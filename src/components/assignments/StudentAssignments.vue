<template>
  <div class="modern-page-bg info-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo info">
          <i class="fas fa-tasks"></i>
        </div>
        <h1 class="modern-title">تکالیف من</h1>
        <p class="modern-subtitle">مدیریت و پیگیری تکالیف درسی</p>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up">
            <div class="modern-stat-icon text-primary">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="modern-stat-value">{{ stats.totalAssignments }}</div>
            <div class="modern-stat-label">کل تکالیف</div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
            <div class="modern-stat-icon text-success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="modern-stat-value">{{ stats.submittedAssignments }}</div>
            <div class="modern-stat-label">ارسال شده</div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
            <div class="modern-stat-icon text-warning">
              <i class="fas fa-clock"></i>
            </div>
            <div class="modern-stat-value">{{ stats.pendingAssignments }}</div>
            <div class="modern-stat-label">در انتظار</div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
            <div class="modern-stat-icon text-info">
              <i class="fas fa-star"></i>
            </div>
            <div class="modern-stat-value">{{ stats.averageScore }}</div>
            <div class="modern-stat-label">میانگین نمره</div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="modern-card animate-slide-up" style="animation-delay: 0.4s;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="modern-tabs">
            <button
                class="modern-tab-btn"
                :class="{ active: activeTab === 'pending' }"
                @click="activeTab = 'pending'">
              <i class="fas fa-clock me-1"></i> در انتظار
            </button>
            <button
                class="modern-tab-btn"
                :class="{ active: activeTab === 'submitted' }"
                @click="activeTab = 'submitted'">
              <i class="fas fa-check-circle me-1"></i> ارسال شده
            </button>
            <button
                class="modern-tab-btn"
                :class="{ active: activeTab === 'graded' }"
                @click="activeTab = 'graded'">
              <i class="fas fa-star me-1"></i> نمره‌دهی شده
            </button>
          </div>
          <button class="modern-btn modern-btn-outline" @click="refreshData">
            <i class="fas fa-sync-alt me-1"></i> بروزرسانی
          </button>
        </div>

        <loading-spinner :loading="loading">
          <!-- Pending Assignments -->
          <div v-if="activeTab === 'pending'">
            <div v-if="pendingAssignments.length === 0" class="text-center py-5">
              <div class="modern-logo large success mb-4">
                <i class="fas fa-check-circle"></i>
              </div>
              <h5>همه تکالیف ارسال شده‌اند!</h5>
              <p class="text-muted">در حال حاضر تکلیف معوقه‌ای ندارید.</p>
            </div>
            <div v-else class="modern-table-container">
              <table class="modern-table table">
                <thead>
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
                    <span class="modern-badge modern-badge-warning">در انتظار ارسال</span>
                  </td>
                  <td>
                    <button
                        class="modern-btn modern-btn-primary modern-btn-sm"
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
            <div v-if="submittedAssignments.length === 0" class="text-center py-5">
              <div class="modern-logo large secondary mb-4">
                <i class="fas fa-file-upload"></i>
              </div>
              <h5>هنوز تکلیفی ارسال نکرده‌اید</h5>
              <p class="text-muted">تکالیف ارسال شده در اینجا نمایش داده خواهند شد.</p>
            </div>
            <div v-else class="modern-table-container">
              <table class="modern-table table">
                <thead>
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
                    <span class="modern-badge modern-badge-info">در حال بررسی</span>
                  </td>
                  <td>
                    <button
                        class="modern-btn modern-btn-outline modern-btn-sm"
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
            <div v-if="gradedAssignments.length === 0" class="text-center py-5">
              <div class="modern-logo large warning mb-4">
                <i class="fas fa-star"></i>
              </div>
              <h5>هنوز تکلیفی نمره‌گذاری نشده</h5>
              <p class="text-muted">تکالیف نمره‌گذاری شده در اینجا نمایش داده خواهند شد.</p>
            </div>
            <div v-else class="modern-table-container">
              <table class="modern-table table">
                <thead>
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
                      <span class="modern-badge" :class="getScoreBadge(assignment.score)">
                        {{ assignment.score || 'نمره‌گذاری نشده' }}
                      </span>
                  </td>
                  <td>{{ formatDate(assignment.gradedAt) }}</td>
                  <td>
                    <button
                        class="modern-btn modern-btn-outline modern-btn-sm"
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
        const response = await axios.get('/assignments/submissions/student');
        const submissions = response.data || [];

        const coursesResponse = await axios.get('/courses/enrolled');
        const enrolledCourses = coursesResponse.data || [];

        const allAssignments = [];

        for (const course of enrolledCourses) {
          try {
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data || [];

            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const lessonAssignments = assignmentsResponse.data || [];

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

        const submittedCount = allAssignments.filter(a => a.submitted).length;
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
      if (!score) return 'modern-badge-secondary';
      if (score >= 80) return 'modern-badge-success';
      if (score >= 60) return 'modern-badge-info';
      if (score >= 40) return 'modern-badge-warning';
      return 'modern-badge-danger';
    };

    const submitAssignment = async (assignment) => {
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
          await fetchAssignments();
          activeTab.value = 'submitted';
        } catch (error) {
          console.error('Error submitting assignment:', error);
          window.showError(error);
        }
      };

      fileInput.click();
    };

    const viewSubmission = async (assignment) => {
      try {
        if (assignment.submissionId) {
          const response = await axios.get(`/assignments/files/${assignment.submissionId}`, {
            responseType: 'blob'
          });

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.click();

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
/* Component specific styles */
.modern-tabs {
  display: flex;
  gap: 0.5rem;
}

.modern-tab-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.modern-tab-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.modern-tab-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .modern-tabs {
    flex-direction: column;
    width: 100%;
  }

  .modern-tab-btn {
    width: 100%;
    text-align: center;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>