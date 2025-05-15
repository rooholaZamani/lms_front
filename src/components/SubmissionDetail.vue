<template>
  <div class="submission-detail-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Assignment Submission Details</h2>
        <button class="btn btn-secondary" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <loading-spinner :loading="loading">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else>
          <!-- Assignment Information -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Assignment Information</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-8">
                  <h4>{{ assignment.title }}</h4>
                  <p>{{ assignment.description }}</p>
                  
                  <div class="assignment-meta">
                    <div class="meta-item">
                      <i class="fas fa-calendar"></i>
                      <span>Created: {{ formatDate(assignment.createdAt) }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-clock"></i>
                      <span>Due Date: {{ formatDate(assignment.dueDate) }}</span>
                    </div>
                  </div>
                  
                  <div v-if="assignment.file" class="assignment-attachment mt-3">
                    <h6>Assignment File:</h6>
                    <div class="attachment-item">
                      <i class="fas fa-file"></i>
                      <a href="#" @click.prevent="downloadFile(assignment.file)">{{ assignment.file.originalFilename }}</a>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="course-info">
                    <h6>Course Information</h6>
                    <div class="info-item">
                      <div class="info-label">Course:</div>
                      <div class="info-value">{{ getCourseTitle() }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Lesson:</div>
                      <div class="info-value">{{ assignment.lesson ? assignment.lesson.title : 'Unknown' }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Teacher:</div>
                      <div class="info-value">{{ getTeacherName() }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submission Information -->
          <div class="card mb-4">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">Student Submission</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="student-info mb-4">
                    <h6>Student Information</h6>
                    <div class="info-item">
                      <div class="info-label">Name:</div>
                      <div class="info-value">{{ getStudentName() }}</div>
                    </div>
                    <div class="info-item" v-if="submission.student && submission.student.email">
                      <div class="info-label">Email:</div>
                      <div class="info-value">{{ submission.student.email }}</div>
                    </div>
                    <div class="info-item" v-if="submission.student && submission.student.studentId">
                      <div class="info-label">Student ID:</div>
                      <div class="info-value">{{ submission.student.studentId }}</div>
                    </div>
                  </div>
                  
                  <div class="submission-meta">
                    <div class="info-item">
                      <div class="info-label">Submitted:</div>
                      <div class="info-value">{{ formatDate(submission.submittedAt) }}</div>
                    </div>
                    <div class="info-item" v-if="submission.status">
                      <div class="info-label">Status:</div>
                      <div class="info-value">
                        <span :class="getSubmissionStatusClass()">
                          {{ getSubmissionStatusText() }}
                        </span>
                      </div>
                    </div>
                    <div class="info-item" v-if="submission.score !== null && submission.score !== undefined">
                      <div class="info-label">Score:</div>
                      <div class="info-value">{{ submission.score }}</div>
                    </div>
                    <div class="info-item" v-if="isOnTime()">
                      <div class="info-label">Submitted:</div>
                      <div class="info-value">
                        <span class="badge bg-success">On Time</span>
                      </div>
                    </div>
                    <div class="info-item" v-else>
                      <div class="info-label">Submitted:</div>
                      <div class="info-value">
                        <span class="badge bg-warning">Late</span>
                        <small class="ms-2">{{ getLateTimeText() }}</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div v-if="submission.file" class="submission-file mb-4">
                    <h6>Submitted File:</h6>
                    <div class="file-container">
                      <i class="fas fa-file-alt file-icon"></i>
                      <div class="file-info">
                        <div class="file-name">{{ submission.file.originalFilename }}</div>
                        <div class="file-size">{{ formatFileSize(submission.file.size) }}</div>
                      </div>
                      <button class="btn btn-primary btn-sm" @click="downloadFile(submission.file)">
                        <i class="fas fa-download me-1"></i> Download
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="submission.comment" class="submission-comment">
                    <h6>Student Comment:</h6>
                    <div class="comment-box">
                      {{ submission.comment }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Teacher Grading Section (only for teachers) -->
              <div v-if="isTeacher && !submission.graded" class="grading-section mt-4">
                <h5>Grade Submission</h5>
                <form @submit.prevent="gradeSubmission">
                  <div class="row">
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label for="score" class="form-label">Score</label>
                        <input type="number" class="form-control" id="score" v-model="gradingForm.score" min="0" max="100" required>
                      </div>
                    </div>
                    <div class="col-md-8">
                      <div class="mb-3">
                        <label for="feedback" class="form-label">Feedback</label>
                        <textarea class="form-control" id="feedback" v-model="gradingForm.feedback" rows="3"></textarea>
                      </div>
                    </div>
                  </div>
                  <div class="text-end">
                    <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submit Grade
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- Display Teacher Feedback (when graded) -->
              <div v-if="submission.feedback || submission.graded" class="feedback-section mt-4">
                <h5>Teacher Feedback</h5>
                <div class="card">
                  <div class="card-body">
                    <div v-if="submission.feedback" class="feedback-text">
                      {{ submission.feedback }}
                    </div>
                    <div v-else class="text-muted">
                      No feedback provided.
                    </div>
                    
                    <div v-if="submission.gradedBy" class="graded-by mt-3">
                      <small class="text-muted">
                        Graded by {{ getGraderName() }} on {{ formatDate(submission.gradedAt) }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'SubmissionDetail',
  components: {
    LoadingSpinner
  },
  mixins: [formMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup() {
    const { isTeacher, getUserFullName } = useUser();
    const { formatDate, formatFileSize } = useFormatters();

    return {
      isTeacher,
      getUserFullName,
      formatDate,
      formatFileSize
    };
  },
  data() {
    return {
      loading: true,
      error: null,
      assignment: {},
      submission: {},
      gradingForm: {
        score: 0,
        feedback: ''
      },
      isSubmitting: false
    };
  },
  created() {
    this.fetchSubmissionData();
  },
  methods: {
    async fetchSubmissionData() {
      try {
        this.loading = true;
        
        // Get submission details
        const response = await axios.get(`/assignments/submissions/${this.id}`);
        this.submission = response.data;
        
        // Get assignment details
        if (this.submission.assignmentId) {
          const assignmentResponse = await axios.get(`/assignments/${this.submission.assignmentId}`);
          this.assignment = assignmentResponse.data;
        }
        
        this.loading = false;
      } catch (error) {
        console.error('Error fetching submission data:', error);
        this.error = 'There was a problem loading the submission details. Please try again.';
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    getCourseTitle() {
      if (!this.assignment || !this.assignment.lesson || !this.assignment.lesson.course) {
        return 'Unknown';
      }
      return this.assignment.lesson.course.title;
    },
    
    getTeacherName() {
      if (!this.assignment || !this.assignment.teacher) {
        return 'Unknown';
      }
      return this.getUserFullName(this.assignment.teacher);
    },
    
    getStudentName() {
      if (!this.submission || !this.submission.student) {
        return 'Unknown';
      }
      return this.getUserFullName(this.submission.student);
    },
    
    getGraderName() {
      if (!this.submission || !this.submission.gradedBy) {
        return 'Unknown';
      }
      return this.getUserFullName(this.submission.gradedBy);
    },
    
    getSubmissionStatusClass() {
      if (!this.submission || !this.submission.status) return '';
      
      switch (this.submission.status.toLowerCase()) {
        case 'submitted':
          return 'badge bg-info';
        case 'graded':
          return 'badge bg-success';
        case 'rejected':
          return 'badge bg-danger';
        default:
          return 'badge bg-secondary';
      }
    },
    
    getSubmissionStatusText() {
      if (!this.submission || !this.submission.status) return 'Unknown';
      
      return this.submission.status.charAt(0).toUpperCase() + this.submission.status.slice(1);
    },
    
    isOnTime() {
      if (!this.submission || !this.submission.submittedAt || !this.assignment || !this.assignment.dueDate) {
        return true; // Default to on time if we don't have dates
      }
      
      const submittedDate = new Date(this.submission.submittedAt);
      const dueDate = new Date(this.assignment.dueDate);
      
      return submittedDate <= dueDate;
    },
    
    getLateTimeText() {
      if (!this.submission || !this.submission.submittedAt || !this.assignment || !this.assignment.dueDate) {
        return '';
      }
      
      const submittedDate = new Date(this.submission.submittedAt);
      const dueDate = new Date(this.assignment.dueDate);
      
      if (submittedDate <= dueDate) return '';
      
      const diffMs = submittedDate - dueDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours > 1 ? 's' : ''} late`;
      } else {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} late`;
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
        this.showErrorToast('Error downloading file. Please try again.');
      }
    },
    
    async gradeSubmission() {
      this.isSubmitting = true;
      
      try {
        const response = await axios.post(`/assignments/submissions/${this.id}/grade`, {
          score: this.gradingForm.score,
          feedback: this.gradingForm.feedback
        });
        
        // Update the submission with the graded data
        this.submission = {
          ...this.submission,
          score: response.data.score,
          feedback: response.data.feedback,
          graded: true,
          gradedAt: response.data.gradedAt,
          gradedBy: response.data.gradedBy || this.$store.getters.currentUser,
          status: 'GRADED'
        };
        
        this.showSuccessToast('Submission graded successfully.');
      } catch (error) {
        console.error('Error grading submission:', error);
        this.showErrorToast('Error grading submission. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
.submission-detail-container {
  min-height: calc(100vh - 56px);
}

.assignment-meta, .submission-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 8px 15px;
  border-radius: 5px;
}

.meta-item i {
  margin-right: 10px;
  color: #007bff;
}

.student-info, .course-info {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
}

.student-info h6, .course-info h6 {
  margin-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  min-width: 70px;
  font-weight: bold;
}

.assignment-attachment, .submission-file {
  margin-top: 20px;
}

.attachment-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 5px;
  margin-top: 8px;
}

.attachment-item i {
  margin-right: 10px;
  color: #6c757d;
}

.file-container {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
}

.file-icon {
  font-size: 2rem;
  color: #007bff;
  margin-right: 15px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: bold;
}

.file-size {
  font-size: 0.9rem;
  color: #6c757d;
}

.submission-comment {
  margin-top: 20px;
}

.comment-box {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  white-space: pre-wrap;
}

.grading-section, .feedback-section {
  border-top: 1px solid #dee2e6;
  padding-top: 20px;
}

.feedback-text {
  white-space: pre-wrap;
}

.graded-by {
  text-align: right;
  font-style: italic;
}
</style>
