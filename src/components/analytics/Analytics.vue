<template>
  <div class="modern-page-bg success-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo success">
          <i class="fas fa-chart-line"></i>
        </div>
        <h1 class="modern-title">{{ isTeacher ? 'تحلیل عملکرد دوره' : 'تحلیل عملکرد من' }}</h1>
        <p class="modern-subtitle">{{ isTeacher ? 'بررسی جامع عملکرد دانش‌آموزان' : 'مشاهده پیشرفت و نتایج شما' }}</p>
      </div>

      <!-- Course Selector for Teachers -->
      <div v-if="isTeacher" class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.2s;">
        <div class="modern-form-group">
          <label for="courseSelect" class="modern-form-label">انتخاب دوره برای تحلیل:</label>
          <select class="modern-form-control" id="courseSelect" v-model="selectedCourseId" @change="onCourseChange">
            <option value="" disabled>انتخاب دوره</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
          </select>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Student-specific analytics -->
        <div v-if="!isTeacher" class="student-analytics">
          <!-- Performance Overview -->
          <div class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.3s;">
            <h5 class="modern-title mb-4">
              <i class="fas fa-chart-pie text-primary me-2"></i>
              خلاصه عملکرد
            </h5>
            <div class="row">
              <div class="col-md-3 text-center mb-3">
                <div class="analytics-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12" />
                    <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="white"
                        stroke-width="12"
                        stroke-dasharray="339.292"
                        :stroke-dashoffset="calculateCircleDashOffset(studentPerformance.averageProgress)"
                        transform="rotate(-90, 60, 60)"
                    />
                  </svg>
                  <div class="circle-text">
                    <div class="circle-percentage">{{ studentPerformance.averageProgress }}%</div>
                    <div class="circle-label">پیشرفت کلی</div>
                  </div>
                </div>
              </div>
              <div class="col-md-9">
                <div class="row">
                  <div class="col-md-4 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">دوره‌های ثبت‌نام شده</div>
                      <div class="stat-value">{{ studentPerformance.enrolledCourses }}</div>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">دوره‌های تکمیل شده</div>
                      <div class="stat-value">{{ studentPerformance.completedCourses }}</div>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">میانگین نمره آزمون</div>
                      <div class="stat-value">{{ studentPerformance.averageExamScore }}</div>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">امتیاز تمرین‌ها</div>
                      <div class="stat-value">{{ studentPerformance.totalExercisePoints }}</div>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">تکالیف ارسال شده</div>
                      <div class="stat-value">{{ studentPerformance.submittedAssignments }}</div>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">میانگین نمره تکالیف</div>
                      <div class="stat-value">{{ studentPerformance.averageAssignmentScore }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Performance Comparison -->
          <div v-if="selectedCourseId" class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.4s;">
            <h5 class="modern-title mb-4">
              <i class="fas fa-balance-scale text-info me-2"></i>
              مقایسه عملکرد در دوره
            </h5>
            <div class="row mb-4">
              <div class="col-md-6">
                <h6 class="text-white">مقایسه پیشرفت</h6>
                <div class="comparison-container">
                  <div class="comparison-item">
                    <span class="comparison-label">شما</span>
                    <div class="comparison-bar">
                      <div class="comparison-fill yours" :style="`width: ${studentComparison.studentProgress}%`"></div>
                    </div>
                    <span class="comparison-value">{{ studentComparison.studentProgress }}%</span>
                  </div>
                  <div class="comparison-item">
                    <span class="comparison-label">میانگین</span>
                    <div class="comparison-bar">
                      <div class="comparison-fill average" :style="`width: ${studentComparison.averageProgress}%`"></div>
                    </div>
                    <span class="comparison-value">{{ studentComparison.averageProgress }}%</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="text-white">مقایسه نمره آزمون</h6>
                <div class="comparison-container">
                  <div class="comparison-item">
                    <span class="comparison-label">شما</span>
                    <div class="comparison-bar">
                      <div class="comparison-fill yours" :style="`width: ${studentComparison.studentExamScore}%`"></div>
                    </div>
                    <span class="comparison-value">{{ studentComparison.studentExamScore }}</span>
                  </div>
                  <div class="comparison-item">
                    <span class="comparison-label">میانگین</span>
                    <div class="comparison-bar">
                      <div class="comparison-fill average" :style="`width: ${studentComparison.averageExamScore}%`"></div>
                    </div>
                    <span class="comparison-value">{{ studentComparison.averageExamScore }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="rank-container">
              <div class="rank-badge">
                <div class="rank-number">{{ studentComparison.studentRank }}</div>
                <div class="rank-label">رتبه شما</div>
              </div>
              <div class="rank-info">
                <p class="text-white">رتبه شما در میان {{ studentComparison.totalStudents }} دانش‌آموز این دوره</p>
                <div class="rank-progress">
                  <div class="rank-progress-indicator" :style="`left: ${calculateRankPercentage(studentComparison.studentRank, studentComparison.totalStudents)}%`"></div>
                </div>
                <div class="rank-scale">
                  <span>1</span>
                  <span>{{ Math.ceil(studentComparison.totalStudents / 2) }}</span>
                  <span>{{ studentComparison.totalStudents }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Exams Performance -->
          <div class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.5s;">
            <h5 class="modern-title mb-4">
              <i class="fas fa-clipboard-check text-warning me-2"></i>
              عملکرد آزمون‌های اخیر
            </h5>
            <div v-if="recentExams.length === 0" class="text-center py-4">
              <div class="modern-logo large secondary mb-3">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <p class="text-white">هنوز در هیچ آزمونی شرکت نکرده‌اید.</p>
            </div>
            <div v-else class="modern-table-container">
              <table class="modern-table table">
                <thead>
                <tr>
                  <th>عنوان آزمون</th>
                  <th>دوره</th>
                  <th>نمره</th>
                  <th>میانگین کلاس</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="exam in recentExams" :key="exam.id">
                  <td>{{ exam.title }}</td>
                  <td>{{ exam.courseName }}</td>
                  <td>{{ exam.score }}</td>
                  <td>{{ exam.classAverage }}</td>
                  <td>
                      <span :class="exam.passed ? 'modern-badge modern-badge-success' : 'modern-badge modern-badge-danger'">
                        {{ exam.passed ? 'قبول' : 'مردود' }}
                      </span>
                  </td>
                  <td>{{ formatDate(exam.date) }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Teacher-specific analytics -->
        <div v-else class="teacher-analytics">
          <!-- Course Performance Overview -->
          <div v-if="selectedCourseId" class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.3s;">
            <h5 class="modern-title mb-4">
              <i class="fas fa-chart-bar text-primary me-2"></i>
              نمای کلی عملکرد دوره
            </h5>
            <div class="row">
              <div class="col-md-6">
                <div class="row">
                  <div class="col-md-6 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">تعداد دانش‌آموزان</div>
                      <div class="stat-value">{{ coursePerformance.studentCount }}</div>
                    </div>
                  </div>
                  <div class="col-md-6 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">میانگین پیشرفت</div>
                      <div class="stat-value">{{ coursePerformance.averageProgress }}%</div>
                    </div>
                  </div>
                  <div class="col-md-6 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">میانگین نمره آزمون</div>
                      <div class="stat-value">{{ coursePerformance.averageExamScore }}</div>
                    </div>
                  </div>
                  <div class="col-md-6 col-sm-6 mb-3">
                    <div class="stat-card">
                      <div class="stat-title">نرخ قبولی</div>
                      <div class="stat-value">{{ coursePerformance.passingRate }}%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="completion-stats">
                  <h6 class="text-white mb-3">وضعیت تکمیل دوره</h6>
                  <div class="completion-chart">
                    <div class="completion-segment completed" :style="`width: ${coursePerformance.completionRate}%`">
                      <span>{{ coursePerformance.completionRate }}%</span>
                    </div>
                    <div class="completion-segment in-progress" :style="`width: ${100 - coursePerformance.completionRate}%`">
                      <span>{{ 100 - coursePerformance.completionRate }}%</span>
                    </div>
                  </div>
                  <div class="completion-legend">
                    <div class="legend-item">
                      <div class="legend-color completed"></div>
                      <span>کاملاً تکمیل شده</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color in-progress"></div>
                      <span>در حال انجام</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Performers and Struggling Students -->
          <div v-if="selectedCourseId" class="row">
            <div class="col-md-6 mb-4">
              <div class="modern-card animate-slide-up" style="animation-delay: 0.4s;">
                <h5 class="modern-title mb-4">
                  <i class="fas fa-star text-warning me-2"></i>
                  دانش‌آموزان برتر
                </h5>
                <div v-if="topPerformers.topByScore.length === 0" class="text-center py-4">
                  <div class="modern-logo large secondary mb-3">
                    <i class="fas fa-star"></i>
                  </div>
                  <p class="text-white">اطلاعاتی موجود نیست</p>
                </div>
                <div v-else>
                  <h6 class="text-white text-center mb-3">برترین‌ها براساس نمره</h6>
                  <div class="performers-list">
                    <div v-for="(student, index) in topPerformers.topByScore" :key="student.userId" class="performer-item">
                      <div class="performer-rank">{{ index + 1 }}</div>
                      <div class="performer-info">
                        <div class="performer-name">{{ student.name }}</div>
                        <div class="performer-score">{{ student.score }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6 mb-4">
              <div class="modern-card animate-slide-up" style="animation-delay: 0.5s;">
                <h5 class="modern-title mb-4">
                  <i class="fas fa-users text-info me-2"></i>
                  دانش‌آموزان نیازمند توجه
                </h5>
                <div v-if="strugglingStudents.length === 0" class="text-center py-4">
                  <div class="modern-logo large success mb-3">
                    <i class="fas fa-thumbs-up"></i>
                  </div>
                  <p class="text-white">در حال حاضر همه دانش‌آموزان عملکرد خوبی دارند.</p>
                </div>
                <div v-else class="modern-table-container">
                  <table class="modern-table table">
                    <thead>
                    <tr>
                      <th>نام دانش‌آموز</th>
                      <th>پیشرفت</th>
                      <th>عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="student in strugglingStudents" :key="student.id">
                      <td>{{ student.name }}</td>
                      <td>
                        <div class="progress">
                          <div class="progress-bar bg-warning" :style="`width: ${student.progress}%`">
                            {{ student.progress }}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <button class="modern-btn modern-btn-primary modern-btn-sm" @click="viewStudentProgress(student)">
                          <i class="fas fa-chart-line"></i>
                        </button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'Analytics',
  components: {
    LoadingSpinner
  },
  props: {
    courseId: {
      type: String,
      default: null
    }
  },
  setup() {
    const { isTeacher, isStudent } = useUser();
    const { formatDate } = useFormatters();

    return {
      isTeacher,
      isStudent,
      formatDate
    };
  },
  data() {
    return {
      loading: true,
      selectedCourseId: this.courseId || '',
      courses: [],

      studentPerformance: {
        enrolledCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        averageExamScore: 0,
        totalExercisePoints: 0,
        submittedAssignments: 0,
        averageAssignmentScore: 0
      },
      studentComparison: {
        studentProgress: 0,
        averageProgress: 0,
        studentExamScore: 0,
        averageExamScore: 0,
        studentRank: 0,
        totalStudents: 0
      },
      recentExams: [],

      coursePerformance: {
        studentCount: 0,
        averageProgress: 0,
        averageExamScore: 0,
        passingRate: 0,
        completionRate: 0
      },
      topPerformers: {
        topByScore: [],
        topByProgress: [],
        topByParticipation: []
      },
      strugglingStudents: []
    };
  },
  async created() {
    if (this.isTeacher) {
      await this.fetchTeacherCourses();
    }

    if (this.selectedCourseId) {
      await this.fetchData();
    } else if (!this.isTeacher) {
      await this.fetchStudentPerformance();
    }
  },
  methods: {
    async fetchTeacherCourses() {
      try {
        const response = await axios.get('/courses/teaching');
        this.courses = response.data;

        if (!this.selectedCourseId && this.courses.length > 0) {
          this.selectedCourseId = this.courses[0].id;
        }
      } catch (error) {
        console.error('Error fetching teacher courses:', error);
        this.$toast.error('مشکلی در دریافت لیست دوره‌ها رخ داد.');
      }
    },

    async fetchData() {
      this.loading = true;

      try {
        if (this.isTeacher) {
          await this.fetchTeacherAnalytics();
        } else {
          await this.fetchStudentPerformance();
          await this.fetchStudentComparison();
          await this.fetchRecentExams();
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        this.$toast.error('مشکلی در دریافت اطلاعات تحلیلی رخ داد.');
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentPerformance() {
      try {
        const response = await axios.get('/analytics/student/performance');
        this.studentPerformance = response.data;
      } catch (error) {
        console.error('Error fetching student performance:', error);
      }
    },

    async fetchStudentComparison() {
      if (!this.selectedCourseId) return;

      try {
        const response = await axios.get(`/analytics/course/${this.selectedCourseId}/student-comparison`);
        this.studentComparison = response.data;
      } catch (error) {
        console.error('Error fetching student comparison:', error);
      }
    },

    async fetchRecentExams() {
      try {
        const response = await axios.get('/exams/submissions/student');

        this.recentExams = response.data.map(submission => {
          return {
            id: submission.id,
            title: submission.exam ? submission.exam.title : 'نامشخص',
            courseName: this.getCourseName(submission),
            score: submission.score,
            classAverage: submission.classAverage || 0,
            passed: submission.passed,
            date: submission.submissionTime
          };
        }).slice(0, 5);
      } catch (error) {
        console.error('Error fetching recent exams:', error);
      }
    },

    async fetchTeacherAnalytics() {
      try {
        const performancePromise = axios.get(`/analytics/teacher/course/${this.selectedCourseId}/performance`);
        const topPerformersPromise = axios.get(`/analytics/course/${this.selectedCourseId}/top-performers`);
        const strugglingStudentsPromise = axios.get(`/analytics/teacher/course/${this.selectedCourseId}/struggling-students`);

        const [
          performanceResponse,
          topPerformersResponse,
          strugglingStudentsResponse
        ] = await Promise.all([
          performancePromise,
          topPerformersPromise,
          strugglingStudentsPromise
        ]);

        this.coursePerformance = performanceResponse.data;
        this.topPerformers = topPerformersResponse.data;
        this.strugglingStudents = strugglingStudentsResponse.data;
      } catch (error) {
        console.error('Error fetching teacher analytics:', error);
      }
    },

    onCourseChange() {
      if (this.selectedCourseId) {
        this.fetchData();
      }
    },

    getCourseName(submission) {
      if (!submission.exam || !submission.exam.lesson || !submission.exam.lesson.course) {
        return 'نامشخص';
      }
      return submission.exam.lesson.course.title;
    },

    viewStudentProgress(student) {
      this.$router.push({
        name: 'StudentProgress',
        params: {
          courseId: this.selectedCourseId,
          studentId: student.id
        }
      });
    },

    calculateCircleDashOffset(percentage) {
      const circumference = 2 * Math.PI * 54;
      return circumference * (1 - percentage / 100);
    },

    calculateRankPercentage(rank, total) {
      if (total <= 1) return 50;
      return ((rank - 1) / (total - 1)) * 100;
    }
  }
}
</script>

<style scoped>
.analytics-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.circle-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.circle-percentage {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.circle-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.comparison-container {
  margin-bottom: 1rem;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.comparison-label {
  min-width: 60px;
  color: white;
  font-size: 0.9rem;
}

.comparison-bar {
  flex: 1;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.comparison-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.comparison-fill.yours {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.comparison-fill.average {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.comparison-value {
  min-width: 50px;
  color: white;
  font-weight: bold;
  text-align: right;
}

.rank-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.rank-badge {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  margin-left: 1.5rem;
  flex-shrink: 0;
}

.rank-number {
  font-size: 2rem;
  font-weight: bold;
}

.rank-label {
  font-size: 0.8rem;
}

.rank-info {
  flex: 1;
}

.rank-progress {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 10px 0;
}

.rank-progress-indicator {
  position: absolute;
  top: -6px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transform: translateX(-50%);
}

.rank-scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.completion-stats {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
}

.completion-chart {
  display: flex;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  margin: 15px 0;
}

.completion-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  padding: 0 10px;
  white-space: nowrap;
  font-size: 0.9rem;
}

.completion-segment.completed {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.completion-segment.in-progress {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.completion-legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: white;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-left: 0.5rem;
}

.legend-color.completed {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.legend-color.in-progress {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.performers-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.performer-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.performer-item:last-child {
  border-bottom: none;
}

.performer-rank {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-left: 1rem;
  font-size: 0.8rem;
}

.performer-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.performer-name {
  font-weight: 500;
  color: white;
}

.performer-score {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
}

.progress {
  height: 6px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .rank-container {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .rank-badge {
    margin-left: 0;
  }

  .comparison-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .comparison-bar {
    width: 100%;
  }

  .completion-legend {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>