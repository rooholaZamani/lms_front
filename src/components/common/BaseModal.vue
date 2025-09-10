<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog" :class="modalSize">
      <div class="modal-content modern-modal-content">
        <!-- Header -->
        <div class="modal-header modern-modal-header" :class="headerClass">
          <h5 class="modal-title modern-modal-title">
            <i v-if="icon" :class="`fas fa-${icon} me-2`"></i>
            {{ title }}
          </h5>
          <button
              type="button"
              class="btn-close"
              :class="{ 'btn-close-white': isLightHeader }"
              data-bs-dismiss="modal"
              aria-label="Close">
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body modern-modal-body">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="modal-footer modern-modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    isLightHeader() {
      return this.headerClass.includes('bg-primary') ||
          this.headerClass.includes('bg-success') ||
          this.headerClass.includes('bg-danger') ||
          this.headerClass.includes('bg-dark') ||
          this.headerClass.includes('bg-warning');
    }
  },
  methods: {
    show() {
      // پاکسازی قبل از نمایش
      this.forceCleanup();

      const modal = new bootstrap.Modal(document.getElementById(this.modalId), {
        backdrop: true,  // نگه داشتن backdrop
        keyboard: true,
        focus: true
      });

      modal.show();

      // اطمینان از positioning درست
      this.$nextTick(() => {
        this.fixModalPosition();
      });
    },

    hide() {
      const modal = bootstrap.Modal.getInstance(document.getElementById(this.modalId));
      if (modal) {
        modal.hide();
      }

      // پاکسازی با delay
      setTimeout(() => {
        this.forceCleanup();
      }, 300);
    },

    // جدید: اصلاح position modal
    fixModalPosition() {
      const modalElement = document.getElementById(this.modalId);
      if (modalElement) {
        modalElement.style.display = 'flex';
        modalElement.style.alignItems = 'center';
        modalElement.style.justifyContent = 'center';

        const modalDialog = modalElement.querySelector('.modal-dialog');
        if (modalDialog) {
          modalDialog.style.margin = '0';
          modalDialog.style.width = 'auto';
          // Remove hardcoded maxWidth constraint to allow responsive sizing
        }
      }
    },

    forceCleanup() {
      try {
        // حذف backdrop های اضافی (نه همه)
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
          // فقط اضافی‌ها را حذف کن
          for (let i = 1; i < backdrops.length; i++) {
            backdrops[i].remove();
          }
        }

        // اصلاح body classes
        if (!document.querySelector('.modal.show')) {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }

      } catch (error) {
        console.error('Cleanup error:', error);
      }
    },
  },

  // پاکسازی هنگام نابودی کامپوننت
  beforeUnmount() {
    this.forceCleanup();
  }
}
</script>

<style scoped>
/* استایل های مدرن برای Modal */
.modern-modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modern-modal-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  padding: 1.5rem;
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

/* انیمیشن */
.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
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
</style>