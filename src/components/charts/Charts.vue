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
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!this.data || this.data.length === 0) {
        this.drawNoDataMessage(ctx, canvas);
        return;
      }

      if (this.type === 'activity') {
        this.drawLineChart(ctx, canvas);
      } else if (this.type === 'scores') {
        this.drawBarChart(ctx, canvas);
      } else if (this.type === 'pie') {
        this.drawPieChart(ctx, canvas);
      }
    },

    drawNoDataMessage(ctx, canvas) {
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('داده‌ای برای نمایش وجود ندارد', canvas.width / 2, canvas.height / 2);
    },

    drawLineChart(ctx, canvas) {
      const padding = 60;
      const width = canvas.width - padding * 2;
      const height = canvas.height - padding * 2;

      // Extract values for scaling
      let maxValue = 0;
      this.data.forEach(item => {
        const values = [
          item.contentViews || item.views || 0,
          item.logins || item.submissions || 0,
          item.avgSessionTime || item.completions || 0
        ];
        maxValue = Math.max(maxValue, ...values);
      });

      if (maxValue === 0) maxValue = 1;

      // Draw grid
      this.drawGrid(ctx, canvas, padding, width, height);

      // Draw lines
      const colors = ['#667eea', '#f093fb', '#4facfe'];
      const series = ['contentViews', 'logins', 'avgSessionTime'];
      const labels = ['بازدید محتوا', 'ورود', 'زمان جلسه'];

      series.forEach((key, index) => {
        ctx.strokeStyle = colors[index];
        ctx.lineWidth = 3;
        ctx.beginPath();

        let hasData = false;
        this.data.forEach((point, i) => {
          const value = point[key] || 0;
          if (value > 0) hasData = true;

          const x = padding + (width / Math.max(1, this.data.length - 1)) * i;
          const y = padding + height - ((value / maxValue) * height);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        if (hasData) {
          ctx.stroke();

          // Draw points
          ctx.fillStyle = colors[index];
          this.data.forEach((point, i) => {
            const value = point[key] || 0;
            const x = padding + (width / Math.max(1, this.data.length - 1)) * i;
            const y = padding + height - ((value / maxValue) * height);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      });

      // Draw legend
      this.drawLegend(ctx, canvas, colors, labels);
    },

    drawBarChart(ctx, canvas) {
      const padding = 60;
      const width = canvas.width - padding * 2;
      const height = canvas.height - padding * 2;

      if (!this.data.length) return;

      const barWidth = width / this.data.length * 0.8;
      const maxValue = Math.max(...this.data.map(d => Math.max(d.score || 0, d.count || 0, d.value || 0)));

      if (maxValue === 0) return;

      // Draw grid
      this.drawGrid(ctx, canvas, padding, width, height);

      // Draw bars
      this.data.forEach((item, index) => {
        const value = item.score || item.count || item.value || 0;
        const barHeight = (value / maxValue) * height;
        const x = padding + index * (width / this.data.length) + (width / this.data.length - barWidth) / 2;
        const y = padding + height - barHeight;

        // Bar
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label || `آیتم ${index + 1}`, x + barWidth / 2, canvas.height - 20);

        // Value
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
      });
    },

    drawPieChart(ctx, canvas) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 40;

      const total = this.data.reduce((sum, item) => sum + (item.value || item.count || 0), 0);
      if (total === 0) return;

      const colors = ['#667eea', '#f093fb', '#4facfe', '#ffeaa7', '#fd79a8'];
      let currentAngle = -Math.PI / 2;

      this.data.forEach((item, index) => {
        const value = item.value || item.count || 0;
        const sliceAngle = (value / total) * 2 * Math.PI;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY);

        currentAngle += sliceAngle;
      });
    },

    drawGrid(ctx, canvas, padding, width, height) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width + padding, y);
        ctx.stroke();
      }

      // Vertical lines
      for (let i = 0; i <= 4; i++) {
        const x = padding + (width / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height + padding);
        ctx.stroke();
      }
    },

    drawLegend(ctx, canvas, colors, labels) {
      const legendY = 20;
      const legendX = 60;

      labels.forEach((label, index) => {
        // Color box
        ctx.fillStyle = colors[index];
        ctx.fillRect(legendX + index * 100, legendY, 15, 15);

        // Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label, legendX + index * 100 + 20, legendY + 12);
      });
    }
  }
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>