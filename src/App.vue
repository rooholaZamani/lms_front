<template>
  <div id="app">
    <loading-spinner v-if="isLoading" message="در حال بارگذاری..." />

    <template v-else>
      <Navbar v-if="isLoggedIn" />

      <div class="app-content" :class="{ 'with-sidebar': showSidebar && isLoggedIn }">
        <!-- Sidebar -->
        <Sidebar v-if="showSidebar && isLoggedIn" @sidebar-collapsed="handleSidebarToggle" />

        <!-- Main Content -->
        <main class="main-content" :class="{
          'with-sidebar': showSidebar && isLoggedIn,
          'sidebar-collapsed': sidebarCollapsed && showSidebar && isLoggedIn
        }">
          <router-view />
        </main>
      </div>
    </template>

    <!-- Global Notifications Container -->
    <NotificationsContainer />
  </div>
</template>

<script>
import { computed, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import NotificationsContainer from '@/components/common/NotificationsContainer.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
    LoadingSpinner,
    NotificationsContainer
  },
  data() {
    return {
      isLoading: true,
      sidebarCollapsed: false
    }
  },
  setup() {
    const route = useRoute();

    // صفحاتی که نیاز به sidebar ندارند
    const pagesWithoutSidebar = [
      'Home',
      'Login',
      'Register',
      'NotFound',
      'Forbidden'
    ];

    // محاسبه اینکه آیا sidebar باید نمایش داده شود یا نه
    const showSidebar = computed(() => {
      // اگر route دارای meta.hideSidebar باشد، sidebar را مخفی کن
      if (route.meta.hideSidebar) {
        return false;
      }

      // اگر نام route در لیست صفحات بدون sidebar باشد، مخفی کن
      if (pagesWithoutSidebar.includes(route.name)) {
        return false;
      }

      // در غیر این صورت sidebar را نمایش بده
      return true;
    });

    return {
      showSidebar
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    }
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed;
      console.log('Sidebar collapsed:', collapsed); // برای debug
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

#app {
  font-family: 'Vazirmatn', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  direction: rtl;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.app-content {
  display: flex;
  min-height: calc(100vh - 56px);
  position: relative;
}

.main-content {
  flex: 1;
  transition: margin-right 0.3s ease;
  background-color: #f8f9fa;
  min-height: calc(100vh - 56px);
  width: 100%;
}

.main-content.with-sidebar {
  margin-right: 260px;
}

/* برای sidebar جمع شده */
.main-content.with-sidebar.sidebar-collapsed {
  margin-right: 60px;
}

/* Responsive design */
@media (max-width: 768px) {
  .app-content {
    min-height: calc(100vh - 56px);
  }
  .main-content {
    min-height: calc(100vh - 56px);
    padding: 0.5rem;
  }
  .main-content.with-sidebar,
  .main-content.with-sidebar.sidebar-collapsed {
    margin-right: 0;
    width: 100% !important;
  }

  .sidebar-toggle {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1051;
    background: rgba(102, 126, 234, 0.9);
    backdrop-filter: blur(10px);
  }
}
@media (max-width: 480px) {
  .app-content {
    min-height: calc(100vh - 50px); /* برای navbar کوچکتر */
  }
  .main-content {
    padding: 0.25rem;
  }
}

@media (max-width: 360px) {
  .app-content {
    min-height: calc(100vh - 48px);
  }

  .main-content {
    min-height: calc(100vh - 48px);
  }
}

/* Loading spinner styles */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Global transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Page transitions */
.page-enter-active, .page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus styles for accessibility */
*:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Custom selection color */
::selection {
  background-color: #007bff;
  color: white;
}

/* Print styles */
@media print {
  .sidebar, .navbar, .sidebar-toggle {
    display: none !important;
  }

  .main-content {
    margin-right: 0 !important;
  }
}

</style>