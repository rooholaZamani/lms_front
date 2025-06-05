<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
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
    },
    width: {
      type: String,
      default: '100%'
    },
    title: {
      type: String,
      default: ''
    }
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
  methods: {
    renderChart() {
      const canvas = this.$refs.chartCanvas;
      const ctx = canvas.getContext('2d');

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simple chart implementation - replace with Chart.js for production
      if (this.type === 'activity') {
        this.drawLineChart(ctx, canvas);
      } else if (this.type === 'scores') {
        this.drawBarChart(ctx, canvas);
      } else if (this.type === 'pie') {
        this.drawPieChart(ctx, canvas);
      }
    },

    drawLineChart(ctx, canvas) {
      if (!this.data.length) return;

      const padding = 40;
      const width = canvas.width - padding * 2;
      const height = canvas.height - padding * 2;

      // Find max value for scaling
      const maxValue = Math.max(...this.data.map(d => Math.max(d.views || 0, d.submissions || 0, d.completions || 0)));

      // Draw grid
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width + padding, y);
        ctx.stroke();
      }

      // Draw lines
      const colors = ['#667eea', '#f093fb', '#4facfe'];
      const series = ['views', 'submissions', 'completions'];

      series.forEach((key, index) => {
        ctx.strokeStyle = colors[index];
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.data.forEach((point, i) => {
          const x = padding + (width / (this.data.length - 1)) * i;
          const y = padding + height - ((point[key] || 0) / maxValue) * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      });
    },

    drawBarChart(ctx, canvas) {
      if (!this.data.length) return;

      const padding = 40;
      const width = canvas.width - padding * 2;
      const height = canvas.height - padding * 2;
      const barWidth = width / this.data.length * 0.8;
      const maxValue = Math.max(...this.data.map(d => d.count || 0));

      this.data.forEach((item, index) => {
        const barHeight = ((item.count || 0) / maxValue) * height;
        const x = padding + (width / this.data.length) * index + (width / this.data.length - barWidth) / 2;
        const y = padding + height - barHeight;

        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.range || item.label || '', x + barWidth / 2, canvas.height - 10);
      });
    },

    drawPieChart(ctx, canvas) {
      if (!this.data.length) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 40;
      const total = this.data.reduce((sum, item) => sum + (item.count || 0), 0);

      let currentAngle = -Math.PI / 2;
      const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#38f9d7'];

      this.data.forEach((item, index) => {
        const sliceAngle = ((item.count || 0) / total) * 2 * Math.PI;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        currentAngle += sliceAngle;
      });
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>