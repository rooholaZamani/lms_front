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
  LineController,
  BarController,
  PieController
} from 'chart.js';

// ثبت همه components مورد نیاز
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineController,
    BarController,
    PieController
);

export default {
  name: 'Charts',
  props: {
    type: {
      type: String,
      required: true,
      validator: value => ['activity', 'scores', 'pie', 'timeDistribution'].includes(value)
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
        console.log('No data available for chart, type:', this.type);
        return;
      }

      console.log(`Rendering chart type: ${this.type}, data length: ${this.data.length}`);
      console.log('Chart data:', this.data);

      const ctx = this.$refs.chartCanvas.getContext('2d');

      if (this.type === 'activity') {
        this.chart = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: this.data.map(item => {
              const date = new Date(item.date);
              return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
            }),
            datasets: [
              {
                label: 'بازدید محتوا',
                data: this.data.map(item => item.contentViews || 0),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: false
              },
              {
                label: 'ورودها',
                data: this.data.map(item => item.logins || 0),
                borderColor: '#f093fb',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                tension: 0.4,
                fill: false
              },
              {
                label: 'ارسال آزمون',
                data: this.data.map(item => item.examSubmissions || 0),
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4,
                fill: false
              },
              {
                label: 'ارسال تکلیف',
                data: this.data.map(item => item.assignmentSubmissions || 0),
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                tension: 0.4,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'تاریخ'
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'تعداد'
                }
              }
            }
          }
        });

      } else if (this.type === 'timeDistribution') {
        this.chart = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: this.data.map(item => {
              const date = new Date(item.date);
              return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
              label: 'دانش‌آموزان فعال',
              data: this.data.map(item => item.activeStudents || 0),
              backgroundColor: '#667eea',
              borderColor: '#667eea',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'تاریخ'
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'تعداد دانش‌آموزان'
                }
              }
            }
          }
        });

      } else if (this.type === 'scores') {
        this.chart = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: this.data.map(item => item.label || item.lesson || item.name),
            datasets: [{
              label: 'نمره میانگین',
              data: this.data.map(item => item.score || item.avgScore || 0),
              backgroundColor: '#667eea',
              borderColor: '#667eea',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'درس‌ها'
                }
              },
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'نمره (از 100)'
                }
              }
            }
          }
        });

      } else if (this.type === 'pie') {
        this.chart = new ChartJS(ctx, {
          type: 'pie',
          data: {
            labels: this.data.map(item => item.label),
            datasets: [{
              data: this.data.map(item => item.value || item.count),
              backgroundColor: [
                '#667eea',
                '#f093fb',
                '#ff6b6b',
                '#4ecdc4',
                '#45b7d1',
                '#f9ca24'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              }
            }
          }
        });
      }

      console.log('Chart rendered successfully:', this.chart);
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
}
</style>