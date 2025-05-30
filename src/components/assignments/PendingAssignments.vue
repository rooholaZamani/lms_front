<template>
  <div class="modern-page-bg warning-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo warning">
          <i class="fas fa-tasks"></i>
        </div>
        <h1 class="modern-title">تکالیف در حال بررسی</h1>
        <p class="modern-subtitle">بررسی و نمره‌دهی تکالیف دانش‌آموزان</p>
      </div>

      <div class="modern-card animate-slide-up" style="animation-delay: 0.2s;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="modern-title mb-0">
            <i class="fas fa-list text-warning me-2"></i>
            لیست تکالیف در انتظار بررسی
          </h5>
          <button class="modern-btn modern-btn-outline text-white" @click="refreshData">
            <i class="fas fa-sync-alt me-1"></i> بروزرسانی
          </button>
        </div>

        <loading-spinner :loading="loading">
          <div v-if="assignments.length === 0" class="text-center py-5">
            <div class="modern-logo large success mb-4">
              <i class="fas fa-check-circle"></i>
            </div>
            <h5>تکلیفی در انتظار بررسی نیست</h5>
            <p class="text-muted">همه تکالیف ارسال شده بررسی شده‌اند.</p>
          </div>
          <div v-else class="modern-table-container">
            <table class="modern-table table">
              <thead>
              <tr>
                <th>#</th>
                <th>عنوان تکلیف</th>
                <th>دوره</th>
                <th>دانش‌آموز</th>
                <th>تاریخ ارسال</th>
                <th>عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(assignment, index) in assignments" :key="assignment.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <div>
                    <strong>{{ assignment.title }}</strong>
                    <div class="small text-muted">{{ truncateText(assignment.description, 50) }}</div>
                  </div>
                </td>
                <td>{{ assignment.course?.title || 'نامشخص' }}</td>
                <td>{{ getStudentName(assignment.student) }}</td>
                <td>{{ formatDate(assignment.submittedAt) }}</td>
                <td>
                  <button
                      class="modern-btn modern-btn-primary modern-btn-sm"
                      @click="gradeAssignment(assignment)"
                      title="نمره‌دهی">
                    <i class="fas fa-check-circle me-1"></i> ارزیابی
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </loading-spinner>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import axios from 'axios';

export default {
  name: 'PendingAssignments',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();
    const loading = ref(true);
    const assignments = ref([]);

    const fetchPendingAssignments = async () => {
      loading.value = true;
      try {
        const coursesResponse = await axios.get('/courses/teaching');
        const courses = coursesResponse.data;

        const pendingAssignments = [];

        for (const course of courses) {
          try {
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data;

            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const lessonAssignments = assignmentsResponse.data;

                for (const assignment of lessonAssignments) {
                  try {
                    const submissionsResponse = await axios.get(`/assignments/${assignment.id}/submissions`);
                    const submissions = submissionsResponse.data;

                    const ungradedSubmissions = submissions
                        .filter(submission => !submission.graded)
                        .map(submission => ({
                          ...submission,
                          title: assignment.title,
                          description: assignment.description,
                          course: course,
                          assignment: assignment
                        }));

                    pendingAssignments.push(...ungradedSubmissions);
                  } catch (error) {
                    console.error(`Error fetching submissions for assignment ${assignment.id}:`, error);
                  }
                }
              } catch (error) {
                console.error(`Error fetching assignments for lesson ${lesson.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching lessons for course ${course.id}:`, error);
          }
        }

        assignments.value = pendingAssignments;
      } catch (error) {
        console.error('Error fetching pending assignments:', error);
        window.showError(error);
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      fetchPendingAssignments();
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    };

    const gradeAssignment = async (assignment) => {
      const score = prompt(`نمره تکلیف "${assignment.title}" را وارد کنید (0-100):`);
      if (score === null) return;

      const numericScore = parseInt(score);
      if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
        alert('لطفاً نمره معتبری بین 0 تا 100 وارد کنید.');
        return;
      }

      const feedback = prompt('بازخورد (اختیاری):') || '';

      try {
        await axios.post(`/assignments/submissions/${assignment.id}/grade`, null, {
          params: {
            score: numericScore,
            feedback: feedback
          }
        });

        window.toast.success('تکلیف با موفقیت نمره‌گذاری شد.');
        await fetchPendingAssignments();
      } catch (error) {
        console.error('Error grading assignment:', error);
        window.showError(error);
      }
    };

    onMounted(() => {
      fetchPendingAssignments();
    });

    return {
      loading,
      assignments,
      refreshData,
      getStudentName,
      gradeAssignment,
      formatDate,
      truncateText
    };
  }
}
</script>

<style scoped>
/* Component specific styles already in common-pages.css */
</style>