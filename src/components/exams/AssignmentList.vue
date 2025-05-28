<template>
  <div class="modern-page-bg secondary-gradient">
    <div class="modern-container large animate-slide-up">
      <!-- Header -->
      <div class="modern-header">
        <div class="modern-logo secondary">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h1 class="modern-title">تکالیف {{ isTeacher ? 'دوره' : 'من' }}</h1>
        <div class="d-flex justify-content-center">
          <button v-if="isTeacher" class="modern-btn modern-btn-success" @click="showCreateAssignmentModal">
            <i class="fas fa-plus me-2"></i>
            ایجاد تکلیف جدید
          </button>
        </div>
      </div>

      <!-- فیلتر و جستجو -->
      <div class="modern-card animate-fade-in" style="animation-delay: 0.1s;">
        <h5 class="modern-title">
          <i class="fas fa-filter text-primary me-2"></i>
          فیلتر و جستجو
        </h5>

        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="searchQuery" class="modern-form-label">جستجو</label>
            <div class="input-group">
              <input
                  type="text"
                  class="modern-form-control"
                  id="searchQuery"
                  v-model="searchQuery"
                  placeholder="عنوان تکلیف"
              >
              <button class="modern-btn modern-btn-primary" @click="searchAssignments">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <label for="statusFilter" class="modern-form-label">وضعیت</label>
            <select class="modern-form-control" id="statusFilter" v-model="statusFilter" @change="filterAssignments">
              <option value="all">همه</option>
              <option value="pending">در انتظار ارسال</option>
              <option value="submitted">ارسال شده</option>
              <option value="graded">نمره‌دهی شده</option>
              <option value="overdue">گذشته</option>
            </select>
          </div>

          <div class="col-md-3 mb-3">
            <label for="sortBy" class="modern-form-label">مرتب‌سازی بر اساس</label>
            <select class="modern-form-control" id="sortBy" v-model="sortBy" @change="sortAssignments">
              <option value="dueDate">تاریخ مهلت</option>
              <option value="title">عنوان</option>
              <option value="createdAt">تاریخ ایجاد</option>
            </select>
          </div>

          <div class="col-md-2 d-flex align-items-end mb-3">
            <button class="modern-btn modern-btn-secondary w-100" @click="resetFilters">
              <i class="fas fa-redo me-2"></i>
              بازنشانی
            </button>
          </div>
        </div>
      </div>

      <!-- لیست تکالیف -->
      <loading-spinner :loading="loading">
        <empty-state
            v-if="filteredAssignments.length === 0"
            title="تکلیفی یافت نشد"
            description="هیچ تکلیفی که با فیلترهای انتخابی مطابقت داشته باشد، وجود ندارد."
            icon="clipboard-list"
        >
          <button class="modern-btn modern-btn-primary mt-3" @click="resetFilters">
            <i class="fas fa-redo me-2"></i>
            حذف فیلترها
          </button>
        </empty-state>

        <div v-else>
          <div v-for="assignment in paginatedAssignments" :key="assignment.id"
               class="modern-card animate-fade-in mb-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="modern-title">{{ assignment.title }}</h5>
              <span :class="getStatusBadgeClass(assignment)">
                {{ getStatusText(assignment) }}
              </span>
            </div>

            <div class="row">
              <div class="col-md-8">
                <p class="text-muted mb-3">{{ assignment.description }}</p>

                <div class="assignment-meta mb-3">
                  <div class="meta-item">
                    <i class="fas fa-book text-primary me-2"></i>
                    <strong>درس:</strong> {{ assignment.lesson ? assignment.lesson.title : 'نامشخص' }}
                  </div>
                </div>

                <div v-if="assignment.file" class="assignment-attachments">
                  <div class="attachment-item">
                    <i class="fas fa-file me-2 text-info"></i>
                    <a href="#" @click.prevent="downloadFile(assignment.file)" class="text-decoration-none">
                      {{ assignment.file.originalFilename }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="assignment-info">
                  <div class="info-item">
                    <i class="fas fa-calendar text-success me-2"></i>
                    <span>تاریخ شروع: {{ formatDate(assignment.createdAt) }}</span>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-clock text-warning me-2"></i>
                    <span>مهلت تحویل: {{ formatDate(assignment.dueDate) }}</span>
                  </div>
                  <div v-if="isStudent && assignment.submission" class="info-item">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    <span>تاریخ تحویل: {{ formatDate(assignment.submission.submittedAt) }}</span>
                  </div>
                  <div v-if="isStudent && assignment.submission && assignment.submission.score !== null" class="info-item">
                    <i class="fas fa-star text-warning me-2"></i>
                    <span>نمره: {{ assignment.submission.score }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="assignment-actions mt-4 pt-3 border-top">
              <!-- دکمه‌های دانش‌آموز -->
              <div v-if="isStudent" class="d-flex gap-2 flex-wrap">
                <button
                    v-if="!assignment.submission && !isOverdue(assignment)"
                    class="modern-btn modern-btn-primary"
                    @click="showSubmitAssignmentModal(assignment)">
                  <i class="fas fa-upload me-2"></i>
                  ارسال تکلیف
                </button>
                <button
                    v-if="assignment.submission"
                    class="modern-btn modern-btn-info"
                    @click="viewSubmission(assignment)">
                  <i class="fas fa-eye me-2"></i>
                  مشاهده ارسال من
                </button>
              </div>

              <!-- دکمه‌های استاد -->
              <div v-else-if="isTeacher" class="d-flex gap-2 flex-wrap">
                <button class="modern-btn modern-btn-success" @click="viewSubmissions(assignment)">
                  <i class="fas fa-list me-2"></i>
                  مشاهده ارسال‌ها
                </button>
                <button class="modern-btn modern-btn-warning" @click="editAssignment(assignment)">
                  <i class="fas fa-edit me-2"></i>
                  ویرایش
                </button>
                <button class="modern-btn modern-btn-danger" @click="confirmDeleteAssignment(assignment)">
                  <i class="fas fa-trash me-2"></i>
                  حذف
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
            <pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                @page-changed="changePage"
            />
          </div>
        </div>
      </loading-spinner>
    </div>

    <!-- مودال ایجاد تکلیف جدید -->
    <base-modal
        modal-id="createAssignmentModal"
        title="ایجاد تکلیف جدید"
        ref="createAssignmentModal">
      <form @submit.prevent="createAssignment">
        <div class="mb-3">
          <label for="title" class="modern-form-label">عنوان تکلیف</label>
          <input type="text" class="modern-form-control" id="title" v-model="newAssignment.title" required>
        </div>
        <div class="mb-3">
          <label for="description" class="modern-form-label">توضیحات</label>
          <textarea class="modern-form-control" id="description" v-model="newAssignment.description" rows="3" required></textarea>
        </div>
        <div class="mb-3">
          <label for="lessonId" class="modern-form-label">درس</label>
          <select class="modern-form-control" id="lessonId" v-model="newAssignment.lessonId" required>
            <option value="" disabled selected>انتخاب درس</option>
            <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">{{ lesson.title }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="dueDate" class="modern-form-label">مهلت تحویل</label>
          <input type="datetime-local" class="modern-form-control" id="dueDate" v-model="newAssignment.dueDate" required>
        </div>
        <div class="mb-3">
          <label for="file" class="modern-form-label">فایل پیوست (اختیاری)</label>
          <input type="file" class="modern-form-control" id="file" @change="handleFileSelect">
        </div>
        <button type="submit" class="modern-btn modern-btn-primary w-100" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ایجاد تکلیف
        </button>
      </form>
    </base-modal>

    <!-- مودال ارسال تکلیف -->
    <base-modal
        modal-id="submitAssignmentModal"
        title="ارسال تکلیف"
        ref="submitAssignmentModal">
      <form @submit.prevent="submitAssignment">
        <div class="mb-3">
          <h5>{{ selectedAssignment ? selectedAssignment.title : '' }}</h5>
          <p class="text-muted">مهلت تحویل: {{ selectedAssignment ? formatDate(selectedAssignment.dueDate) : '' }}</p>
        </div>
        <div class="mb-3">
          <label for="submissionComment" class="modern-form-label">توضیحات (اختیاری)</label>
          <textarea class="modern-form-control" id="submissionComment" v-model="submissionData.comment" rows="3"></textarea>
        </div>
        <div class="mb-3">
          <label for="submissionFile" class="modern-form-label">فایل</label>
          <input type="file" class="modern-form-control" id="submissionFile" @change="handleSubmissionFileSelect" required>
        </div>
        <button type="submit" class="modern-btn modern-btn-primary w-100" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ارسال تکلیف
        </button>
      </form>
    </base-modal>

    <!-- مودال تأیید حذف تکلیف -->
    <confirmation-dialog
        modal-id="deleteAssignmentModal"
        title="حذف تکلیف"
        :message="'آیا از حذف این تکلیف اطمینان دارید؟ این عمل قابل بازگشت نیست.'"
        :details="selectedAssignment ? selectedAssignment.title : ''"
        confirm-text="حذف تکلیف"
        confirm-button-type="danger"
        icon="trash-alt"
        ref="deleteConfirmDialog"
        @confirm="deleteAssignment"
    />
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import { useUser } from '@/composables/useUser.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'AssignmentList',
  components: {
    LoadingSpinner,
    EmptyState,
    Pagination,
    BaseModal,
    ConfirmationDialog
  },
  mixins: [formMixin],
  props: {
    courseId: {
      type: String,
      default: null
    },
    lessonId: {
      type: String,
      default: null
    }
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();
    const { isTeacher, isStudent } = useUser();

    return {
      formatDate,
      truncateText,
      isTeacher,
      isStudent
    };
  },
  data() {
    return {
      assignments: [],
      lessons: [],
      loading: true,
      error: null,

      // pagination
      currentPage: 1,
      itemsPerPage: 5,

      // filters
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'dueDate',

      // forms
      newAssignment: {
        title: '',
        description: '',
        lessonId: '',
        dueDate: '',
        file: null
      },
      submissionData: {
        comment: '',
        file: null
      },
      selectedAssignment: null
    };
  },
  computed: {
    filteredAssignments() {
      let result = [...this.assignments];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(assignment =>
            assignment.title.toLowerCase().includes(query)
        );
      }

      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'pending') {
          result = result.filter(assignment => !assignment.submission && !this.isOverdue(assignment));
        } else if (this.statusFilter === 'submitted') {
          result = result.filter(assignment => assignment.submission && assignment.submission.score === null);
        } else if (this.statusFilter === 'graded') {
          result = result.filter(assignment => assignment.submission && assignment.submission.score !== null);
        } else if (this.statusFilter === 'overdue') {
          result = result.filter(assignment => this.isOverdue(assignment) && !assignment.submission);
        }
      }

      if (this.sortBy === 'title') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'createdAt') {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredAssignments.length / this.itemsPerPage);
    },
    paginatedAssignments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAssignments.slice(start, end);
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;

        if (this.isTeacher) {
          const lessonsResponse = await axios.get('/lessons/teaching');
          this.lessons = lessonsResponse.data;
        }

        let endpoint = '/assignments';
        if (this.lessonId) {
          endpoint = `/assignments/lesson/${this.lessonId}`;
        } else if (this.courseId) {
          endpoint = `/assignments/course/${this.courseId}`;
        } else if (this.isStudent) {
          endpoint = '/assignments/student';
        } else if (this.isTeacher) {
          endpoint = '/assignments/teacher';
        }

        const response = await axios.get(endpoint);

        if (this.isStudent) {
          const submissionsResponse = await axios.get('/assignments/submissions/student');
          const submissions = submissionsResponse.data;

          this.assignments = response.data.map(assignment => {
            const submission = submissions.find(s => s.assignmentId === assignment.id);
            return {
              ...assignment,
              submission: submission || null
            };
          });
        } else {
          this.assignments = response.data;
        }

        this.loading = false;
      } catch (error) {
        console.error('Error fetching assignments:', error);
        this.error = 'مشکلی در دریافت لیست تکالیف رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    isOverdue(assignment) {
      return new Date(assignment.dueDate) < new Date();
    },

    getStatusBadgeClass(assignment) {
      if (this.isStudent) {
        if (assignment.submission && assignment.submission.score !== null) {
          return 'modern-badge modern-badge-success';
        } else if (assignment.submission) {
          return 'modern-badge modern-badge-info';
        } else if (this.isOverdue(assignment)) {
          return 'modern-badge modern-badge-danger';
        } else {
          return 'modern-badge modern-badge-warning';
        }
      } else {
        if (this.isOverdue(assignment)) {
          return 'modern-badge modern-badge-secondary';
        } else {
          return 'modern-badge modern-badge-primary';
        }
      }
    },

    getStatusText(assignment) {
      if (this.isStudent) {
        if (assignment.submission && assignment.submission.score !== null) {
          return 'نمره‌دهی شده';
        } else if (assignment.submission) {
          return 'ارسال شده';
        } else if (this.isOverdue(assignment)) {
          return 'گذشته';
        } else {
          return 'در انتظار ارسال';
        }
      } else {
        if (this.isOverdue(assignment)) {
          return 'مهلت تمام شده';
        } else {
          return 'فعال';
        }
      }
    },

    changePage(page) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    },

    searchAssignments() {
      this.currentPage = 1;
    },

    filterAssignments() {
      this.currentPage = 1;
    },

    sortAssignments() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = 'all';
      this.sortBy = 'dueDate';
      this.currentPage = 1;
    },

    handleFileSelect(event) {
      if (event.target.files.length > 0) {
        this.newAssignment.file = event.target.files[0];
      }
    },

    handleSubmissionFileSelect(event) {
      if (event.target.files.length > 0) {
        this.submissionData.file = event.target.files[0];
      }
    },

    showCreateAssignmentModal() {
      this.newAssignment = {
        title: '',
        description: '',
        lessonId: '',
        dueDate: '',
        file: null
      };
      this.$refs.createAssignmentModal.show();
    },

    async createAssignment() {
      this.startSubmitting();

      try {
        const formData = new FormData();
        formData.append('title', this.newAssignment.title);
        formData.append('description', this.newAssignment.description);
        formData.append('lessonId', this.newAssignment.lessonId);
        formData.append('dueDate', this.newAssignment.dueDate);

        if (this.newAssignment.file) {
          formData.append('file', this.newAssignment.file);
        }

        const response = await axios.post(`/assignments/lesson/${this.newAssignment.lessonId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        this.assignments.unshift(response.data);
        this.$refs.createAssignmentModal.hide();
        this.finishSubmitting('تکلیف با موفقیت ایجاد شد.');
      } catch (error) {
        console.error('Error creating assignment:', error);
        this.finishSubmitting(null, 'خطا در ایجاد تکلیف. لطفاً دوباره تلاش کنید.');
      }
    },

    showSubmitAssignmentModal(assignment) {
      this.selectedAssignment = assignment;
      this.submissionData = {
        comment: '',
        file: null
      };
      this.$refs.submitAssignmentModal.show();
    },

    async submitAssignment() {
      if (!this.selectedAssignment || !this.submissionData.file) {
        this.showErrorToast('لطفاً یک فایل انتخاب کنید.');
        return;
      }

      this.startSubmitting();

      try {
        const formData = new FormData();
        formData.append('file', this.submissionData.file);
        formData.append('comment', this.submissionData.comment || '');

        const response = await axios.post(`/assignments/${this.selectedAssignment.id}/submit`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const index = this.assignments.findIndex(a => a.id === this.selectedAssignment.id);
        if (index !== -1) {
          this.assignments[index].submission = response.data;
        }

        this.$refs.submitAssignmentModal.hide();
        this.finishSubmitting('تکلیف با موفقیت ارسال شد.');
      } catch (error) {
        console.error('Error submitting assignment:', error);
        this.finishSubmitting(null, 'خطا در ارسال تکلیف. لطفاً دوباره تلاش کنید.');
      }
    },

    viewSubmission(assignment) {
      this.$router.push({
        name: 'AssignmentSubmission',
        params: { id: assignment.id }
      });
    },

    viewSubmissions(assignment) {
      this.$router.push({
        name: 'AssignmentSubmissions',
        params: { id: assignment.id }
      });
    },

    editAssignment(assignment) {
      this.$router.push({
        name: 'AssignmentEdit',
        params: { id: assignment.id }
      });
    },

    confirmDeleteAssignment(assignment) {
      this.selectedAssignment = assignment;
      this.$refs.deleteConfirmDialog.show();
    },

    async deleteAssignment() {
      if (!this.selectedAssignment) return;

      try {
        await axios.delete(`/assignments/${this.selectedAssignment.id}`);
        this.assignments = this.assignments.filter(a => a.id !== this.selectedAssignment.id);
        this.showSuccessToast('تکلیف با موفقیت حذف شد.');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        this.showErrorToast('خطا در حذف تکلیف. لطفاً دوباره تلاش کنید.');
      }
    },

    async downloadFile(file) {
      try {
        const response = await axios.get(`/assignments/files/${file.id}`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.originalFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading file:', error);
        this.showErrorToast('خطا در دانلود فایل. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>

<style scoped>
/* Assignment specific styles */
.assignment-meta {
  background: rgba(102, 126, 234, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.assignment-info {
  background: rgba(255, 255, 255, 0.5);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.attachment-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 0.5rem;
}

.attachment-item a {
  color: #007bff;
  font-weight: 500;
}

.attachment-item a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .modern-btn {
    width: 100%;
  }

  .assignment-actions .d-flex.gap-2 .modern-btn {
    width: 100%;
  }
}
</style>