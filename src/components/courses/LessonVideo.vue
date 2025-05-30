<template>
  <div class="modern-card video-container animate-slide-up">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="modern-title mb-0">
        <i class="fas fa-play-circle text-primary me-2"></i>
        ویدیوی آموزشی
      </h6>
      <span class="modern-badge modern-badge-info">
        <i class="fas fa-video me-1"></i>
        ویدیو
      </span>
    </div>

    <div class="video-wrapper">
      <div class="ratio ratio-16x9">
        <video
            controls
            class="video-player"
            :poster="videoPoster"
            @loadstart="onVideoLoadStart"
            @loadeddata="onVideoLoaded"
            @error="onVideoError">
          <source :src="videoUrl" type="video/mp4">
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
    </div>

    <!-- Video Controls -->
    <div class="video-controls mt-3">
      <div class="d-flex justify-content-between align-items-center">
        <div class="video-info">
          <small class="text-muted">
            <i class="fas fa-clock me-1"></i>
            مدت زمان: <span id="videoDuration">--:--</span>
          </small>
        </div>
        <div class="video-actions">
          <button
              class="modern-btn modern-btn-secondary btn-sm me-2"
              @click="toggleFullscreen"
              title="تمام صفحه">
            <i class="fas fa-expand"></i>
          </button>
          <button
              class="modern-btn modern-btn-secondary btn-sm"
              @click="downloadVideo"
              title="دانلود ویدیو">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LessonVideo',
  props: {
    videoUrl: {
      type: String,
      required: true
    },
    videoPoster: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      videoLoading: true,
      videoError: false
    };
  },
  methods: {
    onVideoLoadStart() {
      this.videoLoading = true;
      this.videoError = false;
    },

    onVideoLoaded() {
      this.videoLoading = false;
      this.videoError = false;

      // Update duration display
      const video = this.$el.querySelector('video');
      if (video && video.duration) {
        const duration = this.formatTime(video.duration);
        const durationElement = this.$el.querySelector('#videoDuration');
        if (durationElement) {
          durationElement.textContent = duration;
        }
      }
    },

    onVideoError() {
      this.videoLoading = false;
      this.videoError = true;
      console.error('Video loading error:', this.videoUrl);
    },

    retryVideo() {
      const video = this.$el.querySelector('video');
      if (video) {
        this.videoLoading = true;
        this.videoError = false;
        video.load();
      }
    },

    toggleFullscreen() {
      const video = this.$el.querySelector('video');
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

    downloadVideo() {
      if (this.videoUrl) {
        const link = document.createElement('a');
        link.href = this.videoUrl;
        link.download = 'lesson-video.mp4';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
}
</script>

<style scoped>
.video-container {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
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

.video-error {
  color: white;
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.8);
}

.video-controls {
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  margin-top: 1rem;
}

.video-info small {
  font-size: 0.8rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* Custom video controls styling */
.video-player::-webkit-media-controls-panel {
  background: rgba(0, 0, 0, 0.8);
}

.video-player::-webkit-media-controls-play-button,
.video-player::-webkit-media-controls-mute-button {
  background-color: rgba(102, 126, 234, 0.8);
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .video-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .video-actions {
    justify-content: center;
  }

  .loading-content,
  .error-content {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .video-container {
    background: rgba(255, 255, 255, 0.05);
  }

  .video-controls {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>