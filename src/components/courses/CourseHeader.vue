<template>
  <div class="modern-card course-header animate-slide-up">
    <div class="row align-items-center">
      <div class="col-md-8">
        <div class="course-info">
          <div class="course-icon mb-3">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <h1 class="course-title">{{ course.title }}</h1>
          <p class="course-subtitle">
            <span class="course-detail">
              <i class="fas fa-chalkboard-teacher me-1"></i>
              استاد: {{ getTeacherName() }}
            </span>
            <span class="course-separator">|</span>
            <span class="course-detail">
              <i class="fas fa-users me-1"></i>
              {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز
            </span>
            <span class="course-separator">|</span>
            <span class="course-detail">
              <i class="fas fa-book-open me-1"></i>
              {{ course.lessons ? course.lessons.length : 0 }} درس
            </span>
          </p>
          <div class="course-description" v-if="course.description">
            <p>{{ course.description }}</p>
<!--            <p v-html="formatText(course.description)"></p>-->
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="course-actions">
          <!-- Teacher Actions -->
          <div v-if="isTeacher && isTeacherOfCourse" class="action-group">
            <h6 class="action-group-title">
              <i class="fas fa-tools me-2"></i>
              مدیریت دوره
            </h6>
            <div class="action-buttons">
              <button class="modern-btn modern-btn-primary w-100 mb-2" @click="$emit('add-lesson')">
                <i class="fas fa-plus me-1"></i> افزودن درس
              </button>
                  <!-- دکمه چت جدید -->
                  <button class="modern-btn modern-btn-info w-100 mb-2" @click="openCourseChat">
                    <i class="fas fa-comments me-1"></i> گفتگوی درس
                  </button>
                </div>
              </div>

              <!-- در بخش Student Actions - بعد از دکمه‌های موجود -->
              <div v-else-if="!isTeacher" class="action-group">
                <h6 class="action-group-title">
                  <i class="fas fa-user-graduate me-2"></i>
                  وضعیت شما
                </h6>
                <div class="enrollment-status" v-if="isEnrolled">
                  <div class="status-card enrolled">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    <span>شما در این دوره ثبت‌نام کرده‌اید</span>
                  </div>
                  <button class="modern-btn modern-btn-outline w-100 mt-2 mb-2" @click="$emit('view-progress')">
                    <i class="fas fa-chart-line me-1"></i> مشاهده پیشرفت
                  </button>
                  <!-- دکمه چت جدید -->
                  <button class="modern-btn modern-btn-info w-100" @click="openCourseChat">
                    <i class="fas fa-comments me-1"></i> گفتگوی درس
                  </button>
                </div>
                <div class="enrollment-status" v-else>
                  <div class="status-card not-enrolled">
                    <i class="fas fa-info-circle text-warning me-2"></i>
                    <span>شما هنوز در این دوره ثبت‌نام نکرده‌اید</span>
                  </div>
                  <button class="modern-btn modern-btn-primary w-100 mt-2" @click="$emit('enroll-course')">
                    <i class="fas fa-sign-in-alt me-1"></i> ثبت‌نام در دوره
                  </button>
                </div>
          </div>

          <!-- Student Actions -->
          <div v-else-if="!isTeacher" class="action-group">
            <h6 class="action-group-title">
              <i class="fas fa-user-graduate me-2"></i>
              وضعیت شما
            </h6>
            <div class="enrollment-status" v-if="isEnrolled">
              <div class="status-card enrolled">
                <i class="fas fa-check-circle text-success me-2"></i>
                <span>شما در این دوره ثبت‌نام کرده‌اید</span>
              </div>
              <button class="modern-btn modern-btn-outline w-100 mt-2" @click="$emit('view-progress')">
                <i class="fas fa-chart-line me-1" ></i> مشاهده پیشرفت
              </button>
            </div>
            <div class="enrollment-status" v-else>
              <div class="status-card not-enrolled">
                <i class="fas fa-info-circle text-warning me-2"></i>
                <span>شما هنوز در این دوره ثبت‌نام نکرده‌اید</span>
              </div>
              <button class="modern-btn modern-btn-primary w-100 mt-2" @click="$emit('enroll-course')">
                <i class="fas fa-sign-in-alt me-1"></i> ثبت‌نام در دوره
              </button>
            </div>
          </div>

          <!-- Guest Actions -->
          <div v-else class="action-group">
            <h6 class="action-group-title">
              <i class="fas fa-eye me-2"></i>
              مشاهده عمومی
            </h6>
            <div class="status-card">
              <i class="fas fa-lock text-muted me-2"></i>
              <span>برای دسترسی کامل، لطفاً وارد شوید</span>
            </div>
            <router-link :to="{ name: 'Login' }" class="modern-btn modern-btn-primary w-100 mt-2">
              <i class="fas fa-sign-in-alt me-1"></i> ورود / ثبت‌نام
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTextFormatter } from '@/composables/useTextFormatter'



