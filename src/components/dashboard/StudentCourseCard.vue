<template>
  <div class="course-card modern-card h-100">
    <div class="course-header" :style="getHeaderStyle()">
      <div class="course-badge">
        <i class="fas fa-book"></i>
      </div>
      <div class="course-title">{{ course.title }}</div>
      <div class="course-teacher" v-if="course.teacher">
        <i class="fas fa-user-tie me-1"></i>
        {{ getTeacherName(course.teacher) }}
      </div>
    </div>

    <div class="course-body">
      <div class="course-description" v-if="course.description">
        {{ truncateText(course.description, 80) }}
      </div>

      <div class="course-stats">
        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-play-circle text-primary"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ course.lessons?.length || 0 }}</div>
            <div class="stat-label">درس</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-clock text-info"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ estimatedDuration }}</div>
            <div class="stat-label">ساعت</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-certificate text-warning"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ difficulty }}</div>
            <div class="stat-label">سطح</div>
          </div>
        </div>
      </div>

      <div class="progress-section">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="progress-label">پیشرفت دوره</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>

        <div class="progress-modern" :class="getProgressClass()">
          <div class="progress-bar-modern"
               :style="`width: ${progressPercentage}%`"
               :aria-valuenow="progressPercentage"
               role="progressbar" aria-valuemin="0" aria-valuemax="100">
          </div>
        </div>

        <div class="progress-details mt-2">
          <div class="detail-item">
            <i class="fas fa-check-circle text-success me-1"></i>
            <span>{{ completedLessons }} از {{ totalLessons }} درس تکمیل شده</span>
          </div>
          <div class="detail-item" v-if="lastAccessed">
            <i class="fas fa-history text-muted me-1"></i>
            <span>آخرین بازدید: {{ formatDate(lastAccessed) }}</span>
          </div>
        </div>
      </div>

      <!-- Achievement badges -->
      <div class="achievements" v-if="achievements.length > 0">
        <div class="achievements-title">دستاوردها:</div>
        <div class="achievement-badges">
          <span v-for="achievement in achievements" :key="achievement.id"
                class="achievement-badge" :title="achievement.description">
            <i :class="achievement.icon"></i>
          </span>
        </div>
      </div>

      <!-- Next lesson indicator -->
      <div class="next-lesson" v-if="nextLesson">
        <div class="next-lesson-title">درس بعدی:</div>
        <div class="next-lesson-content text-info">
          <i class="fas fa-play-circle text-primary me-2"></i>
          {{ nextLesson.title }}
        </div>
      </div>
    </div>

    <div class="course-footer">
      <div class="course-actions">
        <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }"
                     class="modern-btn modern-btn-primary">
          <i class="fas fa-play me-1"></i>
          {{ progressPercentage > 0 ? 'ادامه دوره' : 'شروع دوره' }}
        </router-link>
      </div>

      <!-- Course rating -->
