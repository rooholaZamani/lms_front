<template>
  <nav class="modern-navbar">
    <div class="container-fluid px-3">
      <div class="navbar-content">
        <!-- Left Side - Mobile Menu Toggle -->
        <div class="navbar-left">
          <button class="mobile-menu-toggle d-md-none" @click="toggleMobileMenu">
            <i class="fas fa-bars"></i>
          </button>

          <!-- Breadcrumb -->
          <div class="breadcrumb-container d-none d-md-flex">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <router-link to="/dashboard" class="breadcrumb-link">
                    <i class="fas fa-home me-1"></i>
                    خانه
                  </router-link>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  {{ getPageTitle() }}
                </li>
              </ol>
            </nav>
          </div>

          <!-- Page Title for Mobile -->
          <div class="page-title d-md-none">
            {{ getPageTitle() }}
          </div>
        </div>

        <!-- Right Side - User Actions -->
        <div class="navbar-right">
          <!-- User Menu -->
          <div class="navbar-item">
            <div class="user-menu-container" @click="toggleUserMenu">
              <div class="user-avatar">
                <div class="avatar-circle">
                  {{ getUserInitials() }}
                </div>
                <div class="user-status online"></div>
              </div>

              <div class="user-info d-none d-md-block">
                <div class="user-name">{{ getUserFullName() }}</div>
                <div class="user-role">{{ getUserRoleText() }}</div>
              </div>

              <div class="dropdown-arrow d-none d-md-block">
                <i class="fas fa-chevron-down"></i>
              </div>

              <!-- User Dropdown -->
              <transition name="dropdown">
                <div v-if="showUserMenu" class="user-dropdown" @click.stop>
                  <div class="dropdown-header">
                    <div class="user-avatar large">
                      <div class="avatar-circle">
                        {{ getUserInitials() }}
                      </div>
                    </div>
                    <div class="user-details">
                      <div class="user-name">{{ getUserFullName() }}</div>
                      <div class="user-email">{{ currentUser?.email }}</div>
                      <span class="modern-badge modern-badge-primary">{{ getUserRoleText() }}</span>
                    </div>
                  </div>

                  <div class="dropdown-body">
                    <router-link to="/profile" class="dropdown-item">
                      <i class="fas fa-user me-2"></i>
                      پروفایل من
                    </router-link>

                    <div class="dropdown-divider"></div>

                    <router-link v-if="isTeacher" :to="{ name: 'TeachingCourses' }" class="dropdown-item">
                      <i class="fas fa-chalkboard-teacher me-2"></i>
                      دوره‌های من
                    </router-link>

                    <router-link v-if="isStudent" :to="{ name: 'Dashboard' }" class="dropdown-item">
                      <i class="fas fa-graduation-cap me-2"></i>
                      داشبورد دانش‌آموز
                    </router-link>

                    <div class="dropdown-divider"></div>

                    <a href="#" @click.prevent="logout" class="dropdown-item logout-item">
                      <i class="fas fa-sign-out-alt me-2"></i>
                      خروج از حساب
                    </a>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'Navbar',
  emits: ['mobile-menu-toggle'],
  setup(props, { emit }) {
    const route = useRoute();
    const { currentUser, isTeacher, isStudent, logout: userLogout } = useUser();
    const { formatDate } = useFormatters();

    // Reactive state
    const searchQuery = ref('');
    const showNotifications = ref(false);
    const showMessages = ref(false);
    const showUserMenu = ref(false);
    const showMobileSearch = ref(false);
    const isDarkMode = ref(false);
    const mobileSearchInput = ref(null);

    // Mock data
    const unreadNotifications = ref(3);
    const unreadMessages = ref(1);
    const notifications = ref([
      {
        id: 1,
        type: 'course',
        title: 'دوره جدید اضافه شد',
        message: 'دوره "آموزش Vue.js پیشرفته" اضافه شد',
        createdAt: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'assignment',
        title: 'تکلیف جدید',
        message: 'تکلیف جدیدی برای دوره برنامه‌نویسی تعریف شد',
        createdAt: new Date(Date.now() - 3600000),
        read: false
      },
      {
        id: 3,
        type: 'exam',
        title: 'آزمون نزدیک',
        message: 'آزمون پایان ترم فردا برگزار می‌شود',
        createdAt: new Date(Date.now() - 7200000),
        read: true
      }
    ]);

    // Computed
    const getUserInitials = () => {
      if (!currentUser.value) return 'U';
      const firstName = currentUser.value.firstName || '';
      const lastName = currentUser.value.lastName || '';
      return `${firstName.charAt(0)} ${lastName.charAt(0)}`.toUpperCase() || 'U';
    };

    const getUserFullName = () => {
      if (!currentUser.value) return 'کاربر';
      if (currentUser.value.firstName && currentUser.value.lastName) {
        return `${currentUser.value.firstName} ${currentUser.value.lastName}`;
      }
      return currentUser.value.username || 'کاربر';
    };

    const getUserRoleText = () => {
      if (isTeacher.value) return 'استاد';
      if (isStudent.value) return 'دانش‌آموز';
      return 'کاربر';
    };

    const getPageTitle = () => {
      const titles = {
        '/dashboard': 'داشبورد',
        '/courses': 'دوره‌ها',
        '/profile': 'پروفایل',
        '/students': 'دانش‌آموزان',
        '/reports': 'گزارش‌ها',
        '/recommander': 'توصیه‌های یادگیری',
        '/settings': 'تنظیمات'
      };
      return titles[route.path] || route.meta?.title || 'صفحه';
    };

    // Methods
    const toggleMobileMenu = () => {
      emit('mobile-menu-toggle');
    };

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value;
      showMessages.value = false;
      showUserMenu.value = false;
    };

    const toggleMessages = () => {
      showMessages.value = !showMessages.value;
      showNotifications.value = false;
      showUserMenu.value = false;
    };

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value;
      showNotifications.value = false;
      showMessages.value = false;
    };

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      // Implement theme toggle logic
    };

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        console.log('Searching for:', searchQuery.value);
        // Implement search logic
      }
    };

    const toggleMobileSearch = () => {
      showMobileSearch.value = !showMobileSearch.value;
      if (showMobileSearch.value) {
        setTimeout(() => {
          mobileSearchInput.value?.focus();
        }, 100);
      }
    };

    const closeMobileSearch = () => {
      showMobileSearch.value = false;
      searchQuery.value = '';
    };

    const markAsRead = (notificationId) => {
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        unreadNotifications.value = Math.max(0, unreadNotifications.value - 1);
      }
    };

    const clearAllNotifications = () => {
      notifications.value.forEach(n => n.read = true);
      unreadNotifications.value = 0;
    };

    const getNotificationIcon = (type) => {
      const icons = {
        course: 'fas fa-book text-primary',
        assignment: 'fas fa-tasks text-warning',
        exam: 'fas fa-clipboard-check text-danger',
        message: 'fas fa-envelope text-info'
      };
      return icons[type] || 'fas fa-bell text-secondary';
    };

    const formatTime = (date) => {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'همین الان';
      if (diffMins < 60) return `${diffMins} دقیقه قبل`;
      if (diffHours < 24) return `${diffHours} ساعت قبل`;
      if (diffDays < 7) return `${diffDays} روز قبل`;
      return formatDate(date);
    };

    const logout = async () => {
      try {
        await userLogout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    // Click outside handler
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-container')) {
        showNotifications.value = false;
      }
      if (!event.target.closest('.user-menu-container')) {
        showUserMenu.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      searchQuery,
      showNotifications,
      showMessages,
      showUserMenu,
      showMobileSearch,
      isDarkMode,
      mobileSearchInput,
      unreadNotifications,
      unreadMessages,
      notifications,
      currentUser,
      isTeacher,
      isStudent,
      getUserInitials,
      getUserFullName,
      getUserRoleText,
      getPageTitle,
      toggleMobileMenu,
      toggleNotifications,
      toggleMessages,
      toggleUserMenu,
      toggleTheme,
      performSearch,
      toggleMobileSearch,
      closeMobileSearch,
      markAsRead,
      clearAllNotifications,
      getNotificationIcon,
      formatTime,
      logout
    };
  }
}
</script>

