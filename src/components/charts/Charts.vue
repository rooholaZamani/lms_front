<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import ScoresDistributionChart from './ScoresDistributionChart.vue';
import ActivityChart from './ActivityChart.vue';

const props = defineProps({
  // Type of chart: 'scores', 'activity', etc.
  type: {
    type: String,
    default: 'scores'
  },
  // Data to be displayed in the chart
  data: {
    type: Array,
    required: true
  },
  // Chart title
  title: {
    type: String,
    default: ''
  },
  // Chart height
  height: {
    type: String,
    default: '300px'
  }
});

// Container ref for sizing
const chartContainer = ref(null);

// Handle resize
const handleResize = () => {
  // You can add responsive logic here if needed
};

// Add resize listener
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// Clean up
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Component to render based on type
const currentChart = computed(() => {
  switch(props.type) {
    case 'scores':
      return ScoresDistributionChart;
    case 'activity':
      return ActivityChart;
    default:
      return ScoresDistributionChart;
  }
});
</script>

<template>
  <div class="charts-container">
    <div v-if="title" class="chart-title">{{ title }}</div>
    <div
        ref="chartContainer"
        class="chart-area"
        :style="{ height: height }"
    >
      <component
          :is="currentChart"
          :data="data"
      />
    </div>
  </div>
</template>

<style scoped>
.charts-container {
  width: 100%;
  position: relative;
  direction: rtl;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #495057;
}

.chart-area {
  width: 100%;
  min-height: 200px;
}
</style>