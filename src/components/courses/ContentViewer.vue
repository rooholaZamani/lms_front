<template>
  <div class="content-viewer modern-page-bg info-gradient">
    <div class="modern-container large animate-slide-up">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="modern-card text-center">
          <div class="py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p class="mt-3 text-muted">در حال بارگذاری محتوا...</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="modern-card text-center">
          <div class="py-5">
            <div class="modern-logo large danger mb-4">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4 class="text-danger mb-3">خطا در بارگذاری محتوا</h4>
            <p class="text-muted mb-4">{{ error }}</p>
            <button class="modern-btn modern-btn-primary" @click="fetchContentData">
              <i class="fas fa-refresh me-2"></i>
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>

      <!-- Content Display -->
      <div v-else-if="content" class="content-container">
        <!-- Back Button -->
        <div class="content-navigation mb-4">
          <button class="modern-btn modern-btn-secondary" @click="goBack">
            <i class="fas fa-arrow-right me-2"></i>
            بازگشت
          </button>
        </div>

        <!-- Text Content -->
        <div v-if="content.type === 'TEXT'" class="text-content modern-card">
          <div class="content-header">
            <h2 class="content-title">{{ content.title }}</h2>
          </div>
          <div class="content-body">
            <div class="text-content-area">
              <div class="content-text">{{ content.textContent }}</div>
            </div>
          </div>
        </div>

        <!-- Video Content -->
        <div v-else-if="content.type === 'VIDEO'" class="video-content modern-card">
          <div class="content-header">
            <h2 class="content-title">{{ content.title }}</h2>
            <div class="content-actions">
              <button class="modern-btn modern-btn-primary" @click="downloadContent">
                <i class="fas fa-download me-1"></i>
                دانلود ویدیو
              </button>
            </div>
          </div>
          <div class="content-body">
            <div class="video-container">
              <video
                  v-if="content.file?.id"
                  controls
                  class="video-player"
                  :poster="content.thumbnailUrl"
                  preload="metadata">
                <source :src="`/api/content/files/${content.file.id}`" type="video/mp4">
                <source :src="`/api/content/files/${content.file.id}`" type="video/webm">
                <source :src="`/api/content/files/${content.file.id}`" type="video/ogg">
                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
              </video>
              <div v-else class="video-error">
                <i class="fas fa-video text-muted"></i>
                <p>ویدیو در دسترس نیست</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PDF Content -->
        <div v-else-if="content.type === 'PDF'" class="pdf-content modern-card">
          <div class="content-header">
            <h2 class="content-title">{{ content.title }}</h2>
            <div class="content-actions">
              <button class="modern-btn modern-btn-primary" @click="downloadContent">
                <i class="fas fa-download me-1"></i>
                دانلود فایل
              </button>
            </div>
          </div>

          <!-- Debug Info (remove in production) -->
          <div v-if="$route.query.debug" class="debug-info">
            <details>
              <summary>اطلاعات دیباگ</summary>
              <pre>{{ JSON.stringify({
                fileId: content.fileId || content.file?.id,
                fileUrl: content.fileUrl,
                pdfUrl: pdfUrl,
                pdfSupported: pdfSupported,
                pdfLoading: pdfLoading,
                pdfViewerUrl: pdfViewerUrl
              }, null, 2) }}</pre>
            </details>
          </div>

          <!-- PDF Viewer Container -->
          <div class="pdf-viewer-container">
            <!-- Loading state -->
            <div v-if="pdfLoading" class="pdf-loading">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">در حال بارگذاری...</span>
              </div>
              <p class="mt-2">در حال بارگذاری فایل PDF...</p>
              <p class="text-muted small">در صورت طولانی شدن، دکمه دانلود را امتحان کنید</p>
            </div>

            <!-- PDF Iframe -->
            <iframe
                v-else-if="pdfSupported && pdfUrl"
                :src="pdfUrl"
                class="pdf-viewer"
                frameborder="0"
                @error="handlePdfError"
                @load="handlePdfLoad"
                title="PDF Viewer">
            </iframe>

            <!-- Fallback content -->
            <div v-else class="pdf-fallback">
              <div class="fallback-content">
                <div class="fallback-icon">
                  <i class="fas fa-file-pdf text-danger"></i>
                </div>
                <h5>نمایش PDF در مرورگر امکان‌پذیر نیست</h5>
                <p class="text-muted mb-4">
          <span v-if="!pdfSupported">
            مرورگر شما از نمایش PDF در صفحه پشتیبانی نمی‌کند.
          </span>
                  <span v-else>
            خطا در بارگذاری فایل PDF.
          </span>
                  <br>
                  لطفاً فایل را دانلود کنید.
                </p>
                <button class="modern-btn modern-btn-primary mb-2" @click="downloadContent">
                  <i class="fas fa-download me-1"></i>
                  دانلود فایل PDF
                </button>
                <br>
                <button class="modern-btn modern-btn-outline btn-sm" @click="initializePdfViewer">
                  <i class="fas fa-refresh me-1"></i>
                  تلاش مجدد
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Unknown Content Type -->
        <div v-else class="unknown-content modern-card">
          <div class="content-header">
            <h2 class="content-title">{{ content.title }}</h2>
            <div class="content-actions">
              <button
                  v-if="content.file?.id"
                  class="modern-btn modern-btn-primary"
                  @click="downloadContent">
                <i class="fas fa-download me-1"></i>
                دانلود فایل
              </button>
            </div>
          </div>
          <div class="content-body">
            <div class="unknown-content-area">
              <div class="unknown-content-icon">
                <i class="fas fa-file text-muted"></i>
              </div>
              <h5>نوع محتوای ناشناخته</h5>
              <p class="text-muted">
                این نوع محتوا قابل نمایش نیست. می‌توانید آن را دانلود کنید.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Content -->
      <div v-else class="no-content">
        <div class="modern-card text-center">
          <div class="py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-file-alt"></i>
            </div>
            <h4 class="text-muted mb-3">محتوایی یافت نشد</h4>
            <p class="text-muted">محتوای مورد نظر موجود نیست.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import axios from 'axios';

