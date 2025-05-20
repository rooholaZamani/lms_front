<template>
  <div class="assignments-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>تکالیف {{ isTeacher ? 'دوره' : 'من' }}</h2>
        <button v-if="isTeacher" class="btn btn-primary" @click="showCreateAssignmentModal">
          <i class="fas fa-plus me-2"></i> ایجاد تکلیف جدید
        </button>
      </div>

      <!-- فیلتر و جستجو -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group mb-3">
                <label for="searchQuery" class="form-label">جستجو</label>
                <div class="input-group">
                  <input
                      type="text"
                      class="form-control"
                      id="searchQuery"
                      v-model="searchQuery"
                      placeholder="عنوان تکلیف"
                  >
                  <button class="btn btn-primary" @click="searchAssignments">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="statusFilter" class="form-label">وضعیت</label>
                <select class="form-select" id="statusFilter" v-model="statusFilter" @change="filterAssignments">
                  <option value="all">همه</option>
                  <option value="pending">در انتظار ارسال</option>
                  <option value="submitted">ارسال شده</option>
                  <option value="graded">نمره‌دهی شده</option>
                  <option value="overdue">گذشته</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="sortBy" class="form-label">مرتب‌سازی بر اساس</label>
                <select class="form-select" id="sortBy" v-model="sortBy" @change="sortAssignments">
                  <option value="dueDate">تاریخ مهلت</option>
                  <option value="title">عنوان</option>
                  <option value="createdAt">تاریخ ایجاد</option>
                </select>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-secondary w-100" @click="resetFilters">
                <i class="fas fa-redo me-2"></i> بازنشانی
              </button>
            </div>
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
          <button class="btn btn-primary mt-3" @click="resetFilters">
            <i class="fas fa-redo me-2"></i> حذف فیلترها
          </button>
        </empty-state>

        <div v-else>
          <div class="card mb-4" v-for="assignment in paginatedAssignments" :key="assignment.id">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">{{ assignment.title }}</h5>
              <span :class="getStatusBadgeClass(assignment)">
                {{ getStatusText(assignment) }}
              </span>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-8">
                  <p>{{ assignment.description }}</p>

                  <div class="assignment-lesson mt-3">
                    <strong>درس:</strong> {{ assignment.lesson ? assignment.lesson.title : 'نامشخص' }}
                  </div>

                  <div class="assignment-attachments mt-3" v-if="assignment.file">
                    <div class="attachment-item">
                      <i class="fas fa-file me-2"></i>
                      <a href="#" @click.prevent="downloadFile(assignment.file)">{{ assignment.file.originalFilename }}</a>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="assignment-info">
                    <div class="info-item">
                      <i class="fas fa-calendar"></i>
                      <span>تاریخ شروع: {{ formatDate(assignment.createdAt) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="fas fa-clock"></i>
                      <span>مهلت تحویل: {{ formatDate(assignment.dueDate) }}</span>
                    </div>
                    <div class="info-item" v-if="isStudent && assignment.submission">
                      <i class="fas fa-check-circle"></i>
                      <span>تاریخ تحویل: {{ formatDate(assignment.submission.submittedAt) }}</span>
                    </div>
                    <div class="info-item" v-if="isStudent && assignment.submission && assignment.submission.score !== null">
                      <i class="fas fa-star"></i>
                      <span>نمره: {{ assignment.submission.score }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="assignment-actions mt-4">
                <!-- دکمه‌های دانش‌آموز -->
                <div v-if="isStudent">
                  <button
                      v-if="!assignment.submission && !isOverdue(assignment)"
                      class="btn btn-primary"
                      @click="showSubmitAssignmentModal(assignment)">
                    <i class="fas fa-upload me-2"></i> ارسال تکلیف
                  </button>
                  <button
                      v-if="assignment.submission"
                      class="btn btn-info"
                      @click="viewSubmission(assignment)">
                    <i class="fas fa-eye me-2"></i> مشاهده ارسال من
                  </button>
                </div>

                <!-- دکمه‌های استاد -->
                <div v-else-if="isTeacher">
                  <button
                      class="btn btn-success me-2"
                      @click="viewSubmissions(assignment)">
                    <i class="fas fa-list me-2"></i> مشاهده ارسال‌ها
                  </button>
                  <button
                      class="btn btn-warning me-2"
                      @click="editAssignment(assignment)">
                    <i class="fas fa-edit me-2"></i> ویرایش
                  </button>
                  <button
                      class="btn btn-danger"
                      @click="confirmDeleteAssignment(assignment)">
                    <i class="fas fa-trash me-2"></i> حذف
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <pagination
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-changed="changePage"
          />
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
          <label for="title" class="form-label">عنوان تکلیف</label>
          <input type="text" class="form-control" id="title" v-model="newAssignment.title" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">توضیحات</label>
          <textarea class="form-control" id="description" v-model="newAssignment.description" rows="3" required></textarea>
        </div>
        <div class="mb-3">
          <label for="lessonId" class="form-label">درس</label>
          <select class="form-select" id="lessonId" v-model="newAssignment.lessonId" required>
            <option value="" disabled selected>انتخاب درس</option>
            <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">{{ lesson.title }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="dueDate" class="form-label">مهلت تحویل</label>
          <input type="datetime-local" class="form-control" id="dueDate" v-model="newAssignment.dueDate" required>
        </div>
        <div class="mb-3">
          <label for="file" class="form-label">فایل پیوست (اختیاری)</label>
          <input type="file" class="form-control" id="file" @change="handleFileSelect">
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
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
          <label for="submissionComment" class="form-label">توضیحات (اختیاری)</label>
          <textarea class="form-control" id="submissionComment" v-model="submissionData.comment" rows="3"></textarea>
        </div>
        <div class="mb-3">
          <label for="submissionFile" class="form-label">فایل</label>
          <input type="file" class="form-control" id="submissionFile" @change="handleSubmissionFileSelect" required>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
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

      // apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(assignment =>
            assignment.title.toLowerCase().includes(query)
        );
      }

      // apply status filter
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

      // apply sorting
      if (this.sortBy === 'title') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'createdAt') {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        // default: dueDate
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
          // Fetch all lessons for teacher to use in the assignment creation form
          const lessonsResponse = await axios.get('/lessons/teaching');
          this.lessons = lessonsResponse.data;
        }

        // Fetch assignments based on the provided props
        let endpoint = '/assignments';
        if (this.lessonId) {
          endpoint = `/assignments/lesson/${this.lessonId}`;
        } else if (this.courseId) {
          endpoint = `/assignments/course/${this.courseId}`;
        } else if (this.isStudent) {
          // If no specific course or lesson is provided, get all assignments for the student
          endpoint = '/assignments/student';
        } else if (this.isTeacher) {
          // If no specific course or lesson is provided, get all assignments created by the teacher
          endpoint = '/assignments/teacher';
        }

        const response = await axios.get(endpoint);

        // For students, fetch their submissions
        if (this.isStudent) {
          const submissionsResponse = await axios.get('/assignments/submissions/student');
          const submissions = submissionsResponse.data;

          // Map submissions to assignments
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
          return 'badge bg-success';
        } else if (assignment.submission) {
          return 'badge bg-info';
        } else if (this.isOverdue(assignment)) {
          return 'badge bg-danger';
        } else {
          return 'badge bg-warning';
        }
      } else {
        // For teachers, show different status
        if (this.isOverdue(assignment)) {
          return 'badge bg-secondary';
        } else {
          return 'badge bg-primary';
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
        // For teachers
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

        // Add the new assignment to the list
        this.assignments.unshift(response.data);

        // Close the modal
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

        // Update the assignment in the list
        const index = this.assignments.findIndex(a => a.id === this.selectedAssignment.id);
        if (index !== -1) {
          this.assignments[index].submission = response.data;
        }

        // Close the modal
        this.$refs.submitAssignmentModal.hide();

        this.finishSubmitting('تکلیف با موفقیت ارسال شد.');
      } catch (error) {
        console.error('Error submitting assignment:', error);
        this.finishSubmitting(null, 'خطا در ارسال تکلیف. لطفاً دوباره تلاش کنید.');
      }
    },

    viewSubmission(assignment) {
      // Navigate to submission details page
      this.$router.push({
        name: 'AssignmentSubmission',
        params: { id: assignment.id }
      });
    },

    viewSubmissions(assignment) {
      // Navigate to submissions list page for teachers
      this.$router.push({
        name: 'AssignmentSubmissions',
        params: { id: assignment.id }
      });
    },

    editAssignment(assignment) {
      // Navigate to assignment edit page
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

        // Remove the assignment from the list
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

        // Create a download link and click it
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
.assignments-container {
  min-height: calc(100vh - 56px);
}

.assignment-info {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-item i {
  width: 20px;
  margin-left: 10px;
  color: #007bff;
}

.assignment-attachments {
  margin-top: 15px;
}

.attachment-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.attachment-item i {
  margin-left: 10px;
  color: #6c757d;
}

.attachment-item a {
  color: #007bff;
  text-decoration: none;
}

.attachment-item a:hover {
  text-decoration: underline;
}
</style>
