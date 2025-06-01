<template>
  <div class="modern-page-bg info-gradient">
    <div class="modern-container large animate-slide-up">
      <!-- Header -->
      <div class="modern-header">
        <div class="modern-logo info">
          <i :class="getContentIcon(content?.type)"></i>
        </div>
        <h1 class="modern-title">{{ content?.title || 'مشاهده محتوا' }}</h1>
        <p class="modern-subtitle">{{ getContentTypeText(content?.type) }}</p>
      </div>

      <!-- Content Card -->
      <div class="modern-card animate-fade-in" style="animation-delay: 0.1s;">
        <loading-spinner :loading="loading">
          <!-- Error State -->
          <div v-if="error" class="modern-alert modern-alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            خطا در بارگذاری محتوا. لطفاً دوباره تلاش کنید.
            <button class="modern-btn modern-btn-primary mt-3" @click="loadContent">
              <i class="fas fa-redo me-2"></i>
              تلاش مجدد
            </button>
          </div>

          <!-- Content Display -->
          <div v-else-if="content" class="content-display">
            <!-- Content Header Actions -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <button class="modern-btn modern-btn-secondary" @click="goBack">
                <i class="fas fa-arrow-right me-2"></i>
                بازگشت به درس
              </button>

              <div class="content-actions">
                <button
                    v-if="content?.type !== 'TEXT'"
                    class="modern-btn modern-btn-outline me-2"
                    @click="downloadContent"
                    title="دانلود محتوا"
                >
                  <i class="fas fa-download me-1"></i>
                  دانلود
                </button>
                <button
                    class="modern-btn modern-btn-outline"
                    @click="toggleFullscreen"
                    :title="isFullscreen ? 'خروج از تمام صفحه' : 'نمایش تمام صفحه'"
                >
                  <i class="fas" :class="isFullscreen ? 'fa-compress' : 'fa-expand'" class="me-1"></i>
                  {{ isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه' }}
                </button>
              </div>
            </div>

            <!-- Text Content -->
            <div v-if="content.type === 'TEXT'" class="text-content-section">
              <div class="form-section">
                <h6 class="section-title">
                  <i class="fas fa-align-left text-info me-2"></i>
                  محتوای متنی
                </h6>
                <div class="text-content-container">
                  <div class="content-text" v-html="formatTextContent(content.textContent)"></div>
                </div>
              </div>
            </div>

            <!-- Video Content -->
            <div v-else-if="content.type === 'VIDEO'" class="video-content-section">
              <div class="form-section">
                <h6 class="section-title">
                  <i class="fas fa-play-circle text-primary me-2"></i>
                  محتوای ویدیویی
                </h6>
                <div class="video-container">
                  <div class="ratio ratio-16x9">
                    <video
                        ref="videoPlayer"
                        controls
                        class="video-player"
                        @loadedmetadata="onVideoLoaded"
                        @timeupdate="onVideoTimeUpdate"
                        @ended="onVideoEnded"
                        :poster="content.posterUrl"
                    >
                      <source :src="getContentUrl(content)" type="video/mp4">
                      <p class="video-error">
                        مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                        <br>
                        لطفاً مرورگر خود را به‌روزرسانی کنید یا از مرورگر دیگری استفاده کنید.
                      </p>
                    </video>

                    <!-- Loading overlay -->
                    <div v-if="videoLoading" class="video-loading-overlay">
                      <div class="loading-content">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 mb-0">در حال بارگذاری ویدیو...</p>
                      </div>
                    </div>

                    <!-- Error overlay -->
                    <div v-if="videoError" class="video-error-overlay">
                      <div class="error-content">
                        <i class="fas fa-exclamation-triangle text-warning mb-2"></i>
                        <h6>خطا در بارگذاری ویدیو</h6>
                        <p class="mb-3">متأسفانه نتوانستیم ویدیو را بارگذاری کنیم</p>
                        <button class="modern-btn modern-btn-primary btn-sm" @click="retryVideo">
                          <i class="fas fa-redo me-1"></i>
                          تلاش مجدد
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Video Controls -->
                  <div class="video-controls mt-3">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="video-info">
                        <small class="text-muted">
                          <i class="fas fa-clock me-1"></i>
                          مدت زمان: <span id="videoDuration">{{ formatTime(videoDuration) }}</span>
                        </small>
                        <small class="text-muted ms-3">
                          <i class="fas fa-play me-1"></i>
                          زمان فعلی: {{ formatTime(currentTime) }}
                        </small>
                      </div>
                      <div class="playback-controls">
                        <label class="modern-form-label me-2">سرعت پخش:</label>
                        <select
                            v-model="playbackSpeed"
                            @change="changePlaybackSpeed"
                            class="modern-form-control speed-select"
                        >
                          <option value="0.5">۰.۵x</option>
                          <option value="0.75">۰.۷۵x</option>
                          <option value="1">۱x</option>
                          <option value="1.25">۱.۲۵x</option>
                          <option value="1.5">۱.۵x</option>
                          <option value="2">۲x</option>
                        </select>
                        <button
                            class="modern-btn modern-btn-secondary btn-sm ms-2"
                            @click="toggleVideoFullscreen"
                            title="تمام صفحه ویدیو">
                          <i class="fas fa-expand"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PDF Content -->
            <div v-else-if="content.type === 'PDF'" class="pdf-content-section">
              <div class="form-section">
                <h6 class="section-title">
                  <i class="fas fa-file-pdf text-danger me-2"></i>
                  سند PDF
                </h6>
                <div class="pdf-container">
                  <!-- PDF Toolbar -->
                  <div class="pdf-toolbar">
                    <div class="pdf-controls">
                      <button
                          @click="previousPage"
                          :disabled="currentPage <= 1"
                          class="modern-btn modern-btn-secondary btn-sm"
                      >
                        <i class="fas fa-chevron-right me-1"></i>
                        صفحه قبل
                      </button>
                      <span class="page-info mx-3">
                        صفحه {{ currentPage }} از {{ totalPages || '؟' }}
                      </span>
                      <button
                          @click="nextPage"
                          :disabled="currentPage >= totalPages"
                          class="modern-btn modern-btn-secondary btn-sm"
                      >
                        صفحه بعد
                        <i class="fas fa-chevron-left ms-1"></i>
                      </button>
                    </div>

                    <div class="zoom-controls">
                      <button @click="zoomOut" class="modern-btn modern-btn-outline btn-sm">
                        <i class="fas fa-search-minus"></i>
                      </button>
                      <span class="zoom-info mx-2">{{ Math.round(zoomLevel * 100) }}%</span>
                      <button @click="zoomIn" class="modern-btn modern-btn-outline btn-sm">
                        <i class="fas fa-search-plus"></i>
                      </button>
                    </div>
                  </div>

                  <!-- PDF Viewer -->
                  <div class="pdf-viewer">
                    <iframe
                        :src="getPdfUrl()"
                        class="pdf-frame"
                        @load="onPdfLoaded"
                        frameborder="0"
                    >
                      <p class="text-center p-4">
                        مرورگر شما از نمایش PDF پشتیبانی نمی‌کند.
                        <button class="modern-btn modern-btn-primary" @click="downloadContent">
                          <i class="fas fa-download me-1"></i>
                          دانلود فایل
                        </button>
                      </p>
                    </iframe>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Section -->
            <div class="progress-section mt-4">
              <div class="form-section">
                <h6 class="section-title">
                  <i class="fas fa-chart-line text-success me-2"></i>
                  پیشرفت مطالعه
                </h6>
                <div class="progress-info-card">
                  <div class="row">
                    <div class="col-md-8">
                      <div class="progress-details">
                        <h6>وضعیت مطالعه شما</h6>
                        <div class="progress modern-progress mb-2">
                          <div
                              class="progress-bar bg-success"
                              role="progressbar"
                              :style="`width: ${progressPercentage}%`"
                              :aria-valuenow="progressPercentage"
                              aria-valuemin="0"
                              aria-valuemax="100"
                          >
                            {{ Math.round(progressPercentage) }}%
                          </div>
                        </div>
                        <small class="text-muted">
                          <i class="fas fa-clock me-1"></i>
                          زمان مطالعه: {{ formatStudyTime(totalViewTime) }}
                        </small>
                      </div>
                    </div>
                    <div class="col-md-4 text-center">
                      <div class="progress-circle" :style="`--progress: ${progressPercentage}`">
                        <div class="progress-circle-inner">
                          <span class="progress-text">{{ Math.round(progressPercentage) }}%</span>
                          <span class="progress-label">تکمیل شده</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Completion -->
            <div class="content-completion mt-4" v-if="progressPercentage >= 80">
              <div class="modern-alert modern-alert-success">
                <i class="fas fa-check-circle me-2"></i>
                تبریک! شما این محتوا را با موفقیت مطالعه کردید.
                <button class="modern-btn modern-btn-success ms-3" @click="markContentComplete">
                  <i class="fas fa-trophy me-1"></i>
                  تأیید تکمیل
                </button>
              </div>
            </div>
          </div>
        </loading-spinner>
      </div>

      <!-- Related Content -->
      <div v-if="content && !loading" class="modern-card animate-fade-in" style="animation-delay: 0.2s;">
        <h6 class="section-title">
          <i class="fas fa-link text-info me-2"></i>
          عملیات مرتبط
        </h6>
        <div class="related-actions">
          <button class="modern-btn modern-btn-outline me-2" @click="goBack">
            <i class="fas fa-arrow-right me-1"></i>
            بازگشت به درس
          </button>
          <button
              v-if="content?.type !== 'TEXT'"
              class="modern-btn modern-btn-info me-2"
              @click="downloadContent"
          >
            <i class="fas fa-download me-1"></i>
            دانلود محتوا
          </button>
          <button class="modern-btn modern-btn-secondary" @click="shareContent">
            <i class="fas fa-share me-1"></i>
            اشتراک‌گذاری
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Overlay (when showing) -->
    <div v-if="showProgress" class="progress-overlay">
      <div class="progress-container">
        <div class="progress-circle-large">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg"
                  d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path class="circle"
                  :stroke-dasharray="`${progressPercentage}, 100`"
                  d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div class="percentage">{{ Math.round(progressPercentage) }}%</div>
        </div>
        <p class="progress-text">پیشرفت مطالعه</p>
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
      totalViewTime: 0
    };
  },
  async created() {
    await this.loadContent();
    this.startProgressTracking();
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
        // شبیه‌سازی دریافت محتوا - در پروژه واقعی از API استفاده کنید
        await new Promise(resolve => setTimeout(resolve, 1000));

        // محتوای نمونه بر اساس contentId
        const mockContent = {
          1: {
            id: 1,
            title: 'مقدمه‌ای بر برنامه‌نویسی',
            type: 'TEXT',
            textContent: 'برنامه‌نویسی یکی از مهارت‌های مهم قرن بیست و یکم محسوب می‌شود. در این درس با مفاهیم پایه‌ای برنامه‌نویسی آشنا خواهید شد.\n\nبرنامه‌نویسی به معنای نوشتن مجموعه‌ای از دستورات برای کامپیوتر است تا کاری خاص را انجام دهد. این دستورات با استفاده از زبان‌های برنامه‌نویسی مختلف نوشته می‌شوند.\n\nزبان‌های برنامه‌نویسی مختلفی وجود دارند که هر کدام برای کاربردهای خاصی طراحی شده‌اند. برخی از محبوب‌ترین زبان‌های برنامه‌نویسی عبارتند از:\n\n• Python: زبانی ساده و قدرتمند\n• JavaScript: زبان وب\n• Java: زبان شیءگرا و چندمنظوره\n• C++: زبان سیستمی و بازی‌سازی'
          },
          2: {
            id: 2,
            title: 'ویدیو آموزشی برنامه‌نویسی',
            type: 'VIDEO',
            fileUrl: '/sample-video.mp4'
          },
          3: {
            id: 3,
            title: 'کتاب راهنمای برنامه‌نویسی',
            type: 'PDF',
            fileUrl: '/sample-document.pdf'
          }
        };

        this.content = mockContent[this.contentId] || mockContent[1];

        // علامت‌گذاری محتوا به عنوان مشاهده شده
        await this.markContentViewed();

      } catch (error) {
        console.error('Error loading content:', error);
        this.error = 'خطا در بارگذاری محتوا. لطفاً دوباره تلاش کنید.';
      } finally {
        this.loading = false;
      }
    },

    async markContentViewed() {
      try {
        await axios.post(`/api/progress/content/${this.contentId}/view`);
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
      return content.fileUrl || `/api/content/files/${content.fileId}`;
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

    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3);
    },

    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.5);
    },

    onPdfLoaded() {
      // در پروژه واقعی می‌توانید تعداد صفحات را استخراج کنید
      this.totalPages = 10; // مقدار نمونه
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
        await axios.post(`/api/progress/content/${this.contentId}/complete`);
        this.$toast?.success('محتوا به عنوان تکمیل شده علامت‌گذاری شد.');
      } catch (error) {
        console.error('Error marking content complete:', error);
        this.$toast?.error('خطا در علامت‌گذاری محتوا');
      }
    },

    downloadContent() {
      if (this.content && this.content.type !== 'TEXT') {
        const link = document.createElement('a');
        link.href = this.getContentUrl(this.content);
        link.download = this.content.title;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.$toast?.success('دانلود آغاز شد');
      }
    },

    shareContent() {
      if (navigator.share) {
        navigator.share({
          title: this.content?.title,
          text: `محتوای آموزشی: ${this.content?.title}`,
          url: window.location.href
        });
      } else {
        // کپی لینک به کلیپ‌بورد
        navigator.clipboard.writeText(window.location.href);
        this.$toast?.info('لینک محتوا کپی شد');
      }
    }
  }
};
</script>

