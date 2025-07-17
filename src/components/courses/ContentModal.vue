<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content modern-card">
        <div class="modal-header modern-header">
          <div class="modern-logo success">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h5 class="modern-title">افزودن محتوا به درس</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div v-if="error" class="modern-alert modern-alert-danger">
            <i class="fas fa-exclamation-circle me-2"></i>
            {{ error }}
          </div>

          <form @submit.prevent="saveContent">
            <!-- Content Type Selection -->
            <div class="form-section">
              <h6 class="section-title">
                <i class="fas fa-layer-group me-2"></i>
                نوع محتوا
              </h6>

              <div class="content-type-selection">
                <div class="content-type-option" :class="{ active: contentForm.type === 'TEXT' }">
                  <input type="radio" class="btn-check" name="contentType" id="text" value="TEXT" v-model="contentForm.type">
                  <label class="content-type-label" for="text">
                    <i class="fas fa-font"></i>
                    <span>متن</span>
                    <small>محتوای متنی</small>
                  </label>
                </div>

                <div class="content-type-option" :class="{ active: contentForm.type === 'VIDEO' }">
                  <input type="radio" class="btn-check" name="contentType" id="video" value="VIDEO" v-model="contentForm.type">
                  <label class="content-type-label" for="video">
                    <i class="fas fa-video"></i>
                    <span>ویدیو</span>
                    <small>فایل ویدیویی</small>
                  </label>
                </div>

                <div class="content-type-option" :class="{ active: contentForm.type === 'PDF' }">
                  <input type="radio" class="btn-check" name="contentType" id="pdf" value="PDF" v-model="contentForm.type">
                  <label class="content-type-label" for="pdf">
                    <i class="fas fa-file-pdf"></i>
                    <span>فایل PDF</span>
                    <small>سند PDF</small>
                  </label>
                </div>
              </div>
            </div>

            <!-- Text Content Form -->
            <div v-if="contentForm.type === 'TEXT'" class="form-section">
              <h6 class="section-title">
                <i class="fas fa-edit me-2"></i>
                محتوای متنی
              </h6>

              <div class="modern-form-group">
                <label for="textTitle" class="modern-form-label">عنوان محتوا <span class="text-danger">*</span></label>
                <input type="text" class="modern-form-control" id="textTitle" v-model="contentForm.title" required>
              </div>

              <div class="modern-form-group">
                <label for="textContent" class="modern-form-label">محتوای متنی <span class="text-danger">*</span></label>
                <textarea class="modern-form-control" id="textContent" v-model="contentForm.textContent" rows="6" required></textarea>
              </div>

              <div class="modern-form-group">
                <label for="textOrder" class="modern-form-label">ترتیب نمایش</label>
                <input type="number" class="modern-form-control" id="textOrder" v-model="contentForm.orderIndex" min="0">
              </div>
            </div>

            <!-- File Upload Form (Video/PDF) -->
            <div v-else-if="contentForm.type === 'VIDEO' || contentForm.type === 'PDF'" class="form-section">
              <h6 class="section-title">
                <i class="fas fa-upload me-2"></i>
                بارگذاری فایل
              </h6>

              <div class="modern-form-group">
                <label for="fileTitle" class="modern-form-label">عنوان محتوا <span class="text-danger">*</span></label>
                <input type="text" class="modern-form-control" id="fileTitle" v-model="contentForm.title" required>
              </div>

              <div class="modern-form-group">
                <label for="contentFile" class="modern-form-label">
                  انتخاب فایل <span class="text-danger">*</span>
                </label>
                <div class="file-upload-container">
                  <input
                      type="file"
                      class="modern-form-control"
                      id="contentFile"
                      :accept="contentForm.type === 'VIDEO' ? 'video/*' : 'application/pdf'"
                      @change="handleFileSelect"
                      required
                  >
                  <small class="form-text text-muted">
                    {{ contentForm.type === 'VIDEO' ? 'فرمت‌های پشتیبانی شده: MP4, AVI, MOV' : 'فرمت PDF' }}
                    - حداکثر 100 مگابایت
                  </small>
                </div>
              </div>

              <div class="modern-form-group">
                <label for="fileOrder" class="modern-form-label">ترتیب نمایش</label>
                <input type="number" class="modern-form-control" id="fileOrder" v-model="contentForm.orderIndex" min="0">
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex justify-content-between mt-4">
              <button type="button" class="modern-btn modern-btn-secondary" @click="closeModal">
                <i class="fas fa-times me-1"></i>
                انصراف
              </button>
              <button type="submit" class="modern-btn modern-btn-success" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="fas fa-save me-1"></i>
                ذخیره محتوا
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'ContentModal',
  mixins: [formMixin],
  props: {
    modalId: {
      type: String,
      default: 'contentModal'
    },
    lessonId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      contentForm: {
        type: 'TEXT',
        title: '',
        textContent: '',
        orderIndex: 0,
        file: null
      }
    };
  },
  methods: {
    handleFileSelect(event) {
      if (event.target.files.length > 0) {
        this.contentForm.file = event.target.files[0];
      }
    },

    async saveContent() {
      if (!this.validateForm()) {
        return;
      }

      this.startSubmitting();

      try {
        let response;

        if (this.contentForm.type === 'TEXT') {
          const params = new URLSearchParams({
            lessonId: this.lessonId.toString(),
            title: this.contentForm.title,
            textContent: this.contentForm.textContent,
            orderIndex: this.contentForm.orderIndex.toString()
          });

          response = await axios.post(`/content/text?${params}`, {}, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          const formData = new FormData();
          formData.append('file', this.contentForm.file);
          formData.append('lessonId', this.lessonId.toString());
          formData.append('title', this.contentForm.title);
          formData.append('contentType', this.contentForm.type);
          formData.append('orderIndex', this.contentForm.orderIndex.toString());

          response = await axios.post('/content/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }

        this.finishSubmitting('محتوا با موفقیت اضافه شد.');
        this.$emit('content-saved', response.data);
        this.closeModal();
      } catch (error) {
        console.error('Error saving content:', error);

        let errorMessage = 'مشکلی در ذخیره محتوا رخ داد.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 413) {
          errorMessage = 'حجم فایل بیش از حد مجاز است.';
        } else if (error.response?.status === 415) {
          errorMessage = 'فرمت فایل پشتیبانی نمی‌شود.';
        }

        this.finishSubmitting(null, errorMessage);
      }
    },

    validateForm() {
      if (!this.contentForm.title.trim()) {
        this.error = 'لطفاً عنوان محتوا را وارد کنید.';
        return false;
      }

      if (this.contentForm.type === 'TEXT') {
        if (!this.contentForm.textContent.trim()) {
          this.error = 'لطفاً محتوای متنی را وارد کنید.';
          return false;
        }
      } else {
        if (!this.contentForm.file) {
          this.error = 'لطفاً فایل مورد نظر را انتخاب کنید.';
          return false;
        }

        const maxSize = 1000 * 1024 * 1024; // 100MB
        if (this.contentForm.file.size > maxSize) {
          this.error = 'حجم فایل نباید بیش از یک گیگ باشد.';
          return false;
        }

        if (this.contentForm.type === 'VIDEO') {
          const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
          if (!allowedTypes.includes(this.contentForm.file.type)) {
            this.error = 'لطفاً فایل ویدیویی معتبر انتخاب کنید.';
            return false;
          }
        } else if (this.contentForm.type === 'PDF') {
          if (this.contentForm.file.type !== 'application/pdf') {
            this.error = 'لطفاً فایل PDF معتبر انتخاب کنید.';
            return false;
          }
        }
      }

      this.error = null;
      return true;
    },

    closeModal() {
      this.contentForm = {
        type: 'TEXT',
        title: '',
        textContent: '',
        orderIndex: 0,
        file: null
      };
      this.error = null;
      this.success = null;

      const modal = bootstrap.Modal.getInstance(document.getElementById(this.modalId));
      if (modal) {
        modal.hide();
      }
    },

    show() {
      const modal = new bootstrap.Modal(document.getElementById(this.modalId));
      modal.show();
    },

    hide() {
      this.closeModal();
    }
  }
};
</script>

<style scoped>
/* Modal styling */
.modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  border-bottom: none;
  border-radius: 16px 16px 0 0;
  padding: 1.5rem;
  text-align: center;
}

