<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default {
  name: 'Charts',
  props: {
    type: {
      type: String,
      required: true,
      validator: value => ['activity', 'scores', 'pie'].includes(value)
    },
    data: {
      type: Array,
      required: true
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.renderChart();
  },
  watch: {
    data: {
      handler() {
        this.renderChart();
      },
      deep: true
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      if (!this.data || this.data.length === 0) {
        return;
      }

      const ctx = this.$refs.chartCanvas.getContext('2d');

      if (this.type === 'activity') {
        this.chart = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: this.data.map(item => item.date || item.label),
            datasets: [
              {
                label: 'بازدید محتوا',
                data: this.data.map(item => item.contentViews || 0),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
              },
              {
                label: 'ورودها',
                data: this.data.map(item => item.logins || 0),
                borderColor: '#f093fb',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else if (this.type === 'scores') {
        this.chart = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: this.data.map(item => item.label || item.lesson),
            datasets: [{
              label: 'نمره میانگین',
              data: this.data.map(item => item.score || item.avgScore || 0),
              backgroundColor: '#667eea'
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>