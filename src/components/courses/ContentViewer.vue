<template>
  <div class="content-viewer-container">
    <div class="content-viewer-header">
      <div class="header-controls">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i>
          Back to Lesson
        </button>

        <div class="content-title">
          <h4 class="mb-0">{{ content?.title || 'Content Viewer' }}</h4>
          <small class="text-muted">{{ getContentTypeText(content?.type) }}</small>
        </div>

        <div class="header-actions">
          <button v-if="content?.type !== 'TEXT'" class="action-btn" @click="downloadContent" title="Download">
            <i class="fas fa-download"></i>
          </button>
          <button class="action-btn" @click="toggleFullscreen" title="Toggle Fullscreen">
            <i class="fas" :class="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="content-viewer-body" ref="contentBody">
      <loading-spinner :loading="loading">
        <div v-if="error" class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h5>Error Loading Content</h5>
          <p>{{ error }}</p>
          <button class="modern-btn modern-btn-primary" @click="loadContent">
            <i class="fas fa-redo me-2"></i>
            Try Again
          </button>
        </div>

        <div v-else-if="content" class="content-display">
          <!-- Text Content -->
          <div v-if="content.type === 'TEXT'" class="text-content">
            <div class="text-container">
              <div class="content-text" v-html="formatTextContent(content.textContent)"></div>
            </div>
          </div>

          <!-- Video Content -->
          <div v-else-if="content.type === 'VIDEO'" class="video-content">
            <div class="video-container">
              <video
                  ref="videoPlayer"
                  controls
                  class="video-player"
                  @loadedmetadata="onVideoLoaded"
                  @timeupdate="onVideoTimeUpdate"
                  @ended="onVideoEnded"
              >
                <source :src="getContentUrl(content)" type="video/mp4">
                Your browser does not support video playback.
              </video>

              <div class="video-controls">
                <div class="progress-info">
                  <small>{{ formatTime(currentTime) }} / {{ formatTime(videoDuration) }}</small>
                </div>
                <div class="playback-speed">
                  <select v-model="playbackSpeed" @change="changePlaybackSpeed" class="speed-select">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Content -->
          <div v-else-if="content.type === 'PDF'" class="pdf-content">
            <div class="pdf-container">
              <div class="pdf-toolbar">
                <div class="pdf-controls">
                  <button @click="previousPage" :disabled="currentPage <= 1" class="pdf-btn">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="page-info">
                    Page {{ currentPage }} of {{ totalPages || '?' }}
                  </span>
                  <button @click="nextPage" :disabled="currentPage >= totalPages" class="pdf-btn">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>

                <div class="zoom-controls">
                  <button @click="zoomOut" class="pdf-btn">
                    <i class="fas fa-search-minus"></i>
                  </button>
                  <span class="zoom-info">{{ Math.round(zoomLevel * 100) }}%</span>
                  <button @click="zoomIn" class="pdf-btn">
                    <i class="fas fa-search-plus"></i>
                  </button>
                </div>
              </div>

              <div class="pdf-viewer">
                <iframe
                    :src="getPdfUrl()"
                    class="pdf-frame"
                    @load="onPdfLoaded"
                >
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>

    <!-- Progress Overlay -->
    <div v-if="showProgress" class="progress-overlay">
      <div class="progress-container">
        <div class="progress-circle">
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
        <p class="progress-text">Content Progress</p>
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
        // In a real app, you'd fetch content details from API
        // For now, we'll simulate content based on contentId
        const response = await axios.get(`/api/content/${this.contentId}`);
        this.content = response.data;

        // Mark content as viewed
        await this.markContentViewed();

      } catch (error) {
        console.error('Error loading content:', error);
        this.error = 'Failed to load content. Please try again.';
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
      return `/api/content/files/${content.fileId}`;
    },

    getPdfUrl() {
      return `${this.getContentUrl(this.content)}#page=${this.currentPage}&zoom=${Math.round(this.zoomLevel * 100)}`;
    },

    formatTextContent(text) {
      if (!text) return '';
      return text.replace(/\n/g, '<br>');
    },

    getContentTypeText(type) {
      switch (type) {
        case 'TEXT': return 'Text Content';
        case 'VIDEO': return 'Video Content';
        case 'PDF': return 'PDF Document';
        default: return 'Content';
      }
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // Video methods
    onVideoLoaded() {
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

    changePlaybackSpeed() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.playbackRate = parseFloat(this.playbackSpeed);
      }
    },

    // PDF methods
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (!this.totalPages || this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3);
    },

    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.5);
    },

    onPdfLoaded() {
      // PDF loaded - could extract page count if needed
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
      const element = this.$refs.contentBody;
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
    },

    stopProgressTracking() {
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
        // For text, track based on time spent
        const timeSpent = this.totalViewTime + (Date.now() - this.viewStartTime);
        const estimatedReadTime = (this.content.textContent?.length || 1000) / 200 * 1000; // 200 chars per second
        this.progressPercentage = Math.min((timeSpent / estimatedReadTime) * 100, 100);
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
      }
    }
  }
};
</script>

<style scoped>
.content-viewer-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a2e;
  color: white;
  z-index: 1050;
  display: flex;
  flex-direction: column;
}

.content-viewer-header {
  background: #16213e;
  border-bottom: 1px solid #0f3460;
  padding: 1rem;
  flex-shrink: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.back-btn {
  background: #0f3460;
  border: 1px solid #e94560;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.back-btn:hover {
  background: #e94560;
  transform: translateY(-1px);
}

.content-title {
  flex: 1;
  text-align: center;
  margin: 0 2rem;
}

.content-title h4 {
  color: white;
  margin-bottom: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  background: #0f3460;
  border: 1px solid #e94560;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e94560;
  transform: scale(1.05);
}

.content-viewer-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.content-display {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Text Content */
.text-content {
  height: 100%;
  overflow-y: auto;
  padding: 2rem;
}

.text-container {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 3rem;
  backdrop-filter: blur(10px);
}

.content-text {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #e0e0e0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Video Content */
.video-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.video-container {
  width: 100%;
  max-width: 1200px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: auto;
  display: block;
}

.video-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
}

.speed-select {
  background: #0f3460;
  color: white;
  border: 1px solid #e94560;
  border-radius: 4px;
  padding: 0.25rem;
}

/* PDF Content */
.pdf-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-toolbar {
  background: #16213e;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #0f3460;
}

.pdf-controls, .zoom-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pdf-btn {
  background: #0f3460;
  border: 1px solid #e94560;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pdf-btn:hover:not(:disabled) {
  background: #e94560;
}

.pdf-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-viewer {
  flex: 1;
  background: white;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
  color: #e94560;
  margin-bottom: 1rem;
}

/* Progress Overlay */
.progress-overlay {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid #e94560;
}

.progress-container {
  text-align: center;
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}

.circular-chart {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #0f3460;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #e94560;
  stroke-width: 3.8;
  stroke-linecap: round;
  animation: progress 1s ease-in-out forwards;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem;
  font-weight: bold;
  color: white;
}

.progress-text {
  color: #e0e0e0;
  font-size: 0.9rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .header-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .content-title {
    margin: 0;
  }

  .text-container {
    padding: 1.5rem;
  }

  .video-content {
    padding: 1rem;
  }

  .progress-overlay {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    margin: 1rem;
  }
}

/* Animations */
@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

/* Loading Spinner Override */
:deep(.loading-container) {
  background: transparent;
  color: white;
}
</style>