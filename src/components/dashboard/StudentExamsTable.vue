<template>
  <table class="table table-hover">
    <thead class="table-light">
    <tr>
      <th>عنوان آزمون</th>
      <th>دوره</th>
      <th>نمره</th>
      <th>وضعیت</th>
      <th>تاریخ</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="exam in exams" :key="exam.id">
      <td>{{ exam.exam ? exam.exam.title : 'نامشخص' }}</td>
      <td>{{ getCourseTitle(exam.exam ? exam.exam.lesson : null) }}</td>
      <td>{{ exam.score }}</td>
      <td>
          <span :class="exam.passed ? 'badge bg-success' : 'badge bg-danger'">
            {{ exam.passed ? 'قبول' : 'مردود' }}
          </span>
      </td>
      <td>{{ formatDate(exam.submissionTime) }}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentExamsTable',
  props: {
    exams: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  methods: {
    getCourseTitle(lesson) {
      if (!lesson || !lesson.course) return 'نامشخص';
      return lesson.course.title;
    }
  }
}
</script>