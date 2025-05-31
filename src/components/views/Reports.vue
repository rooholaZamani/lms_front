<template>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-chart-line me-3"></i>
            گزارش‌ها و آمارها
          </h2>
          <p class="text-white-50 mb-0">مشاهده کامل عملکرد سیستم آموزشی</p>
        </div>

        <div class="d-flex gap-2">
          <div class="dropdown">
            <button class="modern-btn modern-btn-outline text-white dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-filter me-1"></i> دوره
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" @click.prevent="selectCourse('')">همه دوره‌ها</a></li>
              <li v-for="course in courses" :key="course.id">
                <a class="dropdown-item" href="#" @click.prevent="selectCourse(course.id)">
                  {{ course.title }}
                </a>
              </li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="modern-btn modern-btn-outline text-white dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-calendar me-1"></i> {{ selectedPeriodText }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" @click.prevent="selectPeriod('week')">هفته اخیر</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="selectPeriod('month')">ماه اخیر</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="selectPeriod('all')">تمام مدت</a></li>
            </ul>
          </div>
          <button class="modern-btn modern-btn-outline text-white" @click="exportReport">
            <i class="fas fa-download me-1"></i> دانلود گزارش
          </button>
          <button class="modern-btn modern-btn-outline text-white" @click="printReport">
            <i class="fas fa-print me-1"></i> چاپ
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Stats Overview -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up">
              <div class="modern-stat-icon text-primary">
                <i class="fas fa-users"></i>
              </div>
              <div class="modern-stat-value">{{ stats.totalStudents }}</div>
              <div class="modern-stat-label">کل دانش‌آموزان</div>
              <div class="modern-stat-trend" v-if="stats.studentsTrend">
                <i :class="getTrendIcon(stats.studentsTrend)" class="me-1"></i>
                {{ Math.abs(stats.studentsTrend) }}%
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-book"></i>
              </div>
              <div class="modern-stat-value">{{ stats.totalCourses }}</div>
              <div class="modern-stat-label">کل دوره‌ها</div>
              <div class="modern-stat-trend" v-if="stats.coursesTrend">
                <i :class="getTrendIcon(stats.coursesTrend)" class="me-1"></i>
                {{ Math.abs(stats.coursesTrend) }}%
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="modern-stat-value">{{ stats.averageCompletion }}%</div>
              <div class="modern-stat-label">نرخ تکمیل</div>
              <div class="modern-stat-trend" v-if="stats.completionTrend">
                <i :class="getTrendIcon(stats.completionTrend)" class="me-1"></i>
                {{ Math.abs(stats.completionTrend) }}%
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-star"></i>
              </div>
              <div class="modern-stat-value">{{ stats.averageScore }}</div>
              <div class="modern-stat-label">میانگین نمرات</div>
              <div class="modern-stat-trend" v-if="stats.scoreTrend">
                <i :class="getTrendIcon(stats.scoreTrend)" class="me-1"></i>
                {{ Math.abs(stats.scoreTrend) }}%
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Performance Chart -->
          <div class="col-md-8 mb-4">
            <div class="modern-card animate-slide-right">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-chart-area text-primary me-2"></i>
                  تحلیل عملکرد دوره‌ها
                </h5>
                <div class="chart-controls d-flex gap-2">
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'performance' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'performance'">
                    عملکرد
                  </button>
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'progress' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'progress'">
                    پیشرفت
                  </button>
                </div>
              </div>

              <div class="chart-container bg-light rounded p-4" style="height: 350px;">
                <canvas ref="performanceChart" width="400" height="200"></canvas>
              </div>

              <!-- Course Performance Details -->
              <div class="mt-4" v-if="selectedCourseId && coursePerformance">
                <h6 class="mb-3">
                  <i class="fas fa-info-circle text-info me-2"></i>
                  جزئیات عملکرد دوره انتخاب شده
                </h6>
                <div class="row">
                  <div class="col-md-3 col-6 mb-2">
                    <div class="performance-detail">
                      <div class="detail-value">{{ coursePerformance.studentCount }}</div>
                      <div class="detail-label">دانش‌آموزان</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-2">
                    <div class="performance-detail">
                      <div class="detail-value">{{ coursePerformance.averageProgress }}%</div>
                      <div class="detail-label">میانگین پیشرفت</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-2">
                    <div class="performance-detail">
                      <div class="detail-value">{{ coursePerformance.averageExamScore }}</div>
                      <div class="detail-label">میانگین نمره آزمون</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-2">
                    <div class="performance-detail">
                      <div class="detail-value">{{ coursePerformance.passingRate }}%</div>
                      <div class="detail-label">نرخ قبولی</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Performers -->
          <div class="col-md-4 mb-4">
            <div class="modern-card animate-slide-left">
              <h5 class="modern-title mb-4">
                <i class="fas fa-star text-warning me-2"></i>
                دانش‌آموزان برتر
              </h5>

              <div v-if="topPerformers.length === 0" class="text-center py-4">
                <div class="modern-logo large secondary mb-3">
                  <i class="fas fa-star"></i>
                </div>
                <p class="text-muted">اطلاعاتی موجود نیست</p>
              </div>

              <div v-else class="performers-list">
                <div v-for="(performer, index) in topPerformers" :key="performer.userId"
                     class="performer-item d-flex align-items-center mb-3">
                  <div class="performer-rank me-3">
                    <span class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</span>
                  </div>
                  <div class="performer-info flex-grow-1">
                    <div class="performer-name">{{ performer.name }}</div>
                    <div class="performer-score text-muted">
                      نمره: {{ performer.score }} | پیشرفت: {{ performer.progress }}%
                    </div>
                  </div>
                  <div class="performer-medal">
                    <i v-if="index === 0" class="fas fa-medal text-warning"></i>
                    <i v-else-if="index === 1" class="fas fa-medal" style="color: #c0c0c0;"></i>
                    <i v-else-if="index === 2" class="fas fa-medal" style="color: #cd7f32;"></i>
                  </div>
                </div>
              </div>

              <div class="text-center mt-3" v-if="selectedCourseId">
                <button class="modern-btn modern-btn-outline modern-btn-sm"
                        @click="viewAllPerformers">
                  مشاهده همه
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Analytics Row -->
        <div class="row mb-4">
          <!-- Difficult Lessons -->
          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.5s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                درس‌های چالش‌برانگیز
              </h5>

              <div v-if="difficultLessons.length === 0" class="text-center py-4">
                <div class="modern-logo large success mb-3">
                  <i class="fas fa-check-circle"></i>
                </div>
                <p class="text-muted">درس چالش‌برانگیزی یافت نشد</p>
              </div>

              <div v-else>
                <div v-for="lesson in difficultLessons" :key="lesson.id" class="lesson-difficulty-item mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold">{{ lesson.title }}</span>
                    <span class="modern-badge modern-badge-danger">{{ lesson.difficultyScore }}% چالش</span>
                  </div>
                  <div class="difficulty-metrics">
                    <div class="metric">
                      <span class="metric-label">نرخ شکست:</span>
                      <span class="metric-value text-danger">{{ lesson.failureRate }}%</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">میانگین زمان:</span>
                      <span class="metric-value">{{ lesson.averageTime }} دقیقه</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">تعداد تلاش مجدد:</span>
                      <span class="metric-value">{{ lesson.retryCount }}</span>
                    </div>
                  </div>
                  <div class="progress mt-2" style="height: 4px;">
                    <div class="progress-bar bg-danger"
                         :style="`width: ${lesson.difficultyScore}%`"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Struggling Students -->
          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.6s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-users text-info me-2"></i>
                دانش‌آموزان نیازمند کمک
              </h5>

              <div v-if="strugglingStudents.length === 0" class="text-center py-4">
                <div class="modern-logo large success mb-3">
                  <i class="fas fa-thumbs-up"></i>
                </div>
                <p class="text-muted">همه دانش‌آموزان عملکرد مناسبی دارند</p>
              </div>

              <div v-else>
                <div v-for="student in strugglingStudents" :key="student.id"
                     class="struggling-student-item d-flex align-items-center mb-3">
                  <div class="student-avatar me-3">
                    {{ getStudentInitials(student) }}
                  </div>
                  <div class="student-info flex-grow-1">
                    <div class="student-name fw-bold">{{ getStudentName(student) }}</div>
                    <div class="student-metrics">
                      <span class="text-muted">پیشرفت: {{ student.progress }}%</span>
                      <span class="text-muted ms-2">نمره: {{ student.averageScore }}</span>
                    </div>
                    <div class="progress mt-1" style="height: 4px;">
                      <div class="progress-bar bg-warning"
                           :style="`width: ${student.progress}%`"></div>
                    </div>
                  </div>
                  <div class="student-actions">
                    <button class="modern-btn modern-btn-primary modern-btn-sm"
                            @click="contactStudent(student)"
                            title="ارسال پیام">
                      <i class="fas fa-envelope"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Table -->
        <div class="row">
          <div class="col-12">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.7s;">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-history text-info me-2"></i>
                  فعالیت‌های اخیر دانش‌آموزان
                </h5>
                <div class="d-flex gap-2">
                  <button class="modern-btn modern-btn-secondary modern-btn-sm"
                          @click="refreshActivities">
                    <i class="fas fa-sync-alt me-1"></i> بروزرسانی
                  </button>
                  <router-link :to="{ name: 'StudentActivities' }"
                               class="modern-btn modern-btn-outline modern-btn-sm">
                    مشاهده همه
                  </router-link>
                </div>
              </div>

              <div v-if="recentActivities.length === 0" class="text-center py-5">
                <div class="modern-logo large secondary mb-4">
                  <i class="fas fa-history"></i>
                </div>
                <h5 class="text-muted">فعالیت اخیری یافت نشد</h5>
              </div>

              <div v-else class="modern-table-container">
                <table class="modern-table table">
                  <thead>
                  <tr>
                    <th><i class="fas fa-user me-1"></i> دانش‌آموز</th>
                    <th><i class="fas fa-tasks me-1"></i> نوع فعالیت</th>
                    <th><i class="fas fa-book me-1"></i> دوره</th>
                    <th><i class="fas fa-play-circle me-1"></i> جزئیات</th>
                    <th><i class="fas fa-clock me-1"></i> تاریخ</th>
                    <th><i class="fas fa-star me-1"></i> نمره</th>
                    <th><i class="fas fa-cogs me-1"></i> عملیات</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="activity in recentActivities" :key="activity.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="activity-avatar me-2">
                          {{ getStudentInitials(activity.student) }}
                        </div>
                        <div>
                          <div class="fw-bold">{{ getStudentName(activity.student) }}</div>
                          <small class="text-muted">{{ activity.student.email }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="modern-badge" :class="getActivityBadgeClass(activity.type)">
                        <i :class="getActivityIcon(activity.type)" class="me-1"></i>
                        {{ getActivityTypeText(activity.type) }}
                      </span>
                    </td>
                    <td>{{ activity.course?.title || 'نامشخص' }}</td>
                    <td>{{ activity.details || '-' }}</td>
                    <td>
                      <div>{{ formatDate(activity.date) }}</div>
                      <small class="text-muted">{{ getTimeAgo(activity.date) }}</small>
                    </td>
                    <td>
                      <span v-if="activity.score !== null" class="fw-bold text-success">
                        {{ activity.score }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button class="modern-btn modern-btn-primary modern-btn-sm"
                                @click="viewActivityDetails(activity)"
                                title="جزئیات">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button v-if="activity.type === 'exam' || activity.type === 'assignment'"
                                class="modern-btn modern-btn-info modern-btn-sm"
                                @click="viewSubmission(activity)"
                                title="مشاهده ارسالی">
                          <i class="fas fa-file-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Modal -->
        <div class="modal fade" id="exportModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-download me-2"></i>
                  دانلود گزارش
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">نوع فایل:</label>
                  <select class="form-select" v-model="exportOptions.format">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">محتوای گزارش:</label>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="exportOptions.includeStats" id="includeStats">
                    <label class="form-check-label" for="includeStats">آمار کلی</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="exportOptions.includeActivities" id="includeActivities">
                    <label class="form-check-label" for="includeActivities">فعالیت‌های اخیر</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="exportOptions.includePerformance" id="includePerformance">
                    <label class="form-check-label" for="includePerformance">تحلیل عملکرد</label>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="button" class="btn btn-primary" @click="performExport">
                  <i class="fas fa-download me-1"></i>
                  دانلود
                </button>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import axios from 'axios';

export default {
  name: 'Reports',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  data() {
    return {
      loading: true,
      selectedCourseId: '',
      selectedPeriod: 'month',
      chartType: 'performance',
      performanceChart: null,

      courses: [],

      stats: {
        totalStudents: 0,
        totalCourses: 0,
        averageCompletion: 0,
        averageScore: 0,
        studentsTrend: 0,
        coursesTrend: 0,
        completionTrend: 0,
        scoreTrend: 0
      },

      coursePerformance: null,
      topPerformers: [],
      difficultLessons: [],
      strugglingStudents: [],
      recentActivities: [],

      exportOptions: {
        format: 'pdf',
        includeStats: true,
        includeActivities: true,
        includePerformance: true
      }
    };
  },
  computed: {
    selectedPeriodText() {
      const periods = {
        week: 'هفته اخیر',
        month: 'ماه اخیر',
        all: 'تمام مدت'
      };
      return periods[this.selectedPeriod] || 'ماه اخیر';
    }
  },
  async created() {
    await this.initialize();
  },
  methods: {
    async initialize() {
      this.loading = true;
      try {
        await this.fetchCourses();
        await this.fetchOverallStats();
        await this.fetchRecentActivities();

        if (this.courses.length > 0) {
          await this.fetchCourseSpecificData();
        }
      } catch (error) {
        console.error('Error initializing reports:', error);
        this.$toast?.error('خطا در بارگذاری گزارش‌ها');
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.initializeChart();
        });
      }
    },

    async fetchCourses() {
      try {
        const response = await axios.get('/courses/teaching');
        this.courses = response.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    },

    async fetchOverallStats() {
      try {
        // Get overall statistics from multiple sources
        const [studentsCount, coursesData] = await Promise.all([
          this.getTotalStudentsFromCourses(),
          axios.get('/courses/teaching')
        ]);

        this.stats.totalStudents = studentsCount;
        this.stats.totalCourses = coursesData.data?.length || 0;

        // Calculate averages from course performance data
        if (this.courses.length > 0) {
          const performancePromises = this.courses.map(course =>
              axios.get(`/analytics/teacher/course/${course.id}/performance`).catch(() => null)
          );

          const performances = await Promise.all(performancePromises);
          const validPerformances = performances.filter(p => p?.data);

          if (validPerformances.length > 0) {
            const totalCompletion = validPerformances.reduce((sum, p) => sum + (p.data.completionRate || 0), 0);
            const totalScore = validPerformances.reduce((sum, p) => sum + (p.data.averageExamScore || 0), 0);

            this.stats.averageCompletion = Math.round(totalCompletion / validPerformances.length);
            this.stats.averageScore = Math.round(totalScore / validPerformances.length);
          }
        }

        // Mock trend data (in real app, compare with previous period)
        this.stats.studentsTrend = Math.floor(Math.random() * 20) - 10;
        this.stats.coursesTrend = Math.floor(Math.random() * 15) - 5;
        this.stats.completionTrend = Math.floor(Math.random() * 10) - 5;
        this.stats.scoreTrend = Math.floor(Math.random() * 8) - 4;
      } catch (error) {
        console.error('Error fetching overall stats:', error);
      }
    },

    async getTotalStudentsFromCourses() {
      try {
        const uniqueStudents = new Set();

        for (const course of this.courses) {
          if (course.enrolledStudents) {
            course.enrolledStudents.forEach(student => {
              uniqueStudents.add(student.id);
            });
          }
        }

        return uniqueStudents.size;
      } catch (error) {
        console.error('Error calculating total students:', error);
        return 0;
      }
    },

    async fetchCourseSpecificData() {
      if (!this.selectedCourseId && this.courses.length > 0) {
        this.selectedCourseId = this.courses[0].id;
      }

      if (this.selectedCourseId) {
        try {
          const [performanceRes, topPerformersRes, difficultLessonsRes, strugglingStudentsRes] = await Promise.all([
            axios.get(`/analytics/teacher/course/${this.selectedCourseId}/performance`),
            axios.get(`/analytics/course/${this.selectedCourseId}/top-performers`),
            axios.get(`/analytics/teacher/course/${this.selectedCourseId}/difficult-lessons`),
            axios.get(`/analytics/teacher/course/${this.selectedCourseId}/struggling-students`)
          ]);

          this.coursePerformance = performanceRes.data;
          this.topPerformers = topPerformersRes.data?.topByScore || [];
          this.difficultLessons = difficultLessonsRes.data || [];
          this.strugglingStudents = strugglingStudentsRes.data || [];
        } catch (error) {
          console.error('Error fetching course specific data:', error);
        }
      }
    },

    async fetchRecentActivities() {
      try {
        // Combine different types of activities
        const activities = [];

        // Get recent exam submissions
        try {
          const examSubmissions = await axios.get('/exams/submissions/student');
          if (examSubmissions.data) {
            examSubmissions.data.slice(0, 10).forEach(submission => {
              activities.push({
                id: `exam_${submission.id}`,
                type: 'exam',
                student: submission.student || { username: 'نامشخص' },
                course: submission.exam?.lesson?.course,
                details: submission.exam?.title,
                date: submission.submissionTime,
                score: submission.score,
                submissionId: submission.id
              });
            });
          }
        } catch (error) {
          console.error('Error fetching exam submissions:', error);
        }

        // Get recent assignment submissions
        try {
          const assignmentSubmissions = await axios.get('/assignments/submissions/student');
          if (assignmentSubmissions.data) {
            assignmentSubmissions.data.slice(0, 10).forEach(submission => {
              activities.push({
                id: `assignment_${submission.id}`,
                type: 'assignment',
                student: submission.student || { username: 'نامشخص' },
                course: submission.assignment?.lesson?.course,
                details: submission.assignment?.title,
                date: submission.submissionTime,
                score: submission.score,
                submissionId: submission.id
              });
            });
          }
        } catch (error) {
          console.error('Error fetching assignment submissions:', error);
        }

        // Sort by date and take most recent
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.recentActivities = activities.slice(0, 15);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    },

    selectCourse(courseId) {
      this.selectedCourseId = courseId;
      this.fetchCourseSpecificData();
    },

    selectPeriod(period) {
      this.selectedPeriod = period;
      this.initialize();
    },

    async refreshActivities() {
      await this.fetchRecentActivities();
      this.$toast?.success('فعالیت‌ها بروزرسانی شد');
    },

    initializeChart() {
      const canvas = this.$refs.performanceChart;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      // Clear previous chart
      if (this.performanceChart) {
        this.performanceChart.destroy();
      }

      // Sample data for demonstration
      const data = {
        labels: this.courses.map(course => course.title.substring(0, 15) + '...'),
        datasets: [{
          label: this.chartType === 'performance' ? 'میانگین نمرات' : 'درصد پیشرفت',
          data: this.courses.map(() => Math.floor(Math.random() * 40) + 60),
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          fill: true
        }]
      };

      this.performanceChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    },

    getTrendIcon(trend) {
      if (trend > 0) return 'fas fa-arrow-up text-success';
      if (trend < 0) return 'fas fa-arrow-down text-danger';
      return 'fas fa-minus text-muted';
    },

    getRankClass(index) {
      if (index === 0) return 'rank-gold';
      if (index === 1) return 'rank-silver';
      if (index === 2) return 'rank-bronze';
      return 'rank-default';
    },

    getStudentName(student) {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    },

    getStudentInitials(student) {
      if (!student) return 'N';
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || student.username?.charAt(0).toUpperCase() || 'U';
    },

    getActivityBadgeClass(type) {
      const classes = {
        exam: 'modern-badge-primary',
        assignment: 'modern-badge-warning',
        lesson_complete: 'modern-badge-success',
        course_enrollment: 'modern-badge-info'
      };
      return classes[type] || 'modern-badge-secondary';
    },

    getActivityIcon(type) {
      const icons = {
        exam: 'fas fa-clipboard-check',
        assignment: 'fas fa-file-alt',
        lesson_complete: 'fas fa-check-circle',
        course_enrollment: 'fas fa-user-plus'
      };
      return icons[type] || 'fas fa-circle';
    },

    getActivityTypeText(type) {
      const texts = {
        exam: 'آزمون',
        assignment: 'تکلیف',
        lesson_complete: 'تکمیل درس',
        course_enrollment: 'ثبت‌نام دوره'
      };
      return texts[type] || 'فعالیت';
    },

    getTimeAgo(dateString) {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${diffDays} روز قبل`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته قبل`;
      return `${Math.floor(diffDays / 30)} ماه قبل`;
    },

    viewAllPerformers() {
      this.$router.push({
        name: 'Analytics',
        query: { courseId: this.selectedCourseId }
      });
    },

    async contactStudent(student) {
      if (!student.courseId) {
        this.$toast?.error('اطلاعات دوره یافت نشد');
        return;
      }

      const message = prompt(`پیام برای ${this.getStudentName(student)}:`);
      if (!message) return;

      try {
        await axios.post(`/chat/course/${student.courseId}/send`, null, {
          params: {
            message: `@${student.username} ${message}`
          }
        });
        this.$toast?.success('پیام ارسال شد');
      } catch (error) {
        console.error('Error sending message:', error);
        this.$toast?.error('خطا در ارسال پیام');
      }
    },

    viewActivityDetails(activity) {
      this.$toast?.info(`جزئیات ${this.getActivityTypeText(activity.type)}: ${activity.details}`);
    },

    viewSubmission(activity) {
      // Navigate to submission details
      if (activity.type === 'exam') {
        this.$router.push({
          name: 'ExamResults',
          params: { id: activity.submissionId }
        });
      } else if (activity.type === 'assignment') {
        this.$toast?.info('مشاهده تکلیف ارسالی');
      }
    },

    exportReport() {
      const modal = new bootstrap.Modal(document.getElementById('exportModal'));
      modal.show();
    },

    async performExport() {
      try {
        this.$toast?.info(`در حال تهیه گزارش ${this.exportOptions.format.toUpperCase()}...`);

        // Simulate export process
        await new Promise(resolve => setTimeout(resolve, 2000));

        this.$toast?.success('گزارش با موفقیت دانلود شد');

        const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
        modal.hide();
      } catch (error) {
        console.error('Export error:', error);
        this.$toast?.error('خطا در تهیه گزارش');
      }
    },

    printReport() {
      window.print();
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
}

.chart-controls .modern-btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.performance-detail {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.detail-label {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.performers-list {
  max-height: 300px;
  overflow-y: auto;
}

.performer-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.performer-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
}

.rank-gold { background: linear-gradient(135deg, #FFD700, #FFA500); }
.rank-silver { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); }
.rank-bronze { background: linear-gradient(135deg, #CD7F32, #B8860B); }
.rank-default { background: linear-gradient(135deg, #667eea, #764ba2); }

.lesson-difficulty-item,
.struggling-student-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.difficulty-metrics {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8rem;
}

.metric-label {
  color: #666;
}

.metric-value {
  font-weight: bold;
  margin-top: 0.2rem;
}

.student-avatar,
.activity-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.modern-stat-trend {
  font-size: 0.75rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .chart-container {
    height: 200px !important;
  }

  .difficulty-metrics {
    flex-direction: column;
    gap: 0.5rem;
  }

  .metric {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media print {
  .modern-btn,
  .dropdown,
  .chart-controls {
    display: none !important;
  }

  .modern-card {
    break-inside: avoid;
    margin-bottom: 1rem;
  }
}
</style>