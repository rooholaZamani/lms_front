<template>
  <div class="sidebar-wrapper" :class="{ 'collapsed': collapsed }">
    <!-- Toggle Button -->
    <button class="sidebar-toggle" @click="toggleSidebar" :title="collapsed ? 'باز کردن منو' : 'بستن منو'">
      <i class="fas" :class="collapsed ? 'fa-bars' : 'fa-times'"></i>
    </button>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'collapsed': collapsed }">
      <div class="sidebar-header">
        <h5 v-if="!collapsed" class="text-center text-primary">منوی اصلی</h5>
        <i v-else class="fas fa-home text-primary sidebar-icon-collapsed"></i>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav flex-column">
          <!-- Common menu items -->
          <li class="nav-item">
            <router-link
                class="nav-link"
                :to="{ name: 'Dashboard' }"
                active-class="active"
                :title="collapsed ? 'داشبورد' : ''"
            >
              <i class="fas fa-tachometer-alt"></i>
              <span v-if="!collapsed" class="nav-text">داشبورد</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
                class="nav-link"
                :to="{ name: 'Courses' }"
                active-class="active"
                :title="collapsed ? 'دوره‌ها' : ''"
            >
              <i class="fas fa-book"></i>
              <span v-if="!collapsed" class="nav-text">دوره‌ها</span>
            </router-link>
          </li>

          <!-- Teacher-specific menu items -->
          <template v-if="isTeacher">
            <li class="nav-divider" v-if="!collapsed">
              <span>مدیریت تدریس</span>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'TeachingCourses' }"
                  active-class="active"
                  :title="collapsed ? 'دوره‌های تدریس' : ''"
              >
                <i class="fas fa-chalkboard-teacher"></i>
                <span v-if="!collapsed" class="nav-text">دوره‌های تدریس</span>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'PendingAssignments' }"
                  active-class="active"
                  :title="collapsed ? 'تکالیف در حال بررسی' : ''"
              >
                <i class="fas fa-tasks"></i>
                <span v-if="!collapsed" class="nav-text">تکالیف در حال بررسی</span>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'StudentActivities' }"
                  active-class="active"
                  :title="collapsed ? 'فعالیت دانش‌آموزان' : ''"
              >
                <i class="fas fa-user-graduate"></i>
                <span v-if="!collapsed" class="nav-text">فعالیت دانش‌آموزان</span>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'PerformanceAnalysis' }"
                  active-class="active"
                  :title="collapsed ? 'تحلیل عملکرد' : ''"
              >
                <i class="fas fa-chart-line"></i>
                <span v-if="!collapsed" class="nav-text">تحلیل عملکرد</span>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'TeacherExams' }"
                  active-class="active"
                  :title="collapsed ? 'آزمون‌های من' : ''"
              >
                <i class="fas fa-clipboard-check"></i>
                <span v-if="!collapsed" class="nav-text">آزمون‌های من</span>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'QuestionBank' }"
                  active-class="active"
                  :title="collapsed ? 'بانک سوالات' : ''"
              >
                <i class="fas fa-question-circle"></i>
                <span v-if="!collapsed" class="nav-text">بانک سوالات</span>
              </router-link>
            </li>
          </template>

          <!-- Student-specific menu items -->
          <template v-if="isStudent">
            <li class="nav-divider" v-if="!collapsed">
              <span>تحصیل</span>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'AvailableCourses' }"
                  active-class="active"
                  :title="collapsed ? 'دوره‌های موجود' : ''"
              >
                <i class="fas fa-search"></i>
                <span v-if="!collapsed" class="nav-text">دوره‌های موجود</span>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="nav-link"
                  :to="{ name: 'StudentAssignments' }"
                  active-class="active"
                  :title="collapsed ? 'تکالیف' : ''"
              >
                <i class="fas fa-file-alt"></i>
                <span v-if="!collapsed" class="nav-text">تکالیف</span>
              </router-link>
            </li>
          </template>

          <!-- Common menu items -->
          <li class="nav-divider" v-if="!collapsed">
            <span>عمومی</span>
          </li>

          <li class="nav-item">
            <router-link
                class="nav-link"
                :to="{ name: 'Profile' }"
                active-class="active"
                :title="collapsed ? 'پروفایل' : ''"
            >
              <i class="fas fa-user"></i>
              <span v-if="!collapsed" class="nav-text">پروفایل</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
                class="nav-link"
                :to="{ name: 'Reports' }"
                active-class="active"
                :title="collapsed ? 'گزارش‌ها' : ''"
            >
              <i class="fas fa-chart-bar"></i>
              <span v-if="!collapsed" class="nav-text">گزارش‌ها</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- User Info at Bottom -->
      <div class="sidebar-footer" v-if="currentUser">
        <div class="user-info" :class="{ 'collapsed': collapsed }">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div v-if="!collapsed" class="user-details">
            <div class="user-name">{{ getUserName() }}</div>
            <div class="user-role">{{ getUserRole() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div v-if="!collapsed && isMobile" class="sidebar-overlay" @click="closeSidebar"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Sidebar',
  emits: ['sidebar-collapsed'],
  setup(props, { emit }) {
    const { isTeacher, isStudent, currentUser } = useUser();
    const collapsed = ref(false);
    const isMobile = ref(false);

    // Check if mobile
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
      if (isMobile.value) {
        collapsed.value = true;
      }
    };

    const toggleSidebar = () => {
      collapsed.value = !collapsed.value;

      // Store preference in localStorage
      localStorage.setItem('sidebarCollapsed', collapsed.value.toString());

      // Emit event to parent
      emit('sidebar-collapsed', collapsed.value);
    };

    const closeSidebar = () => {
      if (isMobile.value) {
        collapsed.value = true;
        emit('sidebar-collapsed', collapsed.value);
      }
    };

    const getUserName = () => {
      if (!currentUser.value) return 'کاربر';
      return currentUser.value.firstName && currentUser.value.lastName
          ? `${currentUser.value.firstName} ${currentUser.value.lastName}`
          : currentUser.value.username;
    };

    const getUserRole = () => {
      if (isTeacher.value) return 'استاد';
      if (isStudent.value) return 'دانش‌آموز';
      return 'کاربر';
    };

    // Load preference from localStorage
    onMounted(() => {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        collapsed.value = savedState === 'true';
      }

      checkMobile();
      window.addEventListener('resize', checkMobile);

      // Emit initial state
      emit('sidebar-collapsed', collapsed.value);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile);
    });

    return {
      isTeacher,
      isStudent,
      currentUser,
      collapsed,
      isMobile,
      toggleSidebar,
      closeSidebar,
      getUserName,
      getUserRole
    };
  }
}
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
  z-index: 1000;
}

