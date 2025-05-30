<template>
  <base-modal
      :modal-id="modalId"
      :title="title"
      :icon="icon"
      :header-class="headerClass"
      :modal-size="modalSize"
      ref="modal"
  >
    <div class="modern-content-modal">
      <div v-if="loading" class="content-loading">
        <div class="modern-spinner"></div>
        <p class="loading-text">در حال بارگذاری محتوا...</p>
      </div>

      <div v-else-if="error" class="content-error">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <p class="error-message">{{ error }}</p>
        <button class="modern-btn modern-btn-primary" @click="retry">
          <i class="fas fa-redo me-1"></i>
          تلاش مجدد
        </button>
      </div>

      <div v-else class="content-body">
        <slot></slot>
      </div>
    </div>

    <template #footer v-if="$slots.footer || showDefaultFooter">
      <slot name="footer">
        <div v-if="showDefaultFooter" class="default-footer">
          <button
              type="button"
              class="modern-btn modern-btn-secondary"
              data-bs-dismiss="modal"
          >
            <i class="fas fa-times me-1"></i>
            بستن
          </button>
          <button
              v-if="showSaveButton"
              type="button"
              class="modern-btn modern-btn-primary"
              @click="handleSave"
              :disabled="saving"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-save me-1"></i>
            ذخیره
          </button>
        </div>
      </slot>
    </template>
  </base-modal>
</template>

<script>
import BaseModal from '@/components/common/BaseModal.vue';

export default {
  name: 'ContentModal',
  components: {
    BaseModal
  },
  props: {
    modalId: {
      type: String,
      default: 'contentModal'
    },
    title: {
      type: String,
      default: 'محتوا'
    },
    icon: {
      type: String,
      default: 'file-alt'
    },
    headerClass: {
      type: String,
      default: ''
    },
    modalSize: {
      type: String,
      default: 'modal-lg'
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    showDefaultFooter: {
      type: Boolean,
      default: true
    },
    showSaveButton: {
      type: Boolean,
      default: false
    },
    saving: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    show() {
      this.$refs.modal.show();
    },
    hide() {
      this.$refs.modal.hide();
    },
    retry() {
      this.$emit('retry');
    },
    handleSave() {
      this.$emit('save');
    }
  }
}
</script>

<style scoped>
.modern-content-modal {
  min-height: 200px;
}

.content-loading,
.content-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.modern-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
}

.content-error .error-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.05));
  color: #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
  border: 3px solid rgba(231, 76, 60, 0.2);
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.content-body {
  padding: 0.5rem 0;
}

.default-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: end;
  width: 100%;
}

.default-footer .modern-btn {
  min-width: 100px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 576px) {
  .modern-content-modal {
    min-height: 150px;
  }

  .content-loading,
  .content-error {
    padding: 2rem 1rem;
  }

  .modern-spinner {
    width: 40px;
    height: 40px;
  }

  .content-error .error-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .default-footer {
    flex-direction: column;
  }

  .default-footer .modern-btn {
    width: 100%;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .loading-text {
    color: #cbd5e0;
  }

  .modern-spinner {
    border-color: rgba(102, 126, 234, 0.3);
    border-top-color: #667eea;
  }
}
</style>