export default {
  name: 'CourseHeader',
  props: {
    course: {
      type: Object,
      required: true
    },
    isTeacher: {
      type: Boolean,
      default: false
    },
    isTeacherOfCourse: {
      type: Boolean,
      default: false
    },
    isEnrolled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatText: useTextFormatter().formatText,
    getTeacherName() {
      if (!this.course.teacher) return 'نامشخص';
      return this.course.teacher.firstName && this.course.teacher.lastName
          ? `${this.course.teacher.firstName} ${this.course.teacher.lastName}`
          : this.course.teacher.username;
    },
    // متد جدید برای باز کردن چت
    openCourseChat() {
      if (!this.course || !this.course.id) {
        this.$toast?.error('شناسه دوره معتبر نیست');
        return;
      }

      // باز کردن صفحه چت در تب جدید
      const chatUrl = this.$router.resolve({
        name: 'CourseChat',
        params: { courseId: this.course.id }
      }).href;

      window.open(chatUrl, '_blank');
    }
  }
}
</script>

<style scoped>
.course-header {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* Course Info */
.course-info {
  text-align: center;
}

.course-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.course-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.course-subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.course-detail {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.course-separator {
  color: rgba(108, 117, 125, 0.5);
  font-weight: 300;
}

.course-description {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.course-description p {
  margin: 0;
  color: #495057;
  line-height: 1.6;
}

/* Course Actions */
.course-actions {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
}

.action-group-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
}

.status-card {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.status-card.enrolled {
  background: rgba(40, 167, 69, 0.1);
  border-color: rgba(40, 167, 69, 0.2);
  color: #155724;
}

.status-card.not-enrolled {
  background: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.2);
  color: #856404;
}

/* Responsive */
@media (max-width: 768px) {
  .course-info {
    text-align: center;
    margin-bottom: 2rem;
  }

  .course-title {
    font-size: 1.5rem;
  }

  .course-subtitle {
    flex-direction: column;
    gap: 0.25rem;
  }

  .course-separator {
    display: none;
  }

  .course-actions {
    margin-top: 1rem;
  }

  .course-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .modern-btn {
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
  }

  .course-actions {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .course-header {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.6) 0%, rgba(74, 85, 104, 0.6) 100%);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .course-title {
    color: #e2e8f0;
  }

  .course-subtitle {
    color: #cbd5e0;
  }

  .course-description {
    background: rgba(45, 55, 72, 0.7);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .course-description p {
    color: #e2e8f0;
  }

  .course-actions {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .action-group-title {
    color: #e2e8f0;
    border-bottom-color: rgba(102, 126, 234, 0.3);
  }

  .status-card {
    background: rgba(74, 85, 104, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }

  .status-card.enrolled {
    background: rgba(40, 167, 69, 0.2);
    border-color: rgba(40, 167, 69, 0.3);
    color: #9ae6b4;
  }

  .status-card.not-enrolled {
    background: rgba(255, 193, 7, 0.2);
    border-color: rgba(255, 193, 7, 0.3);
    color: #faf089;
  }
}
</style>