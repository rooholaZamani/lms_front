<template>
  <div class="modal-container">
    <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog" :class="modalSize">
        <div class="modern-modal-content animate-slide-up">
          <div class="modern-modal-header" :class="headerClass">
            <h5 class="modern-modal-title">
              <i v-if="icon" :class="`fas fa-${icon} me-2`"></i>
              {{ title }}
            </h5>
            <button
                type="button"
                class="modern-close-btn"
                :class="{ 'btn-close-white': lightHeader }"
                data-bs-dismiss="modal"
                aria-label="بستن"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modern-modal-body">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="modern-modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default {
  name: 'BaseModal',
  props: {
    modalId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    headerClass: {
      type: String,
      default: ''
    },
    modalSize: {
      type: String,
      default: '',
      validator: (value) => ['', 'modal-sm', 'modal-lg', 'modal-xl'].includes(value)
    }
  },
  computed: {
    lightHeader() {
      return this.headerClass.includes('bg-primary') ||
          this.headerClass.includes('bg-success') ||
          this.headerClass.includes('bg-danger') ||
          this.headerClass.includes('bg-dark') ||
          this.headerClass.includes('bg-warning');
    }
  },
  data() {
    return {
      modal: null,
      modalElement: null,
      isInitialized: false
    }
  },
  mounted() {
    this.initModal();
  },
  beforeUnmount() {
    this.destroyModal();
  },
  methods: {
    // مقداردهی اولیه Modal
    initModal() {
      try {
        this.modalElement = document.getElementById(this.modalId);

        if (!this.modalElement) {
          console.error(`Modal element with id "${this.modalId}" not found`);
          return;
        }

        // ایجاد Bootstrap Modal instance
        this.modal = new bootstrap.Modal(this.modalElement, {
          backdrop: 'static',  // جلوگیری از بسته شدن با کلیک خارج
          keyboard: true,      // اجازه بسته شدن با Escape
          focus: true
        });

        // اضافه کردن Event Listeners
        this.addEventListeners();
        this.isInitialized = true;

      } catch (error) {
        console.error('Error initializing modal:', error);
        this.emergencyCleanup();
      }
    },

    // اضافه کردن Event Listeners
    addEventListeners() {
      if (!this.modalElement) return;

      // قبل از نمایش
      this.modalElement.addEventListener('show.bs.modal', this.onShow);

      // بعد از نمایش
      this.modalElement.addEventListener('shown.bs.modal', this.onShown);

      // قبل از مخفی شدن
      this.modalElement.addEventListener('hide.bs.modal', this.onHide);

      // بعد از مخفی شدن - مهم‌ترین برای cleanup
      this.modalElement.addEventListener('hidden.bs.modal', this.onHidden);
    },

    // Event Handlers
    onShow() {
      // قبل از نمایش Modal
      this.$emit('show');
    },

    onShown() {
      // بعد از نمایش کامل Modal
      this.$emit('shown');
    },

    onHide() {
      // قبل از مخفی شدن Modal
      this.$emit('hide');
    },

    onHidden() {
      // بعد از مخفی شدن کامل - cleanup اصلی اینجا
      this.performCleanup();
      this.$emit('hidden');
    },

    // نمایش Modal
    show() {
      if (!this.isInitialized) {
        this.initModal();
      }

      if (this.modal && this.modalElement) {
        try {
          // پاکسازی قبل از نمایش
          this.emergencyCleanup();

          // نمایش Modal
          this.modal.show();
        } catch (error) {
          console.error('Error showing modal:', error);
          this.emergencyCleanup();
        }
      }
    },

    // مخفی کردن Modal
    hide() {
      if (this.modal && this.modalElement) {
        try {
          this.modal.hide();
        } catch (error) {
          console.error('Error hiding modal:', error);
          this.emergencyCleanup();
        }
      }
    },

    // پاکسازی بعد از مخفی شدن
    performCleanup() {
      try {
        // حذف backdrop های اضافی
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          if (backdrop) {
            backdrop.remove();
          }
        });

        // بازگرداندن حالت طبیعی body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // حذف inline styles
        if (document.body.hasAttribute('style')) {
          const style = document.body.getAttribute('style');
          if (style.includes('overflow') || style.includes('padding-right')) {
            document.body.removeAttribute('style');
          }
        }

      } catch (error) {
        console.error('Error during cleanup:', error);
        this.emergencyCleanup();
      }
    },

    // پاکسازی اضطراری
    emergencyCleanup() {
      try {
        // حذف تمام backdrop ها
        const allBackdrops = document.querySelectorAll('.modal-backdrop');
        allBackdrops.forEach(backdrop => backdrop.remove());

        // بازگرداندن body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.removeAttribute('style');

      } catch (error) {
        console.error('Emergency cleanup failed:', error);
      }
    },

    // نابودی Modal
    destroyModal() {
      try {
        // پاکسازی نهایی
        this.performCleanup();

        // حذف Event Listeners
        if (this.modalElement) {
          this.modalElement.removeEventListener('show.bs.modal', this.onShow);
          this.modalElement.removeEventListener('shown.bs.modal', this.onShown);
          this.modalElement.removeEventListener('hide.bs.modal', this.onHide);
          this.modalElement.removeEventListener('hidden.bs.modal', this.onHidden);
        }

        // نابودی Bootstrap Modal instance
        if (this.modal) {
          this.modal.dispose();
          this.modal = null;
        }

        this.modalElement = null;
        this.isInitialized = false;

      } catch (error) {
        console.error('Error destroying modal:', error);
        this.emergencyCleanup();
      }
    },

    // متد عمومی برای reset
    reset() {
      this.hide();
      setTimeout(() => {
        this.performCleanup();
      }, 300);
    }
  }
}
</script>

<style scoped>
.modal-container {
  --bs-modal-bg: transparent;
}

.modern-modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modern-modal-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modern-modal-header.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.modern-modal-header.bg-success {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.modern-modal-header.bg-danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.modern-modal-header.bg-warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.modern-modal-header.bg-dark {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.modern-modal-title {
  color: #333;
  font-weight: 700;
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.modern-modal-header[class*="bg-"] .modern-modal-title {
  color: white;
}

.modern-close-btn {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 8px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6c757d;
}

.modern-close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.modern-close-btn.btn-close-white {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.modern-close-btn.btn-close-white:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modern-modal-body {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
}

.modern-modal-footer {
  background: rgba(248, 249, 250, 0.8);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: end;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 576px) {
  .modern-modal-content {
    margin: 1rem;
    border-radius: 12px;
  }

  .modern-modal-header,
  .modern-modal-body,
  .modern-modal-footer {
    padding: 1rem;
  }

  .modern-modal-title {
    font-size: 1.1rem;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modern-modal-content {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .modern-modal-header {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.08));
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .modern-modal-title {
    color: #e2e8f0;
  }

  .modern-modal-body {
    background: rgba(45, 55, 72, 0.5);
  }

  .modern-modal-footer {
    background: rgba(74, 85, 104, 0.8);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}

/* جلوگیری از مشکلات backdrop */
.modal-backdrop {
  z-index: 1040 !important;
}

.modal-backdrop + .modal-backdrop {
  display: none !important;
}

/* اطمینان از z-index درست */
.modal {
  z-index: 1050 !important;
}

.modal-dialog {
  z-index: 1060 !important;
}
</style>