<template>
  <div class="analytics-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ isTeacher ? 'تحلیل عملکرد دوره' : 'تحلیل عملکرد من' }}</h2>
        
        <!-- Course selector for teachers -->
        <div v-if="isTeacher" class="col-md-4">
          <select class="form-select" v-model="selectedCourseId" @change="onCourseChange">
            <option value="" disabled>انتخاب دوره</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
          </select>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Student-specific analytics -->
        <div v-if="!isTeacher" class="student-analytics">
          <!-- Performance Overview -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">خلاصه عملکرد</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 text-center mb-3">
                  <div class="analytics-circle">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e9ecef" stroke-width="12" />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#007bff"
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
          </div>

          <!-- Course Performance Comparison -->
          <div v-if="selectedCourseId" class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">مقایسه عملکرد در دوره</h5>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-6">
                  <h6>مقایسه پیشرفت</h6>
                  <div class="comparison-bar-container">
                    <div class="comparison-labels">
                      <span>شما</span>
                      <span>میانگین</span>
                    </div>
                    <div class="comparison-bars">
                      <div class="comparison-bar-wrapper">
                        <div class="comparison-bar comparison-yours" :style="`width: ${studentComparison.studentProgress}%`"></div>
                        <span class="comparison-value">{{ studentComparison.studentProgress }}%</span>
                      </div>
                      <div class="comparison-bar-wrapper">
                        <div class="comparison-bar comparison-avg" :style="`width: ${studentComparison.averageProgress}%`"></div>
                        <span class="comparison-value">{{ studentComparison.averageProgress }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6>مقایسه نمره آزمون</h6>
                  <div class="comparison-bar-container">
                    <div class="comparison-labels">
                      <span>شما</span>
                      <span>میانگین</span>
                    </div>
                    <div class="comparison-bars">
                      <div class="comparison-bar-wrapper">
                        <div class="comparison-bar comparison-yours" :style="`width: ${studentComparison.studentExamScore}%`"></div>
                        <span class="comparison-value">{{ studentComparison.studentExamScore }}</span>
                      </div>
                      <div class="comparison-bar-wrapper">
                        <div class="comparison-bar comparison-avg" :style="`width: ${studentComparison.averageExamScore}%`"></div>
                        <span class="comparison-value">{{ studentComparison.averageExamScore }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="student-rank-container">
                <div class="rank-badge">
                  <div class="rank-number">{{ studentComparison.studentRank }}</div>
                  <div class="rank-label">رتبه شما</div>
                </div>
                <div class="rank-info">
                  <p>رتبه شما در میان {{ studentComparison.totalStudents }} دانش‌آموز این دوره</p>
                  <div class="rank-progress">
                    <div class="rank-progress-bar" :style="`left: ${calculateRankPercentage(studentComparison.studentRank, studentComparison.totalStudents)}%`"></div>
                  </div>
                  <div class="rank-scale">
                    <span>1</span>
                    <span>{{ Math.ceil(studentComparison.totalStudents / 2) }}</span>
                    <span>{{ studentComparison.totalStudents }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Exams Performance -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">عملکرد آزمون‌های اخیر</h5>
            </div>
            <div class="card-body">
              <div v-if="recentExams.length === 0" class="text-center py-4">
                <p>هنوز در هیچ آزمونی شرکت نکرده‌اید.</p>
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table">
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
                          <span :class="exam.passed ? 'badge bg-success' : 'badge bg-danger'">
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
          </div>
        </div>

        <!-- Teacher-specific analytics -->
        <div v-else class="teacher-analytics">
          <!-- Course Performance Overview -->
          <div v-if="selectedCourseId" class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">نمای کلی عملکرد دوره</h5>
            </div>
            <div class="card-body">
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
                  <div class="course-completion-stats">
                    <h6>وضعیت تکمیل دوره</h6>
                    <div class="completion-chart">
                      <div class="completion-segment completed" :style="`width: ${coursePerformance.completionRate}%`">
                        <span>تکمیل شده: {{ coursePerformance.completionRate }}%</span>
                      </div>
                      <div class="completion-segment in-progress" :style="`width: ${100 - coursePerformance.completionRate}%`">
                        <span>در حال انجام: {{ 100 - coursePerformance.completionRate }}%</span>
                      </div>
                    </div>
                    <div class="completion-legend">
                      <div class="legend-item">
                        <div class="legend-color completed"></div>
                        <div>کاملاً تکمیل شده</div>
                      </div>
                      <div class="legend-item">
                        <div class="legend-color in-progress"></div>
                        <div>در حال انجام</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Performers -->
          <div v-if="selectedCourseId" class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">دانش‌آموزان برتر</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <h6 class="text-center">برترین‌ها براساس نمره</h6>
                  <div class="top-performers-list">
                    <div v-for="(student, index) in topPerformers.topByScore" :key="student.userId" class="top-performer-item">
                      <div class="performer-rank">{{ index + 1 }}</div>
                      <div class="performer-info">
                        <div class="performer-name">{{ student.name }}</div>
                        <div class="performer-score">{{ student.score }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <h6 class="text-center">برترین‌ها براساس پیشرفت</h6>
                  <div class="top-performers-list">
                    <div v-for="(student, index) in topPerformers.topByProgress" :key="student.userId" class="top-performer-item">
                      <div class="performer-rank">{{ index + 1 }}</div>
                      <div class="performer-info">
                        <div class="performer-name">{{ student.name }}</div>
                        <div class="performer-score">{{ student.progress }}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <h6 class="text-center">برترین‌ها براساس مشارکت</h6>
                  <div class="top-performers-list">
                    <div v-for="(student, index) in topPerformers.topByParticipation" :key="student.userId" class="top-performer-item">
                      <div class="performer-rank">{{ index + 1 }}</div>
                      <div class="performer-info">
                        <div class="performer-name">{{ student.name }}</div>
                        <div class="performer-score">{{ student.participation }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Difficult Lessons -->
          <div v-if="selectedCourseId" class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">درس‌های چالش‌برانگیز</h5>
            </div>
            <div class="card-body">
              <div v-if="difficultLessons.length === 0" class="text-center py-4">
                <p>اطلاعات کافی برای تحلیل درس‌های چالش‌برانگیز وجود ندارد.</p>
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>عنوان درس</th>
                        <th>میانگین پیشرفت</th>
                        <th>میانگین زمان تکمیل (دقیقه)</th>
                        <th>نرخ موفقیت آزمون</th>
                        <th>سطح چالش</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="lesson in difficultLessons" :key="lesson.id">
                        <td>{{ lesson.title }}</td>
                        <td>{{ lesson.averageProgress }}%</td>
                        <td>{{ lesson.averageCompletionTime }}</td>
                        <td>{{ lesson.examSuccessRate }}%</td>
                        <td>
                          <span :class="getDifficultLessonBadgeClass(lesson.difficultyScore)">
                            {{ getDifficultLessonText(lesson.difficultyScore) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Struggling Students -->
          <div v-if="selectedCourseId" class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">دانش‌آموزان نیازمند توجه</h5>
            </div>
            <div class="card-body">
              <div v-if="strugglingStudents.length === 0" class="text-center py-4">
                <p>در حال حاضر همه دانش‌آموزان عملکرد خوبی دارند.</p>
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>نام دانش‌آموز</th>
                        <th>پیشرفت</th>
                        <th>آخرین فعالیت</th>
                        <th>تکمیل محتوا</th>
                        <th>نمره آزمون‌ها</th>
                        <th>اقدامات</th>
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
                        <td>{{ formatDate(student.lastActivity) }}</td>
                        <td>{{ student.contentCompletionRate }}%</td>
                        <td>{{ student.examAverage }}</td>
                        <td>
                          <button class="btn btn-sm btn-primary" @click="viewStudentProgress(student)">
                            <i class="fas fa-chart-line"></i> جزئیات
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
      
      // Student data
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
        minProgress: 0,
        maxProgress: 0,
        studentExamScore: 0,
        averageExamScore: 0,
        studentRank: 0,
        totalStudents: 0
      },
      recentExams: [],
      
      // Teacher data
      coursePerformance: {
        studentCount: 0,
        averageProgress: 0,
        averageExamScore: 0,
        passingRate: 0,
        completionRate: 0,
        averageTimeSpent: 0
      },
      topPerformers: {
        topByScore: [],
        topByProgress: [],
        topByParticipation: []
      },
      difficultLessons: [],
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
      // If student and no courseId, fetch overall performance
      await this.fetchStudentPerformance();
    }
  },
  methods: {
    async fetchTeacherCourses() {
      try {
        const response = await axios.get('/courses/teaching');
        this.courses = response.data;
        
        // If courseId not provided and there are courses, select the first one
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
        
        // Transform the data to include more info
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
        }).slice(0, 5); // Get last 5 exams
      } catch (error) {
        console.error('Error fetching recent exams:', error);
      }
    },
    
    async fetchTeacherAnalytics() {
      try {
        const performancePromise = axios.get(`/analytics/teacher/course/${this.selectedCourseId}/performance`);
        const topPerformersPromise = axios.get(`/analytics/course/${this.selectedCourseId}/top-performers`);
        const difficultLessonsPromise = axios.get(`/analytics/teacher/course/${this.selectedCourseId}/difficult-lessons`);
        const strugglingStudentsPromise = axios.get(`/analytics/teacher/course/${this.selectedCourseId}/struggling-students`);
        
        const [
          performanceResponse,
          topPerformersResponse,
          difficultLessonsResponse,
          strugglingStudentsResponse
        ] = await Promise.all([
          performancePromise,
          topPerformersPromise,
          difficultLessonsPromise,
          strugglingStudentsPromise
        ]);
        
        this.coursePerformance = performanceResponse.data;
        this.topPerformers = topPerformersResponse.data;
        this.difficultLessons = difficultLessonsResponse.data;
        this.strugglingStudents = strugglingStudentsResponse.data;
      } catch (error) {
        console.error('Error fetching teacher analytics:', error);
      }
    },
    
    onCourseChange() {
      // Navigate to the selected course or reload data
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
      const circumference = 2 * Math.PI * 54; // 2πr where r=54
      return circumference * (1 - percentage / 100);
    },
    
    calculateRankPercentage(rank, total) {
      if (total <= 1) return 50;
      return ((rank - 1) / (total - 1)) * 100;
    },
    
    getDifficultLessonBadgeClass(score) {
      if (score >= 75) {
        return 'badge bg-danger';
      } else if (score >= 50) {
        return 'badge bg-warning';
      } else if (score >= 25) {
        return 'badge bg-info';
      } else {
        return 'badge bg-success';
      }
    },
    
    getDifficultLessonText(score) {
      if (score >= 75) {
        return 'خیلی دشوار';
      } else if (score >= 50) {
        return 'دشوار';
      } else if (score >= 25) {
        return 'متوسط';
      } else {
        return 'آسان';
      }
    }
  }
}
</script>

<style scoped>
.analytics-container {
  min-height: calc(100vh - 56px);
}

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
  color: #007bff;
}

