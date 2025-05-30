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
      modal: null
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(document.getElementById(this.modalId));
  },
  methods: {
    show() {
      this.modal.show();
    },
    hide() {
      this.modal.hide();
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
</style>