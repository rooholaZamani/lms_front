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
                  <i class="fas me-1" :class="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
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
      totalViewTime: 0,

      pdfSupported: true,
      pdfLoading: false,
      pdfUrl: null,
      pdfBlob: null
    };
  },
  async created() {
    await this.fetchContentData();

  },
  methods: {
    async initializePdfViewer() {
      if (this.content?.type !== 'PDF') return;

      console.log('Initializing PDF viewer...');
      this.pdfLoading = true;

      // Check browser support first
      this.checkPdfSupport();

      if (this.pdfSupported) {
        await this.loadPdfWithAuth();
      } else {
        this.pdfLoading = false;
        console.log('PDF viewer not supported, using fallback');
      }
    },
    async loadPdfWithAuth() {
      try {
        if (!this.fileId) {
          console.error('No file ID available for PDF');
          this.pdfSupported = false;
          this.pdfLoading = false;
          return;
        }

        console.log('Loading PDF with file ID:', this.fileId);

        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token');
          this.pdfSupported = false;
          this.pdfLoading = false;
          return;
        }

        // Fetch PDF with proper authentication
        const response = await fetch(`/api/content/files/${this.fileId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${token}`,
            'Accept': 'application/pdf,*/*'
          }
        });

        console.log('PDF fetch response:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Verify content type
        const contentType = response.headers.get('content-type');
        console.log('PDF content type:', contentType);

        if (!contentType || !contentType.includes('application/pdf')) {
          console.warn('Response is not a PDF, content-type:', contentType);
          this.pdfSupported = false;
          this.pdfLoading = false;
          return;
        }

        // Create blob and URL
        const blob = await response.blob();
        this.pdfBlob = blob;
        this.pdfUrl = URL.createObjectURL(blob);

        console.log('PDF loaded successfully:', {
          size: blob.size,
          url: this.pdfUrl
        });

        this.pdfLoading = false;

      } catch (error) {
        console.error('Error loading PDF:', error);
        this.pdfSupported = false;
        this.pdfLoading = false;

        if (this.$toast) {
          this.$toast.error('خطا در بارگذاری فایل PDF: ' + error.message);
        }
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

        console.log('Fetching content:', this.contentId);

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
    async markContentViewed() {
      try {
        if (this.contentId) {
          await this.$http.post(`/progress/content/${this.contentId}/view`);
        }
      } catch (error) {
        console.error('Error marking content as viewed:', error);
      }
    },
    checkPdfSupport() {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIE = userAgent.includes('msie') || userAgent.includes('trident');

      if (isIE) {
        console.log('Internet Explorer detected, disabling PDF viewer');
        this.pdfSupported = false;
        return;
      }

      // Mobile devices often have issues with PDF in iframe
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        console.log('Mobile device detected, using download fallback');
        this.pdfSupported = false;
        return;
      }

      console.log('Browser supports PDF viewing');
      this.pdfSupported = true;
    },
    handlePdfLoad() {
      console.log('PDF iframe loaded successfully');
      this.pdfLoading = false;
    },

    // Handle PDF load error
    handlePdfError(event) {
      console.warn('PDF iframe failed to load:', event);
      this.pdfSupported = false;
      this.pdfLoading = false;
    },
    async downloadContent() {
      try {
        if (!this.fileId) {
          if (this.$toast) {
            this.$toast.error('فایل برای دانلود موجود نیست');
          }
          return;
        }

        console.log('Starting download for file ID:', this.fileId);

        // If we already have the PDF blob, use it
        if (this.pdfBlob && this.content.type === 'PDF') {
          const url = URL.createObjectURL(this.pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = (this.content.title || 'document') + '.pdf';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);

          if (this.$toast) {
            this.$toast.success('دانلود فایل شروع شد');
          }
          return;
        }

        // Otherwise, fetch the file with authentication
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/content/files/${this.fileId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Determine file extension
        const contentType = response.headers.get('content-type');
        let extension = '';
        if (contentType) {
          if (contentType.includes('pdf')) extension = '.pdf';
          else if (contentType.includes('video')) extension = '.mp4';
          else if (contentType.includes('image')) extension = '.jpg';
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = (this.content.title || 'download') + extension;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        if (this.$toast) {
          this.$toast.success('دانلود فایل شروع شد');
        }

      } catch (error) {
        console.error('Error downloading file:', error);
        if (this.$toast) {
          this.$toast.error('خطا در دانلود فایل: ' + error.message);
        }
      }
    },

    cleanup() {
      if (this.pdfUrl && this.pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.pdfUrl);
        console.log('PDF blob URL cleaned up');
      }
    },

    goBack() {
      const lessonId = this.$route.query.lessonId;
      if (lessonId) {
        this.$router.push({
          name: 'CourseDetail',
          params: { id: lessonId },
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
    fileId() {
      // Get file ID from multiple possible locations
      return this.content?.fileId || this.content?.file?.id;
    },
    pdfViewerUrl() {
      if (this.fileId) {
        return `/api/content/files/${this.fileId}`;
      }
      return null;
    }
  },
  async mounted() {
    // Initialize PDF viewer if content is PDF
    if (this.content?.type === 'PDF') {
      await this.initializePdfViewer();
    }
  },
  beforeUnmount() {
    this.cleanup();
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