<template>
  <div class="student-activities-container">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-bar me-3"></i>
        گزارش فعالیت دانش‌آموزان
      </h1>
      <p class="page-description">
        تحلیل جامع عملکرد و فعالیت‌های دانش‌آموزان در دوره‌های آموزشی
      </p>
    </div>

    <!-- فیلترهای انتخاب -->
    <div class="filters-section mb-4">
      <div class="row">
        <div class="col-md-4">
          <div class="filter-group">
            <label class="form-label">انتخاب دوره:</label>
            <select v-model="selectedCourseId" @change="onCourseChange" class="form-select">
              <option value="">دوره مورد نظر را انتخاب کنید</option>
              <option v-for="course in teachingCourses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-md-4" v-if="selectedCourseId">
          <div class="filter-group">
            <label class="form-label">انتخاب دانش‌آموز:</label>
            <select v-model="selectedStudentId" @change="fetchAdvancedAnalytics" class="form-select">
              <option value="">دانش‌آموز مورد نظر را انتخاب کنید</option>
              <option v-for="student in courseStudents" :key="student.studentId" :value="student.studentId">
                {{ student.studentName }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-md-4" v-if="selectedStudentId">
          <div class="filter-group">
            <label class="form-label">بازه زمانی:</label>
            <select v-model="selectedTimeFilter" @change="fetchAdvancedAnalytics" class="form-select">
              <option v-for="filter in timeFilters" :key="filter.value" :value="filter.value">
                {{ filter.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- محتوای اصلی -->
    <div v-if="!selectedStudentId && !loading" class="empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <i class="fas fa-user-graduate"></i>
        </div>
        <h3 class="empty-state-title">انتخاب دانش‌آموز</h3>
        <p class="empty-state-description">
          برای مشاهده گزارش عملکرد، ابتدا دوره و سپس دانش‌آموز مورد نظر را انتخاب کنید
        </p>
      </div>
    </div>

    <!-- گزارش دانش‌آموز -->
    <div v-else-if="selectedStudentId && advancedAnalytics">
      <div class="analytics-dashboard">

        <!-- ردیف اول نمودارها -->
        <div class="row mb-4">
          <!-- نمودار توزیع انواع فعالیت -->
          <div class="col-md-6 mb-4">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="mb-0">
                  <i class="fas fa-pie-chart text-primary me-2"></i>
                  توزیع انواع فعالیت‌ها(تعداد)
                </h5>
              </div>
              <div class="modern-card-body">
                <canvas ref="activityTypeChart" height="300"></canvas>
              </div>
            </div>
          </div>

          <!-- نمودار تحلیل زمان -->
          <div class="col-md-6 mb-4">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="mb-0">
                  <i class="fas fa-clock text-warning me-2"></i>
                  تحلیل زمان بر اساس نوع فعالیت(مدت)
                </h5>
              </div>
              <div class="modern-card-body">
                <canvas ref="timeAnalysisChart" height="300"></canvas>
              </div>
            </div>
          </div>
        </div>
        <!-- ردیف دوم: Heatmap و Timeline -->
        <div class="row mb-4">
          <!-- نمودار Heatmap فعالیت روزانه -->
          <div class="col-lg-7 mb-4">
            <div class="modern-card h-100">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-calendar-alt text-warning me-2"></i>
                  نقشه حرارتی فعالیت (Heatmap)
                </h6>
                <small class="text-muted">فعالیت در ساعات مختلف روز و روزهای هفته</small>
              </div>
              <div class="modern-card-body">
                <div v-if="dailyHeatmapData.length === 0" class="text-center py-4">
                  <i class="fas fa-chart-area text-muted fa-3x mb-3"></i>
                  <p class="text-muted">داده‌ای برای نمایش وجود ندارد</p>
                </div>
                <div v-else>
                  <div ref="dailyHeatmapChart" class="heatmap-container"></div>

                  <!-- راهنمای رنگ‌ها -->
                  <div class="heatmap-legend mt-3">
                    <div class="d-flex align-items-center justify-content-center">
                      <span class="me-2">کم</span>
                      <div class="legend-gradient me-2"></div>
                      <span>زیاد</span>
                    </div>
                  </div>

                  <!-- آمار کلی -->
                  <div class="row mt-3">
                    <div class="col-4 text-center">
                      <div class="stat-number">{{ mostActiveDay }}</div>
                      <div class="stat-label">فعال‌ترین روز</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="stat-number">{{ mostActiveHour }}</div>
                      <div class="stat-label">فعال‌ترین ساعت</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="stat-number">{{ totalDailyActivities }}</div>
                      <div class="stat-label">کل فعالیت‌ها</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- نمودار Timeline فعالیت‌ها -->
          <div class="col-lg-5 mb-4">
            <div class="modern-card h-100">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-history text-info me-2"></i>
                  جدول زمانی فعالیت‌ها (Timeline)
                </h6>
                <small class="text-muted">فعالیت‌های اخیر به ترتیب زمانی</small>
              </div>
              <div class="modern-card-body">
                <div v-if="activityTimelineData.length === 0" class="text-center py-4">
                  <i class="fas fa-clock text-muted fa-3x mb-3"></i>
                  <p class="text-muted">فعالیتی یافت نشد</p>
                </div>
                <div v-else class="timeline-container">
                  <!-- فیلتر نوع فعالیت -->
                  <div class="timeline-filters mb-3">
                    <select v-model="timelineFilter" @change="filterTimelineData" class="form-select form-select-sm">
                      <option value="all">همه فعالیت‌ها</option>
                      <option value="CONTENT_VIEW">مشاهده محتوا</option>
                      <option value="EXAM_SUBMISSION">آزمون‌ها</option>
                      <option value="ASSIGNMENT_SUBMISSION">تکالیف</option>
                      <option value="LESSON_COMPLETION">تکمیل درس</option>
                    </select>
                  </div>

                  <!-- Timeline -->
                  <div class="timeline">
                    <div
                        v-for="(activity, index) in filteredTimelineData.slice(0, 20)"
                        :key="index"
                        class="timeline-item"
                        :class="getTimelineItemClass(activity.type)"
                    >
                      <div class="timeline-marker">
                        <i :class="getActivityTypeIcon(activity.type)"></i>
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <span class="timeline-title">{{ getEnhancedDescription(activity) }}</span>
                          <span class="timeline-time">{{ formatTimelineDate(activity.timestamp) }}</span>
                        </div>
                        <div class="timeline-meta">
                            <span v-if="activity.metadata" class="badge badge-outline me-1">
                              {{ formatMetadata(activity.metadata) }}
                            </span>
                            <span v-if="activity.timeSpent" class="text-muted small">
                              <i class="fas fa-clock me-1"></i>{{ $filters.formatTime(activity.timeSpent) }}
                            </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- نمایش بیشتر -->
                  <div v-if="filteredTimelineData.length > 20" class="text-center mt-3">
                    <button class="btn btn-outline-primary btn-sm" @click="loadMoreTimeline">
                      <i class="fas fa-plus me-1"></i>نمایش بیشتر
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- ردیف دوم نمودارها -->
<!--        <div class="row mb-4">-->
<!--          &lt;!&ndash; نمودار فعالیت در هر درس &ndash;&gt;-->
<!--          <div class="col-12 mb-4">-->
<!--            <div class="modern-card">-->
<!--              <div class="modern-card-header">-->
<!--                <h5 class="mb-0">-->
<!--                  <i class="fas fa-chart-bar text-success me-2"></i>-->
<!--                  فعالیت در هر درس-->
<!--                </h5>-->
<!--              </div>-->
<!--              <div class="modern-card-body">-->
<!--                <canvas ref="lessonActivityChart" height="400"></canvas>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import * as d3 from 'd3'
import { formatTimelineDate, formatFullDate } from '@/utils/timeFormatter'

Chart.register(...registerables)

export default {
  name: 'StudentActivities',
  data() {
    return {
      loading: false,
      teachingCourses: [],
      courseStudents: [],
      selectedCourseId: '',
      selectedStudentId: '',
      selectedTimeFilter: 'month',
      advancedAnalytics: null,

      // Chart instances
      activityTypeChartInstance: null,
      timeAnalysisChartInstance: null,
      lessonActivityChartInstance: null,

      timeFilters: [
        { value: 'week', label: 'هفته گذشته' },
        { value: 'month', label: 'ماه گذشته' },
        { value: '3months', label: '3 ماه گذشته' },
        { value: 'semester', label: 'ترم جاری' }
      ],
      // نمودار Heatmap
      dailyHeatmapData: [],
      dailyHeatmapChart: null,
      mostActiveDay: '-',
      mostActiveHour: '-',
      totalDailyActivities: 0,

      // Timeline
      activityTimelineData: [],
      filteredTimelineData: [],
      timelineFilter: 'all',
      timelineLoadLimit: 20,
    }
  },

  computed: {
    activityTimeline() {
      return this.advancedAnalytics?.activityTimeline || []
    }
  },

  async mounted() {
    await this.fetchTeachingCourses()
  },

  beforeUnmount() {
    // پاک کردن tooltip اگر وجود دارد
    d3.select("body").selectAll(".heatmap-tooltip").remove();

    if (this.dailyHeatmapChart) {
      d3.select(this.$refs.dailyHeatmapChart).selectAll("*").remove();
    }
    this.destroyCharts()
  },

  methods: {
    async fetchTeachingCourses() {
      try {
        const response = await axios.get('/courses/teaching')
        this.teachingCourses = response.data
      } catch (error) {
        console.error('Error fetching teaching courses:', error)
        this.$toast.error('خطا در بارگذاری دوره‌ها')
      }
    },
    async fetchDailyHeatmapData(studentId, courseId, timeFilter) {
      try {
        const response = await axios.get(`/analytics/student/${studentId}/course/${courseId}/daily-heatmap`, {
          params: { timeFilter }
        });

        console.log('Heatmap API Response:', response.data);
        
        if (response.data.error) {
          console.error('Backend heatmap error:', response.data.error);
          this.$toast?.error?.(response.data.error);
        }

        this.processDailyHeatmapData(response.data);
        this.$nextTick(() => {
          this.renderDailyHeatmap();
        });
      } catch (error) {
        console.error('Error fetching daily heatmap data:', error);
        this.$toast?.error?.('خطا در بارگذاری داده‌های نمودار حرارتی');
        this.dailyHeatmapData = [];
        this.mostActiveDay = '-';
        this.mostActiveHour = '-';
        this.totalDailyActivities = 0;
      }
    },

    async fetchActivityTimeline(studentId, courseId, timeFilter) {
      try {
        const response = await axios.get(`/analytics/student/${studentId}/course/${courseId}/activity-timeline`, {
          params: {
            timeFilter,
            limit: 100 // دریافت 100 فعالیت اخیر
          }
        });

        this.activityTimelineData = response.data.activities || [];
        this.filterTimelineData();
      } catch (error) {
        console.error('Error fetching activity timeline:', error);
        this.activityTimelineData = [];
        this.filteredTimelineData = [];
      }
    },

    processDailyHeatmapData(data) {
      this.dailyHeatmapData = data.heatmapData || [];
      this.mostActiveDay = data.analytics?.mostActiveDay || '-';
      this.mostActiveHour = data.analytics?.mostActiveHour || '-';
      this.totalDailyActivities = data.analytics?.totalActivities || 0;
    },

    renderDailyHeatmap() {
      if (!this.$refs.dailyHeatmapChart || this.dailyHeatmapData.length === 0) {
        console.log('Heatmap render skipped: no container or no data', {
          containerExists: !!this.$refs.dailyHeatmapChart,
          dataLength: this.dailyHeatmapData.length
        });
        return;
      }

      // پاک کردن محتوای قبلی و tooltips
      d3.select(this.$refs.dailyHeatmapChart).selectAll("*").remove();
      d3.selectAll(".heatmap-tooltip").remove();

      // دریافت ابعاد container
      const containerRect = this.$refs.dailyHeatmapChart.getBoundingClientRect();
      const containerWidth = containerRect.width || 600;
      
      const margin = { top: 40, right: 40, bottom: 100, left: 100 };
      const width = Math.max(480, containerWidth - margin.left - margin.right);
      const height = 200;

      const gridSize = Math.floor(width / 24);
      const rowHeight = Math.floor(height / 7);

      const daysOfWeek = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];

      const hours = d3.range(24);

      console.log('Heatmap data structure:', this.dailyHeatmapData.slice(0, 5));

      // ایجاد SVG
      const svg = d3.select(this.$refs.dailyHeatmapChart)
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .style("overflow", "visible")
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

      // برچسب‌های روزها
      svg.selectAll(".dayLabel")
          .data(daysOfWeek)
          .enter().append("text")
          .text(d => d)
          .attr("x", -10)
          .attr("y", (d, i) => i * rowHeight + rowHeight / 2)
          .style("text-anchor", "end")
          .style("dominant-baseline", "middle")
          .style("font-size", "11px")
          .style("fill", "#666")
          .style("font-family", "IRANSans, sans-serif");

      // برچسب‌های ساعت‌ها (فقط ساعات زوج)
      const hourLabels = hours.filter(h => h % 2 === 0);
      svg.selectAll(".hourLabel")
          .data(hourLabels)
          .enter().append("text")
          .text(d => `${d}:00`)
          .attr("x", d => d * gridSize + gridSize / 2)
          .attr("y", -10)
          .style("text-anchor", "middle")
          .style("font-size", "9px")
          .style("fill", "#666")
          .style("font-family", "IRANSans, sans-serif");

      // محاسبه حداکثر مقدار برای رنگ‌بندی
      const maxValue = d3.max(this.dailyHeatmapData, d => d.activityCount) || 1;
      console.log('Max activity value:', maxValue);

      // رنگ‌بندی بهتر
      const colorScale = d3.scaleSequential()
          .interpolator(d3.interpolateBlues)
          .domain([0, maxValue]);

      // ایجاد tooltip
      const tooltip = d3.select("body").append("div")
          .attr("class", "heatmap-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 10px")
          .style("border-radius", "4px")
          .style("font-size", "11px")
          .style("font-family", "IRANSans, sans-serif")
          .style("pointer-events", "none")
          .style("z-index", "1000");

      // ایجاد مربع‌ها
      const heatmap = svg.selectAll(".hour")
          .data(this.dailyHeatmapData)
          .enter().append("rect")
          .attr("class", "hour")
          .attr("x", d => d.hour * gridSize)
          .attr("y", d => d.dayOfWeek * rowHeight)
          .attr("width", gridSize - 1)
          .attr("height", rowHeight - 1)
          .attr("rx", 2)
          .style("fill", d => {
            if (d.activityCount === 0) return "#f8f9fa";
            return colorScale(d.activityCount);
          })
          .style("stroke", "#ffffff")
          .style("stroke-width", "1px")
          .style("cursor", "pointer")
          .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.95);
            
            const dayName = daysOfWeek[d.dayOfWeek] || 'نامشخص';
            tooltip.html(`
              <div><strong>${dayName}</strong></div>
              <div>ساعت ${d.hour}:00</div>
              <div>${d.activityCount} فعالیت</div>
            `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 10) + "px");

            d3.select(this)
                .style("stroke", "#333")
                .style("stroke-width", "2px")
                .style("opacity", 0.8);
          })
          .on("mouseout", function() {
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);

            d3.select(this)
                .style("stroke", "#ffffff")
                .style("stroke-width", "1px")
                .style("opacity", 1);
          });

      // افزودن Legend
      const legendData = [0, Math.ceil(maxValue/4), Math.ceil(maxValue/2), Math.ceil(3*maxValue/4), maxValue];
      const legendWidth = 200;
      const legendHeight = 15;
      
      const legend = svg.append("g")
          .attr("class", "legend")
          .attr("transform", `translate(${(width - legendWidth) / 2}, ${height + 50})`);

      legend.selectAll("rect")
          .data(legendData)
          .enter().append("rect")
          .attr("x", (d, i) => i * (legendWidth / legendData.length))
          .attr("y", 0)
          .attr("width", legendWidth / legendData.length)
          .attr("height", legendHeight)
          .style("fill", d => d === 0 ? "#f8f9fa" : colorScale(d));

      legend.selectAll("text")
          .data(legendData)
          .enter().append("text")
          .text(d => d)
          .attr("x", (d, i) => i * (legendWidth / legendData.length) + (legendWidth / legendData.length) / 2)
          .attr("y", legendHeight + 15)
          .style("text-anchor", "middle")
          .style("font-size", "10px")
          .style("font-family", "IRANSans, sans-serif")
          .style("fill", "#666");

      // افزودن عنوان Legend
      legend.append("text")
          .attr("x", legendWidth / 2)
          .attr("y", -10)
          .style("text-anchor", "middle")
          .style("font-size", "11px")
          .style("font-family", "IRANSans, sans-serif")
          .style("fill", "#666")
          .text("تعداد فعالیت‌ها");

      console.log('Heatmap rendered successfully with', this.dailyHeatmapData.length, 'data points');
    },

    getActivityCountForDayHour(dayIndex, hour) {
      const activity = this.dailyHeatmapData.find(d =>
          d.dayOfWeek === dayIndex && d.hour === hour
      );
      return activity ? activity.activityCount : 0;
    },

    getHeatmapColor(intensity) {
      // گرادیان رنگی از آبی کم‌رنگ تا قرمز پررنگ
      const colors = [
        'rgba(239, 243, 255, 0.8)', // خیلی کم
        'rgba(199, 210, 254, 0.8)', // کم
        'rgba(129, 140, 248, 0.8)', // متوسط
        'rgba(79, 70, 229, 0.8)',   // زیاد
        'rgba(239, 68, 68, 0.8)'    // خیلی زیاد
      ];

      const colorIndex = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
      return colors[colorIndex];
    },

    filterTimelineData() {
      if (this.timelineFilter === 'all') {
        this.filteredTimelineData = [...this.activityTimelineData];
      } else {
        this.filteredTimelineData = this.activityTimelineData.filter(
            activity => activity.type === this.timelineFilter
        );
      }
    },

    getTimelineItemClass(activityType) {
      const classMap = {
        'CONTENT_VIEW': 'timeline-content-view',
        'EXAM_SUBMISSION': 'timeline-exam',
        'ASSIGNMENT_SUBMISSION': 'timeline-assignment',
        'LESSON_COMPLETION': 'timeline-lesson',
        'CHAT_MESSAGE_SEND': 'timeline-chat',
        'LOGIN': 'timeline-login'
      };
      return classMap[activityType] || 'timeline-default';
    },

    formatTimelineDate(dateString) {
      // Use the centralized time formatter to fix timezone issues
      return formatTimelineDate(dateString);
    },

    loadMoreTimeline() {
      this.timelineLoadLimit += 20;
    },

    async onCourseChange() {
      if (this.selectedCourseId) {
        await this.fetchCourseStudents()
      }
      this.selectedStudentId = ''
      this.advancedAnalytics = null
    },

    async fetchCourseStudents() {
      try {
        const response = await axios.get(`/analytics/teacher/course/${this.selectedCourseId}/students-summary`)
        this.courseStudents = response.data
      } catch (error) {
        console.error('Error fetching course students:', error)
        this.$toast.error('خطا در بارگذاری دانش‌آموزان')
      }
    },

    async fetchAdvancedAnalytics() {
      if (!this.selectedStudentId || !this.selectedCourseId) return

      this.loading = true
      try {
        const response = await axios.get(
            `/analytics/teacher/student/${this.selectedStudentId}/advanced-analytics`,
            {
              params: {
                courseId: this.selectedCourseId,
                timeFilter: this.selectedTimeFilter
              }
            }
        )

        await Promise.all([
          this.fetchDailyHeatmapData(this.selectedStudentId, this.selectedCourseId, this.selectedTimeFilter),
          this.fetchActivityTimeline(this.selectedStudentId, this.selectedCourseId, this.selectedTimeFilter)
        ]);

        this.advancedAnalytics = response.data

        // Wait for DOM update then create charts
        await this.$nextTick()
        this.createCharts()

      } catch (error) {
        console.error('Error fetching advanced analytics:', error)
        this.$toast.error('خطا در بارگذاری آنالیز پیشرفته')
      } finally {
        this.loading = false
      }
    },

    createCharts() {
      this.destroyCharts()
      this.createActivityTypeChart()
      this.createTimeAnalysisChart()
      this.createLessonActivityChart()
    },

    createActivityTypeChart() {
      if (!this.$refs.activityTypeChart || !this.advancedAnalytics?.activityTypeDistribution) return

      const data = this.advancedAnalytics.activityTypeDistribution
      const chartData = Object.entries(data).map(([type, info]) => ({
        label: info.label,
        value: info.count,
        percentage: info.percentage
      }))

      const ctx = this.$refs.activityTypeChart.getContext('2d')
      this.activityTypeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartData.map(item => item.label),
          datasets: [{
            data: chartData.map(item => item.value),
            backgroundColor: [
              '#667eea',
              '#f093fb',
              '#ff6b6b',
              '#4ecdc4',
              '#45b7d1',
              '#f9ca24',
              '#6c5ce7',
              '#fd79a8'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'IRANSans' },
                generateLabels: (chart) => {
                  return chartData.map((item, index) => ({
                    text: `${item.label}: ${item.percentage}%`,
                    fillStyle: chart.data.datasets[0].backgroundColor[index],
                    index: index
                  }))
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = chartData[context.dataIndex]
                  return `${item.label}: ${item.value} (${item.percentage}%)`
                }
              }
            }
          }
        }
      })
    },

    createTimeAnalysisChart() {
      if (!this.$refs.timeAnalysisChart || !this.advancedAnalytics?.timeAnalysisByActivityType) return

      const data = this.advancedAnalytics.timeAnalysisByActivityType
      const chartData = Object.entries(data).map(([type, info]) => ({
        label: info.label,
        // اصلاح: استفاده از valueSeconds یا valueHours
        hours: info.valueHours || (info.valueSeconds ? info.valueSeconds / 3600 : 0),
        minutes: info.valueMinutes || (info.valueSeconds ? info.valueSeconds / 60 : 0),
        percentage: info.percentage
      }))

      const ctx = this.$refs.timeAnalysisChart.getContext('2d')
      this.timeAnalysisChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.map(item => item.label),
          datasets: [{
            label: 'ساعت',
            data: chartData.map(item => item.hours),
            backgroundColor: [
              '#667eea',
              '#f093fb',
              '#ff6b6b',
              '#4ecdc4',
              '#45b7d1',
              '#f9ca24'
            ],
            borderColor: [
              '#5a67d8',
              '#e879f9',
              '#e53e3e',
              '#38b2ac',
              '#3182ce',
              '#d69e2e'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'ساعت'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = chartData[context.dataIndex]
                  return `${this.$filters.formatTime(item.hours * 3600)} (${item.percentage}%)`
                }
              }
            }
          }
        }
      })
    },

    createLessonActivityChart() {
      if (!this.$refs.lessonActivityChart || !this.advancedAnalytics?.lessonActivityBreakdown) return

      const data = this.advancedAnalytics.lessonActivityBreakdown
      const lessons = Object.keys(data)

      const datasets = [
        {
          label: 'مشاهده محتوا',
          data: lessons.map(lesson => data[lesson].contentViews || 0),
          backgroundColor: '#667eea',
          borderColor: '#5a67d8'
        },
        {
          label: 'تکالیف',
          data: lessons.map(lesson => data[lesson].assignments || 0),
          backgroundColor: '#f093fb',
          borderColor: '#e879f9'
        },
        {
          label: 'آزمون‌ها',
          data: lessons.map(lesson => data[lesson].exams || 0),
          backgroundColor: '#ff6b6b',
          borderColor: '#e53e3e'
        },
        {
          label: 'تکمیل درس',
          data: lessons.map(lesson => data[lesson].completions || 0),
          backgroundColor: '#4ecdc4',
          borderColor: '#38b2ac'
        }
      ]

      const ctx = this.$refs.lessonActivityChart.getContext('2d')
      this.lessonActivityChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: lessons,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'تعداد فعالیت'
              }
            },
            x: {
              title: {
                display: true,
                text: 'دروس'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      })
    },

    destroyCharts() {
      if (this.activityTypeChartInstance) {
        this.activityTypeChartInstance.destroy()
        this.activityTypeChartInstance = null
      }
      if (this.timeAnalysisChartInstance) {
        this.timeAnalysisChartInstance.destroy()
        this.timeAnalysisChartInstance = null
      }
      if (this.lessonActivityChartInstance) {
        this.lessonActivityChartInstance.destroy()
        this.lessonActivityChartInstance = null
      }
    },
    getActivityTypeIcon(activityType) {
      const icons = {
        'CONTENT_VIEW': 'fas fa-play-circle',
        'LESSON_COMPLETION': 'fas fa-check-circle',
        'EXAM_SUBMISSION': 'fas fa-clipboard-check',
        'ASSIGNMENT_SUBMISSION': 'fas fa-tasks',
        'CHAT_MESSAGE_SEND': 'fas fa-comment',
        'CHAT_VIEW': 'fas fa-comments',
        'FILE_ACCESS': 'fas fa-file',
        'LESSON_ACCESS': 'fas fa-book-open',
        'LOGIN': 'fas fa-sign-in-alt',
        'CONTENT_COMPLETION': 'fas fa-check-double',
        'EXAM_START': 'fas fa-play',
        'ASSIGNMENT_VIEW': 'fas fa-eye'
      }
      return icons[activityType] || 'fas fa-circle'
    },
    getActivityIcon(activityType) {
      const icons = {
        'CONTENT_VIEW': 'fas fa-play-circle',
        'LESSON_COMPLETION': 'fas fa-check-circle',
        'EXAM_SUBMISSION': 'fas fa-clipboard-check',
        'ASSIGNMENT_SUBMISSION': 'fas fa-tasks',
        'CHAT_MESSAGE_SEND': 'fas fa-comment',
        'CHAT_VIEW': 'fas fa-comments',
        'FILE_ACCESS': 'fas fa-file',
        'LOGIN': 'fas fa-sign-in-alt'
      }
      return icons[activityType] || 'fas fa-circle'
    },

    getEnhancedDescription(activity) {
      // اگر metadata وجود دارد، توضیحات غنی‌تری بسازیم
      if (activity.metadata && Object.keys(activity.metadata).length > 0) {
        const meta = activity.metadata;

        switch (activity.type) {
          case 'CONTENT_VIEW':
            if (meta.contentTitle && meta.lessonTitle) {
              return `مشاهده محتوای "${meta.contentTitle}" در درس "${meta.lessonTitle}"`
            } else if (meta.lessonTitle) {
              return `مشاهده محتوا در درس "${meta.lessonTitle}"`
            } else if (meta.contentTitle) {
              return `مشاهده محتوای "${meta.contentTitle}"`
            }
            break;

          case 'EXAM_SUBMISSION':
            if (meta.examTitle && meta.lessonTitle) {
              return `شرکت در آزمون "${meta.examTitle}" درس "${meta.lessonTitle}"`
            } else if (meta.examTitle) {
              return `شرکت در آزمون "${meta.examTitle}"`
            } else if (meta.lessonTitle) {
              return `شرکت در آزمون درس "${meta.lessonTitle}"`
            }
            break;

          case 'ASSIGNMENT_SUBMISSION':
            if (meta.assignmentTitle && meta.lessonTitle) {
              return `ارسال تکلیف "${meta.assignmentTitle}" درس "${meta.lessonTitle}"`
            } else if (meta.assignmentTitle) {
              return `ارسال تکلیف "${meta.assignmentTitle}"`
            } else if (meta.lessonTitle) {
              return `ارسال تکلیف درس "${meta.lessonTitle}"`
            }
            break;

          case 'LESSON_COMPLETION':
            if (meta.lessonTitle) {
              return `تکمیل درس "${meta.lessonTitle}"`
            }
            break;

          case 'LESSON_ACCESS':
            if (meta.lessonTitle) {
              return `دسترسی به درس "${meta.lessonTitle}"`
            }
            break;

          case 'CHAT_MESSAGE_SEND':
            if (meta.courseTitle) {
              return `ارسال پیام در چت دوره "${meta.courseTitle}"`
            }
            break;

          case 'FILE_ACCESS':
            if (meta.fileName && meta.lessonTitle) {
              return `دسترسی به فایل "${meta.fileName}" در درس "${meta.lessonTitle}"`
            } else if (meta.fileName) {
              return `دسترسی به فایل "${meta.fileName}"`
            }
            break;
        }
      }

      // اگر metadata کامل نبود، از توضیحات پیش‌فرض استفاده کن
      return activity.description || activity.typeLabel
    },

    formatMetadata(metadata) {
      const metaArray = []

      // فیلدهای مهم metadata را نمایش بده
      if (metadata.courseTitle) {
        metaArray.push(`دوره: ${metadata.courseTitle}`)
      }

      if (metadata.score !== undefined) {
        metaArray.push(`نمره: ${metadata.score}`)
      }

      if (metadata.difficulty) {
        const difficultyMap = {
          'EASY': 'آسان',
          'MEDIUM': 'متوسط',
          'HARD': 'سخت'
        }
        metaArray.push(`سطح: ${difficultyMap[metadata.difficulty] || metadata.difficulty}`)
      }

      if (metadata.questionCount) {
        metaArray.push(`${metadata.questionCount} سؤال`)
      }

      if (metadata.fileSize) {
        metaArray.push(`حجم: ${this.formatFileSize(metadata.fileSize)}`)
      }

      if (metadata.progress && metadata.progress !== '100') {
        metaArray.push(`پیشرفت: ${metadata.progress}%`)
      }

      return metaArray.join(' • ')
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 10) / 10 + ' ' + sizes[i]
    },

    formatDate(dateString) {
      // Use the centralized date formatter with proper timezone handling
      return formatFullDate(dateString);
    }
  }
}
</script>

