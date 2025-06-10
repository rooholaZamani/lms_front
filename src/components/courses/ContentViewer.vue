<template>
  <div class="content-viewer">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
        <h5 class="text-muted">در حال بارگذاری محتوا...</h5>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="text-center">
        <div class="modern-logo error mb-4">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h4 class="text-danger mb-3">خطا در بارگذاری محتوا</h4>
        <p class="text-muted mb-4">{{ error }}</p>
        <button @click="fetchContentData" class="modern-btn modern-btn-primary">
          <i class="fas fa-redo me-2"></i>
          تلاش مجدد
        </button>
      </div>
    </div>

    <!-- No Content -->
    <div v-else-if="!content" class="no-content">
      <div class="text-center">
        <div class="modern-logo warning mb-4">
          <i class="fas fa-file-alt"></i>
        </div>
        <h4 class="text-warning mb-3">محتوایی یافت نشد</h4>
        <p class="text-muted">محتوای درخواستی موجود نیست یا حذف شده است.</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="container content-wrapper">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10 col-xl-8">

          <!-- Content Header -->
          <div class="content-header mb-4 animate-slide-up">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div class="flex-grow-1">
                <h1 class="content-title">{{ content.title }}</h1>
                <div class="content-meta">
                  <span class="me-3">
                    <i class="fas fa-book me-1"></i>
                    {{ content.lesson?.courseTitle }}
                  </span>
                  <span class="me-3">
                    <i class="fas fa-bookmark me-1"></i>
                    {{ content.lesson?.title }}
                  </span>
                  <span class="me-3">
                    <i class="fas fa-clock me-1"></i>
                    {{ formatTime(timeSpent) }} مطالعه شده
                  </span>
                </div>
              </div>
              <div class="content-actions">
                <button
                    @click="markAsComplete"
                    :disabled="isMarkingComplete || isCompleted"
                    class="modern-btn"
                    :class="isCompleted ? 'modern-btn-success' : 'modern-btn-primary'"
                >
                  <div v-if="isMarkingComplete" class="spinner-border spinner-border-sm me-2" role="status"></div>
                  <i v-else class="fas me-2" :class="isCompleted ? 'fa-check-circle' : 'fa-check'"></i>
                  {{ isCompleted ? 'تکمیل شده' : 'تکمیل محتوا' }}
                </button>
                <button @click="goBack" class="modern-btn modern-btn-outline">
                  <i class="fas fa-arrow-right me-2"></i>
                  بازگشت
                </button>
              </div>
            </div>
          </div>

          <!-- Text Content -->
          <div v-if="content.type === 'TEXT'" class="text-content-section">
            <div class="modern-card animate-slide-up">
              <div class="content-text" v-html="content.textContent"></div>
            </div>
          </div>

          <!-- Video Content -->
          <div v-else-if="content.type === 'VIDEO'" class="video-content-section">
            <div class="modern-card animate-slide-up">

              <!-- Video Loading -->
              <div v-if="videoLoading && !videoBlobUrl" class="video-loading-container">
                <div class="modern-logo info">
                  <i class="fas fa-video"></i>
                </div>
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3 mb-0">در حال بارگذاری ویدیو...</p>
              </div>

              <!-- Video Error -->
              <div v-else-if="videoError" class="video-error-container">
                <div class="modern-alert modern-alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  خطا در بارگذاری ویدیو
                  <button @click="retryVideo" class="modern-btn modern-btn-outline-danger mt-2">
                    تلاش مجدد
                  </button>
                </div>
              </div>

              <!-- Video Player -->
              <div v-else class="video-container">
                <video
                    ref="videoPlayer"
                    :src="videoBlobUrl || videoUrl"
                    class="video-player"
                    controls
                    preload="metadata"
                    @loadedmetadata="onVideoLoaded"
                    @timeupdate="onVideoTimeUpdate"
                    @ended="onVideoEnded"
                    @error="onVideoError"
                >
                  مرورگر شما از نمایش ویدیو پشتیبانی نمی‌کند.
                </video>

                <!-- Video Controls -->
                <div class="video-controls mt-3">
                  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div class="time-display">
                      <span>{{ formatTime(currentVideoTime) }} / {{ formatTime(videoDuration) }}</span>
                    </div>
                    <div class="speed-control">
                      <label class="me-2">سرعت پخش:</label>
                      <select v-model="playbackSpeed" @change="changePlaybackSpeed" class="form-select speed-select">
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>
                    <button @click="toggleVideoFullscreen" class="modern-btn modern-btn-outline">
                      <i class="fas fa-expand"></i>
                      تمام صفحه
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Content -->
          <div v-else-if="content.type === 'PDF'" class="pdf-content-section">
            <div class="modern-card animate-slide-up">

              <!-- PDF Loading State -->
              <div v-if="pdfLoading" class="pdf-loading-container">
                <div class="modern-logo info">
                  <i class="fas fa-file-pdf fa-3x text-primary"></i>
                </div>
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">در حال بارگذاری...</span>
                </div>
                <p class="mt-3 mb-0 fw-semibold">در حال بارگذاری PDF...</p>
                <small class="text-muted">لطفاً صبر کنید</small>
              </div>

              <!-- PDF Error State -->
              <div v-else-if="pdfError" class="pdf-error-container">
                <div class="modern-alert modern-alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  <strong>خطا در بارگذاری PDF:</strong>
                  <br>{{ pdfError }}
                  <div class="mt-3">
                    <button @click="retryPdfLoad" class="modern-btn modern-btn-outline-danger me-2">
                      <i class="fas fa-redo"></i>
                      تلاش مجدد
                    </button>
                    <button @click="downloadFile" class="modern-btn modern-btn-outline-secondary me-2">
                      <i class="fas fa-download"></i>
                      دانلود فایل
                    </button>
                    <button @click="debugPdfState" class="modern-btn modern-btn-outline-info">
                      <i class="fas fa-bug"></i>
                      Debug Info
                    </button>
                  </div>
                </div>
              </div>

              <!-- PDF Viewer - حالت عادی -->
              <div v-else-if="isPdfLoaded && totalPages > 0">

                <!-- PDF Toolbar -->
                <div class="pdf-toolbar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">

                  <!-- Navigation Group -->
                  <div class="pdf-nav-group">
                    <button
                        @click="previousPage"
                        :disabled="currentPage <= 1 || !!pdfRenderTask || !isPdfLoaded"
                        class="modern-btn modern-btn-outline"
                        title="صفحه قبل (→)"
                    >
                      <i class="fas fa-chevron-right"></i>
                    </button>
                    <span class="px-3 py-2 bg-light rounded text-nowrap">
                      صفحه {{ currentPage }} از {{ totalPages }}
                    </span>
                    <button
                        @click="nextPage"
                        :disabled="currentPage >= totalPages || !!pdfRenderTask || !isPdfLoaded"
                        class="modern-btn modern-btn-outline"
                        title="صفحه بعد (←)"
                    >
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </div>

                  <!-- Zoom Group -->
                  <div class="zoom-group">
                    <button
                        @click="zoomOut"
                        :disabled="pdfScale <= 0.5 || !!pdfRenderTask || !isPdfLoaded"
                        class="modern-btn modern-btn-outline"
                        title="کوچک کردن (Ctrl + -)"
                    >
                      <i class="fas fa-search-minus"></i>
                    </button>
                    <span class="px-3 py-2 bg-light rounded text-nowrap">
                      {{ Math.round(pdfScale * 100) }}%
                    </span>
                    <button
                        @click="zoomIn"
                        :disabled="pdfScale >= 3.0 || !!pdfRenderTask || !isPdfLoaded"
                        class="modern-btn modern-btn-outline"
                        title="بزرگ کردن (Ctrl + +)"
                    >
                      <i class="fas fa-search-plus"></i>
                    </button>
                  </div>

                  <!-- Action Group -->
                  <div class="action-group">
                    <button
                        @click="fitToWidth"
                        :disabled="!!pdfRenderTask || !isPdfLoaded"
                        class="modern-btn modern-btn-outline"
                        title="تنظیم عرض (Ctrl + F)"
                    >
                      <i class="fas fa-arrows-alt-h"></i>
                      <span class="d-none d-md-inline">تنظیم عرض</span>
                    </button>
                    <button
                        @click="toggleFullscreenPdf"
                        class="modern-btn modern-btn-outline"
                        title="تمام صفحه"
                    >
                      <i class="fas fa-expand"></i>
                      <span class="d-none d-lg-inline">تمام صفحه</span>
                    </button>
                    <button
                        @click="downloadFile"
                        class="modern-btn modern-btn-outline"
                        title="دانلود PDF"
                    >
                      <i class="fas fa-download"></i>
                      <span class="d-none d-lg-inline">دانلود</span>
                    </button>
                  </div>
                </div>

                <!-- PDF Status Indicator -->
                <div v-if="pdfRenderTask" class="alert alert-info py-2 mb-3">
                  <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    <small>در حال رندر صفحه {{ currentPage }}...</small>
                  </div>
                </div>

                <!-- PDF Viewer Container -->
                <div
                    ref="pdfViewerWrapper"
                    class="pdf-viewer-wrapper"
                    @keydown="handlePdfKeyboard"
                    tabindex="0"
                    role="application"
                    aria-label="نمایشگر PDF"
                    :aria-describedby="`pdf-page-info-${contentId}`"
                >
                  <!-- Page Info for Screen Readers -->
                  <div
                      :id="`pdf-page-info-${contentId}`"
                      class="visually-hidden"
                      aria-live="polite"
                  >
                    صفحه {{ currentPage }} از {{ totalPages }}، زوم {{ Math.round(pdfScale * 100) }} درصد
                  </div>

                  <!-- Canvas Container -->
                  <div
                      class="pdf-canvas-container"
                      :class="{ 'changing-page': !!pdfRenderTask }"
                  >
                    <canvas
                        ref="pdfCanvas"
                        class="pdf-display-canvas"
                        role="img"
                        :aria-label="`صفحه ${currentPage} از PDF ${content.title}`"
                    ></canvas>

                    <!-- Loading Overlay for Page Changes -->
                    <div
                        v-if="pdfRenderTask"
                        class="position-absolute top-50 start-50 translate-middle"
                        style="z-index: 10;"
                    >
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">در حال رندر صفحه...</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mobile PDF Navigation -->
                <div class="pdf-mobile-nav d-md-none">
                  <div class="modern-card text-center">
                    <div class="d-flex justify-content-center align-items-center gap-3 mb-2">
                      <button
                          @click="previousPage"
                          :disabled="currentPage <= 1 || !!pdfRenderTask || !isPdfLoaded"
                          class="modern-btn modern-btn-sm modern-btn-outline"
                          title="صفحه قبل"
                      >
                        <i class="fas fa-chevron-right"></i>
                      </button>
                      <span class="fw-semibold">{{ currentPage }} / {{ totalPages }}</span>
                      <button
                          @click="nextPage"
                          :disabled="currentPage >= totalPages || !!pdfRenderTask || !isPdfLoaded"
                          class="modern-btn modern-btn-sm modern-btn-outline"
                          title="صفحه بعد"
                      >
                        <i class="fas fa-chevron-left"></i>
                      </button>
                    </div>

                    <!-- Mobile Quick Actions -->
                    <div class="d-flex justify-content-center gap-2">
                      <button
                          @click="fitToWidth"
                          :disabled="!!pdfRenderTask || !isPdfLoaded"
                          class="modern-btn modern-btn-sm modern-btn-outline"
                          title="تنظیم عرض"
                      >
                        <i class="fas fa-arrows-alt-h"></i>
                      </button>
                      <button
                          @click="toggleFullscreenPdf"
                          class="modern-btn modern-btn-sm modern-btn-outline"
                          title="تمام صفحه"
                      >
                        <i class="fas fa-expand"></i>
                      </button>
                      <button
                          @click="downloadFile"
                          class="modern-btn modern-btn-sm modern-btn-outline"
                          title="دانلود"
                      >
                        <i class="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PDF Information Panel -->
                <div class="mt-3 p-3 bg-light rounded">
                  <div class="row g-3 text-center">
                    <div class="col-6 col-md-3">
                      <small class="text-muted d-block">تعداد صفحات</small>
                      <strong>{{ totalPages }}</strong>
                    </div>
                    <div class="col-6 col-md-3">
                      <small class="text-muted d-block">صفحه فعلی</small>
                      <strong>{{ currentPage }}</strong>
                    </div>
                    <div class="col-6 col-md-3">
                      <small class="text-muted d-block">زوم</small>
                      <strong>{{ Math.round(pdfScale * 100) }}%</strong>
                    </div>
                    <div class="col-6 col-md-3">
                      <small class="text-muted d-block">وضعیت</small>
                      <strong>{{ pdfRenderTask ? 'در حال رندر' : 'آماده' }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Keyboard Shortcuts Help -->
                <div class="mt-2">
                  <button
                      class="btn btn-link btn-sm text-muted p-0"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#pdf-shortcuts"
                      aria-expanded="false"
                  >
                    <i class="fas fa-keyboard me-1"></i>
                    میانبرهای صفحه کلید
                  </button>
                  <div class="collapse mt-2" id="pdf-shortcuts">
                    <div class="card card-body bg-light border-0">
                      <div class="row g-2 small">
                        <div class="col-md-6">
                          <strong>پیمایش:</strong><br>
                          ← / → : صفحه بعد/قبل<br>
                          Home / End : اولین/آخرین صفحه
                        </div>
                        <div class="col-md-6">
                          <strong>زوم:</strong><br>
                          Ctrl + / Ctrl - : بزرگ/کوچک کردن<br>
                          Ctrl F : تنظیم عرض
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- PDF Not Loaded State -->
              <div v-else-if="!pdfLoading && !pdfError" class="pdf-error-container">
                <div class="modern-alert modern-alert-warning">
                  <i class="fas fa-file-pdf me-2"></i>
                  PDF هنوز بارگذاری نشده است
                  <div class="mt-2">
                    <button @click="initializePdfViewer" class="modern-btn modern-btn-outline-warning me-2">
                      <i class="fas fa-refresh"></i>
                      شروع بارگذاری
                    </button>
                    <button @click="debugPdfState" class="modern-btn modern-btn-outline-info">
                      <i class="fas fa-info"></i>
                      بررسی وضعیت
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Unknown Content Type -->
          <div v-else class="unknown-content-section">
            <div class="modern-card animate-slide-up">
              <div class="unknown-content-area">
                <div class="modern-logo warning mb-4">
                  <i class="fas fa-question-circle"></i>
                </div>
                <h5>نوع محتوای نامشخص</h5>
                <p class="text-muted mb-4">نوع این محتوا پشتیبانی نمی‌شود.</p>
                <button v-if="fileId" @click="downloadFile" class="modern-btn modern-btn-primary">
                  <i class="fas fa-download"></i>
                  دانلود فایل
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'ContentViewer',

  setup() {
    const route = useRoute()
    const router = useRouter()

    // State
    const loading = ref(true)
    const error = ref(null)
    const content = ref(null)
    const timeSpent = ref(0)
    const startTime = ref(Date.now())
    const isMarkingComplete = ref(false)
    const isCompleted = ref(false)

    // Video state
    const videoBlobUrl = ref(null)
    const videoLoading = ref(false)
    const videoError = ref(false)
    const currentVideoTime = ref(0)
    const videoDuration = ref(0)
    const playbackSpeed = ref(1)

    // PDF state - تغییر مهم: استفاده از متغیر معمولی برای PDF document
    let pdfDocInstance = null  // بجای ref، از متغیر معمولی استفاده می‌کنیم
    const isPdfLoaded = ref(false)  // برای track کردن وضعیت
    const pdfLoading = ref(false)
    const pdfError = ref(null)
    const currentPage = ref(1)
    const totalPages = ref(0)
    const pdfScale = ref(1.0)
    const pdfRenderTask = ref(null)

    // Refs
    const videoPlayer = ref(null)
    const pdfCanvas = ref(null)
    const pdfViewerWrapper = ref(null)

    // Timers
    let timeTrackingInterval = null

    // Computed
    const contentId = computed(() => route.params.contentId)

    const fileId = computed(() => {
      return content.value?.fileId || content.value?.file?.id
    })

    const videoUrl = computed(() => {
      if (fileId.value) {
        return `/api/content/files/${fileId.value}?timeSpent=${timeSpent.value}`
      }
      return null
    })

    // Helper Functions
    const formatTime = (seconds) => {
      if (!seconds || seconds < 0) return '00:00:00'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':')
    }

    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 B'

      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // debounce helper
    function debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    // Main Methods
    const fetchContentData = async () => {
      if (!contentId.value) {
        error.value = 'شناسه محتوا نامعتبر است'
        loading.value = false
        return
      }

      try {
        loading.value = true
        error.value = null

        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/${contentId.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات محتوا')
        }

        const data = await response.json()
        content.value = data

        // Mark as viewed
        markAsViewed()

        // Initialize based on content type
        if (data.type === 'VIDEO' && fileId.value) {
          await fetchVideoBlob(fileId.value)
        } else if (data.type === 'PDF' && fileId.value) {
          await nextTick()
          initializePdfViewer()
        }

      } catch (err) {
        console.error('Error fetching content:', err)
        error.value = err.message || 'خطا در دریافت محتوا'
      } finally {
        loading.value = false
      }
    }

    const markAsViewed = async () => {
      try {
        const token = localStorage.getItem('token')
        await fetch(`/api/progress/content/${contentId.value}/view?timeSpent=${timeSpent.value}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${token}`
          }
        })
      } catch (err) {
        console.error('Error marking content as viewed:', err)
      }
    }

    const markAsComplete = async () => {
      try {
        isMarkingComplete.value = true
        const token = localStorage.getItem('token')

        await fetch(`/api/progress/content/${contentId.value}/complete?timeSpent=${timeSpent.value}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        isCompleted.value = true

      } catch (err) {
        console.error('Error marking content as complete:', err)
      } finally {
        isMarkingComplete.value = false
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    // Video Methods
    const fetchVideoBlob = async (videoFileId) => {
      try {
        videoLoading.value = true
        videoError.value = false

        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${videoFileId}?timeSpent=${timeSpent.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('خطا در دریافت ویدیو')
        }

        const blob = await response.blob()
        videoBlobUrl.value = URL.createObjectURL(blob)

      } catch (err) {
        console.error('Error fetching video:', err)
        videoError.value = true
      } finally {
        videoLoading.value = false
      }
    }

    const onVideoLoaded = () => {
      if (videoPlayer.value) {
        videoDuration.value = videoPlayer.value.duration || 0
      }
    }

    const onVideoTimeUpdate = () => {
      if (videoPlayer.value) {
        currentVideoTime.value = videoPlayer.value.currentTime || 0
      }
    }

    const onVideoEnded = () => {
      console.log('Video ended')
    }

    const onVideoError = () => {
      console.error('Video error occurred')
      videoError.value = true
    }

    const retryVideo = async () => {
      if (fileId.value) {
        videoError.value = false
        await fetchVideoBlob(fileId.value)
      }
    }

    const changePlaybackSpeed = () => {
      if (videoPlayer.value) {
        videoPlayer.value.playbackRate = parseFloat(playbackSpeed.value)
      }
    }

    const toggleVideoFullscreen = () => {
      if (videoPlayer.value) {
        if (videoPlayer.value.requestFullscreen) {
          videoPlayer.value.requestFullscreen()
        } else if (videoPlayer.value.webkitRequestFullscreen) {
          videoPlayer.value.webkitRequestFullscreen()
        } else if (videoPlayer.value.mozRequestFullScreen) {
          videoPlayer.value.mozRequestFullScreen()
        }
      }
    }

    // PDF Methods - ورژن تصحیح شده برای حل مشکل private field
    const initializePdfViewer = async () => {
      if (!fileId.value) {
        pdfError.value = 'فایل PDF یافت نشد'
        return
      }

      try {
        pdfLoading.value = true
        pdfError.value = null

        // پاک کردن وضعیت قبلی
        if (pdfRenderTask.value) {
          try {
            pdfRenderTask.value.cancel()
          } catch (e) {
            // Ignore cancel errors
          }
          pdfRenderTask.value = null
        }

        // Import PDF.js با روش جدید و امن‌تر
        const pdfjsLib = await import('pdfjs-dist')

        // تنظیم worker با روش بهتر
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        }

        // دریافت PDF با authentication
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${fileId.value}?timeSpent=${timeSpent.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`خطا در دریافت PDF: ${response.status}`)
        }

        const pdfArrayBuffer = await response.arrayBuffer()

        // بارگذاری PDF document با تنظیمات بهینه
        const loadingTask = pdfjsLib.getDocument({
          data: pdfArrayBuffer,
          verbosity: 0, // کاهش لاگ‌ها
          disableAutoFetch: false,
          disableStream: false
        })

        // Wait for PDF to load
        pdfDocInstance = await loadingTask.promise
        isPdfLoaded.value = true
        totalPages.value = pdfDocInstance.numPages
        currentPage.value = 1

        console.log('PDF loaded successfully, total pages:', totalPages.value)

        // رندر اولیه با تأخیر
        await nextTick()
        if (pdfCanvas.value) {
          setTimeout(async () => {
            await renderPdfPage(1)
            setTimeout(() => {
              fitToWidth()
            }, 200)
          }, 100)
        }

      } catch (err) {
        console.error('Error loading PDF:', err)
        pdfError.value = err.message || 'خطا در بارگذاری PDF'
        isPdfLoaded.value = false
      } finally {
        pdfLoading.value = false
      }
    }

    const renderPdfPage = async (pageNumber) => {
      if (!pdfDocInstance || !pdfCanvas.value) {
        return
      }

      // لغو رندر قبلی در صورت وجود
      if (pdfRenderTask.value) {
        try {
          pdfRenderTask.value.cancel()
        } catch (e) {
          // Ignore cancel errors
        }
        pdfRenderTask.value = null
      }

      try {
        console.log('Rendering page:', pageNumber)

        const page = await pdfDocInstance.getPage(pageNumber)
        const canvas = pdfCanvas.value
        const context = canvas.getContext('2d')

        // پاک کردن canvas قبلی
        context.clearRect(0, 0, canvas.width, canvas.height)

        const viewport = page.getViewport({ scale: pdfScale.value })

        // تنظیم dimensions
        const devicePixelRatio = window.devicePixelRatio || 1
        const canvasWidth = viewport.width * devicePixelRatio
        const canvasHeight = viewport.height * devicePixelRatio

        // تنظیم اندازه canvas
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        canvas.style.width = viewport.width + 'px'
        canvas.style.height = viewport.height + 'px'

        // تنظیم scale برای quality بهتر
        context.scale(devicePixelRatio, devicePixelRatio)

        // رندر PDF page با promise handling بهتر
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        // استفاده از approach جدید برای render
        const renderTask = page.render(renderContext)
        pdfRenderTask.value = renderTask

        // منتظر اتمام render
        await renderTask.promise

        // پاک کردن task پس از اتمام
        pdfRenderTask.value = null
        currentPage.value = pageNumber

        console.log('Page rendered successfully:', pageNumber)

      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err)
          pdfError.value = 'خطا در نمایش صفحه PDF'
        }
        pdfRenderTask.value = null
      }
    }

    const nextPage = async () => {
      if (currentPage.value < totalPages.value && !pdfRenderTask.value && isPdfLoaded.value) {
        await renderPdfPage(currentPage.value + 1)
      }
    }

    const previousPage = async () => {
      if (currentPage.value > 1 && !pdfRenderTask.value && isPdfLoaded.value) {
        await renderPdfPage(currentPage.value - 1)
      }
    }

    const zoomIn = async () => {
      if (pdfRenderTask.value || !isPdfLoaded.value) return

      const newScale = Math.min(pdfScale.value + 0.25, 3.0)
      if (newScale !== pdfScale.value) {
        pdfScale.value = newScale
        await renderPdfPage(currentPage.value)
      }
    }

    const zoomOut = async () => {
      if (pdfRenderTask.value || !isPdfLoaded.value) return

      const newScale = Math.max(pdfScale.value - 0.25, 0.5)
      if (newScale !== pdfScale.value) {
        pdfScale.value = newScale
        await renderPdfPage(currentPage.value)
      }
    }

    const fitToWidth = async () => {
      if (!pdfViewerWrapper.value || !pdfDocInstance || pdfRenderTask.value || !isPdfLoaded.value) {
        return
      }

      try {
        const page = await pdfDocInstance.getPage(currentPage.value)
        const viewport = page.getViewport({ scale: 1.0 })

        // محاسبه عرض container
        const containerRect = pdfViewerWrapper.value.getBoundingClientRect()
        const containerWidth = containerRect.width - 80

        // محاسبه scale
        const scale = containerWidth / viewport.width
        const clampedScale = Math.max(0.5, Math.min(scale, 3.0))

        if (Math.abs(pdfScale.value - clampedScale) > 0.01) {
          pdfScale.value = clampedScale
          await renderPdfPage(currentPage.value)
        }
      } catch (err) {
        console.error('Error fitting to width:', err)
      }
    }

    const retryPdfLoad = () => {
      // Reset all states
      pdfError.value = null
      pdfLoading.value = false
      isPdfLoaded.value = false
      currentPage.value = 1
      totalPages.value = 0
      pdfScale.value = 1.0

      if (pdfRenderTask.value) {
        try {
          pdfRenderTask.value.cancel()
        } catch (e) {
          // Ignore errors
        }
        pdfRenderTask.value = null
      }

      pdfDocInstance = null

      // پاک کردن canvas
      if (pdfCanvas.value) {
        const context = pdfCanvas.value.getContext('2d')
        context.clearRect(0, 0, pdfCanvas.value.width, pdfCanvas.value.height)
      }

      // تلاش مجدد با تأخیر
      setTimeout(() => {
        initializePdfViewer()
      }, 200)
    }

    const handlePdfKeyboard = (event) => {
      // جلوگیری از اجرای commands در حالت loading
      if (pdfRenderTask.value || !isPdfLoaded.value) return

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault()
          nextPage()
          break
        case 'ArrowRight':
          event.preventDefault()
          previousPage()
          break
        case 'Equal':
        case 'NumpadAdd':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            zoomIn()
          }
          break
        case 'Minus':
        case 'NumpadSubtract':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            zoomOut()
          }
          break
        case 'Home':
          event.preventDefault()
          if (currentPage.value !== 1) {
            renderPdfPage(1)
          }
          break
        case 'End':
          event.preventDefault()
          if (currentPage.value !== totalPages.value) {
            renderPdfPage(totalPages.value)
          }
          break
        case 'KeyF':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            fitToWidth()
          }
          break
      }
    }

    const toggleFullscreenPdf = async () => {
      if (!pdfViewerWrapper.value) return

      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
        } else {
          await pdfViewerWrapper.value.requestFullscreen()
          // تنظیم مجدد اندازه پس از fullscreen
          setTimeout(() => {
            if (isPdfLoaded.value) {
              fitToWidth()
            }
          }, 300)
        }
      } catch (err) {
        console.error('Error toggling fullscreen:', err)
      }
    }

    // متد اضافی برای دیباگ
    const debugPdfState = () => {
      console.log('PDF Debug State:', {
        isPdfLoaded: isPdfLoaded.value,
        currentPage: currentPage.value,
        totalPages: totalPages.value,
        pdfScale: pdfScale.value,
        hasRenderTask: !!pdfRenderTask.value,
        hasDocument: !!pdfDocInstance,
        hasCanvas: !!pdfCanvas.value,
        hasWrapper: !!pdfViewerWrapper.value,
        pdfError: pdfError.value,
        pdfLoading: pdfLoading.value
      })
    }

    // General Methods
    const downloadFile = async () => {
      if (!fileId.value) return

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${fileId.value}?timeSpent=${timeSpent.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('خطا در دانلود فایل')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = content.value?.file?.originalFilename || 'file'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

      } catch (err) {
        console.error('Error downloading file:', err)
      }
    }

    // resize handler with debounce
    const handleResize = debounce(() => {
      if (isPdfLoaded.value && pdfCanvas.value) {
        fitToWidth()
      }
    }, 250)

    // Lifecycle
    onMounted(() => {
      fetchContentData()

      // Time tracking
      timeTrackingInterval = setInterval(() => {
        timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
      }, 1000)

      // Add resize listener
      window.addEventListener('resize', handleResize)

      // listener برای تغییر fullscreen
      document.addEventListener('fullscreenchange', () => {
        setTimeout(() => {
          if (isPdfLoaded.value) {
            fitToWidth()
          }
        }, 100)
      })
    })

    onUnmounted(() => {
      // Clear timers
      if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval)
      }

      // Clean up video blob URL
      if (videoBlobUrl.value) {
        URL.revokeObjectURL(videoBlobUrl.value)
      }

      // Clean up PDF
      if (pdfRenderTask.value) {
        try {
          pdfRenderTask.value.cancel()
        } catch (e) {
          // Ignore errors
        }
        pdfRenderTask.value = null
      }

      // Clean up PDF document instance
      if (pdfDocInstance) {
        try {
          pdfDocInstance.destroy()
        } catch (e) {
          // Ignore errors
        }
        pdfDocInstance = null
      }

      // Remove listeners
      window.removeEventListener('resize', handleResize)
    })

    // Watchers
    watch(() => fileId.value, (newFileId) => {
      if (newFileId && content.value?.type === 'PDF') {
        resetPdfViewer()
        initializePdfViewer()
      }
    })

    const resetPdfViewer = () => {
      if (pdfRenderTask.value) {
        pdfRenderTask.value.cancel()
        pdfRenderTask.value = null
      }

      pdfDocInstance = null
      isPdfLoaded.value = false
      pdfLoading.value = false
      pdfError.value = null
      currentPage.value = 1
      totalPages.value = 0
      pdfScale.value = 1.0

      // پاک کردن canvas
      if (pdfCanvas.value) {
        const context = pdfCanvas.value.getContext('2d')
        context.clearRect(0, 0, pdfCanvas.value.width, pdfCanvas.value.height)
      }
    }

    return {
      // State
      loading,
      error,
      content,
      timeSpent,
      isMarkingComplete,
      isCompleted,

      // Video
      videoLoading,
      videoError,
      currentVideoTime,
      videoDuration,
      playbackSpeed,
      videoPlayer,
      videoBlobUrl,
      videoUrl,

      // PDF
      isPdfLoaded,
      pdfLoading,
      pdfError,
      currentPage,
      totalPages,
      pdfScale,
      pdfCanvas,
      pdfViewerWrapper,
      pdfRenderTask,

      // Methods
      fetchContentData,
      markAsComplete,
      goBack,
      fetchVideoBlob,
      formatTime,
      formatFileSize,

      // Video Methods
      onVideoLoaded,
      onVideoTimeUpdate,
      onVideoEnded,
      onVideoError,
      retryVideo,
      changePlaybackSpeed,
      toggleVideoFullscreen,

      // PDF Methods
      initializePdfViewer,
      nextPage,
      previousPage,
      zoomIn,
      zoomOut,
      fitToWidth,
      retryPdfLoad,
      handlePdfKeyboard,
      toggleFullscreenPdf,
      debugPdfState,

      // General Methods
      downloadFile,

      // Computed
      contentId,
      fileId
    }
  }
})
</script>

<style scoped>
/* Base Styles */
.content-viewer {
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-container,
.error-container,
.no-content {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-wrapper {
  padding: 2rem 0;
}

/* Content Header */
.content-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.content-meta {
  color: #6c757d;
  font-size: 0.9rem;
}

.content-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .content-actions {
    margin-top: 0;
  }
}

/* Text Content */
.text-content-section {
  margin-top: 1rem;
}

.content-text {
  padding: 2rem;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

.content-text h1,
.content-text h2,
.content-text h3,
.content-text h4,
.content-text h5,
.content-text h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: #2c3e50;
}

.content-text p {
  margin-bottom: 1.2em;
}

.content-text ul,
.content-text ol {
  margin-bottom: 1.2em;
  padding-right: 2rem;
}

.content-text li {
  margin-bottom: 0.5em;
}

.content-text blockquote {
  border-right: 4px solid #667eea;
  padding-right: 1rem;
  margin: 1.5rem 0;
  color: #555;
  font-style: italic;
}

.content-text pre {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.content-text code {
  background: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.content-text img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.content-text table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.content-text th,
.content-text td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: right;
}

.content-text th {
  background: #f8f9fa;
  font-weight: 600;
}

/* Video Content */
.video-content-section {
  background: white;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: auto;
  max-height: 70vh;
  display: block;
  background: #000;
}

.video-loading-container,
.video-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 3rem 2rem;
}

.video-loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
  margin: 1rem 0;
}

.video-controls {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.time-display {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
  color: #6c757d;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.speed-select {
  width: auto;
  min-width: 100px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* PDF Content - بهبود یافته */
.pdf-content-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.pdf-loading-container,
.pdf-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
  padding: 3rem 2rem;
}

.pdf-loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
  margin: 1rem 0;
}

/* PDF Toolbar - بهبود یافته */
.pdf-toolbar {
  background: rgba(248, 249, 250, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 1rem;
  z-index: 10;
}

.pdf-nav-group,
.zoom-group,
.action-group {
  display: flex;
  gap: 0;
  align-items: center;
}

.pdf-nav-group .modern-btn,
.zoom-group .modern-btn,
.action-group .modern-btn {
  border-radius: 0;
  font-size: 0.875rem;
  padding: 0.6rem 1rem;
  border-left: none;
  transition: all 0.2s ease;
  min-width: auto;
}

.pdf-nav-group .modern-btn:hover,
.zoom-group .modern-btn:hover,
.action-group .modern-btn:hover {
  background-color: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.pdf-nav-group .modern-btn:first-child,
.zoom-group .modern-btn:first-child,
.action-group .modern-btn:first-child {
  border-radius: 8px 0 0 8px;
  border-left: 2px solid rgba(102, 126, 234, 0.2);
}

.pdf-nav-group .modern-btn:last-child,
.zoom-group .modern-btn:last-child,
.action-group .modern-btn:last-child {
  border-radius: 0 8px 8px 0;
  border-left: 2px solid rgba(102, 126, 234, 0.2);
}

.pdf-nav-group span,
.zoom-group span {
  min-width: 120px;
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

/* PDF Viewer Wrapper - بهبود یافته */
.pdf-viewer-wrapper {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 600px;
  max-height: 80vh;
  overflow: auto;
  position: relative;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pdf-viewer-wrapper:focus {
  outline: 3px solid rgba(102, 126, 234, 0.3);
  outline-offset: 2px;
}

/* PDF Canvas Container - بهبود یافته */
.pdf-canvas-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  max-width: 100%;
  position: relative;
}

.pdf-display-canvas {
  display: block;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  box-shadow:
      0 8px 30px rgba(0, 0, 0, 0.12),
      0 4px 15px rgba(0, 0, 0, 0.08);
  background: white;
  max-width: 100%;
  height: auto;
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pdf-display-canvas:hover {
  transform: translateY(-2px);
  box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 6px 20px rgba(0, 0, 0, 0.1);
}

.pdf-display-canvas:active {
  cursor: grabbing;
  transform: translateY(0);
}

.pdf-display-canvas:focus {
  outline: 3px solid rgba(102, 126, 234, 0.5);
  outline-offset: 3px;
}

/* Mobile PDF Navigation - بهبود یافته */
.pdf-mobile-nav {
  position: sticky;
  bottom: 20px;
  z-index: 100;
  margin-top: 1rem;
}

.pdf-mobile-nav .modern-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.pdf-mobile-nav .modern-btn-sm {
  padding: 0.5rem 0.75rem;
  min-width: 40px;
}

/* Fullscreen Styles - بهبود یافته */
.pdf-viewer-wrapper:fullscreen {
  background: #1a1a1a;
  padding: 1rem;
  max-height: none;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-viewer-wrapper:fullscreen .pdf-display-canvas {
  border-color: #444;
  box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.5),
      0 10px 30px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  max-width: 90vw;
}

.pdf-viewer-wrapper:fullscreen .pdf-canvas-container {
  align-items: center;
}

/* Loading Animation */
@keyframes pdfPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

.pdf-loading-container {
  animation: pdfPulse 2s infinite;
}

/* Error State */
.pdf-error-container {
  color: #dc3545;
}

.pdf-error-container .modern-alert {
  max-width: 400px;
  margin: 0 auto;
}

/* Animation for page transitions */
.pdf-canvas-container.changing-page {
  opacity: 0.7;
  transform: scale(0.98);
}

/* Unknown Content */
.unknown-content-section {
  background: white;
}

.unknown-content-area {
  padding: 4rem 2rem;
  text-align: center;
}

.unknown-content-area h5 {
  color: #2c3e50;
  font-weight: 600;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .content-viewer {
    background: #1a202c;
  }

  .content-header,
  .text-content-section .modern-card,
  .video-content-section .modern-card,
  .pdf-content-section .modern-card,
  .unknown-content-section .modern-card {
    background: #2d3748;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .content-title {
    color: #e2e8f0;
  }

  .content-meta {
    color: #a0aec0;
  }

  .content-text {
    color: #e2e8f0;
  }

  .content-text h1,
  .content-text h2,
  .content-text h3,
  .content-text h4,
  .content-text h5,
  .content-text h6 {
    color: #e2e8f0;
  }

  .video-controls {
    background: rgba(45, 55, 72, 0.8);
  }

  .time-display {
    color: #cbd5e0;
  }

  .pdf-toolbar {
    background: rgba(45, 55, 72, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .pdf-nav-group span,
  .zoom-group span {
    color: #e2e8f0;
  }

  .pdf-viewer-wrapper {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }

  .pdf-display-canvas {
    border-color: #4a5568;
    box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.3),
        0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .pdf-mobile-nav .modern-card {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Responsive Design - بهبود یافته */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem 0;
  }

  .content-header {
    padding: 1rem;
  }

  .content-title {
    font-size: 1.5rem;
  }

  .content-actions {
    flex-direction: column;
  }

  .pdf-toolbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    position: static;
  }

  .pdf-toolbar > div {
    justify-content: center;
    width: 100%;
  }

  .pdf-nav-group,
  .zoom-group,
  .action-group {
    width: 100%;
    justify-content: center;
  }

  .pdf-viewer-wrapper {
    padding: 1rem;
    min-height: 400px;
    max-height: 60vh;
  }

  .pdf-display-canvas {
    max-width: calc(100vw - 2rem);
  }

  .pdf-mobile-nav {
    bottom: 10px;
  }

  .video-controls .d-flex {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .speed-control {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pdf-toolbar {
    padding: 0.75rem;
  }

  .pdf-nav-group .modern-btn,
  .zoom-group .modern-btn,
  .action-group .modern-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .pdf-nav-group span,
  .zoom-group span {
    min-width: 100px;
    font-size: 0.85rem;
  }

  .pdf-viewer-wrapper {
    padding: 0.5rem;
    border-radius: 8px;
  }
}

/* Accessibility Improvements */
.pdf-toolbar button:focus,
.pdf-mobile-nav button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  z-index: 1;
}

.pdf-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Custom Scrollbar for PDF Viewer */
.pdf-viewer-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.pdf-viewer-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.pdf-viewer-wrapper::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
}

.pdf-viewer-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* Print Styles */
@media print {
  .pdf-toolbar,
  .pdf-mobile-nav {
    display: none !important;
  }

  .pdf-viewer-wrapper {
    background: white !important;
    box-shadow: none !important;
    padding: 0 !important;
    max-height: none !important;
    overflow: visible !important;
  }

  .pdf-display-canvas {
    border: none !important;
    box-shadow: none !important;
    max-width: 100% !important;
    page-break-inside: avoid;
  }
}

/* Animation */
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* High DPI Support */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .pdf-display-canvas {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
</style>