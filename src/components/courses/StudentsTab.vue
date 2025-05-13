<template>
  <div class="card">
    <div class="card-body">
      <h3>دانش‌آموزان ثبت‌نام شده</h3>

      <div v-if="!course.enrolledStudents || course.enrolledStudents.length === 0" class="alert alert-info text-center">
        <p>هنوز دانش‌آموزی در این دوره ثبت‌نام نکرده است</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
          <tr>
            <th>نام</th>
            <th>شماره دانش‌آموزی</th>
            <th>تاریخ ثبت‌نام</th>
            <th>پیشرفت</th>
            <th>عملیات</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="student in course.enrolledStudents" :key="student.id">
            <td>{{ getStudentName(student) }}</td>
            <td>{{ student.studentId || '---' }}</td>
            <td>{{ formatDate(student.enrollmentDate) }}</td>
            <td>
              <div class="progress">
                <div class="progress-bar bg-success" role="progressbar"
                     :style="`width: ${getStudentProgress(student.id)}%`"
                     :aria-valuenow="getStudentProgress(student.id)"
                     aria-valuemin="0" aria-valuemax="100">
                  {{ getStudentProgress(student.id) }}%
                </div>
              </div>
            </td>
            <td>
              <button class="btn btn-sm btn-info" @click="$emit('view-student-progress', student)">
                <i class="fas fa-eye"></i> مشاهده جزئیات
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import tableMixin from '@/mixins/tableMixin.js';

export default {
  name: 'StudentsTab',
  mixins: [tableMixin],
  props: {
    course: {
      type: Object,
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
    getStudentProgress(studentId) {
      // محاسبه درصد پیشرفت دانش‌آموز
      if (!this.course.lessons || this.course.lessons.length === 0) return 0;

      const studentProgress = this.course.progress?.find(p => p.studentId === studentId);
      if (!studentProgress || !studentProgress.completedLessons) return 0;

      const totalLessons = this.course.lessons.length;
      const completedLessons = studentProgress.completedLessons.length;

      return Math.round((completedLessons / totalLessons) * 100);
    }
  }
}
</script>