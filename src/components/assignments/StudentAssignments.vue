<template>
  <div class="student-assignments">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>تکالیف</h2>
            <button class="btn btn-outline-secondary" @click="refreshData">
              <i class="fas fa-sync-alt me-1"></i> بروزرسانی
            </button>
          </div>

          <!-- Statistics Cards -->
          <div class="row mb-4">
            <div class="col-md-3 mb-3">
              <div class="card text-center">
                <div class="card-body">
                  <i class="fas fa-tasks fa-2x text-primary mb-2"></i>
                  <h3 class="mb-0">{{ stats.totalAssignments }}</h3>
                  <p class="text-muted mb-0">کل تکالیف</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card text-center">
                <div class="card-body">
                  <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                  <h3 class="mb-0">{{ stats.submittedAssignments }}</h3>
                  <p class="text-muted mb-0">ارسال شده</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card text-center">
                <div class="card-body">
                  <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                  <h3 class="mb-0">{{ stats.pendingAssignments }}</h3>
                  <p class="text-muted mb-0">در انتظار</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card text-center">
                <div class="card-body">
                  <i class="fas fa-star fa-2x text-info mb-2"></i>
                  <h3 class="mb-0">{{ stats.averageScore }}</h3>
                  <p class="text-muted mb-0">میانگین نمره</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="card">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                  <a
                      class="nav-link"
                      :class="{ active: activeTab === 'pending' }"
                      href="#"
                      @click.prevent="activeTab = 'pending'">
                    <i class="fas fa-clock me-1"></i> تکالیف در انتظار
                  </a>
                </li>
                <li class="nav-item">
                  <a
                      class="nav-link"
                      :class="{ active: activeTab === 'submitted' }"
                      href="#"
                      @click.prevent="activeTab = 'submitted'">
                    <i class="fas fa-check-circle me-1"></i> ارسال شده
                  </a>
                </li>
                <li class="nav-item">
                  <a
                      class="nav-link"
                      :class="{ active: activeTab === 'graded' }"
                      href="#"
                      @click.prevent="activeTab = 'graded'">
                    <i class="fas fa-star me-1"></i> نمره‌دهی شده
                  </a>
                </li>
              </ul>
            </div>
            <div class="card-body">
              <loading-spinner :loading="loading">
                <!-- Pending Assignments -->
                <div v-if="activeTab === 'pending'">
                  <div v-if="pendingAssignments.length === 0" class="text-center py-4">
                    <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h5>همه تکالیف ارسال شده‌اند!</h5>
                    <p class="text-muted">در حال حاضر تکلیف معوقه‌ای ندارید.</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>عنوان تکلیف</th>
                        <th>دوره</th>
                        <th>مهلت تحویل</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(assignment, index) in pendingAssignments" :key="assignment.id">
                        <td>{{ index + 1 }}</td>
                        <td>
                          <div>
                            <strong>{{ assignment.title }}</strong>
                            <div class="small text-muted">{{ truncateText(assignment.description, 50) }}</div>
                          </div>
                        </td>
                        <td>{{ assignment.course?.title || 'نامشخص' }}</td>
                        <td>
                          <div>{{ formatDate(assignment.dueDate) }}</div>
                          <div class="small" :class="getDueDateClass(assignment.dueDate)">
                            {{ getDaysRemaining(assignment.dueDate) }}
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-warning">در انتظار ارسال</span>
                        </td>
                        <td>
                          <button
                              class="btn btn-sm btn-primary"
                              @click="submitAssignment(assignment)"
                              title="ارسال تکلیف">
                            <i class="fas fa-upload me-1"></i> ارسال
                          </button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Submitted Assignments -->
                <div v-if="activeTab === 'submitted'">
                  <div v-if="submittedAssignments.length === 0" class="text-center py-4">
                    <i class="fas fa-file-upload fa-3x text-muted mb-3"></i>
                    <h5>هنوز تکلیفی ارسال نکرده‌اید</h5>
                    <p class="text-muted">تکالیف ارسال شده در اینجا نمایش داده خواهند شد.</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>عنوان تکلیف</th>
                        <th>دوره</th>
                        <th>تاریخ ارسال</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(assignment, index) in submittedAssignments" :key="assignment.id">
                        <td>{{ index + 1 }}</td>
                        <td>
                          <div>
                            <strong>{{ assignment.title }}</strong>
                            <div class="small text-muted">{{ truncateText(assignment.description, 50) }}</div>
                          </div>
                        </td>
                        <td>{{ assignment.course?.title || 'نامشخص' }}</td>
                        <td>{{ formatDate(assignment.submittedAt) }}</td>
                        <td>
                          <span class="badge bg-info">در حال بررسی</span>
                        </td>
                        <td>
                          <button
                              class="btn btn-sm btn-outline-primary"
                              @click="viewSubmission(assignment)"
                              title="مشاهده ارسالی">
                            <i class="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Graded Assignments -->
                <div v-if="activeTab === 'graded'">
                  <div v-if="gradedAssignments.length === 0" class="text-center py-4">
                    <i class="fas fa-star fa-3x text-muted mb-3"></i>
                    <h5>هنوز تکلیفی نمره‌گذاری نشده</h5>
                    <p class="text-muted">تکالیف نمره‌گذاری شده در اینجا نمایش داده خواهند شد.</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>عنوان تکلیف</th>
                        <th>دوره</th>
                        <th>نمره</th>
                        <th>تاریخ نمره‌گذاری</th>
                        <th>عملیات</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(assignment, index) in gradedAssignments" :key="assignment.id">
                        <td>{{ index + 1 }}</td>
                        <td>
                          <div>
                            <strong>{{ assignment.title }}</strong>
                            <div class="small text-muted">{{ truncateText(assignment.description, 50) }}</div>
                          </div>
                        </td>
                        <td>{{ assignment.course?.title || 'نامشخص' }}</td>
                        <td>
                            <span class="badge" :class="getScoreBadge(assignment.score)">
                              {{ assignment.score || 'نمره‌گذاری نشده' }}
                            </span>
                        </td>
                        <td>{{ formatDate(assignment.gradedAt) }}</td>
                        <td>
                          <button
                              class="btn btn-sm btn-outline-primary"
                              @click="viewFeedback(assignment)"
                              title="مشاهده بازخورد">
                            <i class="fas fa-comments"></i>
                          </button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
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
import { ref, onMounted, computed } from 'vue';
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import axios from 'axios';

