<template>
  <div class="loading-container" v-if="loading">
    <div class="spinner"></div>
    <p>{{ message }}</p>
  </div>
  <slot v-else></slot>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: 'در حال بارگذاری...'
    }
  }
}
</script>