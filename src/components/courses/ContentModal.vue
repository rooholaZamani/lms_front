<template>
  <base-modal
      :modal-id="modalId"
      title="افزودن محتوا به درس"
      modal-size="modal-lg"
      ref="baseModal"
  >
    <div class="content-form">
      <!-- Content Type Selection -->
      <div class="mb-4">
        <label class="form-label">نوع محتوا</label>
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" name="contentType" id="text" value="TEXT" v-model="contentForm.type">
          <label class="btn btn-outline-primary" for="text">
            <i class="fas fa-font me-2"></i> متن
          </label>

          <input type="radio" class="btn-check" name="contentType" id="video" value="VIDEO" v-model="contentForm.type">
          <label class="btn btn-outline-primary" for="video">
            <i class="fas fa-video me-2"></i> ویدیو
          </label>

          <input type="radio" class="btn-check" name="contentType" id="pdf" value="PDF" v-model="contentForm.type">
          <label class="btn btn-outline-primary" for="pdf">
            <i class="fas fa-file-pdf me-2"></i> فایل PDF
          </label>
        </div>
      </div>

      <!-- Text Content Form -->
      <div v-if="contentForm.type === 'TEXT'">
        <div class="mb-3">
          <label for="textTitle" class="form-label">عنوان محتوا <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="textTitle" v-model="contentForm.title" required>
        </div>

        <div class="mb-3">
          <label for="textContent" class="form-label">محتوای متنی <span class="text-danger">*</span></label>
          <textarea class="form-control" id="textContent" v-model="contentForm.textContent" rows="8" required></textarea>
        </div>

        <div class="mb-3">
          <label for="textOrder" class="form-label">ترتیب نمایش</label>
          <input type="number" class="form-control" id="textOrder" v-model="contentForm.orderIndex" min="0">
        </div>
      </div>

      <!-- File Upload Form (Video/PDF) -->
      <div v-else-if="contentForm.type === 'VIDEO' || contentForm.type === 'PDF'">
        <div class="mb-3">
          <label for="fileTitle" class="form-label">عنوان محتوا <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="fileTitle" v-model="contentForm.title" required>
        </div>

        <div class="mb-3">
          <label for="contentFile" class="form-label">
            انتخاب فایل
            <span class="text-danger">*</span>
            <small class="text-muted">
              ({{ contentForm.type === 'VIDEO' ? 'فرمت‌های پشتیبانی شده: MP4, AVI, MOV' : 'فرمت PDF' }})
            </small>
          </label>
          <input type="file" class="form-control" id="contentFile"
                 :accept="contentForm.type === 'VIDEO' ? 'video/*' : 'application/pdf'"
                 @change="handleFileSelect" required>
        </div>

        <div class="mb-3">
          <label for="fileOrder" class="form-label">ترتیب نمایش</label>
          <input type="number" class="form-control" id="fileOrder" v-model="contentForm.orderIndex" min="0">
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="closeModal">انصراف</button>
        <button type="button" class="btn btn-primary" @click="saveContent" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
          ذخیره محتوا
        </button>
      </div>
    </div>
  </base-modal>
</template>

<script>
import axios from 'axios';
import BaseModal from '@/components/common/BaseModal.vue';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'ContentModal',
  components: {
    BaseModal
  },
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
      },
      isSubmitting: false
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

      this.isSubmitting = true;

      try {
        let response;

        if (this.contentForm.type === 'TEXT') {
          // ارسال محتوای متنی با استفاده از query parameters
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
          // ارسال فایل (ویدیو یا PDF) با استفاده از FormData
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

        this.showSuccessToast('محتوا با موفقیت اضافه شد.');
        this.$emit('content-saved', response.data);
        this.closeModal();
      } catch (error) {
        console.error('Error saving content:', error);

        // نمایش پیام خطای مناسب
        let errorMessage = 'مشکلی در ذخیره محتوا رخ داد.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 413) {
          errorMessage = 'حجم فایل بیش از حد مجاز است.';
        } else if (error.response?.status === 415) {
          errorMessage = 'فرمت فایل پشتیبانی نمی‌شود.';
        }

        this.showErrorToast(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },

    validateForm() {
      if (!this.contentForm.title.trim()) {
        this.showErrorToast('لطفاً عنوان محتوا را وارد کنید.');
        return false;
      }

      if (this.contentForm.type === 'TEXT') {
        if (!this.contentForm.textContent.trim()) {
          this.showErrorToast('لطفاً محتوای متنی را وارد کنید.');
          return false;
        }
      } else {
        if (!this.contentForm.file) {
          this.showErrorToast('لطفاً فایل مورد نظر را انتخاب کنید.');
          return false;
        }

        // بررسی حجم فایل (حداکثر 100 مگابایت)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (this.contentForm.file.size > maxSize) {
          this.showErrorToast('حجم فایل نباید بیش از 100 مگابایت باشد.');
          return false;
        }

        // بررسی نوع فایل
        if (this.contentForm.type === 'VIDEO') {
          const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
          if (!allowedTypes.includes(this.contentForm.file.type)) {
            this.showErrorToast('لطفاً فایل ویدیویی معتبر انتخاب کنید.');
            return false;
          }
        } else if (this.contentForm.type === 'PDF') {
          if (this.contentForm.file.type !== 'application/pdf') {
            this.showErrorToast('لطفاً فایل PDF معتبر انتخاب کنید.');
            return false;
          }
        }
      }

      return true;
    },

    closeModal() {
      // ری‌ست کردن فرم
      this.contentForm = {
        type: 'TEXT',
        title: '',
        textContent: '',
        orderIndex: 0,
        file: null
      };

      // بستن مودال
      this.$refs.baseModal.hide();
    },

    show() {
      this.$refs.baseModal.show();
    },

    hide() {
      this.$refs.baseModal.hide();
    }
  }
};
</script>

<style scoped>
.content-form {
  padding: 1rem;
}

.btn-group .btn-check:checked + .btn {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.form-label {
  font-weight: 600;
}

.text-muted {
  font-size: 0.875em;
}
</style>