export default {
  name: 'ContentViewer',
  components: {
    LoadingSpinner
  },
  props: {
    contentId: {
      type: [String, Number],
      required: true
    },
    lessonId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      content: null,
      loading: true,
      error: null,
      isFullscreen: false,

      // Video specific
      currentTime: 0,
      videoDuration: 0,
      playbackSpeed: 1,
      videoLoading: true,
      videoError: false,

      // PDF specific
      currentPage: 1,
      totalPages: null,
      zoomLevel: 1,

      // Progress tracking
      showProgress: false,
      progressPercentage: 0,
      viewStartTime: null,
      totalViewTime: 0,

      pdfSupported: true,
      pdfLoading: false,
      pdfUrl: null,
      pdfBlob: null
    };
  },
  async created() {
    await this.loadContent();
    this.startProgressTracking();
    await this.fetchContentData();

  },
  beforeUnmount() {
    this.stopProgressTracking();
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  },
  methods: {
    async loadContent() {
      this.loading = true;
      this.error = null;

      try {
        // Fetch actual content from API
        const response = await axios.get(`/content/${this.contentId}`);
        this.content = response.data;

        // Mark content as viewed
        await this.markContentViewed();

      } catch (error) {
        console.error('Error loading content:', error);
        this.error = 'خطا در بارگذاری محتوا. لطفاً دوباره تلاش کنید.';
      } finally {
        this.loading = false;
      }
    },
    async fetchContentData() {
      if (!this.contentId) {
        this.error = 'شناسه محتوا مشخص نشده است';
        this.loading = false;
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        // Fetch content details
        const response = await this.$http.get(`/content/${this.contentId}`);
        this.content = response.data;

        console.log('Content loaded:', this.content);

        // Mark content as viewed for progress tracking
        await this.markContentViewed();

      } catch (error) {
        console.error('Error fetching content:', error);
        this.error = 'خطا در بارگذاری محتوا. لطفاً دوباره تلاش کنید.';

        if (this.$toast) {
          this.$toast.error('خطا در بارگذاری محتوا');
        }
      } finally {
        this.loading = false;
      }
    },
    initializePdfViewer() {
      if (this.content.type === 'PDF' && this.content.file?.id) {
        this.pdfLoading = true;
        this.pdfUrl = this.pdfViewerUrl;

        // Check if browser supports PDF viewing
        this.checkPdfSupport();
      }
    },
    checkPdfSupport() {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIE = userAgent.includes('msie') || userAgent.includes('trident');
      const isOldSafari = userAgent.includes('safari') && !userAgent.includes('chrome') &&
          parseFloat(userAgent.substring(userAgent.indexOf('version/') + 8)) < 10;

      // Disable PDF viewer for browsers with poor PDF support
      if (isIE || isOldSafari) {
        this.pdfSupported = false;
      }

      // For mobile devices, you might want to disable iframe PDF viewing
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        this.pdfSupported = false;
      }
    },
    handlePdfLoad() {
      this.pdfLoading = false;
      console.log('PDF loaded successfully');
    },

    // Handle PDF load error
    handlePdfError() {
      console.warn('PDF failed to load in iframe, showing fallback');
      this.pdfSupported = false;
      this.pdfLoading = false;
    },
    async downloadContent() {
      try {
        if (!this.content?.file?.id) {
          this.$toast?.error('فایل برای دانلود موجود نیست');
          return;
        }

        // Create download link
        const downloadUrl = `/api/content/files/${this.content.file.id}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = this.content.file.originalFilename || this.content.title;
        link.target = '_blank';

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.$toast?.success('دانلود فایل شروع شد');
      } catch (error) {
        console.error('Error downloading file:', error);
        this.$toast?.error('خطا در دانلود فایل');
      }
    },


    async markContentViewed() {
      try {
        await axios.post(`/progress/content/${this.contentId}/view`);
      } catch (error) {
        console.error('Error marking content as viewed:', error);
      }
    },

    goBack() {
      if (this.lessonId) {
        this.$router.push({
          name: 'CourseDetail',
          params: { id: this.lessonId },
          query: { tab: 'lessons' }
        });
      } else {
        this.$router.go(-1);
      }
    },

    getContentUrl(content) {
      if (content.type === 'TEXT') return null;
      if (content.fileId) {
        return `/content/files/${content.fileId}`;
      }
      // Fallback to fileUrl if available
      return content.fileUrl || content.url;
    },

    getPdfUrl() {
      return `${this.getContentUrl(this.content)}#page=${this.currentPage}&zoom=${Math.round(this.zoomLevel * 100)}`;
    },

    formatTextContent(text) {
      if (!text) return '';
      return text.replace(/\n/g, '<br>').replace(/•/g, '&bull;');
    },

    getContentTypeText(type) {
      switch (type) {
        case 'TEXT': return 'محتوای متنی';
        case 'VIDEO': return 'محتوای ویدیویی';
        case 'PDF': return 'سند PDF';
        default: return 'محتوا';
      }
    },

    getContentIcon(type) {
      switch (type) {
        case 'TEXT': return 'fas fa-align-left';
        case 'VIDEO': return 'fas fa-play-circle';
        case 'PDF': return 'fas fa-file-pdf';
        default: return 'fas fa-file';
      }
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    formatStudyTime(milliseconds) {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `${hours} ساعت و ${minutes % 60} دقیقه`;
      } else if (minutes > 0) {
        return `${minutes} دقیقه`;
      } else {
        return `${seconds} ثانیه`;
      }
    },

    // Video methods
    onVideoLoaded() {
      this.videoLoading = false;
      this.videoError = false;
      if (this.$refs.videoPlayer) {
        this.videoDuration = this.$refs.videoPlayer.duration;
      }
    },

    onVideoTimeUpdate() {
      if (this.$refs.videoPlayer) {
        this.currentTime = this.$refs.videoPlayer.currentTime;
        this.updateProgress();
      }
    },

    onVideoEnded() {
      this.progressPercentage = 100;
      this.showProgress = true;
      setTimeout(() => this.showProgress = false, 3000);
    },

    retryVideo() {
      const video = this.$refs.videoPlayer;
      if (video) {
        this.videoLoading = true;
        this.videoError = false;
        video.load();
      }
    },

    changePlaybackSpeed() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.playbackRate = parseFloat(this.playbackSpeed);
      }
    },

    toggleVideoFullscreen() {
      const video = this.$refs.videoPlayer;
      if (video) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        }
      }
    },

    // PDF methods
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updateProgress();
      }
    },

    nextPage() {
      if (!this.totalPages || this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updateProgress();
      }
    },




    // Fullscreen methods
    toggleFullscreen() {
      if (this.isFullscreen) {
        this.exitFullscreen();
      } else {
        this.enterFullscreen();
      }
    },

    enterFullscreen() {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      this.isFullscreen = true;
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.isFullscreen = false;
    },

    // Progress tracking
    startProgressTracking() {
      this.viewStartTime = Date.now();
      // شروع ردیابی پیشرفت
      this.progressInterval = setInterval(() => {
        this.updateProgress();
      }, 5000); // هر 5 ثانیه
    },

    stopProgressTracking() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      if (this.viewStartTime) {
        this.totalViewTime += Date.now() - this.viewStartTime;
      }
    },

    updateProgress() {
      if (this.content?.type === 'VIDEO' && this.videoDuration > 0) {
        this.progressPercentage = (this.currentTime / this.videoDuration) * 100;
      } else if (this.content?.type === 'PDF' && this.totalPages > 0) {
        this.progressPercentage = (this.currentPage / this.totalPages) * 100;
      } else if (this.content?.type === 'TEXT') {
        // برای متن، بر اساس زمان صرف شده
        const timeSpent = this.totalViewTime + (Date.now() - this.viewStartTime);
        const estimatedReadTime = (this.content.textContent?.length || 1000) / 200 * 1000; // 200 کاراکتر در ثانیه
        this.progressPercentage = Math.min((timeSpent / estimatedReadTime) * 100, 100);
      }
    },

    async markContentComplete() {
      try {
        await axios.post(`/progress/content/${this.contentId}/complete`);
        this.$toast?.success('محتوا به عنوان تکمیل شده علامت‌گذاری شد.');
      } catch (error) {
        console.error('Error marking content complete:', error);
        this.$toast?.error('خطا در علامت‌گذاری محتوا');
      }
    },

  },
  computed: {

    pdfViewerUrl() {
      console.log("pdfViewerUrl() {")
      if (this.content?.fileId) {
        console.log(" if (this.content?.fileId)");
        return `/api/content/files/${this.content.fileId}`;
      } else if (this.content?.file?.id) {
        console.log("else if (this.content?.file?.id) {");
        return `/api/content/files/${this.content.file.id}`;
      }
      return null;
    }
  },
  async mounted() {
    try {
      if (!this.content) {
        await this.fetchContentData();
      }

      // Initialize PDF viewer if content is PDF
      if (this.content?.type === 'PDF') {
        this.initializePdfViewer();
      }
    } catch (error) {
      console.error('Error in mounted:', error);
    }
  }
};
</script>

