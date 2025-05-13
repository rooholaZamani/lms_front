<template>
  <table class="table table-hover">
    <thead class="table-light">
    <tr>
      <th>نام دانش‌آموز</th>
      <th>عنوان آزمون</th>
      <th>دوره</th>
      <th>نمره</th>
      <th>وضعیت</th>
      <th>تاریخ</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="submission in submissions" :key="submission.id">
      <td>{{ getStudentName(submission.student) }}</td>
      <td>{{ submission.exam ? submission.exam.title : 'نامشخص' }}</td>
      <td>{{ getCourseTitle(submission.exam ? submission.exam.lesson : null) }}</td>
      <td>{{ submission.score }}</td>
      <td>
          <span :class="submission.passed ? 'badge bg-success' : 'badge bg-danger'">
            {{ submission.passed ? 'قبول' : 'مردود' }}
          </span>
      </td>
      <td>{{ formatDate(submission.submissionTime) }}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import tableMixin from '@/mixins/tableMixin.js';

export default {
  name: 'ExamResultsTable',
  mixins: [tableMixin],
  props: {
    submissions: {
      type: Array,
      required: true
    }
  },
  methods: {
    getCourseTitle(lesson) {
      if (!lesson || !lesson.course) return 'نامشخص';
      return lesson.course.title;
    }
  }
}
</script>