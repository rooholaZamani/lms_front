<template>
  <div class="confirmation-dialog">
    <base-modal
        :modal-id="modalId"
        :title="title"
        :icon="icon"
        :header-class="headerClass"
        :modal-size="size"
        ref="modal"
    >
      <div class="modern-confirmation-body">
        <div class="confirmation-icon-container">
          <div class="confirmation-icon" :class="getIconColorClass()">
            <i :class="`fas fa-${icon}`"></i>
          </div>
        </div>

        <div class="confirmation-content">
          <p class="confirmation-message">{{ message }}</p>

          <div v-if="details" class="confirmation-details">
            <div class="details-card">
              <i class="fas fa-info-circle me-2"></i>
              {{ details }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modern-confirmation-footer">
          <button
              type="button"
              class="modern-btn modern-btn-secondary"
              @click="onCancel"
          >
            <i class="fas fa-times me-1"></i>
            {{ cancelText }}
          </button>
          <button
              type="button"
              :class="`modern-btn modern-btn-${confirmButtonType}`"
              @click="onConfirm"
          >
            <i :class="`fas ${getConfirmIcon()} me-1`"></i>
            {{ confirmText }}
          </button>
        </div>
      </template>
    </base-modal>
  </div>
</template>

<script>
import BaseModal from '@/components/common/BaseModal.vue';

export default {
  name: 'ConfirmationDialog',
  components: {
    BaseModal
  },
  props: {
    modalId: {
      type: String,
      default: 'confirmationModal'
    },
    title: {
      type: String,
      default: 'تأیید'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: 'تأیید'
    },
    cancelText: {
      type: String,
      default: 'انصراف'
    },
    confirmButtonType: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'danger', 'success', 'warning', 'info'].includes(value)
    },
    icon: {
      type: String,
      default: 'question-circle'
    },
    size: {
      type: String,
      default: ''
    },
    headerClass: {
      type: String,
      default: ''
    }
  },
  methods: {
    show() {
      this.$refs.modal.show();
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },
    hide() {
      this.$refs.modal.hide();
    },
    onConfirm() {
      if (this.resolvePromise) {
        this.resolvePromise(true);
      }
      this.hide();
      this.$emit('confirm');
    },
    onCancel() {
      if (this.resolvePromise) {
        this.resolvePromise(false);
      }
      this.hide();
      this.$emit('cancel');
    },
    getIconColorClass() {
      const classes = {
        'question-circle': 'icon-primary',
        'exclamation-triangle': 'icon-warning',
        'exclamation-circle': 'icon-danger',
        'info-circle': 'icon-info',
        'check-circle': 'icon-success',
        'trash': 'icon-danger'
      };
      return classes[this.icon] || 'icon-primary';
    },
    getConfirmIcon() {
      const icons = {
        primary: 'fa-check',
        danger: 'fa-trash',
        success: 'fa-check',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
      };
      return icons[this.confirmButtonType] || 'fa-check';
    }
  }
}
</script>

<style scoped>
.modern-confirmation-body {
  text-align: center;
  padding: 1rem 0;
}

.confirmation-icon-container {
  margin-bottom: 1.5rem;
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  animation: iconPulse 2s infinite;
}

.confirmation-icon.icon-primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
  color: #667eea;
  border: 3px solid rgba(102, 126, 234, 0.2);
}

.confirmation-icon.icon-danger {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.05));
  color: #e74c3c;
  border: 3px solid rgba(231, 76, 60, 0.2);
}

.confirmation-icon.icon-warning {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(230, 126, 34, 0.05));
  color: #f39c12;
  border: 3px solid rgba(243, 156, 18, 0.2);
}

.confirmation-icon.icon-success {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.05));
  color: #27ae60;
  border: 3px solid rgba(39, 174, 96, 0.2);
}

.confirmation-icon.icon-info {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(154, 207, 234, 0.05));
  color: #3498db;
  border: 3px solid rgba(52, 152, 219, 0.2);
}

.confirmation-content {
  max-width: 400px;
  margin: 0 auto;
}

.confirmation-message {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.confirmation-details {
  margin-bottom: 1rem;
}

.details-card {
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(233, 236, 239, 0.5));
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
  backdrop-filter: blur(5px);
}

.modern-confirmation-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  width: 100%;
}

.modern-confirmation-footer .modern-btn {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive */
@media (max-width: 576px) {
  .confirmation-icon {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }

  .confirmation-message {
    font-size: 1rem;
  }

  .modern-confirmation-footer {
    flex-direction: column;
  }

  .modern-confirmation-footer .modern-btn {
    width: 100%;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .confirmation-message {
    color: #e2e8f0;
  }

  .details-card {
    background: linear-gradient(135deg, rgba(74, 85, 104, 0.8), rgba(113, 128, 150, 0.5));
    border-color: rgba(255, 255, 255, 0.1);
    color: #cbd5e0;
  }
}
</style>