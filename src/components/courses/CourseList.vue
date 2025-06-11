<template>
  <div class="course-list-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">دوره‌های من</h1>
      <p class="page-subtitle">مشاهده و مدیریت دوره‌های ثبت‌نام شده</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">در حال بارگذاری دوره‌ها...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">خطا در بارگذاری</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="fetchCoursesWithProgress" class="retry-button">
        تلاش مجدد
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="courses.length === 0" class="empty-container">
      <div class="empty-icon">📚</div>
      <h3 class="empty-title">هیچ دوره‌ای یافت نشد</h3>
      <p class="empty-message">شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.</p>
      <router-link to="/courses/available" class="browse-courses-button">
        مشاهده دوره‌های موجود
      </router-link>
    </div>

    <!-- Courses Grid -->
    <div v-else class="courses-grid">
      <div
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          :class="{ 'completed': isCompleted(course) }"
      >
        <!-- Course Header -->
        <div class="course-header">
          <div class="course-status">
            <span
                class="status-badge"
                :class="getStatusClass(course)"
            >
              {{ getStatusText(course) }}
            </span>
          </div>
          <div class="course-actions">
            <button
                @click="refreshCourseProgress(course.id)"
                class="refresh-button"
                :disabled="refreshing === course.id"
            >
              {{ refreshing === course.id ? '⏳' : '🔄' }}
            </button>
          </div>
        </div>

        <!-- Course Content -->
        <div class="course-content">
          <h3 class="course-title">{{ course.title }}</h3>
          <p class="course-description">{{ course.description }}</p>

          <!-- Teacher Info -->
          <div class="teacher-info">
            <span class="teacher-label">مدرس:</span>
            <span class="teacher-name">
              {{ course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'نامشخص' }}
            </span>
          </div>

          <!-- Course Stats -->
          <div class="course-stats">
            <div class="stat-item">
              <span class="stat-label">تعداد درس:</span>
              <span class="stat-value">{{ course.totalLessons || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">مدت زمان:</span>
              <span class="stat-value">{{ formatDuration(course.totalDuration) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">آخرین بازدید:</span>
              <span class="stat-value">{{ formatLastAccessed(course.lastAccessed) }}</span>
            </div>
          </div>

          <!-- Progress Section -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-title">پیشرفت دوره</span>
              <span class="progress-percentage">{{ getProgressPercentage(course).toFixed(0) }}%</span>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div
                    class="progress-fill"
                    :style="{ width: getProgressPercentage(course) + '%' }"
                    :class="getProgressClass(course)"
                ></div>
              </div>
            </div>

            <!-- Progress Details -->
            <div class="progress-details">
              <div class="progress-text">
                {{ getProgressText(course) }}
              </div>
              <div class="completion-stats">
                <span>{{ course.completedLessons || 0 }} از {{ course.totalLessons || 0 }} درس تکمیل شده</span>
              </div>
            </div>
          </div>

          <!-- Prerequisites -->
          <div v-if="course.prerequisite" class="prerequisites">
            <h4 class="prerequisites-title">پیش‌نیازها:</h4>
            <p class="prerequisites-text">{{ course.prerequisite }}</p>
          </div>
        </div>

        <!-- Course Footer -->
        <div class="course-footer">
          <div class="action-buttons">
            <router-link
                :to="`/courses/${course.id}`"
                class="primary-button"
            >
              {{ getProgressPercentage(course) > 0 ? 'ادامه یادگیری' : 'شروع دوره' }}
            </router-link>

            <router-link
                :to="`/courses/${course.id}/lessons`"
                class="secondary-button"
            >
              مشاهده درس‌ها
            </router-link>

            <button
                @click="viewCourseDetails(course.id)"
                class="tertiary-button"
            >
              جزئیات
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Course Details Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">جزئیات دوره</h3>
          <button @click="closeDetailModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedCourse">
            <h4>{{ selectedCourse.title }}</h4>
            <p>{{ selectedCourse.description }}</p>
            <!-- Add more course details here -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseList',
  data() {
    return {
      courses: [],
      progressData: [],
      loading: false,
      error: null,
      refreshing: null,
      showDetailModal: false,
      selectedCourse: null
    }
  },

  async mounted() {
    await this.fetchCoursesWithProgress();
  },

  methods: {
    async fetchCoursesWithProgress() {
      try {
        this.loading = true;
        this.error = null;

        // Fetch enrolled courses and progress data simultaneously
        const [coursesResponse, progressResponse] = await Promise.all([
          fetch('/api/courses/enrolled', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch('/api/progress', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (!coursesResponse.ok) {
          throw new Error(`خطا در دریافت دوره‌ها: ${coursesResponse.status}`);
        }

        if (!progressResponse.ok) {
          throw new Error(`خطا در دریافت اطلاعات پیشرفت: ${progressResponse.status}`);
        }

        const courses = await coursesResponse.json();
        const progressData = await progressResponse.json();

        // Merge courses with their progress data
        this.courses = courses.map(course => {
          const progress = progressData.find(p => p.courseId === course.id);
          return {
            ...course,
            completionPercentage: progress ? progress.completionPercentage : 0,
            completedLessons: progress ? progress.completedLessonCount : 0,
            totalLessons: progress ? progress.totalLessons : 0,
            lastAccessed: progress ? progress.lastAccessed : null,
            viewedContent: progress ? progress.viewedContent : [],
            completedContent: progress ? progress.completedContent : []
          };
        });

      } catch (error) {
        console.error('Error fetching courses:', error);
        this.error = error.message || 'خطا در بارگذاری اطلاعات دوره‌ها';
      } finally {
        this.loading = false;
      }
    },

    async refreshCourseProgress(courseId) {
      try {
        this.refreshing = courseId;

        const response = await fetch(`/api/progress/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const progressData = await response.json();
          const courseIndex = this.courses.findIndex(c => c.id === courseId);

          if (courseIndex !== -1) {
            this.courses[courseIndex] = {
              ...this.courses[courseIndex],
              completionPercentage: progressData.completionPercentage,
              completedLessons: progressData.completedLessonCount,
              totalLessons: progressData.totalLessons,
              lastAccessed: progressData.lastAccessed
            };
          }
        }
      } catch (error) {
        console.error('Error refreshing progress:', error);
      } finally {
        this.refreshing = null;
      }
    },

    getProgressPercentage(course) {
      return course.completionPercentage || 0;
    },

    getProgressText(course) {
      const completed = course.completedLessons || 0;
      const total = course.totalLessons || 0;

      if (total === 0) return 'اطلاعات در دسترس نیست';
      if (completed === total) return 'دوره تکمیل شده';

      return `${completed} از ${total} درس تکمیل شده`;
    },

    getStatusText(course) {
      const percentage = this.getProgressPercentage(course);

      if (percentage === 0) return 'شروع نشده';
      if (percentage === 100) return 'تکمیل شده';
      if (percentage >= 75) return 'نزدیک به اتمام';
      if (percentage >= 25) return 'در حال یادگیری';
      return 'شروع شده';
    },

    getStatusClass(course) {
      const percentage = this.getProgressPercentage(course);

      if (percentage === 0) return 'status-not-started';
      if (percentage === 100) return 'status-completed';
      if (percentage >= 75) return 'status-near-completion';
      if (percentage >= 25) return 'status-in-progress';
      return 'status-started';
    },

    getProgressClass(course) {
      const percentage = this.getProgressPercentage(course);

      if (percentage === 100) return 'progress-completed';
      if (percentage >= 75) return 'progress-high';
      if (percentage >= 25) return 'progress-medium';
      return 'progress-low';
    },

    isCompleted(course) {
      return this.getProgressPercentage(course) === 100;
    },

    formatDuration(minutes) {
      if (!minutes) return 'نامشخص';

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (hours === 0) return `${remainingMinutes} دقیقه`;
      if (remainingMinutes === 0) return `${hours} ساعت`;
      return `${hours} ساعت و ${remainingMinutes} دقیقه`;
    },

    formatLastAccessed(dateString) {
      if (!dateString) return 'هرگز';

      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'امروز';
      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${diffDays} روز پیش`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
      return `${Math.floor(diffDays / 30)} ماه پیش`;
    },

    async viewCourseDetails(courseId) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.selectedCourse = data.course;
          this.showDetailModal = true;
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedCourse = null;
    }
  }
}
</script>

<style scoped>
.course-list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  direction: rtl;
  font-family: 'Vazir', 'Tahoma', sans-serif;
}

/* Header Styles */
.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  color: #7f8c8d;
}

/* Error Styles */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-title {
  font-size: 1.5rem;
  color: #e74c3c;
  margin-bottom: 10px;
}

.error-message {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.retry-button {
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #2980b9;
}

/* Empty State Styles */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-message {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.browse-courses-button {
  padding: 12px 24px;
  background-color: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.browse-courses-button:hover {
  background-color: #229954;
}

/* Courses Grid */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

/* Course Card Styles */
.course-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.course-card.completed {
  border-color: #27ae60;
  background: linear-gradient(135deg, #ffffff 0%, #f8fff9 100%);
}

/* Course Header */
.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-not-started {
  background-color: #ecf0f1;
  color: #7f8c8d;
}

.status-started {
  background-color: #fff3cd;
  color: #856404;
}

.status-in-progress {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-near-completion {
  background-color: #d4edda;
  color: #155724;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.refresh-button {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-button:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Course Content */
.course-content {
  padding: 20px;
}

.course-title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
  line-height: 1.4;
}

.course-description {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.6;
}

.teacher-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.teacher-label {
  font-weight: 600;
  color: #495057;
  margin-left: 5px;
}

.teacher-name {
  color: #2c3e50;
}

/* Course Stats */
.course-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
}

/* Progress Section */
.progress-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-title {
  font-weight: 600;
  color: #2c3e50;
}

.progress-percentage {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2c3e50;
}

.progress-bar-container {
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-low {
  background-color: #e74c3c;
}

.progress-medium {
  background-color: #f39c12;
}

.progress-high {
  background-color: #3498db;
}

.progress-completed {
  background-color: #27ae60;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-text {
  font-size: 0.9rem;
  color: #6c757d;
}

.completion-stats {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Prerequisites */
.prerequisites {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #fff3cd;
  border-radius: 8px;
  border-right: 4px solid #ffc107;
}

.prerequisites-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #856404;
  margin-bottom: 5px;
}

.prerequisites-text {
  font-size: 0.85rem;
  color: #856404;
  margin: 0;
}

/* Course Footer */
.course-footer {
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-button, .secondary-button, .tertiary-button {
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.primary-button {
  background-color: #3498db;
  color: white;
  flex: 1;
}

.primary-button:hover {
  background-color: #2980b9;
}

.secondary-button {
  background-color: #95a5a6;
  color: white;
  flex: 1;
}

.secondary-button:hover {
  background-color: #7f8c8d;
}

.tertiary-button {
  background-color: #ecf0f1;
  color: #2c3e50;
  border: 1px solid #bdc3c7;
}

.tertiary-button:hover {
  background-color: #d5dbdb;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 1.3rem;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background-color: #f8f9fa;
}

.modal-body {
  padding: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .course-stats {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .course-list-container {
    padding: 15px;
  }

  .course-card {
    border-radius: 12px;
  }

  .course-content {
    padding: 15px;
  }

  .course-footer {
    padding: 15px;
  }
}
</style>