<!--      <div class="course-rating" v-if="course.rating">-->
<!--        <div class="rating-stars">-->
<!--          <i v-for="star in 5" :key="star"-->
<!--             class="fas fa-star"-->
<!--             :class="star <= course.rating ? 'text-warning' : 'text-muted'"></i>-->
<!--        </div>-->
<!--        <div class="rating-text">{{ course.rating.toFixed(1) }}</div>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentCourseCard',
  props: {
    course: {
      type: Object,
      required: true
    },
    progress: {
      type: Object,
      default: () => ({})
    }
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();
    return { formatDate, truncateText };
  },
  computed: {
    progressPercentage() {
      return Math.round(this.progress?.completionPercentage || 0);
    },

    completedLessons() {
      return this.progress?.completedLessonCount || 0;
    },

    totalLessons() {
      return this.progress?.totalLessons || this.course.lessons?.length || 0;
    },

    lastAccessed() {
      return this.progress?.lastAccessed;
    },

    estimatedDuration() {
      // Calculate estimated duration based on number of lessons
      const lessons = this.course.lessons?.length || 0;
      return Math.ceil(lessons * 1.5); // Assume 1.5 hours per lesson
    },

    difficulty() {
      // Mock difficulty calculation
      const lessons = this.course.lessons?.length || 0;
      if (lessons <= 5) return 'مبتدی';
      if (lessons <= 10) return 'متوسط';
      return 'پیشرفته';
    },

    achievements() {
      const achievements = [];

      if (this.progressPercentage >= 25) {
        achievements.push({
          id: 'quarter',
          icon: 'fas fa-trophy text-bronze',
          description: 'تکمیل 25% دوره'
        });
      }

      if (this.progressPercentage >= 50) {
        achievements.push({
          id: 'half',
          icon: 'fas fa-medal text-silver',
          description: 'تکمیل 50% دوره'
        });
      }

      if (this.progressPercentage >= 75) {
        achievements.push({
          id: 'three_quarter',
          icon: 'fas fa-crown text-gold',
          description: 'تکمیل 75% دوره'
        });
      }

      if (this.progressPercentage >= 100) {
        achievements.push({
          id: 'complete',
          icon: 'fas fa-gem text-diamond',
          description: 'تکمیل کامل دوره'
        });
      }

      return achievements;
    },

    nextLesson() {
      if (!this.course.lessons || this.progressPercentage >= 100) return null;

      const completedLessons = this.progress?.completedLessons || [];
      const nextLesson = this.course.lessons.find(lesson =>
          !completedLessons.includes(lesson.id)
      );

      return nextLesson;
    }
  },
  methods: {
    getTeacherName(teacher) {
      if (!teacher) return 'نامشخص';
      return teacher.firstName && teacher.lastName
          ? `${teacher.firstName} ${teacher.lastName}`
          : teacher.username;
    },

    getHeaderStyle() {
      // Generate a gradient based on course ID for variety
      const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
      ];

      const colorIndex = (this.course.id || 0) % colors.length;
      return { background: colors[colorIndex] };
    },

    getProgressClass() {
      if (this.progressPercentage >= 75) return 'progress-success';
      if (this.progressPercentage >= 50) return 'progress-info';
      if (this.progressPercentage >= 25) return 'progress-warning';
      return 'progress-danger';
    }
  }
}
</script>

<style scoped>
.course-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.course-header {
  padding: 2rem 1.5rem 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.course-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

.course-badge {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
}

.course-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.course-teacher {
  font-size: 0.9rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
}

.course-body {
  padding: 1.5rem;
}

.course-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.course-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.progress-percentage {
  font-weight: 700;
  color: #667eea;
  font-size: 0.9rem;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.achievements {
  margin-bottom: 1rem;
}

.achievements-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.achievement-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.achievement-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
}

.achievement-badge:hover {
  transform: scale(1.1);
  border-color: rgba(102, 126, 234, 0.4);
}

.text-bronze { color: #cd7f32; }
.text-silver { color: #c0c0c0; }
.text-gold { color: #ffd700; }
.text-diamond { color: #b9f2ff; }

.next-lesson {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.next-lesson-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.next-lesson-content {
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
}

.course-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(248, 249, 250, 0.5);
}

.course-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.course-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.rating-text {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

/* Progress animations */
.progress-modern {
  height: 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.progress-bar-modern {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s ease;
  position: relative;
  overflow: hidden;
}

.progress-success .progress-bar-modern {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.progress-info .progress-bar-modern {
  background: linear-gradient(90deg, #17a2b8, #007bff);
}

.progress-warning .progress-bar-modern {
  background: linear-gradient(90deg, #ffc107, #fd7e14);
}

.progress-danger .progress-bar-modern {
  background: linear-gradient(90deg, #dc3545, #e83e8c);
}

.progress-bar-modern::after {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% { left: -50%; }
  100% { left: 150%; }
}

/* Responsive design */
@media (max-width: 768px) {
  .course-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-item {
    padding: 0.5rem;
  }

  .course-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .course-header {
    padding: 1.5rem 1rem 1rem;
  }

  .course-title {
    font-size: 1.1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .course-card {
    background: #2d3748;
    color: #e2e8f0;
  }

  .course-description {
    color: #a0aec0;
  }

  .stat-value {
    color: #e2e8f0;
  }

  .stat-label {
    color: #a0aec0;
  }

  .progress-label {
    color: #e2e8f0;
  }

  .course-footer {
    background: rgba(45, 55, 72, 0.5);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>