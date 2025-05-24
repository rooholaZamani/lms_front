<template>
  <div class="pending-assignments">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>تکالیف در حال بررسی</h2>
            <button class="btn btn-outline-secondary" @click="refreshData">
              <i class="fas fa-sync-alt me-1"></i> بروزرسانی
            </button>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">لیست تکالیف در انتظار بررسی</h5>
            </div>
            <div class="card-body">
              <loading-spinner :loading="loading">
                <div v-if="assignments.length === 0" class="text-center py-4">
                  <i class="fas fa-tasks fa-3x text-muted mb-3"></i>
                  <h5>تکلیفی در انتظار بررسی نیست</h5>
                  <p class="text-muted">همه تکالیف ارسال شده بررسی شده‌اند.</p>
                </div>
                <div v-else class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
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
                            class="btn btn-sm btn-primary"
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
        // Get all teaching courses first
        const coursesResponse = await axios.get('/courses/teaching');
        const courses = coursesResponse.data;

        const pendingAssignments = [];

        // For each course, get lessons and their assignments
        for (const course of courses) {
          try {
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data;

            // For each lesson, get assignments
            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const lessonAssignments = assignmentsResponse.data;

                // For each assignment, get ungraded submissions
                for (const assignment of lessonAssignments) {
                  try {
                    const submissionsResponse = await axios.get(`/assignments/${assignment.id}/submissions`);
                    const submissions = submissionsResponse.data;

                    // Filter ungraded submissions
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
      // Show a simple prompt for grading (in a real app, use a modal)
      const score = prompt(`نمره تکلیف "${assignment.title}" را وارد کنید (0-100):`);
      if (score === null) return; // User cancelled

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

        // Refresh the list
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
.pending-assignments {
  min-height: calc(100vh - 56px);
  background-color: #f8f9fa;
  padding: 2rem 0;
}
</style>