.modal-header .modern-title {
  color: white;
  margin: 0.5rem 0 0 0;
}

.modal-header .btn-close {
  position: absolute;
  top: 1rem;
  left: 1rem;
  filter: invert(1);
}

.modal-body {
  padding: 2rem;
}

/* Content type selection */
.content-type-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.content-type-option {
  position: relative;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.content-type-option:hover {
  border-color: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
}

.content-type-option.active {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.content-type-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.content-type-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  margin: 0;
}

.content-type-label i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #27ae60;
}

.content-type-label span {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.content-type-label small {
  color: #6c757d;
  font-size: 0.75rem;
}

/* Form sections */
.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(39, 174, 96, 0.2);
}

/* File upload styling */
.file-upload-container {
  position: relative;
}

.form-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* Button styling */
.modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .content-type-selection {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .content-type-label i {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 0.5rem;
  }

  .d-flex.justify-content-between .modern-btn {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .content-type-option {
    background: rgba(45, 55, 72, 0.8);
    border-color: #4a5568;
  }

  .content-type-option.active {
    background: rgba(39, 174, 96, 0.2);
    border-color: #27ae60;
  }

  .content-type-label span {
    color: #e2e8f0;
  }

  .content-type-label small {
    color: #cbd5e0;
  }

  .form-section {
    background: rgba(45, 55, 72, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: #e2e8f0;
    border-bottom-color: rgba(39, 174, 96, 0.3);
  }
}
</style>