export default {
  name: 'StudentAssignments',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();
    const loading = ref(true);
    const activeTab = ref('pending');
    const assignments = ref([]);

    const stats = ref({
      totalAssignments: 0,
      submittedAssignments: 0,
      pendingAssignments: 0,
      averageScore: 0
    });

    const pendingAssignments = computed(() =>
        assignments.value.filter(a => !a.submitted)
    );

    const submittedAssignments = computed(() =>
        assignments.value.filter(a => a.submitted && !a.graded)
    );

    const gradedAssignments = computed(() =>
        assignments.value.filter(a => a.graded)
    );

    const fetchAssignments = async () => {
      loading.value = true;
      try {
        // Get all student submissions
        const response = await axios.get('/assignments/submissions/student');
        const submissions = response.data || [];

        // Get enrolled courses to fetch all available assignments
        const coursesResponse = await axios.get('/courses/enrolled');
        const enrolledCourses = coursesResponse.data || [];

        const allAssignments = [];

        // For each enrolled course, get lessons and their assignments
        for (const course of enrolledCourses) {
          try {
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data || [];

            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const lessonAssignments = assignmentsResponse.data || [];

                // For each assignment, check if student has submitted
                for (const assignment of lessonAssignments) {
                  const submission = submissions.find(s => s.assignmentId === assignment.id);

                  allAssignments.push({
                    ...assignment,
                    course: course,
                    lesson: lesson,
                    submitted: !!submission,
                    graded: submission?.graded || false,
                    score: submission?.score,
                    submittedAt: submission?.submittedAt,
                    gradedAt: submission?.gradedAt,
                    feedback: submission?.feedback,
                    submissionId: submission?.id
                  });
                }
              } catch (error) {
                console.error(`Error fetching assignments for lesson ${lesson.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching lessons for course ${course.id}:`, error);
          }
        }

        assignments.value = allAssignments;

        // Calculate statistics
        const submittedCount = allAssignments.filter(a => a.submitted).length;
        const gradedCount = allAssignments.filter(a => a.graded).length;
        const pendingCount = allAssignments.filter(a => !a.submitted).length;

        const gradedAssignmentsWithScore = allAssignments.filter(a => a.graded && a.score);
        const averageScore = gradedAssignmentsWithScore.length > 0
            ? Math.round(gradedAssignmentsWithScore.reduce((sum, a) => sum + a.score, 0) / gradedAssignmentsWithScore.length)
            : 0;

        stats.value = {
          totalAssignments: allAssignments.length,
          submittedAssignments: submittedCount,
          pendingAssignments: pendingCount,
          averageScore: averageScore
        };

      } catch (error) {
        console.error('Error fetching assignments:', error);
        window.showError(error);
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      fetchAssignments();
    };

    const getDaysRemaining = (dueDate) => {
      if (!dueDate) return '';
      const now = new Date();
      const due = new Date(dueDate);
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'مهلت گذشته';
      if (diffDays === 0) return 'امروز';
      if (diffDays === 1) return 'فردا';
      return `${diffDays} روز باقی مانده`;
    };

    const getDueDateClass = (dueDate) => {
      if (!dueDate) return '';
      const now = new Date();
      const due = new Date(dueDate);
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'text-danger';
      if (diffDays <= 1) return 'text-warning';
      return 'text-success';
    };

    const getScoreBadge = (score) => {
      if (!score) return 'bg-secondary';
      if (score >= 80) return 'bg-success';
      if (score >= 60) return 'bg-info';
      if (score >= 40) return 'bg-warning';
      return 'bg-danger';
    };

    const submitAssignment = async (assignment) => {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.doc,.docx,.txt,.zip,.rar';

      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const comment = prompt('نظر یا توضیحات اضافی (اختیاری):') || '';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('comment', comment);

        try {
          await axios.post(`/assignments/${assignment.id}/submit`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          window.toast.success('تکلیف با موفقیت ارسال شد.');

          // Refresh assignments list
          await fetchAssignments();

          // Switch to submitted tab
          activeTab.value = 'submitted';
        } catch (error) {
          console.error('Error submitting assignment:', error);
          window.showError(error);
        }
      };

      // Trigger file selection
      fileInput.click();
    };

    const viewSubmission = async (assignment) => {
      try {
        // Get assignment file if it exists
        if (assignment.submissionId) {
          const response = await axios.get(`/assignments/files/${assignment.submissionId}`, {
            responseType: 'blob'
          });

          // Create a URL for the file and open it
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.click();

          // Clean up
          window.URL.revokeObjectURL(url);
        } else {
          alert('فایل ارسالی یافت نشد.');
        }
      } catch (error) {
        console.error('Error viewing submission:', error);
        window.showError(error);
      }
    };

    const viewFeedback = (assignment) => {
      if (assignment.feedback) {
        alert(`بازخورد استاد:\n\n${assignment.feedback}\n\nنمره: ${assignment.score || 'نمره‌گذاری نشده'}`);
      } else {
        alert(`نمره: ${assignment.score || 'نمره‌گذاری نشده'}\n\nبازخوردی ارائه نشده است.`);
      }
    };

    onMounted(() => {
      fetchAssignments();
    });

    return {
      loading,
      activeTab,
      assignments,
      stats,
      pendingAssignments,
      submittedAssignments,
      gradedAssignments,
      refreshData,
      getDaysRemaining,
      getDueDateClass,
      getScoreBadge,
      submitAssignment,
      viewSubmission,
      viewFeedback,
      formatDate,
      truncateText
    };
  }
}
</script>

<style scoped>
.student-assignments {
  min-height: calc(100vh - 56px);
  background-color: #f8f9fa;
  padding: 2rem 0;
}
</style>