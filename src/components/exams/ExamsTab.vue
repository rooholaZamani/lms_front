<template>
  <div class="card">
    <div class="card-body">
      <h3>آزمون‌های دوره</h3>

      <div v-if="!courseExams || courseExams.length === 0" class="alert alert-info text-center">
        <p>هنوز آزمونی برای این دوره ایجاد نشده است</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
          <tr>
            <th>عنوان آزمون</th>
            <th>درس مربوطه</th>
            <th>مدت زمان (دقیقه)</th>
            <th>تعداد سوالات</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="exam in courseExams" :key="exam.id">
            <td>{{ exam.title }}</td>
            <td>{{ getRelatedLesson(exam) }}</td>
            <td>{{ exam.duration }}</td>
            <td>{{ exam.questions ? exam.questions.length : 0 }}</td>
            <td>
                <span :class="getExamStatusClass(exam)">
                  {{ getExamStatusText(exam) }}
                </span>
            </td>
            <td>
              <div class="d-flex gap-1">
                <!-- دکمه‌های مخصوص معلم -->
                <template v-if="isTeacher && isTeacherOfCourse">
                  <button class="btn btn-sm btn-success" @click="$emit('edit-exam', exam)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-info" @click="$emit('view-exam-results', exam)">
                    <i class="fas fa-chart-bar"></i> نتایج
                  </button>
                </template>

                <!-- دکمه‌های مخصوص دانش‌آموز -->
                <template v-else-if="isEnrolled">
                  <button v-if="!hasCompletedExam(exam)" class="btn btn-sm btn-primary" @click="$emit('start-exam', exam)">
                    <i class="fas fa-pen"></i> شروع آزمون
                  </button>
                  <button v-else class="btn btn-sm btn-info" @click="$emit('view-exam-result', exam)">
                    <i class="fas fa-eye"></i> مشاهده نتیجه
                  </button>
                </template>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamsTab',
  props: {
    courseExams: {
      type: Array,
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
    getRelatedLesson(exam) {
      if (!exam.lesson) return 'نامشخص';
      return exam.lesson.title || 'نامشخص';
    },
    getExamStatusClass(exam) {
      if (this.hasCompletedExam(exam)) {
        return 'badge bg-success';
      }
      return 'badge bg-primary';
    },
    getExamStatusText(exam) {
      if (this.hasCompletedExam(exam)) {
        return 'انجام شده';
      }
      return 'آماده';
    },
    hasCompletedExam(exam) {
      // بررسی اینکه دانش‌آموز آزمون را انجام داده است یا خیر
      if (!exam || !exam.submissions || !this.$store.getters.currentUser) return false;
      return exam.submissions.some(sub => sub.studentId === this.$store.getters.currentUser.id);
    }
  }
}
</script>