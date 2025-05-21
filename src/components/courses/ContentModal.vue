<template>
  <div class="modal-container">
    <base-modal :modal-id="modalId" title="افزودن محتوا به درس" modal-size="modal-lg" ref="baseModal">
      <ul class="nav nav-tabs mb-3" id="contentTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="text-tab" data-bs-toggle="tab" data-bs-target="#text"
                  type="button" role="tab" aria-controls="text" aria-selected="true">
            متن
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="file-tab" data-bs-toggle="tab" data-bs-target="#file"
                  type="button" role="tab" aria-controls="file" aria-selected="false">
            فایل
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="video-tab" data-bs-toggle="tab" data-bs-target="#video"
                  type="button" role="tab" aria-controls="video" aria-selected="false">
            ویدیو
          </button>
        </li>
      </ul>
      <div class="tab-content" id="contentTabContent">
        <!-- Tab: متن -->
        <div class="tab-pane fade show active" id="text" role="tabpanel" aria-labelledby="text-tab">
          <form @submit.prevent="saveTextContent">
            <div class="mb-3">
              <label for="textContent" class="form-label">محتوای متنی</label>
              <textarea class="form-control rich-editor" id="textContent"
                        v-model="contentData.text" rows="10" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ذخیره محتوای متنی
            </button>
          </form>
        </div>

        <!-- Tab: فایل -->
        <div class="tab-pane fade" id="file" role="tabpanel" aria-labelledby="file-tab">
          <form @submit.prevent="uploadFile">
            <div class="mb-3">
              <label for="fileUpload" class="form-label">آپلود فایل</label>
              <input type="file" class="form-control" id="fileUpload" @change="handleFileSelect">
              <small class="form-text text-muted">فرمت‌های مجاز: PDF, DOCX, PPT, ZIP (حداکثر 10MB)</small>
            </div>
            <div class="mb-3">
              <label for="fileName" class="form-label">نام نمایشی فایل</label>
              <input type="text" class="form-control" id="fileName" v-model="contentData.fileName" required>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !contentData.file">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              آپلود فایل
            </button>
          </form>
        </div>

        <!-- Tab: ویدیو -->
        <div class="tab-pane fade" id="video" role="tabpanel" aria-labelledby="video-tab">
          <form @submit.prevent="uploadVideo">
            <div class="mb-3">
              <label for="videoUpload" class="form-label">آپلود ویدیو</label>
              <input type="file" class="form-control" id="videoUpload" @change="handleVideoSelect" accept="video/mp4,video/webm">
              <small class="form-text text-muted">فرمت‌های مجاز: MP4, WEBM (حداکثر 100MB)</small>
            </div>
            <div class="mb-3">
              <label for="videoTitle" class="form-label">عنوان ویدیو</label>
              <input type="text" class="form-control" id="videoTitle" v-model="contentData.videoTitle" required>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !contentData.video">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              آپلود ویدیو
            </button>
          </form>
        </div>
      </div>
    </base-modal>
  </div>
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
      default: null
    }
  },
  data() {
    return {
      contentData: {
        text: '',
        file: null,
        fileName: '',
        video: null,
        videoTitle: ''
      },
      progressMap: {
        file: 0,
        video: 0
      }
    }
  },
  methods: {
    // متدهای عمومی
    reset() {
      this.contentData = {
        text: '',
        file: null,
        fileName: '',
        video: null,
        videoTitle: ''
      };
      this.progressMap = {
        file: 0,
        video: 0
      };
    },

    show() {
      if (this.$refs.baseModal && typeof this.$refs.baseModal.show === 'function') {
        this.$refs.baseModal.show();
      } else {
        console.error('متد show در BaseModal یافت نشد');
        this.showWithBootstrap();
      }
    },

    hide() {
      if (this.$refs.baseModal && typeof this.$refs.baseModal.hide === 'function') {
        this.$refs.baseModal.hide();
      } else {
        console.error('متد hide در BaseModal یافت نشد');
        this.hideWithBootstrap();
      }
    },

    showWithBootstrap() {
      const modalEl = document.getElementById(this.modalId);
      if (modalEl) {
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
      } else {
        console.error(`مودال با ID ${this.modalId} یافت نشد`);
      }
    },

    hideWithBootstrap() {
      const modalEl = document.getElementById(this.modalId);
      if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) {
          bsModal.hide();
        } else {
          console.error(`نمونه Bootstrap Modal برای ID ${this.modalId} یافت نشد`);
        }
      } else {
        console.error(`مودال با ID ${this.modalId} یافت نشد`);
      }
    },

    // متدهای مربوط به تب متن
    async saveTextContent() {
      if (!this.lessonId) {
        this.showErrorToast('شناسه درس نامعتبر است.');
        return;
      }

      this.startSubmitting();

      try {
        console.log('در حال ذخیره محتوای متنی برای درس:', this.lessonId);

        const contentData = {
          content: this.contentData.text
        };

        const response = await axios.put(`/lessons/${this.lessonId}/content`, contentData);
        console.log('پاسخ ذخیره محتوای متنی:', response.data);

        this.finishSubmitting('محتوای متنی با موفقیت ذخیره شد.');

        // انتشار رویداد برای اطلاع دادن به کامپوننت والد
        this.$emit('content-saved', response.data);

        // بستن مودال
        this.hide();
      } catch (error) {
        console.error('Error saving text content:', error);
        this.finishSubmitting(null, 'مشکلی در ذخیره محتوای متنی رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    // متدهای مربوط به تب فایل
    handleFileSelect(event) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];

        // بررسی اندازه فایل (حداکثر 10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.showErrorToast('حجم فایل نباید بیشتر از 10 مگابایت باشد.');
          event.target.value = ''; // پاک کردن فایل انتخاب شده
          return;
        }

        this.contentData.file = file;
        if (!this.contentData.fileName) {
          this.contentData.fileName = this.contentData.file.name;
        }

        console.log('فایل انتخاب شده:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    },

    async uploadFile() {
      if (!this.lessonId || !this.contentData.file) {
        this.showErrorToast('لطفاً فایل را انتخاب کنید.');
        return;
      }

      this.startSubmitting();

      try {
        console.log('در حال آپلود فایل برای درس:', this.lessonId);

        // ایجاد FormData برای آپلود فایل (فقط شامل فایل)
        const formData = new FormData();
        formData.append('file', this.contentData.file);

        // ایجاد پارامترهای URL به صورت query string
        const params = new URLSearchParams();
        params.append('lessonId', this.lessonId);
        params.append('title', this.contentData.fileName);
        params.append('contentType', 'PDF');
        params.append('orderIndex', '1');

        // URL کامل با پارامترها
        const url = `/content/upload?${params.toString()}`;

        console.log('URL آپلود فایل:', url);

        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            this.progressMap.file = percentCompleted;
            console.log(`پیشرفت آپلود فایل: ${percentCompleted}%`);
          }
        });

        console.log('پاسخ آپلود فایل:', response.data);
        this.finishSubmitting('فایل با موفقیت آپلود شد.');

        // بازیابی اطلاعات به‌روز شده درس
        try {
          console.log('دریافت اطلاعات به‌روز شده درس');
          const lessonResponse = await axios.get(`/lessons/${this.lessonId}`);
          console.log('اطلاعات به‌روز شده درس:', lessonResponse.data);

          // انتشار رویداد برای اطلاع دادن به کامپوننت والد
          this.$emit('content-saved', lessonResponse.data);
        } catch (lessonError) {
          console.error('خطا در دریافت اطلاعات به‌روز شده درس:', lessonError);
          // حتی در صورت خطا در دریافت اطلاعات به‌روز شده، پیام موفقیت آپلود فایل را نمایش می‌دهیم
          this.$emit('content-saved', { id: this.lessonId });
        }

        // بستن مودال
        this.hide();
      } catch (error) {
        console.error('Error uploading file:', error);
        const errorMessage = error.response?.data?.message || 'مشکلی در آپلود فایل رخ داد. لطفاً دوباره تلاش کنید.';
        this.finishSubmitting(null, errorMessage);
      }
    },

    // متدهای مربوط به تب ویدیو
    handleVideoSelect(event) {
      if (event.target.files.length > 0) {
        const video = event.target.files[0];

        // بررسی اندازه ویدیو (حداکثر 100MB)
        if (video.size > 100 * 1024 * 1024) {
          this.showErrorToast('حجم ویدیو نباید بیشتر از 100 مگابایت باشد.');
          event.target.value = ''; // پاک کردن فایل انتخاب شده
          return;
        }

        // بررسی نوع فایل
        if (!['video/mp4', 'video/webm'].includes(video.type)) {
          this.showErrorToast('فرمت ویدیو باید MP4 یا WEBM باشد.');
          event.target.value = ''; // پاک کردن فایل انتخاب شده
          return;
        }

        this.contentData.video = video;
        if (!this.contentData.videoTitle) {
          this.contentData.videoTitle = video.name.split('.')[0];
        }

        console.log('ویدیو انتخاب شده:', {
          name: video.name,
          size: video.size,
          type: video.type
        });
      }
    },

    async uploadVideo() {
      if (!this.lessonId || !this.contentData.video) {
        this.showErrorToast('لطفاً ویدیو را انتخاب کنید.');
        return;
      }

      this.startSubmitting();

      try {
        console.log('در حال آپلود ویدیو برای درس:', this.lessonId);

        // ایجاد FormData برای آپلود ویدیو (فقط شامل فایل)
        const formData = new FormData();
        formData.append('file', this.contentData.video);

        // ایجاد پارامترهای URL به صورت query string
        const params = new URLSearchParams();
        params.append('lessonId', this.lessonId);
        params.append('title', this.contentData.videoTitle);
        params.append('contentType', 'VIDEO');
        params.append('orderIndex', '1');

        // URL کامل با پارامترها
        const url = `/content/upload?${params.toString()}`;

        console.log('URL آپلود ویدیو:', url);

        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            this.progressMap.video = percentCompleted;
            console.log(`پیشرفت آپلود ویدیو: ${percentCompleted}%`);
          }
        });

        console.log('پاسخ آپلود ویدیو:', response.data);
        this.finishSubmitting('ویدیو با موفقیت آپلود شد.');

        // بازیابی اطلاعات به‌روز شده درس
        try {
          console.log('دریافت اطلاعات به‌روز شده درس');
          const lessonResponse = await axios.get(`/lessons/${this.lessonId}`);
          console.log('اطلاعات به‌روز شده درس:', lessonResponse.data);

          // انتشار رویداد برای اطلاع دادن به کامپوننت والد
          this.$emit('content-saved', lessonResponse.data);
        } catch (lessonError) {
          console.error('خطا در دریافت اطلاعات به‌روز شده درس:', lessonError);
          // حتی در صورت خطا در دریافت اطلاعات به‌روز شده، پیام موفقیت آپلود ویدیو را نمایش می‌دهیم
          this.$emit('content-saved', { id: this.lessonId });
        }

        // بستن مودال
        this.hide();
      } catch (error) {
        console.error('Error uploading video:', error);
        const errorMessage = error.response?.data?.message || 'مشکلی در آپلود ویدیو رخ داد. لطفاً دوباره تلاش کنید.';
        this.finishSubmitting(null, errorMessage);
      }
    }
  },
  watch: {
    // وقتی lessonId تغییر می‌کند، فرم را ریست می‌کنیم
    lessonId() {
      this.reset();
    }
  },
  mounted() {
    console.log('ContentModal mounted - lessonId:', this.lessonId);
  }
}
</script>

<style scoped>
.progress {
  margin-top: 10px;
  height: 5px;
  border-radius: 3px;
  margin-bottom: 10px;
}

.rich-editor {
  min-height: 200px;
}
</style>