<style scoped>
.content-viewer {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.loading-container,
.error-container,
.no-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.content-container {
  max-width: 100%;
}

.content-navigation {
  display: flex;
  justify-content: flex-start;
}

/* Content Header Styles */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px 12px 0 0;
}

.content-title {
  color: #333;
  font-weight: 600;
  margin: 0;
  flex: 1;
  font-size: 1.5rem;
}

.content-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.content-body {
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

/* Text Content Styles */
.text-content {
  background: white;
}

.text-content-area {
  padding: 2rem;
}

.content-text {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: none;
}

/* Video Content Styles */
.video-content {
  background: white;
}

.video-container {
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.video-player {
  width: 100%;
  height: auto;
  max-height: 70vh;
  min-height: 400px;
  background: #000;
}

.video-error {
  text-align: center;
  color: #6c757d;
  padding: 2rem;
}

.video-error i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* PDF Content Styles */
.pdf-content {
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: calc(100vh - 200px);
  background: white;
}

.pdf-viewer-container {
  flex: 1;
  position: relative;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  min-height: 600px;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
  background: white;
}

.pdf-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.fallback-content {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 2rem;
}

.fallback-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.fallback-content h5 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
}

.fallback-content .text-muted {
  line-height: 1.6;
  font-size: 0.95rem;
}

.pdf-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.pdf-loading .spinner-border {
  width: 3rem;
  height: 3rem;
}

.pdf-loading p {
  margin: 0;
  color: #6c757d;
  font-weight: 500;
}

/* Unknown Content Styles */
.unknown-content {
  background: white;
}

.unknown-content-area {
  padding: 3rem 2rem;
  text-align: center;
}

.unknown-content-icon {
  font-size: 4rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.unknown-content-area h5 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
}

.unknown-content-area .text-muted {
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Error and Loading States */
.loading-container .spinner-border,
.error-container .modern-logo {
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-viewer {
    padding: 1rem 0.5rem;
  }

  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }

  .content-title {
    font-size: 1.25rem;
    text-align: center;
  }

  .content-actions {
    justify-content: center;
  }

  .text-content-area {
    padding: 1.5rem;
  }

  .content-text {
    font-size: 1rem;
    line-height: 1.7;
  }

  .video-player {
    min-height: 250px;
  }

  .pdf-viewer {
    min-height: 400px;
  }

  .pdf-viewer-container {
    min-height: 400px;
  }

  .fallback-content {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }

  .fallback-icon {
    font-size: 3rem;
  }

  .unknown-content-area {
    padding: 2rem 1.5rem;
  }

  .unknown-content-icon {
    font-size: 3rem;
  }
}

@media (max-width: 576px) {
  .content-title {
    font-size: 1.1rem;
  }

  .text-content-area {
    padding: 1rem;
  }

  .content-text {
    font-size: 0.95rem;
  }

  .video-player {
    min-height: 200px;
  }

  .pdf-viewer {
    min-height: 300px;
  }

  .pdf-viewer-container {
    min-height: 300px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .content-header {
    background: rgba(45, 55, 72, 0.9);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .content-title {
    color: #e2e8f0;
  }

  .text-content,
  .video-content,
  .pdf-content,
  .unknown-content {
    background: #2d3748;
  }

  .text-content-area {
    background: #2d3748;
  }

  .content-text {
    color: #e2e8f0;
  }

  .pdf-viewer-container {
    background: #2d3748;
  }

  .fallback-content {
    background: #2d3748;
    color: #e2e8f0;
  }

  .fallback-content h5 {
    color: #e2e8f0;
  }

  .pdf-loading {
    background: rgba(45, 55, 72, 0.95);
    color: #e2e8f0;
  }

  .unknown-content-area {
    background: #2d3748;
  }

  .unknown-content-area h5 {
    color: #e2e8f0;
  }
}

/* Print Styles */
@media print {
  .content-navigation,
  .content-actions {
    display: none;
  }

  .content-viewer {
    background: white;
    padding: 0;
  }

  .modern-card {
    box-shadow: none;
    border: 1px solid #ccc;
  }

  .content-text {
    color: black;
  }
}

/* Animation Classes */
.animate-slide-up {
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus and Accessibility */
.modern-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.video-player:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .content-header {
    border-bottom: 2px solid #000;
  }

  .content-title {
    color: #000;
  }

  .content-text {
    color: #000;
    font-weight: 500;
  }

  .fallback-content,
  .unknown-content-area {
    border: 2px solid #000;
  }
}
</style>