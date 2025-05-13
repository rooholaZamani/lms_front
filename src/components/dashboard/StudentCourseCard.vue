<template>
  <div class="card course-card">
    <div class="card-header bg-primary text-white">
      <h5 class="card-title mb-0">{{ course.title }}</h5>
    </div>
    <div class="card-body">
      <p class="card-text" v-if="course.description">{{ truncatedDescription }}</p>

      <!-- نمایش پیشرفت دوره -->
      <div v-if="progress">
        <div class="d-flex justify-content-between mb-2">
          <span>پیشرفت دوره:</span>
          <span>{{ Math.round(progress.completionPercentage) }}%</span>
        </div>
        <div class="progress mb-3">
          <div class="progress-bar bg-success"
               :style="`width: ${progress.completionPercentage}%`"
               :aria-valuenow="progress.completionPercentage"
               role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
        </div>

        <div class="d-flex justify-content-between">
          <small class="text-muted">
            {{ progress.completedLessonCount }} از
            {{ progress.totalLessons }} درس تکمیل شده
          </small>
          <small class="text-muted" v-if="progress.lastAccessed">
            آخرین بازدید: {{ formatDate(progress.lastAccessed) }}
          </small>
        </div>
      </div>

      <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="btn btn-primary mt-3 w-100">
        مشاهده دوره
      </router-link>
    </div>
    <div class="card-footer text-muted">
      <small>استاد: {{ teacherName }}</small>
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
  }
}
</script>

<style scoped>
.course-card {
  transition: transform 0.3s;
  height: 100%;
}

.course-card:hover {
  transform: translateY(-5px);
}
</style>