<style scoped>
.student-activities-container {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  color: #2d3748;
  font-weight: bold;
  margin-bottom: 10px;
}

.page-description {
  color: #718096;
  font-size: 16px;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filter-group label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.form-select {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  font-family: 'IRANSans';
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: none;
}

.modern-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 12px 12px 0 0;
  border-bottom: none;
}

.modern-card-body {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state-icon {
  font-size: 4rem;
  color: #a0aec0;
  margin-bottom: 20px;
}

.empty-state-title {
  color: #2d3748;
  margin-bottom: 10px;
}

.empty-state-description {
  color: #718096;
  font-size: 16px;
}

.analytics-dashboard {
  margin-top: 20px;
}

/* Timeline Styles */
.activity-timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: -20px;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  margin-right: 20px;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.timeline-content {
  flex: 1;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #667eea;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge-content_view { background: #667eea; }
.badge-lesson_completion { background: #48bb78; }
.badge-exam_submission { background: #ed8936; }
.badge-assignment_submission { background: #9f7aea; }
.badge-chat_message_send { background: #38b2ac; }
.badge-login { background: #718096; }

.timeline-time {
  color: #718096;
  font-size: 14px;
}

.timeline-description {
  color: #2d3748;
  margin-bottom: 8px;
  font-weight: 500;
}

.timeline-metadata {
  background: #f7fafc;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #e2e8f0;
}

.timeline-score {
  color: #48bb78;
  font-size: 14px;
  margin-bottom: 4px;
}

.timeline-duration {
  color: #718096;
  font-size: 14px;
}

@media (max-width: 768px) {
  .filters-section .row {
    flex-direction: column;
  }

  .analytics-dashboard .row {
    flex-direction: column;
  }

  .timeline-item {
    flex-direction: column;
  }

  .timeline-marker {
    margin-right: 0;
    margin-bottom: 10px;
  }
}

/* Heatmap Styles */
.heatmap-container {
  min-height: 400px;
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.heatmap-legend {
  text-align: center;
  font-size: 12px;
  margin-top: 15px;
  font-family: 'IRANSans', 'Vazirmatn', sans-serif;
  direction: rtl;
}

.legend-gradient {
  width: 60px;
  height: 10px;
  background: linear-gradient(to right,
  rgba(239, 243, 255, 0.8),
  rgba(199, 210, 254, 0.8),
  rgba(129, 140, 248, 0.8),
  rgba(79, 70, 229, 0.8),
  rgba(239, 68, 68, 0.8)
  );
  border-radius: 5px;
  display: inline-block;
  border: 1px solid rgba(0,0,0,0.1);
}

/* Heatmap tooltip override global styles */
.heatmap-tooltip {
  pointer-events: none !important;
  z-index: 9999 !important;
  font-family: 'IRANSans', 'Vazirmatn', sans-serif !important;
  direction: rtl !important;
  text-align: center !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  backdrop-filter: blur(5px) !important;
}

/* Responsive heatmap */
@media (max-width: 768px) {
  .heatmap-container {
    min-height: 300px;
    padding: 15px 10px;
    overflow-x: scroll;
  }
  
  .heatmap-container svg {
    min-width: 500px;
  }
}

@media (max-width: 576px) {
  .heatmap-container {
    min-height: 280px;
    padding: 10px 5px;
  }
  
  .col-lg-7.mb-4:has(.heatmap-container) {
    order: 2;
  }
  
  .col-lg-5.mb-4:has(.timeline-container) {
    order: 1;
  }
}

/* Enhanced stat styling */
.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  font-family: 'IRANSans', 'Vazirmatn', sans-serif;
}

.stat-label {
  font-size: 13px;
  color: #718096;
  font-family: 'IRANSans', 'Vazirmatn', sans-serif;
  margin-top: 4px;
}

/* Timeline Styles */
.timeline-container {
  max-height: 600px;
  overflow-y: auto;
}

.timeline-filters .form-select {
  max-width: 200px;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #e2e8f0, #cbd5e0);
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-left: 20px;
}

.timeline-marker {
  position: absolute;
  left: -25px;
  top: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #718096;
}

.timeline-content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.timeline-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.timeline-title {
  flex: 1;
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.timeline-time {
  font-size: 11px;
  color: #a0aec0;
  white-space: nowrap;
  margin-left: 10px;
}

.timeline-meta {
  font-size: 12px;
}

.badge-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #718096;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

/* رنگ‌بندی انواع فعالیت */
.timeline-content-view .timeline-marker {
  border-color: #3182ce;
  color: #3182ce;
}

.timeline-exam .timeline-marker {
  border-color: #e53e3e;
  color: #e53e3e;
}

.timeline-assignment .timeline-marker {
  border-color: #38a169;
  color: #38a169;
}

.timeline-lesson .timeline-marker {
  border-color: #d69e2e;
  color: #d69e2e;
}

.timeline-chat .timeline-marker {
  border-color: #805ad5;
  color: #805ad5;
}

.timeline-login .timeline-marker {
  border-color: #718096;
  color: #718096;
}


</style>