<style scoped>
/* Navbar Container */
.modern-navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1030;
  height: 70px;
  display: flex;
  align-items: center;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

/* Left Side */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-toggle {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-menu-toggle:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

/* Breadcrumb */
.breadcrumb {
  margin: 0;
  background: none;
  padding: 0;
}

.breadcrumb-link {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #667eea;
}

.breadcrumb-item.active {
  color: #333;
  font-weight: 600;
}

.page-title {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

/* Right Side */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-item {
  position: relative;
}

/* Search */
.search-container {
  margin-left: 1rem;
}

.search-input-group {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #e9ecef;
  border-radius: 25px;
  background: rgba(248, 249, 250, 0.8);
  color: #333;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Icon Buttons */
.icon-button {
  position: relative;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.notification-badge {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border-radius: 10px;
  padding: 0.15rem 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

/* User Menu */
.user-menu-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.user-menu-container:hover {
  background: rgba(102, 126, 234, 0.05);
}

.user-avatar {
  position: relative;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
}

.user-avatar.large .avatar-circle {
  width: 50px;
  height: 50px;
  font-size: 1.1rem;
}

.user-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.user-status.online {
  background: #27ae60;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: #6c757d;
  font-size: 0.75rem;
}

.dropdown-arrow {
  color: #6c757d;
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.user-menu-container:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* Dropdowns */
.notifications-dropdown,
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0.25rem;
  left: 0.5rem;
  /*background: white;*/
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.1);
  overflow: hidden;
  z-index: 1000;
  min-width: 320px;
  max-width: 400px;
}

.user-dropdown {
  min-width: 280px;
}

.dropdown-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  background: rgba(102, 126, 234, 0.02);
}

.dropdown-title {
  margin: 0;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 0.5rem;
  padding: 0.25rem 0;
}

.clear-all-btn:hover {
  text-decoration: underline;
}

.user-details {
  margin-top: 0.75rem;
}

.user-details .user-name {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.user-email {
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.dropdown-body {
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #555;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
}

.dropdown-item.logout-item:hover {
  background: rgba(231, 76, 60, 0.05);
  color: #e74c3c;
}

.dropdown-divider {
  height: 1px;
  background: rgba(102, 126, 234, 0.1);
  margin: 0.5rem 0;
}

.dropdown-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  background: rgba(102, 126, 234, 0.02);
}

.view-all-btn {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.view-all-btn:hover {
  text-decoration: underline;
}

/* Notifications */
.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-notifications {
  padding: 2rem;
  text-align: center;
}

.notification-item {
  display: flex;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.notification-item:hover {
  background: rgba(102, 126, 234, 0.03);
}

.notification-item.unread {
  background: rgba(102, 126, 234, 0.02);
  border-right: 3px solid #667eea;
}

.notification-icon {
  margin-left: 0.75rem;
  font-size: 1.2rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #6c757d;
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}



.mobile-search-input i {
  color: #6c757d;
  margin-left: 0.75rem;
}

.mobile-search-input input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 1rem;
  color: #333;
}

.close-search {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
}

/* Animations */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Responsive */
/* Responsive */
@media (max-width: 768px) {
  .modern-navbar {
    height: 56px; /* کاهش ارتفاع از 70px به 56px */
    padding: 0; /* حذف padding اضافی */
  }

  .container-fluid {
    padding-left: 0.5rem !important; /* کاهش padding */
    padding-right: 0.5rem !important;
  }

  .navbar-content {
    height: 56px; /* مطابق با ارتفاع navbar */
    padding: 0.25rem 0; /* padding کم */
  }

  .navbar-left {
    gap: 0.5rem; /* کاهش gap */
  }

  .page-title {
    font-size: 0.9rem; /* کاهش سایز فونت */
    line-height: 1.2;
  }

  .mobile-menu-toggle {
    padding: 0.375rem; /* کاهش padding */
    font-size: 1rem; /* کاهش سایز آیکون */
  }

  .navbar-right {
    gap: 0.25rem;
  }

  .icon-button {
    padding: 0.375rem; /* کاهش padding */
    font-size: 0.9rem; /* کاهش سایز آیکون */
  }

  .user-menu-container {
    padding: 0.25rem 0.375rem; /* کاهش padding */
  }

  .avatar-circle {
    width: 32px; /* کاهش سایز */
    height: 32px;
    font-size: 0.75rem;
  }

  .notifications-dropdown,
  .user-dropdown {
    top: calc(100% + 0.25rem); /* کاهش فاصله */
    right: 0.25rem;
    left: 0.25rem;
    min-width: auto;
    max-width: none;
    width: calc(100vw - 0.5rem);
  }
}
@media (max-width: 480px) {
  .modern-navbar {
    height: 50px; /* ارتفاع کمتر */
  }

  .navbar-content {
    height: 50px;
    padding: 0.125rem 0;
  }

  .container-fluid {
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
  }

  .page-title {
    font-size: 0.85rem;
  }

  .mobile-menu-toggle {
    padding: 0.25rem;
    font-size: 0.9rem;
  }

  .avatar-circle {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .notifications-dropdown,
  .user-dropdown {
    right: 0.125rem;
    left: 0.125rem;
    width: calc(100vw - 0.25rem);
  }
}
@media (max-width: 360px) {
  .modern-navbar {
    height: 48px;
  }

  .navbar-content {
    height: 48px;
  }

  .page-title {
    font-size: 0.8rem;
    max-width: 120px; /* محدود کردن عرض */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modern-navbar {
    background: rgba(45, 55, 72, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .page-title,
  .user-name,
  .dropdown-title,
  .notification-title {
    color: #e2e8f0;
  }

  .user-role,
  .notification-message {
    color: #cbd5e0;
  }

  .search-input {
    background: rgba(74, 85, 104, 0.8);
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .search-input:focus {
    background: rgba(74, 85, 104, 1);
  }

  .notifications-dropdown,
  .user-dropdown {
    background: #2d3748;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .dropdown-header,
  .dropdown-footer {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .dropdown-item {
    color: #cbd5e0;
  }

  .dropdown-item:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #90cdf4;
  }

  .notification-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .notification-item.unread {
    background: rgba(102, 126, 234, 0.05);
  }
}
</style>