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
          <div class="mt-4">
            <button @click="goBack" class="modern-btn modern-btn-primary">
              <i class="fas fa-arrow-right"></i>
              بازگشت به درس
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Display -->
    <div v-else class="content-wrapper animate-fade-in">
      <div class="container-fluid p-0">
        <div class="row g-0">
          <div class="col-lg-10 mx-auto">

            <!-- Content Header -->
            <div class="content-header modern-card mb-4">
              <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h1 class="content-title">{{ content.title }}</h1>
                  <p class="content-meta mb-0">
                    <i class="fas fa-clock me-2"></i>
                    <span>{{ timeSpent }} ثانیه مطالعه</span>
                  </p>
                </div>
                <div class="content-actions">
                  <button
                      @click="markAsComplete"
                      :disabled="isMarkingComplete || isCompleted"
                      class="modern-btn modern-btn-success"
                  >
                    <i class="fas" :class="isCompleted ? 'fa-check-circle' : 'fa-check'"></i>
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

                <!-- Video Error -->
                <div v-if="videoError" class="video-error-container">
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
                        <button @click="fitToWidth" class="modern-btn modern-btn-outline">
                          <i class="fas fa-compress"></i>
                          متناسب
                        </button>
                        <button @click="zoomIn" class="modern-btn modern-btn-outline">
                          <i class="fas fa-search-plus"></i>
                        </button>
                      </div>

                      <!-- Actions -->
                      <div class="btn-group action-group">
                        <button @click="toggleFullscreenPdf" class="modern-btn modern-btn-outline">
                          <i class="fas fa-expand"></i>
                          تمام صفحه
                        </button>
                        <button @click="downloadFile" class="modern-btn modern-btn-primary">
                          <i class="fas fa-download"></i>
                          دانلود
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- PDF Canvas -->
                  <div class="pdf-viewer-wrapper" ref="pdfViewerWrapper">
                    <div class="pdf-canvas-container">
                      <canvas
                          ref="pdfCanvas"
                          class="pdf-display-canvas"
                          tabindex="0"
                          @keydown="handlePdfKeyboard"
                      ></canvas>
                    </div>
                  </div>

                  <!-- Mobile Navigation -->
                  <div class="pdf-mobile-nav d-md-none mt-3">
                    <div class="modern-card">
                      <div class="d-flex justify-content-between align-items-center">
                        <button
                            @click="previousPage"
                            :disabled="currentPage <= 1"
                            class="modern-btn modern-btn-outline"
                        >
                          <i class="fas fa-chevron-right"></i>
                        </button>
                        <span class="text-muted">{{ currentPage }} / {{ totalPages }}</span>
                        <button
                            @click="nextPage"
                            :disabled="currentPage >= totalPages"
                            class="modern-btn modern-btn-outline"
                        >
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
                  <div class="modern-logo secondary">
                    <i class="fas fa-question-circle"></i>
                  </div>
                  <h5 class="mt-3">نوع محتوا پشتیبانی نمی‌شود</h5>
                  <p class="text-muted">
                    نوع محتوای "{{ content.type }}" در حال حاضر پشتیبانی نمی‌شود.
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
        // صبر کن تا مطمئن بشیم DOM آماده است
        await nextTick()

        await loadPdfWithPdfJs()
      } catch (err) {
        console.error('PDF initialization failed:', err)
        pdfError.value = err.message || 'خطا در بارگذاری PDF'
        pdfLoading.value = false
      }
    }

    // PDF loading function with fixed proxy issue
    const loadPdfWithPdfJs = async () => {
      try {
        if (!fileId.value) {
          throw new Error('شناسه فایل PDF موجود نیست')
        }

        console.log('Step 1: Starting PDF load process')

        // Load PDF.js library
        if (!window.pdfjsLib) {
          console.log('Step 2: Loading PDF.js library')
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
            script.onload = () => {
              console.log('Step 3: PDF.js library loaded successfully')
              resolve()
            }
            script.onerror = (error) => {
              console.error('Step 3 ERROR: Failed to load PDF.js library', error)
              reject(error)
            }
            document.head.appendChild(script)
          })
        }

        // Set worker
        console.log('Step 4: Setting up PDF worker')
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

        // Fetch PDF
        console.log('Step 5: Fetching PDF file')
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/content/files/${fileId.value}`, {
          headers: {
            'Authorization': `Basic ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`خطا در دریافت فایل: ${response.status}`)
        }

        console.log('Step 6: Converting to arrayBuffer')
        const arrayBuffer = await response.arrayBuffer()
        console.log('Step 7: ArrayBuffer size:', arrayBuffer.byteLength)

        // Load PDF - تغییر مهم: ذخیره در متغیر معمولی
        console.log('Step 8: Parsing PDF with PDF.js')
        const loadingTask = window.pdfjsLib.getDocument(arrayBuffer)

        // Add progress tracking
        loadingTask.onProgress = function(progress) {
          console.log('PDF Loading progress:', progress.loaded / progress.total * 100 + '%')
        }

        // تغییر مهم: ذخیره PDF document در متغیر معمولی
        pdfDocInstance = await loadingTask.promise
        isPdfLoaded.value = true

        console.log('Step 9: PDF parsed successfully. Pages:', pdfDocInstance.numPages)
        totalPages.value = pdfDocInstance.numPages

        // اول pdfLoading رو false کن تا UI نمایش داده بشه
        pdfLoading.value = false

        // صبر کن تا DOM آماده بشه
        await nextTick()

        // دوباره چک کن که آیا canvas موجود است
        console.log('Step 10: Checking for canvas availability')
        await waitForCanvas()

        // حالا رندر کن
        console.log('Step 11: Rendering first page')
        await renderPdfPage(1)
        console.log('Step 12: First page rendered successfully')

        // Auto fit
        await nextTick()
        fitToWidth()

      } catch (err) {
        console.error('PDF Loading Error at step:', err)
        pdfLoading.value = false  // اطمینان از false شدن loading در صورت خطا
        throw new Error(err.message || 'خطا در بارگذاری PDF')
      }
    }

    // Watch for canvas to be ready
    const waitForCanvas = () => {
      return new Promise((resolve) => {
        console.log('Waiting for canvas element...')

        if (pdfCanvas.value) {
          console.log('Canvas already available')
          resolve(pdfCanvas.value)
        } else {
          let checkCount = 0
          const checkInterval = setInterval(() => {
            checkCount++
            console.log(`Canvas check attempt ${checkCount}`)

            if (pdfCanvas.value) {
              clearInterval(checkInterval)
              console.log('Canvas found after waiting')
              resolve(pdfCanvas.value)
            }
          }, 50)

          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval)
            console.error('Canvas wait timeout')
            resolve(null)
          }, 5000)
        }
      })
    }

    const renderPdfPage = async (pageNum) => {
      // تغییر مهم: استفاده از pdfDocInstance بجای pdfDoc.value
      if (!pdfDocInstance || pageNum < 1 || pageNum > totalPages.value) {
        console.log('Invalid page render request')
        return
      }

      try {
        console.log('Rendering page:', pageNum)

        // Cancel previous render
        if (pdfRenderTask.value) {
          try {
            pdfRenderTask.value.cancel()
            pdfRenderTask.value = null
          } catch (e) {
            // Ignore cancellation errors
          }
        }

        // تغییر مهم: استفاده از pdfDocInstance
        const pagePromise = pdfDocInstance.getPage(pageNum)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Page loading timeout')), 10000)
        })

        const page = await Promise.race([pagePromise, timeoutPromise])
        console.log('Page object retrieved successfully')

        // صبر کن تا canvas آماده بشه
        const canvas = await waitForCanvas()
        if (!canvas) {
          console.error('Canvas element not found after waiting')
          throw new Error('Canvas element not available')
        }

        const context = canvas.getContext('2d')
        const viewport = page.getViewport({ scale: pdfScale.value || 1.0 })

        canvas.height = viewport.height
        canvas.width = viewport.width

        // Clear canvas قبل از render جدید
        context.clearRect(0, 0, canvas.width, canvas.height)

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        console.log('Starting page render...')
        pdfRenderTask.value = page.render(renderContext)
        await pdfRenderTask.value.promise

        currentPage.value = pageNum
        console.log('Page rendered successfully')

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

    const zoomIn = async () => {
      if (!isPdfLoaded.value) return

      pdfScale.value = Math.min(pdfScale.value + 0.25, 3.0)
      await renderPdfPage(currentPage.value)
    }

    const zoomOut = async () => {
      if (!isPdfLoaded.value) return

      pdfScale.value = Math.max(pdfScale.value - 0.25, 0.5)
      await renderPdfPage(currentPage.value)
    }

    const fitToWidth = async () => {
      if (!isPdfLoaded.value || !pdfCanvas.value) return

      try {
        const page = await pdfDocInstance.getPage(currentPage.value)
        const viewport = page.getViewport({ scale: 1.0 })
        const containerWidth = pdfCanvas.value.parentElement.clientWidth - 40

        pdfScale.value = containerWidth / viewport.width
        await renderPdfPage(currentPage.value)
      } catch (err) {
        console.error('Error fitting to width:', err)
      }
    }

    const retryPdfLoad = async () => {
      pdfError.value = null
      // پاک کردن instance قبلی
      if (pdfDocInstance) {
        try {
          pdfDocInstance.destroy()
        } catch (e) {
          // Ignore destroy errors
        }
        pdfDocInstance = null
        isPdfLoaded.value = false
      }
      await initializePdfViewer()
    }

    const handlePdfKeyboard = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          nextPage()
          break
        case 'ArrowRight':
          previousPage()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
      }
    }

    const toggleFullscreenPdf = () => {
      if (pdfViewerWrapper.value) {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          pdfViewerWrapper.value.requestFullscreen()
        }
      }
    }

    // General Methods
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
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = content.value.title || 'download'
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
      currentVideoTime,
      videoDuration,
      playbackSpeed,
      videoPlayer,
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

.video-error-container {
  padding: 4rem 2rem;
  text-align: center;
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