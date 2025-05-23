<template>
  <div class="lms-card course-card">
    <div class="lms-card-header">
      <h5 class="mb-0">{{ course.title }}</h5>
    </div>
    <div class="lms-card-body">
      <p class="text-muted" v-if="course.description">{{ truncatedDescription }}</p>

      <!-- Progress Display -->
      <div v-if="progress" class="mt-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span>پیشرفت دوره:</span>
          <span class="text-primary fw-bold">{{ Math.round(progress.completionPercentage) }}%</span>
        </div>

        <div class="progress-modern progress-success">
          <div class="progress-bar-modern"
               :style="`width: ${progress.completionPercentage}%`"
               :aria-valuenow="progress.completionPercentage"
               role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
        </div>

        <div class="meta-info mt-3">
          <div class="meta-item">
            <i class="fas fa-book-open"></i>
            <span>{{ progress.completedLessonCount }} از {{ progress.totalLessons }} درس</span>
          </div>
          <div class="meta-item" v-if="progress.lastAccessed">
            <i class="fas fa-clock"></i>
            <span>{{ formatDate(progress.lastAccessed) }}</span>
          </div>
        </div>
      </div>

      <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }"
                   class="btn btn-primary mt-3 w-100">
        مشاهده دوره
      </router-link>
    </div>

    <div class="lms-card-footer">
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
      const firstInitial = firstName ? firstName.charAt(0) : '';
      const lastInitial = lastName ? lastName.charAt(0) : '';
      return (firstInitial + lastInitial).toUpperCase() || 'نا';
    }
  }
}
</script>

<style scoped>
/* Component-specific styles only (most styles now come from global.css) */
.course-card {
  transition: transform 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
}
</style>