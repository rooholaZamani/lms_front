<template>
  <div class="student-dashboard">
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="dashboard-title">داشبورد دانش‌آموز</h2>
      <button class="btn btn-outline-secondary" @click="refreshData">
        <i class="fas fa-sync-alt me-1"></i> بروزرسانی
      </button>
    </div>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-book"
            :value="stats.totalCourses"
            label="تعداد دوره‌ها"
        />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-check-circle"
            :value="stats.completedCourses"
            label="دوره‌های تکمیل شده"
        />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-chart-line"
            :value="stats.averageProgress + '%'"
            label="میانگین پیشرفت"
        />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-clipboard-check"
            :value="exams.length"
            label="آزمون‌های انجام شده"
        />
      </div>
    </div>

    <!-- تب‌های اطلاعات -->
    <div class="card mb-4">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'courses' }" href="#" @click.prevent="activeTab = 'courses'">
              <i class="fas fa-book me-1"></i> دوره‌های من
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'exams' }" href="#" @click.prevent="activeTab = 'exams'">
              <i class="fas fa-clipboard-check me-1"></i> آزمون‌ها
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'progress' }" href="#" @click.prevent="activeTab = 'progress'">
              <i class="fas fa-chart-line me-1"></i> پیشرفت تحصیلی
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'calendar' }" href="#" @click.prevent="activeTab = 'calendar'">
              <i class="fas fa-calendar-alt me-1"></i> تقویم آموزشی
            </a>
          </li>
        </ul>
      </div>
      <div class="card-body">
        <!-- دوره‌ها -->
        <div v-if="activeTab === 'courses'">
          <loading-spinner :loading="loading">
            <template v-if="courses.length === 0">
              <empty-state
                  title="شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید"
                  icon="book"
              >
                <router-link :to="{ name: 'AvailableCourses' }" class="btn btn-primary mt-3">
                  جستجوی دوره‌های جدید
                </router-link>
              </empty-state>
            </template>

            <template v-else>
              <div class="row">
                <!-- کارت دوره‌ها -->
                <div v-for="course in courses" :key="course.id" class="col-md-4 mb-4">
                  <student-course-card
                      :course="course"
                      :progress="progressMap[course.id]"
                  />
                </div>
              </div>

              <!-- دکمه مشاهده همه دوره‌ها -->
              <div v-if="courses.length > 6" class="text-center mt-4">
                <router-link :to="{ name: 'Courses' }" class="btn btn-outline-primary">
                  مشاهده همه دوره‌ها
                </router-link>
              </div>
            </template>
          </loading-spinner>
        </div>

        <!-- آزمون‌ها -->
        <div v-if="activeTab === 'exams'">
          <loading-spinner :loading="loadingExams">
            <template v-if="exams.length === 0">
              <empty-state
                  title="شما هنوز در هیچ آزمونی شرکت نکرده‌اید"
                  icon="clipboard-check"
                  compact
              />
            </template>

            <template v-else>
              <!-- آزمون‌های اخیر -->
              <div class="table-responsive">
                <student-exams-table :exams="exams" />
              </div>

              <!-- نمودار عملکرد در آزمون‌ها -->
              <div class="card mt-4">
                <div class="card-header bg-light">
                  <h5 class="card-title mb-0">نمودار عملکرد آزمون‌ها</h5>
                </div>
                <div class="card-body" style="height: 300px;">
                  <div id="exam-performance-chart">
                    <!-- نمودار نمرات آزمون‌ها در اینجا نمایش داده می‌شود -->
                    <div ref="examChart"></div>
                  </div>
                </div>
              </div>
            </template>
          </loading-spinner>
        </div>

        <!-- پیشرفت تحصیلی -->
        <div v-if="activeTab === 'progress'">
          <loading-spinner :loading="loadingProgress">
            <template v-if="progressList.length === 0">
              <empty-state
                  title="اطلاعات پیشرفت تحصیلی موجود نیست"
                  icon="chart-line"
                  compact
              />
            </template>

            <template v-else>
              <!-- نمودار پیشرفت دوره‌ها -->
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h5 class="card-title mb-0">پیشرفت دوره‌ها</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div v-for="progress in progressList" :key="progress.course.id" class="col-md-6 mb-3">
                      <div class="course-progress-card">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <h6 class="mb-0">{{ progress.course.title }}</h6>
                          <span class="badge" :class="getProgressBadgeClass(progress.completionPercentage)">
                            {{ Math.round(progress.completionPercentage) }}%
                          </span>
                        </div>
                        <div class="progress mb-1">
                          <div class="progress-bar"
                               :class="getProgressBarClass(progress.completionPercentage)"
                               :style="`width: ${progress.completionPercentage}%`"
                               :aria-valuenow="progress.completionPercentage"
                               role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="d-flex justify-content-between">
                          <small class="text-muted">
                            {{ progress.completedLessonCount }} از {{ progress.totalLessons }} درس تکمیل شده
                          </small>
                          <small class="text-muted" v-if="progress.lastAccessed">
                            آخرین بازدید: {{ formatDate(progress.lastAccessed) }}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- آمار کلی پیشرفت -->
              <div class="card">
                <div class="card-header bg-light">
                  <h5 class="card-title mb-0">آمار کلی پیشرفت</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="performance-stats">
                        <h6>میانگین زمان مطالعه روزانه</h6>
                        <div class="d-flex align-items-center">
                          <div class="display-4 me-3">{{ performanceStats.avgStudyTime }}</div>
                          <div>دقیقه</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="performance-stats">
                        <h6>روزهای پشت سر هم فعالیت</h6>
                        <div class="d-flex align-items-center">
                          <div class="display-4 me-3">{{ performanceStats.streak }}</div>
                          <div>روز</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mt-4">
                      <div class="performance-stats">
                        <h6>درصد تکمیل تکالیف</h6>
                        <div class="d-flex align-items-center">
                          <div class="display-4 me-3">{{ performanceStats.assignmentCompletion }}</div>
                          <div>درصد</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mt-4">
                      <div class="performance-stats">
                        <h6>میانگین نمرات</h6>
                        <div class="d-flex align-items-center">
                          <div class="display-4 me-3">{{ performanceStats.avgScore }}</div>
                          <div>از 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </loading-spinner>
        </div>

        <!-- تقویم آموزشی -->
        <div v-if="activeTab === 'calendar'">
          <loading-spinner :loading="loadingCalendar">
            <template v-if="events.length === 0">
              <empty-state
                  title="رویدادی در تقویم آموزشی شما موجود نیست"
                  icon="calendar-alt"
                  compact
              />
            </template>

            <template v-else>
              <div class="upcoming-events mb-4">
                <h5 class="mb-3">رویدادهای نزدیک</h5>
                <div class="list-group">
                  <div
                      v-for="event in upcomingEvents"
                      :key="event.id"
                      class="list-group-item list-group-item-action"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <div class="d-flex align-items-center">
                          <div class="event-icon me-3" :class="getEventColorClass(event.type)">
                            <i :class="getEventIcon(event.type)"></i>
                          </div>
                          <div>
                            <h6 class="mb-0">{{ event.title }}</h6>
                            <p class="mb-0 text-muted">{{ event.course.title }}</p>
                          </div>
                        </div>
                      </div>
                      <div class="text-end">
                        <div>{{ formatDate(event.date) }}</div>
                        <div class="small text-muted">{{ getDaysRemaining(event.date) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header bg-light">
                  <h5 class="card-title mb-0">تقویم ماهانه</h5>
                </div>
                <div class="card-body">
                  <!-- در اینجا می‌توان از یک کامپوننت تقویم استفاده کرد -->
                  <div class="calendar-placeholder text-center py-5">
                    <i class="fas fa-calendar-alt fa-5x mb-3 text-muted"></i>
                    <h5>تقویم آموزشی</h5>
                    <p class="text-muted">نمایش رویدادهای آموزشی، آزمون‌ها و مهلت‌های تحویل تکالیف</p>
                  </div>
                </div>
              </div>
            </template>
          </loading-spinner>
        </div>
      </div>
    </div>

    <!-- توصیه‌های یادگیری -->
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="card-title mb-0">توصیه‌های یادگیری شخصی‌سازی شده</h5>
      </div>
      <div class="card-body">
        <loading-spinner :loading="loadingRecommendations">
          <div class="row">
            <div v-for="(recommendation, index) in recommendations" :key="index" class="col-md-4 mb-3">
              <div class="recommendation-card">
                <div class="recommendation-icon">
                  <i :class="recommendation.icon"></i>
                </div>
                <h6 class="recommendation-title">{{ recommendation.title }}</h6>
                <p class="recommendation-description">{{ recommendation.description }}</p>
                <router-link :to="recommendation.link" class="btn btn-sm btn-primary">
                  مشاهده
                </router-link>
              </div>
            </div>
          </div>
        </loading-spinner>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as d3 from 'd3';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import StatCard from '@/components/common/StatCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import StudentCourseCard from '@/components/dashboard/StudentCourseCard.vue';
import StudentExamsTable from '@/components/dashboard/StudentExamsTable.vue';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentDashboard',
  components: {
    LoadingSpinner,
    StatCard,
    EmptyState,
    StudentCourseCard,
    StudentExamsTable
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeTab: 'courses',
      loading: true,
      loadingExams: true,
      loadingProgress: true,
      loadingCalendar: true,
      loadingRecommendations: true,
      courses: [],
      progressList: [],
      progressMap: {},
      exams: [],
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0
      },
      performanceStats: {
        avgStudyTime: 0,
        streak: 0,
        assignmentCompletion: 0,
        avgScore: 0
      },
      events: [],
      recommendations: []
    }
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();

    return {
      formatDate,
      truncateText
    };
  },
  computed: {
    // Upcoming events (next 7 days)
    upcomingEvents() {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      return this.events
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  },
  created() {
    this.fetchData();
  },
  mounted() {
    // Initialize d3 chart when component is mounted
    if (this.exams.length > 0) {
      this.renderExamChart();
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'exams' && this.exams.length > 0) {
        this.$nextTick(() => {
          this.renderExamChart();
        });
      }
    },
    exams(newExams) {
      if (this.activeTab === 'exams' && newExams.length > 0) {
        this.$nextTick(() => {
          this.renderExamChart();
        });
      }
    }
  },
  methods: {
    async fetchData() {
      try {
        // Get all data in parallel
        const [statsResponse, progressResponse, coursesResponse, examsResponse] = await Promise.all([
          axios.get('/progress/stats'), // Stats
          axios.get('/progress'), // Progress
          axios.get('/courses/enrolled'), // Courses
          axios.get('/exams/submissions/student') // Exams
        ]);

        // Update state
        this.stats = statsResponse.data;
        this.progressList = progressResponse.data;
        this.courses = coursesResponse.data;
        this.exams = examsResponse.data;

        // Create progress map for easier access
        this.progressMap = {};
        this.progressList.forEach(progress => {
          if (progress.course) {
            this.progressMap[progress.course.id] = progress;
          }
        });

        // Update loading states
        this.loading = false;
        this.loadingExams = false;

        // Fetch additional data
        await this.fetchPerformanceStats();
        await this.fetchCalendarEvents();
        await this.fetchRecommendations();

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.$store.dispatch('notification/showError', 'مشکلی در دریافت اطلاعات داشبورد رخ داد.');
        this.loading = false;
        this.loadingExams = false;
      }
    },

    async fetchPerformanceStats() {
      this.loadingProgress = true;
      try {
        const response = await axios.get('/analytics/student/performance');
        this.performanceStats = {
          avgStudyTime: response.data.averageStudyTime || 0,
          streak: response.data.streak || 0,
          assignmentCompletion: response.data.assignmentCompletionRate || 0,
          avgScore: response.data.averageScore || 0
        };
      } catch (error) {
        console.error('Error fetching performance stats:', error);
      } finally {
        this.loadingProgress = false;
      }
    },

    async fetchCalendarEvents() {
      this.loadingCalendar = true;
      try {
        // In a real application, fetch from a calendar events API
        // For now, generate some sample data
        this.events = this.generateSampleEvents();
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        this.loadingCalendar = false;
      }
    },

    async fetchRecommendations() {
      this.loadingRecommendations = true;
      try {
        // In a real application, fetch from a recommendations API
        // For now, generate some sample data
        this.recommendations = [
          {
            icon: 'fas fa-graduation-cap',
            title: 'تکمیل دوره‌های پایه',
            description: 'پیشنهاد می‌شود ابتدا دوره‌های پایه را تکمیل کنید.',
            link: { name: 'Courses' }
          },
          {
            icon: 'fas fa-book-reader',
            title: 'منابع مطالعاتی بیشتر',
            description: 'مطالعه این منابع به درک بهتر مفاهیم کمک می‌کند.',
            link: { name: 'Resources' }
          },
          {
            icon: 'fas fa-tasks',
            title: 'تمرین‌های تکمیلی',
            description: 'برای تقویت مهارت‌ها، این تمرین‌ها را انجام دهید.',
            link: { name: 'Exercises' }
          }
        ];
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        this.loadingRecommendations = false;
      }
    },

    renderExamChart() {
      if (!this.$refs.examChart || this.exams.length === 0) return;

      // Clear previous chart
      d3.select(this.$refs.examChart).selectAll('*').remove();

      // Prepare data
      const examData = this.exams.map(exam => ({
        date: new Date(exam.submissionTime),
        score: exam.score,
        passed: exam.passed,
        name: exam.exam ? exam.exam.title : 'آزمون'
      })).sort((a, b) => a.date - b.date);

      // Set dimensions
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = this.$refs.examChart.clientWidth - margin.left - margin.right;
      const height = 240 - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(this.$refs.examChart)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      // Set scales
      const x = d3.scaleTime()
          .domain(d3.extent(examData, d => d.date))
          .range([0, width]);

      const y = d3.scaleLinear()
          .domain([0, 100])
          .range([height, 0]);

      // Add X axis
      svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x)
              .ticks(5)
              .tickFormat(d => d.toLocaleDateString('fa-IR')));

      // Add Y axis
      svg.append('g')
          .call(d3.axisLeft(y));

      // Add passing score line
      svg.append('line')
          .attr('x1', 0)
          .attr('y1', y(60))
          .attr('x2', width)
          .attr('y2', y(60))
          .attr('stroke', '#dc3545')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '5,5');

      // Add passing score label
      svg.append('text')
          .attr('x', width)
          .attr('y', y(60) - 5)
          .attr('text-anchor', 'end')
          .style('font-size', '12px')
          .style('fill', '#dc3545')
          .text('حد قبولی');

      // Add line
      const line = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.score))
          .curve(d3.curveMonotoneX);

      svg.append('path')
          .datum(examData)
          .attr('fill', 'none')
          .attr('stroke', '#007bff')
          .attr('stroke-width', 2)
          .attr('d', line);

      // Add points
      svg.selectAll('.point')
          .data(examData)
          .enter().append('circle')
          .attr('class', 'point')
          .attr('cx', d => x(d.date))
          .attr('cy', d => y(d.score))
          .attr('r', 5)
          .attr('fill', d => d.passed ? '#28a745' : '#dc3545');

      // Add labels
      svg.selectAll('.label')
          .data(examData)
          .enter().append('text')
          .attr('class', 'label')
          .attr('x', d => x(d.date))
          .attr('y', d => y(d.score) - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .text(d => d.score);
    },

    getProgressBarClass(progress) {
      if (progress >= 75) return 'bg-success';
      if (progress >= 50) return 'bg-info';
      if (progress >= 25) return 'bg-warning';
      return 'bg-danger';
    },

    getProgressBadgeClass(progress) {
      if (progress >= 75) return 'bg-success';
      if (progress >= 50) return 'bg-info';
      if (progress >= 25) return 'bg-warning';
      return 'bg-danger';
    },

    getEventIcon(eventType) {
      const icons = {
        exam: 'fas fa-clipboard-check',
        assignment: 'fas fa-tasks',
        lesson: 'fas fa-book',
        deadline: 'fas fa-clock',
        meeting: 'fas fa-users'
      };

      return icons[eventType] || 'fas fa-calendar-day';
    },

    getEventColorClass(eventType) {
      const colors = {
        exam: 'bg-danger',
        assignment: 'bg-warning',
        lesson: 'bg-info',
        deadline: 'bg-secondary',
        meeting: 'bg-primary'
      };

      return colors[eventType] || 'bg-light';
    },

    getDaysRemaining(dateString) {
      const eventDate = new Date(dateString);
      const today = new Date();

      // Reset time part for accurate day comparison
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'امروز';
      if (diffDays === 1) return 'فردا';
      if (diffDays > 1 && diffDays < 7) return `${diffDays} روز دیگر`;

      return this.formatDate(dateString);
    },

    generateSampleEvents() {
      // Generate sample events for the next 30 days
      const events = [];
      const today = new Date();

      // For each course
      this.courses.forEach(course => {
        // Add exam events
        const examDate = new Date(today);
        examDate.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1);

        events.push({
          id: `exam-${course.id}`,
          title: `آزمون ${course.title}`,
          date: examDate.toISOString(),
          type: 'exam',
          course: course
        });

        // Add assignment deadline events
        const assignmentDate = new Date(today);
        assignmentDate.setDate(today.getDate() + Math.floor(Math.random() * 10) + 1);

        events.push({
          id: `assignment-${course.id}`,
          title: `مهلت تحویل تکلیف ${course.title}`,
          date: assignmentDate.toISOString(),
          type: 'assignment',
          course: course
        });

        // Add lesson events
        const lessonDate = new Date(today);
        lessonDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);

        events.push({
          id: `lesson-${course.id}`,
          title: `کلاس آنلاین ${course.title}`,
          date: lessonDate.toISOString(),
          type: 'lesson',
          course: course
        });
      });

      return events;
    },

    refreshData() {
      this.fetchData();
    }
  }
}
</script>

<style scoped>
.dashboard-title {
  margin-bottom: 1.5rem;
}

.course-progress-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.course-progress-card:hover {
  transform: translateY(-3px);
}

.progress {
  height: 6px;
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
}

.performance-stats {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.performance-stats h6 {
  color: #6c757d;
  margin-bottom: 10px;
}

.performance-stats .display-4 {
  font-weight: 600;
  color: #212529;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.recommendation-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  text-align: center;
  height: 100%;
  transition: transform 0.3s;
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.recommendation-icon {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 15px;
}

.recommendation-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.recommendation-description {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.calendar-placeholder {
  color: #adb5bd;
}
</style>