<style scoped>
/* Content Sections */
.text-content-section,
.video-content-section,
.pdf-content-section {
  margin-bottom: 2rem;
}

.text-content-container {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  min-height: 400px;
}

.content-text {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Video Styling */
.video-container {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.video-player {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #000;
}

.video-loading-overlay,
.video-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.loading-content,
.error-content {
  text-align: center;
  padding: 2rem;
}

.error-content i {
  font-size: 2rem;
}

.video-controls {
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.speed-select {
  width: auto;
  min-width: 80px;
}

/* PDF Styling */
.pdf-container {
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.pdf-toolbar {
  background: rgba(102, 126, 234, 0.05);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.pdf-controls,
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-info,
.zoom-info {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
  text-align: center;
}

.pdf-viewer {
  height: 600px;
  overflow: hidden;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
}

/* Progress Section */
.progress-section {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.05), rgba(46, 204, 113, 0.05));
  border-radius: 12px;
}

.progress-info-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(40, 167, 69, 0.1);
}

.modern-progress {
  height: 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.progress-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
      #28a745 0deg,
      #28a745 calc(var(--progress) * 3.6deg),
      #e9ecef calc(var(--progress) * 3.6deg)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
}

.progress-circle-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.progress-text {
  font-size: 1rem;
  font-weight: bold;
  color: #28a745;
  display: block;
}

.progress-label {
  font-size: 0.7rem;
  color: #6c757d;
  display: block;
}

/* Progress Overlay */
.progress-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.2);
  z-index: 1000;
  text-align: center;
  backdrop-filter: blur(10px);
}

