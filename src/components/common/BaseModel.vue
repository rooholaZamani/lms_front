<template>
  <div class="modal-container">
    <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog" :class="modalSize">
        <div class="modal-content">
          <div class="modal-header" :class="headerClass">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" :class="{ 'btn-close-white': lightHeader }" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="$slots.footer">
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
    headerClass: {
      type: String,
      default: ''
    },
    modalSize: {
      type: String,
      default: ''
    }
  },
  computed: {
    lightHeader() {
      return this.headerClass.includes('bg-primary') ||
             this.headerClass.includes('bg-success') ||
             this.headerClass.includes('bg-danger') ||
             this.headerClass.includes('bg-dark');
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