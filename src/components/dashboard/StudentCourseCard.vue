<template>
  <div class="modern-card h-100 course-card">
    <div class="modern-card-header">
      <h5 class="mb-0">{{ course.title }}</h5>
    </div>

    <div class="modern-card-body d-flex flex-column">
      <p class="text-muted mb-3" v-if="course.description">
        {{ truncatedDescription }}
      </p>

      <!-- Progress Display -->
      <div v-if="progress" class="mt-auto">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-semibold">پیشرفت دوره:</span>
          <span class="modern-badge modern-badge-primary">
            {{ Math.round(progress.completionPercentage) }}%
          </span>
        </div>

        <div class="progress-modern progress-success">
          <div class="progress-bar-modern"
               :style="`width: ${progress.completionPercentage}%`"
               :aria-valuenow="progress.completionPercentage"
               role="progressbar" aria-valuemin="0" aria-valuemax="100">
          </div>
        </div>

        <div class="meta-info mt-3">
          <div class="meta-item">
            <i class="fas fa-book-open text-info me-1"></i>
            <span>{{ progress.completedLessonCount }} از {{ progress.totalLessons }} درس</span>
          </div>
          <div class="meta-item" v-if="progress.lastAccessed">
            <i class="fas fa-clock text-muted me-1"></i>
            <small class="text-muted">{{ formatDate(progress.lastAccessed) }}</small>
          </div>
        </div>
      </div>

      <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }"
                   class="modern-btn modern-btn-primary mt-3">
        <i class="fas fa-eye me-1"></i>
        مشاهده دوره
      </router-link>
    </div>

    <div class="modern-card-footer">
      <div class="user-display">
        <div class="avatar avatar-sm">
          <span>{{ getTeacherInitials() }}</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ teacherName }}</div>
          <div class="user-role">استاد</div>
        </div>
      </div>
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
      default: null
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
    teacherName() {
      if (!this.course.teacher) return 'نامشخص';
      return this.course.teacher.firstName && this.course.teacher.lastName
          ? `${this.course.teacher.firstName} ${this.course.teacher.lastName}`
          : this.course.teacher.username;
    },
    truncatedDescription() {
      return this.truncateText(this.course.description, 100);
    }
  },
  methods: {
    getTeacherInitials() {
      if (!this.course.teacher) return 'نا';
      const firstName = this.course.teacher.firstName || '';
      const lastName = this.course.teacher.lastName || '';
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'نا';
    }
  }
}
</script>

<style scoped>
.course-card {
  transition: transform 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.user-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #333;
}

.user-role {
  font-size: 0.75rem;
  color: #6c757d;
}
</style>