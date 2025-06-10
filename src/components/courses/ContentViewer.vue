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
                  {{ isCompleted ? 'تکمیل شده' : 'علامت‌گذاری به عنوان تکمیل شده' }}
                </button>
                <button @click="goBack" class="modern-btn modern-btn-secondary ms-2">
                  <i class="fas fa-arrow-right"></i>
                  بازگشت
                </button>
              </div>
            </div>
          </div>

          <!-- Text Content -->
          <div v-if="content.type === 'TEXT'" class="text-content-section">
            <div class="modern-card">
              <div class="content-text" v-html="content.textContent"></div>
            </div>
          </div>

          <!-- Video Content -->
          <div v-else-if="content.type === 'VIDEO'" class="video-content-section">
            <div class="modern-card">

              <!-- Video Loading -->
              <div v-if="videoLoading" class="video-loading-container">
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
                    :src="videoUrl"
                    class="video-player"
                    controls
                    controlsList="nodownload"
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
            <div class="modern-card">

              <!-- PDF Loading -->
              <div v-if="pdfLoading" class="pdf-loading-container">
                <div class="modern-logo info">
                  <i class="fas fa-file-pdf"></i>
                </div>
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3 mb-0">در حال بارگذاری PDF...</p>
              </div>

              <!-- PDF Error -->
              <div v-else-if="pdfError" class="pdf-error-container">
                <div class="modern-alert modern-alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ pdfError }}
                  <button @click="retryPdfLoad" class="modern-btn modern-btn-outline-danger mt-2">
                    تلاش مجدد
                  </button>
                </div>
              </div>

              <!-- PDF Viewer -->
              <div v-else>
                <!-- PDF Toolbar -->
                <div class="pdf-toolbar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                  <div class="pdf-nav-group">
                    <button @click="previousPage" :disabled="currentPage <= 1" class="modern-btn modern-btn-outline">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                    <span class="px-3 py-2 bg-light rounded">
                      صفحه {{ currentPage }} از {{ totalPages }}
                    </span>
                    <button @click="nextPage" :disabled="currentPage >= totalPages" class="modern-btn modern-btn-outline">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </div>

                  <div class="zoom-group">
                    <button @click="zoomOut" class="modern-btn modern-btn-outline">
                      <i class="fas fa-search-minus"></i>
                    </button>
                    <span class="px-3 py-2 bg-light rounded">
                      {{ Math.round(pdfScale * 100) }}%
                    </span>
                    <button @click="zoomIn" class="modern-btn modern-btn-outline">
                      <i class="fas fa-search-plus"></i>
                    </button>
                  </div>

                  <div class="action-group">
                    <button @click="fitToWidth" class="modern-btn modern-btn-outline">
                      <i class="fas fa-arrows-alt-h"></i>
                      تنظیم عرض
                    </button>
                    <button @click="toggleFullscreenPdf" class="modern-btn modern-btn-outline">
                      <i class="fas fa-expand"></i>
                      تمام صفحه
                    </button>
                  </div>
                </div>

                <!-- PDF Viewer -->
                <div
                    ref="pdfViewerWrapper"
                    class="pdf-viewer-wrapper"
                    @keydown="handlePdfKeyboard"
                    tabindex="0"
                >
                  <div class="pdf-canvas-container">
                    <canvas ref="pdfCanvas" class="pdf-display-canvas"></canvas>
                  </div>
                </div>

                <!-- Mobile PDF Navigation -->
                <div class="pdf-mobile-nav d-md-none">
                  <div class="modern-card text-center">
                    <div class="d-flex justify-content-center align-items-center gap-3">
                      <button @click="previousPage" :disabled="currentPage <= 1" class="modern-btn modern-btn-sm modern-btn-outline">
                        <i class="fas fa-chevron-right"></i>
                      </button>
                      <span class="fw-semibold">{{ currentPage }} / {{ totalPages }}</span>
                      <button @click="nextPage" :disabled="currentPage >= totalPages" class="modern-btn modern-btn-sm modern-btn-outline">
                        <i class="fas fa-chevron-left"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Unknown Content Type -->
          <div v-else class="unknown-content-section">
            <div class="modern-card">
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
      // اگر blob URL موجود است، از آن استفاده کن
      if (videoBlobUrl.value) {
        return videoBlobUrl.value
      }
      return null
    })

    // اضافه کردن متد برای دریافت ویدیو با authentication
    const fetchVideoBlob = async (fileId) => {
      try {
        videoLoading.value = true
        videoError.value = false

        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${fileId}?timeSpent=${timeSpent.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`خطا در دریافت ویدیو: ${response.status}`)
        }

        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        videoBlobUrl.value = blobUrl

      } catch (err) {
        console.error('Error fetching video blob:', err)
        videoError.value = true
      } finally {
        videoLoading.value = false
      }
    }

    // Methods
    const fetchContentData = async () => {
      if (!contentId.value) {
        error.value = 'شناسه محتوا مشخص نشده است'
        loading.value = false
        return
      }

      try {
        loading.value = true
        error.value = null

        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/${contentId.value}?timeSpent=${timeSpent.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`خطا در دریافت محتوا: ${response.status}`)
        }

        content.value = await response.json()

        // Mark as viewed
        await markContentViewed()

        // اگر محتوا ویدیو است، blob URL را دریافت کن
        if (content.value?.type === 'VIDEO' && fileId.value) {
          await fetchVideoBlob(fileId.value)
        }

      } catch (err) {
        console.error('Error fetching content:', err)
        error.value = err.message || 'خطا در بارگذاری محتوا'
      } finally {
        loading.value = false
      }

      // Initialize PDF after content is loaded and DOM is ready
      if (content.value?.type === 'PDF') {
        await nextTick()  // صبر کن تا DOM با محتوای جدید آپدیت بشه
        await initializePdfViewer()
      }
    }

    const markContentViewed = async () => {
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

    // Video Methods
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

    // PDF Methods
    const initializePdfViewer = async () => {
      if (!fileId.value) {
        pdfError.value = 'فایل PDF یافت نشد'
        return
      }

      try {
        pdfLoading.value = true
        pdfError.value = null

        // Import PDF.js
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')

        // Set worker
        const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.entry')
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default

        // Fetch PDF with authentication
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

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({
          data: pdfArrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
          cMapPacked: true,
        })

        pdfDocInstance = await loadingTask.promise
        isPdfLoaded.value = true
        totalPages.value = pdfDocInstance.numPages
        currentPage.value = 1

        console.log('PDF loaded successfully, total pages:', totalPages.value)

        // Initial render
        await nextTick()
        if (pdfCanvas.value) {
          await renderPdfPage(1)
          fitToWidth()
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
      if (!pdfDocInstance || !pdfCanvas.value || pdfRenderTask.value) {
        return
      }

      try {
        console.log('Rendering page:', pageNumber)

        const page = await pdfDocInstance.getPage(pageNumber)
        const canvas = pdfCanvas.value
        const context = canvas.getContext('2d')

        const viewport = page.getViewport({ scale: pdfScale.value })

        // Set canvas dimensions
        canvas.height = viewport.height
        canvas.width = viewport.width
        canvas.style.height = viewport.height + 'px'
        canvas.style.width = viewport.width + 'px'

        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        pdfRenderTask.value = page.render(renderContext)
        await pdfRenderTask.value.promise

        pdfRenderTask.value = null
        currentPage.value = pageNumber

        console.log('Page rendered successfully:', pageNumber)

      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err)
        }
        pdfRenderTask.value = null
      }
    }

    const nextPage = async () => {
      if (currentPage.value < totalPages.value) {
        await renderPdfPage(currentPage.value + 1)
      }
    }

    const previousPage = async () => {
      if (currentPage.value > 1) {
        await renderPdfPage(currentPage.value - 1)
      }
    }

    const zoomIn = async () => {
      pdfScale.value = Math.min(pdfScale.value + 0.25, 3.0)
      await renderPdfPage(currentPage.value)
    }

    const zoomOut = async () => {
      pdfScale.value = Math.max(pdfScale.value - 0.25, 0.5)
      await renderPdfPage(currentPage.value)
    }

    const fitToWidth = async () => {
      if (!pdfViewerWrapper.value || !pdfDocInstance) {
        return
      }

      try {
        const page = await pdfDocInstance.getPage(currentPage.value)
        const viewport = page.getViewport({ scale: 1.0 })
        const containerWidth = pdfViewerWrapper.value.clientWidth - 40 // padding

        const scale = containerWidth / viewport.width
        pdfScale.value = Math.max(0.5, Math.min(scale, 3.0))

        await renderPdfPage(currentPage.value)
      } catch (err) {
        console.error('Error fitting to width:', err)
      }
    }

    const retryPdfLoad = () => {
      initializePdfViewer()
    }

    const handlePdfKeyboard = (event) => {
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
          if (event.ctrlKey) {
            event.preventDefault()
            zoomIn()
          }
          break
        case 'Minus':
        case 'NumpadSubtract':
          if (event.ctrlKey) {
            event.preventDefault()
            zoomOut()
          }
          break
      }
    }

    const toggleFullscreenPdf = () => {
      if (!pdfViewerWrapper.value) return

      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        pdfViewerWrapper.value.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err)
        })
      }
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
        alert('خطا در دانلود فایل')
      }
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const goBack = () => {
      router.back()
    }

    // Track time spent
    const startTimeTracking = () => {
      timeTrackingInterval = setInterval(() => {
        timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
      }, 1000)
    }

    // Watch for PDF readiness
    watch(() => [content.value?.type, pdfLoading.value], async ([type, loading]) => {
      if (type === 'PDF' && !loading && isPdfLoaded.value && !currentPage.value) {
        console.log('PDF is ready, attempting first render')
        await nextTick()
        if (pdfCanvas.value) {
          await renderPdfPage(1)
          fitToWidth()
        }
      }
    })

    // Lifecycle
    onMounted(() => {
      fetchContentData()
      startTimeTracking()
    })

    onUnmounted(() => {
      // Stop time tracking
      if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval)
      }

      // Clean up video blob URL
      if (videoBlobUrl.value) {
        URL.revokeObjectURL(videoBlobUrl.value)
        videoBlobUrl.value = null
      }

      // Clean up PDF
      if (pdfDocInstance) {
        try {
          pdfDocInstance.destroy()
          pdfDocInstance = null
          isPdfLoaded.value = false
        } catch (err) {
          console.error('Error destroying PDF:', err)
        }
      }

      // Cancel any ongoing render task
      if (pdfRenderTask.value) {
        try {
          pdfRenderTask.value.cancel()
        } catch (e) {
          // Ignore cancellation errors
        }
      }

      // Send final time spent
      if (contentId.value && timeSpent.value > 0) {
        const token = localStorage.getItem('token')
        navigator.sendBeacon(
            `/api/progress/content/${contentId.value}/time?timeSpent=${timeSpent.value}`,
            new Blob([JSON.stringify({ timeSpent: timeSpent.value })], { type: 'application/json' })
        )
      }
    })

    // Return all reactive properties and methods
    return {
      // State
      loading,
      error,
      content,
      timeSpent,
      isMarkingComplete,
      isCompleted,

      // Video
      videoError,
      videoLoading,
      currentVideoTime,
      videoDuration,
      playbackSpeed,
      videoPlayer,
      videoBlobUrl,
      videoUrl,

      // PDF
      pdfLoading,
      pdfError,
      currentPage,
      totalPages,
      pdfScale,
      pdfCanvas,
      pdfViewerWrapper,

      // Methods
      fetchContentData,
      markAsComplete,
      goBack,
      fetchVideoBlob,

      // Video Methods
      onVideoLoaded,
      onVideoTimeUpdate,
      onVideoEnded,
      onVideoError,
      retryVideo,
      changePlaybackSpeed,
      toggleVideoFullscreen,

      // PDF Methods
      nextPage,
      previousPage,
      zoomIn,
      zoomOut,
      fitToWidth,
      retryPdfLoad,
      handlePdfKeyboard,
      toggleFullscreenPdf,

      // General Methods
      downloadFile,
      formatTime,

      // Computed
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

/* PDF Content */
.pdf-content-section {
  background: white;
}

.pdf-loading-container,
.pdf-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 3rem 2rem;
}