.progress-circle-large {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  position: relative;
}

.circular-chart {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #e9ecef;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #28a745;
  stroke-width: 3.8;
  stroke-linecap: round;
  animation: progress-animation 1s ease-in-out forwards;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  font-weight: bold;
  color: #28a745;
}

.progress-text {
  color: #495057;
  font-size: 0.9rem;
  margin: 0;
}

/* Related Actions */
.related-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Content Actions */
.content-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .text-content-container {
    padding: 1.5rem;
    font-size: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .content-actions,
  .related-actions {
    justify-content: center;
  }

  .pdf-toolbar {
    flex-direction: column;
    gap: 1rem;
  }

  .playback-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .progress-overlay {
    margin: 1rem;
    padding: 1.5rem;
  }

  .video-controls {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .content-actions .modern-btn,
  .related-actions .modern-btn {
    flex: 1;
    min-width: 0;
  }

  .pdf-controls,
  .zoom-controls {
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .text-content-container {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .content-text {
    color: #e2e8f0;
  }

  .video-container,
  .pdf-container {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .progress-info-card {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(40, 167, 69, 0.2);
  }

  .progress-circle::before {
    background: #2d3748;
  }

  .progress-overlay {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(102, 126, 234, 0.3);
  }
}

/* Animations */
@keyframes progress-animation {
  0% {
    stroke-dasharray: 0 100;
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>