.sidebar-toggle {
  position: fixed;
  top: 70px;
  right: 15px;
  z-index: 1001;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background-color: #0056b3;
  transform: scale(1.1);
}

.sidebar {
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
  height: calc(100vh - 56px);
  position: fixed;
  top: 56px;
  right: 0;
  width: 260px;
  overflow-y: auto;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #fff;
  text-align: center;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-icon-collapsed {
  font-size: 1.5rem;
}

.sidebar-nav {
  padding: 0.5rem 0;
  flex: 1;
}

.nav-item {
  margin-bottom: 2px;
}

.nav-link {
  color: #495057;
  padding: 0.75rem 1rem;
  border-radius: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  position: relative;
  text-decoration: none;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem;
}

.nav-link i {
  width: 20px;
  text-align: center;
  margin-left: 0.75rem;
  font-size: 1.1rem;
}

.sidebar.collapsed .nav-link i {
  margin-left: 0;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
}

.nav-link:hover {
  background-color: #e9ecef;
  color: #007bff;
  transform: translateX(-2px);
}

.nav-link.active {
  background-color: #007bff;
  color: white;
}

.nav-link.active:hover {
  background-color: #0056b3;
}

.nav-divider {
  margin: 1rem 0 0.5rem 0;
  padding: 0 1rem;
}

.nav-divider span {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.sidebar-footer {
  border-top: 1px solid #dee2e6;
  background-color: #fff;
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.user-info.collapsed {
  justify-content: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.75rem;
  font-size: 0.9rem;
}

.user-info.collapsed .user-avatar {
  margin-left: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #495057;
}

.user-role {
  font-size: 0.75rem;
  color: #6c757d;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Tooltip for collapsed sidebar */
.sidebar.collapsed .nav-link {
  position: relative;
}

.sidebar.collapsed .nav-link[title]:hover::after {
  content: attr(title);
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(33, 37, 41, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 0.75rem;
  margin-right: 15px;
  z-index: 1002;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  animation: tooltipFadeIn 0.2s ease-out;
}

.sidebar.collapsed .nav-link[title]:hover::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(33, 37, 41, 0.9);
  margin-right: 9px;
  z-index: 1002;
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .sidebar {
    width: 260px;
    transform: translateX(100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: block;
  }
}

@media (min-width: 769px) {
  .sidebar-overlay {
    display: none;
  }
}

/* Smooth animations */
.sidebar * {
  transition: all 0.3s ease;
}

/* Custom scrollbar */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>