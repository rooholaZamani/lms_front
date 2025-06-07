<template>
  <div class="content-viewer modern-page-bg">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="modern-container">
        <div class="modern-header text-center">
          <div class="modern-logo info">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <h1 class="modern-title">در حال بارگذاری...</h1>
          <p class="modern-subtitle">لطفاً منتظر بمانید</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="modern-container">
        <div class="modern-header text-center">
          <div class="modern-logo danger">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h1 class="modern-title">خطا در بارگذاری</h1>
          <p class="modern-subtitle">{{ error }}</p>
          <div class="mt-4">
            <button @click="fetchContentData" class="modern-btn modern-btn-primary">
              <i class="fas fa-redo"></i>
              تلاش مجدد
            </button>
            <button @click="goBack" class="modern-btn modern-btn-secondary ms-2">
              <i class="fas fa-arrow-right"></i>
              بازگشت
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Content -->
    <div v-else-if="!content" class="no-content">
      <div class="modern-container">
        <div class="modern-header text-center">
          <div class="modern-logo secondary">
            <i class="fas fa-file-times"></i>
          </div>
          <h1 class="modern-title">محتوایی یافت نشد</h1>
          <p class="modern-subtitle">محتوای درخواستی موجود نیست</p>
          <button @click="goBack" class="modern-btn modern-btn-secondary mt-3">
            <i class="fas fa-arrow-right"></i>
            بازگشت
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="content-container">
      <div class="modern-container large animate-slide-up">

        <!-- Content Header -->
        <div class="content-header modern-card mb-4">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div class="content-info flex-grow-1">
              <h1 class="content-title">{{ content.title }}</h1>
              <div class="content-meta">
                <span class="content-type-badge" :class="getContentTypeClass(content.type)">
                  <i :class="getContentTypeIcon(content.type)"></i>
                  {{ getContentTypeLabel(content.type) }}
                </span>
                <span class="time-badge">
                  <i class="fas fa-clock"></i>
                  زمان مطالعه: {{ formatTime(timeSpent) }}
                </span>
                <span v-if="content.lesson" class="lesson-badge">
                  <i class="fas fa-book"></i>
                  {{ content.lesson.title }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="content-actions">
              <button
                  @click="markAsComplete"
                  :disabled="isMarkingComplete"
                  class="modern-btn modern-btn-success"
                  v-if="!isCompleted"
              >
                <i class="fas fa-check" v-if="!isMarkingComplete"></i>
                <i class="fas fa-spinner fa-spin" v-else></i>
                تکمیل شد
              </button>
              <span v-else class="modern-badge modern-badge-success">
                <i class="fas fa-check-circle"></i>
                تکمیل شده
              </span>
              <button @click="goBack" class="modern-btn modern-btn-secondary">
                <i class="fas fa-arrow-right"></i>
                بازگشت
              </button>
            </div>
          </div>
        </div>

        <!-- Content Body -->
        <div class="content-body">

          <!-- TEXT Content -->
          <div v-if="content.type === 'TEXT'" class="text-content-section">
            <div class="modern-card">
              <div class="text-content-area">
                <div class="content-text" v-html="formatTextContent(content.textContent)"></div>
              </div>
            </div>
          </div>

          <!-- VIDEO Content -->
          <div v-else-if="content.type === 'VIDEO'" class="video-content-section">
            <div class="modern-card">
              <div class="video-container">
                <video
                    ref="videoPlayer"
                    :src="videoUrl"
                    controls
                    preload="metadata"
                    @loadedmetadata="onVideoLoaded"
                    @timeupdate="onVideoTimeUpdate"
                    @ended="onVideoEnded"
                    @error="onVideoError"
                    class="video-player"
                >
                  مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                </video>

                <!-- Video Error State -->
                <div v-if="videoError" class="video-error">
                  <i class="fas fa-exclamation-triangle"></i>
                  <p>خطا در بارگذاری ویدیو</p>
                  <button @click="retryVideo" class="modern-btn modern-btn-outline">
                    تلاش مجدد
                  </button>
                </div>
              </div>

              <!-- Video Controls -->
              <div class="video-controls mt-3">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div class="playback-info">
                    <span class="time-display">
                      {{ formatVideoTime(currentVideoTime) }} / {{ formatVideoTime(videoDuration) }}
                    </span>
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
                        title="تمام صفحه"
                    >
                      <i class="fas fa-expand"></i>
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
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">بارگذاری PDF...</span>
                </div>
                <p class="mt-3">در حال بارگذاری فایل PDF...</p>
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
              <div v-else class="pdf-container">

                <!-- PDF Controls -->
                <div class="pdf-toolbar mb-3">
                  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">

                    <!-- Page Navigation -->
                    <div class="btn-group pdf-nav-group">
                      <button
                          @click="previousPage"
                          :disabled="currentPage <= 1"
                          class="modern-btn modern-btn-outline"
                      >
                        <i class="fas fa-chevron-right"></i>
                        قبلی
                      </button>
                      <span class="modern-btn modern-btn-outline disabled">
                        {{ currentPage }} / {{ totalPages }}
                      </span>
                      <button
                          @click="nextPage"
                          :disabled="currentPage >= totalPages"
                          class="modern-btn modern-btn-outline"
                      >
                        بعدی
                        <i class="fas fa-chevron-left"></i>
                      </button>
                    </div>

                    <!-- Zoom Controls -->
                    <div class="btn-group zoom-group">
                      <button @click="zoomOut" class="modern-btn modern-btn-outline">
                        <i class="fas fa-search-minus"></i>
                      </button>
                      <span class="modern-btn modern-btn-outline disabled">
                        {{ Math.round(pdfScale * 100) }}%
                      </span>
                      <button @click="zoomIn" class="modern-btn modern-btn-outline">
                        <i class="fas fa-search-plus"></i>
                      </button>
                      <button @click="fitToWidth" class="modern-btn modern-btn-outline">
                        <i class="fas fa-arrows-alt-h"></i>
                        تنظیم عرض
                      </button>
                    </div>

                    <!-- Actions -->
                    <div class="btn-group action-group">
                      <button @click="downloadPdf" class="modern-btn modern-btn-primary">
                        <i class="fas fa-download"></i>
                        دانلود
                      </button>
                      <button @click="togglePdfFullscreen" class="modern-btn modern-btn-outline">
                        <i class="fas fa-expand"></i>
                        تمام صفحه
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PDF Canvas -->
                <div class="pdf-viewer-wrapper" ref="pdfViewerWrapper">
                  <div
                      class="pdf-canvas-container"
                      :style="{ transform: `scale(${pdfScale})`, transformOrigin: 'top center' }"
                  >
                    <canvas
                        ref="pdfCanvas"
                        class="pdf-display-canvas"
                        @wheel="handlePdfZoom"
                        tabindex="0"
                    ></canvas>
                  </div>
                </div>

                <!-- Mobile Navigation -->
                <div class="pdf-mobile-nav d-md-none mt-3">
                  <div class="modern-card">
                    <div class="row text-center">
                      <div class="col-4">
                        <button
                            @click="previousPage"
                            :disabled="currentPage <= 1"
                            class="modern-btn modern-btn-outline w-100"
                        >
                          <i class="fas fa-chevron-right"></i>
                        </button>
                      </div>
                      <div class="col-4 d-flex align-items-center justify-content-center">
                        <span class="modern-badge modern-badge-primary">
                          {{ currentPage }}/{{ totalPages }}
                        </span>
                      </div>
                      <div class="col-4">
                        <button
                            @click="nextPage"
                            :disabled="currentPage >= totalPages"
                            class="modern-btn modern-btn-outline w-100"
                        >
                          <i class="fas fa-chevron-left"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Unknown Content Type -->
          <div v-else class="unknown-content-section">
            <div class="modern-card">
              <div class="unknown-content-area text-center">
                <div class="unknown-content-icon">
                  <i class="fas fa-question-circle"></i>
                </div>
                <h5>نوع محتوای ناشناخته</h5>
                <p class="text-muted">
                  نوع محتوای "{{ content.type }}" پشتیبانی نمی‌شود.
                </p>
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
    const videoError = ref(false)
    const currentVideoTime = ref(0)
    const videoDuration = ref(0)
    const playbackSpeed = ref(1)

    // PDF state
    const pdfDoc = ref(null)
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
    let timeTracker = null

    // Computed
    const contentId = computed(() => route.params.contentId)

    const fileId = computed(() => {
      return content.value?.fileId || content.value?.file?.id
    })

    const videoUrl = computed(() => {
      if (content.value?.type === 'VIDEO' && fileId.value) {
        return `/api/content/files/${fileId.value}`
      }
      return null
    })

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

        // Initialize based on content type
        if (content.value.type === 'PDF') {
          await initializePdfViewer()
        }

      } catch (err) {
        console.error('Error fetching content:', err)
        error.value = err.message || 'خطا در بارگذاری محتوا'
      } finally {
        loading.value = false
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
        console.error('Error marking content complete:', err)
      } finally {
        isMarkingComplete.value = false
      }
    }

    // Video Methods
    const onVideoLoaded = () => {
      videoError.value = false
      if (videoPlayer.value) {
        videoDuration.value = videoPlayer.value.duration
      }
    }

    const onVideoTimeUpdate = () => {
      if (videoPlayer.value) {
        currentVideoTime.value = videoPlayer.value.currentTime
      }
    }

    const onVideoEnded = () => {
      // Auto mark as complete when video ends
      if (!isCompleted.value) {
        markAsComplete()
      }
    }

    const onVideoError = () => {
      videoError.value = true
    }

    const retryVideo = () => {
      videoError.value = false
      if (videoPlayer.value) {
        videoPlayer.value.load()
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
        }
      }
    }

    // PDF Methods
    const initializePdfViewer = async () => {
      if (content.value?.type !== 'PDF') return

      pdfLoading.value = true
      pdfError.value = null

      try {
        await loadPdfWithPdfJs()
      } catch (err) {
        console.error('PDF initialization failed:', err)
        pdfError.value = err.message || 'خطا در بارگذاری PDF'
        pdfLoading.value = false
      }
    }

    const loadPdfWithPdfJs = async () => {
      try {
        if (!fileId.value) {
          throw new Error('شناسه فایل PDF موجود نیست')
        }

        // Import PDF.js
        const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'


        // Fetch PDF
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${fileId.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`خطا در دریافت فایل: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        // Load PDF
        pdfDoc.value = await pdfjsLib.getDocument(arrayBuffer).promise
        totalPages.value = pdfDoc.value.numPages

        // Render first page
        await renderPdfPage(1)

        pdfLoading.value = false

        // Auto fit
        nextTick(() => {
          fitToWidth()
        })

      } catch (err) {
        throw new Error(err.message || 'خطا در بارگذاری PDF')
      }
    }

    const renderPdfPage = async (pageNum) => {
      if (!pdfDoc.value || pageNum < 1 || pageNum > totalPages.value) {
        return
      }

      try {
        // Cancel previous render
        if (pdfRenderTask.value) {
          pdfRenderTask.value.cancel()
        }

        const page = await pdfDoc.value.getPage(pageNum)
        const canvas = pdfCanvas.value

        if (!canvas) return

        const context = canvas.getContext('2d')
        const viewport = page.getViewport({ scale: 1.0 })

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        pdfRenderTask.value = page.render(renderContext)
        await pdfRenderTask.value.promise

        currentPage.value = pageNum

      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err)
          pdfError.value = 'خطا در نمایش صفحه PDF'
        }
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

    const zoomIn = () => {
      pdfScale.value = Math.min(pdfScale.value * 1.25, 3.0)
    }

    const zoomOut = () => {
      pdfScale.value = Math.max(pdfScale.value / 1.25, 0.25)
    }

    const fitToWidth = () => {
      nextTick(() => {
        const wrapper = pdfViewerWrapper.value
        const canvas = pdfCanvas.value

        if (wrapper && canvas) {
          const wrapperWidth = wrapper.clientWidth - 40
          const canvasWidth = canvas.width

          if (canvasWidth > 0) {
            pdfScale.value = wrapperWidth / canvasWidth
          }
        }
      })
    }

    const handlePdfZoom = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()

        if (event.deltaY < 0) {
          zoomIn()
        } else {
          zoomOut()
        }
      }
    }

    const downloadPdf = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${fileId.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('خطا در دانلود فایل')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = content.value.title || 'document.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

      } catch (err) {
        console.error('Download error:', err)
      }
    }

    const togglePdfFullscreen = () => {
      const wrapper = pdfViewerWrapper.value
      if (!wrapper) return

      if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(err => {
          console.error('Fullscreen error:', err)
        })
      } else {
        document.exitFullscreen()
      }
    }

    const retryPdfLoad = () => {
      pdfError.value = null
      initializePdfViewer()
    }

    // Utility Methods
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatVideoTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatTextContent = (text) => {
      if (!text) return ''
      return text.replace(/\n/g, '<br>')
    }

    const getContentTypeLabel = (type) => {
      const labels = {
        'TEXT': 'محتوای متنی',
        'VIDEO': 'ویدیو',
        'PDF': 'فایل PDF'
      }
      return labels[type] || type
    }

    const getContentTypeIcon = (type) => {
      const icons = {
        'TEXT': 'fas fa-file-text',
        'VIDEO': 'fas fa-play-circle',
        'PDF': 'fas fa-file-pdf'
      }
      return icons[type] || 'fas fa-file'
    }

    const getContentTypeClass = (type) => {
      const classes = {
        'TEXT': 'modern-badge-info',
        'VIDEO': 'modern-badge-success',
        'PDF': 'modern-badge-danger'
      }
      return classes[type] || 'modern-badge-secondary'
    }

    const downloadFile = async () => {
      if (!fileId.value) return

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${fileId.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('خطا در دانلود فایل')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = content.value.title || 'file'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

      } catch (err) {
        console.error('Download error:', err)
      }
    }

    const goBack = () => {
      sendTimeData()
      router.back()
    }

    const sendTimeData = async () => {
      if (timeSpent.value > 0 && contentId.value) {
        try {
          const token = localStorage.getItem('token')
          await fetch(`/api/content/${contentId.value}?timeSpent=${timeSpent.value}`, {
            headers: {
              'Authorization': `Basic ${token}`
            }
          })
        } catch (err) {
          console.error('Error sending time data:', err)
        }
      }
    }

    // Event Handlers
    const handleKeydown = (event) => {
      if (content.value?.type !== 'PDF') return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          nextPage()
          break
        case 'ArrowRight':
          event.preventDefault()
          previousPage()
          break
        case 'PageDown':
        case ' ':
          event.preventDefault()
          nextPage()
          break
        case 'PageUp':
          event.preventDefault()
          previousPage()
          break
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            zoomIn()
          }
          break
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            zoomOut()
          }
          break
      }
    }

    const handleResize = () => {
      if (content.value?.type === 'PDF' && pdfDoc.value) {
        fitToWidth()
      }
    }

    // Time tracking
    const startTimer = () => {
      timeTracker = setInterval(() => {
        timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
      }, 1000)
    }

    const stopTimer = () => {
      if (timeTracker) {
        clearInterval(timeTracker)
        timeTracker = null
      }
    }

    // Lifecycle
    onMounted(() => {
      fetchContentData()
      startTimer()

      // Event listeners
      window.addEventListener('keydown', handleKeydown)
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      stopTimer()
      sendTimeData()

      // Cleanup
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('resize', handleResize)

      if (pdfRenderTask.value) {
        pdfRenderTask.value.cancel()
      }
    })

    // Watchers
    watch(() => route.params.contentId, () => {
      if (route.params.contentId !== contentId.value) {
        fetchContentData()
      }
    })

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
      currentVideoTime,
      videoDuration,
      playbackSpeed,
      videoUrl,

      // PDF
      pdfLoading,
      pdfError,
      currentPage,
      totalPages,
      pdfScale,

      // Refs
      videoPlayer,
      pdfCanvas,
      pdfViewerWrapper,

      // Computed
      fileId,

      // Methods
      fetchContentData,
      markAsComplete,
      goBack,

      // Video methods
      onVideoLoaded,
      onVideoTimeUpdate,
      onVideoEnded,
      onVideoError,
      retryVideo,
      changePlaybackSpeed,
      toggleVideoFullscreen,

      // PDF methods
      nextPage,
      previousPage,
      zoomIn,
      zoomOut,
      fitToWidth,
      handlePdfZoom,
      downloadPdf,
      togglePdfFullscreen,
      retryPdfLoad,

      // Utility
      formatTime,
      formatVideoTime,
      formatTextContent,
      getContentTypeLabel,
      getContentTypeIcon,
      getContentTypeClass,
      downloadFile
    }
  }
})
</script>

<style scoped>
/* Base Styles */
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
  min-height: 80vh;
}

.content-container {
  max-width: 100%;
}

/* Content Header */
.content-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.content-title {
  color: #333;
  font-weight: 700;
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  line-height: 1.3;
}

.content-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.content-type-badge,
.time-badge,
.lesson-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.content-type-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.time-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.lesson-badge {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.content-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* Content Body */
.content-body {
  border-radius: 16px;
  overflow: hidden;
}

/* TEXT Content */
.text-content-section {
  background: white;
}

.text-content-area {
  padding: 3rem;
}

.content-text {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
  max-width: none;
}

.content-text h1,
.content-text h2,
.content-text h3,
.content-text h4,
.content-text h5,
.content-text h6 {
  color: #2c3e50;
  margin: 2rem 0 1rem 0;
}

.content-text p {
  margin-bottom: 1.5rem;
}

.content-text ul,
.content-text ol {
  margin: 1.5rem 0;
  padding-right: 2rem;
}

/* VIDEO Content */
.video-content-section {
  background: white;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: auto;
  min-height: 400px;
  max-height: 70vh;
}

.video-error {
  text-align: center;
  color: #6c757d;
  padding: 3rem 2rem;
}

.video-error i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.video-controls {
  padding: 1.5rem 2rem;
  background: rgba(248, 249, 250, 0.7);
  backdrop-filter: blur(10px);
}

.playback-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-display {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
}

.playback-controls {
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

/* Responsive Design */
@media (max-width: 768px) {
  .content-viewer {
    padding: 1rem 0.5rem;
  }

  .content-header {
    padding: 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }

  .content-info {
    margin-bottom: 1.5rem;
  }

  .content-title {
    font-size: 1.5rem;
  }

  .content-meta {
    justify-content: center;
  }

  .content-actions {
    justify-content: center;
    width: 100%;
  }

  .text-content-area {
    padding: 2rem;
  }

  .content-text {
    font-size: 1rem;
  }

  .video-container {
    min-height: 250px;
  }

  .video-controls {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .playback-controls {
    justify-content: center;
  }

  .pdf-toolbar {
    padding: 1rem;
  }

  .pdf-toolbar .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .pdf-nav-group,
  .zoom-group,
  .action-group {
    justify-content: center;
    width: 100%;
  }

  .pdf-nav-group .modern-btn,
  .zoom-group .modern-btn,
  .action-group .modern-btn {
    flex: 1;
    border-radius: 8px !important;
    border-right: 2px solid rgba(102, 126, 234, 0.84) !important;
    margin: 0 2px;
  }

  .pdf-viewer-wrapper {
    padding: 1rem;
    min-height: 400px;
  }

  .pdf-display-canvas {
    max-width: calc(100vw - 2rem);
  }

  .unknown-content-area {
    padding: 3rem 1.5rem;
  }

  .unknown-content-icon {
    font-size: 3rem;
  }
}

@media (max-width: 576px) {
  .content-title {
    font-size: 1.25rem;
  }

  .text-content-area {
    padding: 1.5rem;
  }

  .content-text {
    font-size: 0.95rem;
  }

  .video-container {
    min-height: 200px;
  }

  .pdf-toolbar {
    padding: 0.75rem;
  }

  .pdf-nav-group .modern-btn,
  .zoom-group .modern-btn,
  .action-group .modern-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .pdf-viewer-wrapper {
    padding: 0.5rem;
    min-height: 300px;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .content-header {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .content-title {
    color: #e2e8f0;
  }

  .time-badge,
  .lesson-badge {
    background: rgba(102, 126, 234, 0.2);
    color: #cbd5e0;
  }

  .text-content-section,
  .video-content-section,
  .pdf-content-section,
  .unknown-content-section {
    background: #2d3748;
  }

  .text-content-area {
    background: #2d3748;
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
    background: #1a202c;
  }

  .pdf-display-canvas {
    border-color: #4a5568;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .pdf-mobile-nav .modern-card {
    background: rgba(45, 55, 72, 0.95);
    color: #e2e8f0;
  }

  .pdf-loading-container,
  .pdf-error-container {
    color: #e2e8f0;
  }

  .unknown-content-area {
    background: #2d3748;
    color: #e2e8f0;
  }

  .unknown-content-area h5 {
    color: #e2e8f0;
  }
}

/* Print Styles */
@media print {
  .content-header .content-actions,
  .pdf-toolbar,
  .pdf-mobile-nav,
  .video-controls {
    display: none !important;
  }

  .content-viewer {
    background: white !important;
    padding: 0;
  }

  .modern-card {
    box-shadow: none;
    border: 1px solid #ccc;
  }

  .content-text {
    color: black;
  }

  .pdf-viewer-wrapper {
    background: white !important;
    padding: 0 !important;
  }

  .pdf-display-canvas {
    border: none !important;
    box-shadow: none !important;
    max-width: 100% !important;
  }
}

/* Animations */
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

/* High Contrast */
@media (prefers-contrast: high) {
  .content-header {
    border: 2px solid #000;
  }

  .content-title {
    color: #000;
    font-weight: 800;
  }

  .content-text {
    color: #000;
    font-weight: 500;
  }

  .pdf-display-canvas {
    border: 2px solid #000;
  }

  .pdf-nav-group .modern-btn,
  .zoom-group .modern-btn,
  .action-group .modern-btn {
    border-width: 2px;
  }
}

/* Touch Gestures */
@media (pointer: coarse) {
  .pdf-display-canvas {
    touch-action: pan-x pan-y pinch-zoom;
  }
}

/* Loading Animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-border {
  border: 0.3em solid rgba(102, 126, 234, 0.3);
  border-top: 0.3em solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* PDF Page Transition */
.pdf-canvas-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>