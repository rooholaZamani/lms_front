<template>
  <div id="app">
    <loading-spinner v-if="isLoading" message="در حال بارگذاری..." />

    <template v-else>
      <Navbar v-if="isLoggedIn" />
      <router-view />
    </template>
  </div>
</template>

<script>
import Navbar from '@/components/layout/Navbar.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    LoadingSpinner
  },
  data() {
    return {
      isLoading: true
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    }
  },
  async created() {
    try {
      await this.$store.dispatch('auth/checkAuth')
    } catch (error) {
      console.error('Error checking authentication status:', error)
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style>
@import './assets/styles/main.css';
</style>