.pdf-loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
  margin: 1rem 0;
}

.pdf-toolbar {
  background: rgba(248, 249, 250, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.pdf-nav-group,
.zoom-group,
.action-group {
  display: flex;
  gap: 0;
}

.pdf-nav-group .modern-btn,
.zoom-group .modern-btn,
.action-group .modern-btn {
  border-radius: 0;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-right: none;
}

.pdf-nav-group .modern-btn:first-child,
.zoom-group .modern-btn:first-child,
.action-group .modern-btn:first-child {
  border-radius: 8px 0 0 8px;
  border-right: 2px solid rgba(102, 126, 234, 0.84);
}

.pdf-nav-group .modern-btn:last-child,
.zoom-group .modern-btn:last-child,
.action-group .modern-btn:last-child {
  border-radius: 0 8px 8px 0;
  border-right: 2px solid rgba(102, 126, 234, 0.84);
}

.pdf-viewer-wrapper {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 600px;
  overflow: auto;
  position: relative;
}

.pdf-canvas-container {
  transition: transform 0.3s ease;
  display: flex;
  justify-content: center;
  max-width: 100%;
}

.pdf-display-canvas {
  display: block;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
  max-width: 100%;
  height: auto;
  cursor: grab;
}

.pdf-display-canvas:active {
  cursor: grabbing;
}

.pdf-display-canvas:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.pdf-mobile-nav {
  position: sticky;
  bottom: 20px;
  z-index: 100;
}

.pdf-mobile-nav .modern-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
}

/* Fullscreen */
.pdf-viewer-wrapper:fullscreen {
  background: #2c3e50;
  padding: 1rem;
}

.pdf-viewer-wrapper:fullscreen .pdf-display-canvas {
  border-color: #34495e;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
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
    background: rgba(45, 55, 72, 0.9);
  }

  .pdf-viewer-wrapper {
    background: #2d3748;
  }
}

/* Responsive */
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
  }

  .pdf-toolbar > div {
    justify-content: center;
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
</style>