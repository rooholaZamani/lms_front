<template>
  <div class="confirmation-dialog">
    <base-modal
        :modal-id="modalId"
        :title="title"
        :header-class="headerClass"
        :modal-size="size"
        ref="modal"
    >
      <div class="confirmation-body">
        <i v-if="icon" :class="`fas fa-${icon} confirmation-icon mb-3`"></i>
        <p class="confirmation-message">{{ message }}</p>
        <div v-if="details" class="confirmation-details">
          {{ details }}
        </div>
      </div>

      <template #footer>
        <div class="d-flex justify-content-end gap-2">
          <button
              type="button"
              class="btn btn-secondary"
              @click="onCancel"
          >
            {{ cancelText }}
          </button>
          <button
              type="button"
              :class="`btn btn-${confirmButtonType}`"
              @click="onConfirm"
          >
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
    }
  }
}
</script>

<style scoped>
.confirmation-body {
  text-align: center;
  padding: 10px;
}

.confirmation-icon {
  font-size: 3rem;
  color: var(--bs-primary);
}

.confirmation-message {
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.confirmation-details {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  text-align: right;
  margin-bottom: 10px;
  font-size: 0.9rem;
}
</style>