.circle-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.stat-card {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.stat-title {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #212529;
}

.comparison-bar-container {
  margin-bottom: 20px;
}

.comparison-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comparison-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comparison-bar-wrapper {
  position: relative;
  height: 30px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.comparison-bar {
  height: 100%;
  border-radius: 5px;
}

.comparison-yours {
  background-color: #007bff;
}

.comparison-avg {
  background-color: #6c757d;
}

.comparison-value {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  color: white;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.student-rank-container {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  margin-top: 20px;
}

.rank-badge {
  width: 80px;
  height: 80px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  margin-left: 20px;
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
  background-color: #e9ecef;
  border-radius: 2px;
  margin: 10px 0;
}

.rank-progress-bar {
  position: absolute;
  top: -6px;
  width: 16px;
  height: 16px;
  background-color: #007bff;
  border-radius: 50%;
  transform: translateX(-50%);
}

.rank-scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6c757d;
}

.course-completion-stats {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  height: 100%;
}

.completion-chart {
  display: flex;
  height: 40px;
  border-radius: 5px;
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
}

.completion-segment.completed {
  background-color: #28a745;
}

.completion-segment.in-progress {
  background-color: #ffc107;
  color: #212529;
}

.completion-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-left: 5px;
}

.legend-color.completed {
  background-color: #28a745;
}

.legend-color.in-progress {
  background-color: #ffc107;
}

.top-performers-list {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 10px;
}

.top-performer-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
}

.top-performer-item:last-child {
  border-bottom: none;
}

.performer-rank {
  width: 24px;
  height: 24px;
  background-color: #007bff;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-left: 10px;
}

.performer-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.performer-name {
  font-weight: 500;
}

.performer-score {
  font-weight: bold;
}
</style>
