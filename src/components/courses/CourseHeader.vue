<template>
  <div class="course-header mb-4">
    <div class="row align-items-center">
      <div class="col-md-8">
        <h1>{{ course.title }}</h1>
        <p class="text-muted">
          <span>استاد: {{ getTeacherName() }}</span>
          <span class="mx-2">|</span>
          <span>{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز</span>
        </p>
      </div>
      <div class="col-md-4 text-end">
        <!-- دکمه‌های مخصوص معلم -->
        <div v-if="isTeacher && isTeacherOfCourse" class="d-flex justify-content-end gap-2">
          <button class="btn btn-success" @click="$emit('edit-course')">
            <i class="fas fa-edit"></i> ویرایش دوره
          </button>
          <button class="btn btn-primary" @click="$emit('add-lesson')">
            <i class="fas fa-plus"></i> افزودن درس
          </button>
        </div>
        <!-- دکمه‌های مخصوص دانش‌آموز -->
        <div v-else-if="!isTeacher">
          <button v-if="!isEnrolled" class="btn btn-primary" @click="$emit('enroll-course')">
            <i class="fas fa-sign-in-alt"></i> ثبت‌نام در دوره
          </button>
          <button v-else class="btn btn-outline-success" disabled>
            <i class="fas fa-check"></i> ثبت‌نام شده
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    getTeacherName() {
      if (!this.course.teacher) return 'نامشخص';
      return this.course.teacher.firstName && this.course.teacher.lastName
          ? `${this.course.teacher.firstName} ${this.course.teacher.lastName}`
          : this.course.teacher.username;
    }
  }
}
</script>