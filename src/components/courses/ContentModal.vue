<template>
  <div class="modal-container">
    <base-modal :modal-id="modalId" title="افزودن محتوا به درس" modal-size="modal-lg">
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
      type: String,
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
      }
    }
  },
  methods: {
    async saveTextContent() {
      if (!this.lessonId) {
        this.showErrorToast('شناسه درس نامعتبر است.');
        return;
      }

      this.startSubmitting();

      try {
        const contentData = {
          content: this.contentData.text
        };

        const response = await axios.put(`/lessons/${this.lessonId}/content`, contentData);

        this.finishSubmitting('محتوای متنی با موفقیت ذخیره شد.');

        // انتشار رویداد برای اطلاع دادن به کامپوننت والد
        this.$emit('content-saved', response.data);

        // بستن مودال
        this.$parent.hide();
      } catch (error) {
        console.error('Error saving text content:', error);
        this.finishSubmitting(null, 'مشکلی در ذخیره محتوای متنی رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    handleFileSelect(event) {
      if (event.target.files.length > 0) {
        this.contentData.file = event.target.files[0];
        if (!this.contentData.fileName) {
          this.contentData.fileName = this.contentData.file.name;
        }
      }
    },

    async uploadFile() {
      if (!this.lessonId || !this.contentData.file) {
        this.showErrorToast('لطفاً فایل را انتخاب کنید.');
        return;
      }

      this.startSubmitting();

      try {
        // ایجاد FormData برای آپلود فایل
        const formData = new FormData();
        formData.append('file', this.contentData.file);
        formData.append('name', this.contentData.fileName);
        formData.append('lessonId', this.lessonId);

        const response = await axios.post('/attachments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        this.finishSubmitting('فایل با موفقیت آپلود شد.');

        // بازیابی اطلاعات به‌روز شده درس
        const lessonResponse = await axios.get(`/lessons/${this.lessonId}`);

        // انتشار رویداد برای اطلاع دادن به کامپوننت والد
        this.$emit('content-saved', lessonResponse.data);

        // بستن مودال
        this.$parent.hide();
      } catch (error) {
        console.error('Error uploading file:', error);
        this.finishSubmitting(null, 'مشکلی در آپلود فایل رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    handleVideoSelect(event) {
      if (event.target.files.length > 0) {
        this.contentData.video = event.target.files[0];
        if (!this.contentData.videoTitle) {
          this.contentData.videoTitle = this.contentData.video.name.split('.')[0];
        }
      }
    },

    async uploadVideo() {
      if (!this.lessonId || !this.contentData.video) {
        this.showErrorToast('لطفاً ویدیو را انتخاب کنید.');
        return;
      }

      this.startSubmitting();

      try {
        // ایجاد FormData برای آپلود ویدیو
        const formData = new FormData();
        formData.append('video', this.contentData.video);
        formData.append('title', this.contentData.videoTitle);
        formData.append('lessonId', this.lessonId);

        const response = await axios.post('/videos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        this.finishSubmitting('ویدیو با موفقیت آپلود شد.');

        // بازیابی اطلاعات به‌روز شده درس
        const lessonResponse = await axios.get(`/lessons/${this.lessonId}`);

        // انتشار رویداد برای اطلاع دادن به کامپوننت والد
        this.$emit('content-saved', lessonResponse.data);

        // بستن مودال
        this.$parent.hide();
      } catch (error) {
        console.error('Error uploading video:', error);
        this.finishSubmitting(null, 'مشکلی در آپلود ویدیو رخ داد. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>