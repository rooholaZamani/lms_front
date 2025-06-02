<template>
  <div class="sidebar-wrapper" :class="{ 'collapsed': collapsed }">
    <!-- Toggle Button -->
    <button class="sidebar-toggle modern-btn modern-btn-primary" @click="toggleSidebar" :title="collapsed ? 'باز کردن منو' : 'بستن منو'">
      <i class="fas" :class="collapsed ? 'fa-bars' : 'fa-times'"></i>
    </button>

    <!-- Sidebar -->
    <div class="modern-sidebar" :class="{ 'collapsed': collapsed }">
      <div class="sidebar-header">
        <div v-if="!collapsed" class="header-content animate-fade-in">
          <div class="sidebar-logo">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <h5 class="header-title">منوی اصلی</h5>
          <p class="header-subtitle">سامانه آموزش آنلاین</p>
        </div>
        <div v-else class="header-collapsed">
          <i class="fas fa-home sidebar-icon-collapsed"></i>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav flex-column">
          <!-- Common menu items -->
          <li class="nav-item">
            <router-link
                class="modern-nav-link"
                :to="{ name: 'Dashboard' }"
                active-class="active"
                :title="collapsed ? 'داشبورد' : ''"
            >
              <div class="nav-icon">
                <i class="fas fa-tachometer-alt"></i>
              </div>
              <span v-if="!collapsed" class="nav-text">داشبورد</span>
              <div v-if="!collapsed" class="nav-arrow">
                <i class="fas fa-chevron-left"></i>
              </div>
            </router-link>
          </li>

          <li v-if="isStudent" class="nav-item">
            <router-link
                class="modern-nav-link"
                :to="{ name: 'Courses' }"
                active-class="active"
                :title="collapsed ? 'دوره‌ها' : ''"
            >
              <div class="nav-icon">
                <i class="fas fa-book"></i>
              </div>
              <span v-if="!collapsed" class="nav-text">دوره‌ها</span>
              <div v-if="!collapsed" class="nav-arrow">
                <i class="fas fa-chevron-left"></i>
              </div>
            </router-link>
          </li>

          <!-- Teacher-specific menu items -->
          <template v-if="isTeacher">
            <li class="nav-divider" v-if="!collapsed">
              <span>
                <i class="fas fa-chalkboard-teacher me-2"></i>
                مدیریت تدریس
              </span>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'TeachingCourses' }"
                  active-class="active"
                  :title="collapsed ? 'دوره‌های در حال تدریس' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">دوره‌های در حال تدریس</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'PendingAssignments' }"
                  active-class="active"
                  :title="collapsed ? 'تکالیف در حال بررسی' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-tasks"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">تکالیف در حال بررسی</span>
                <div v-if="!collapsed" class="nav-badge modern-badge modern-badge-warning">
                  <span>3</span>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'PerformanceAnalysis' }"
                  active-class="active"
                  :title="collapsed ? 'تحلیل عملکرد' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">تحلیل عملکرد</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'TeacherExams' }"
                  active-class="active"
                  :title="collapsed ? 'آزمون‌های من' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-clipboard-check"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">آزمون‌های من</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'QuestionBank' }"
                  active-class="active"
                  :title="collapsed ? 'بانک سوالات' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-question-circle"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">بانک سوالات</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>
          </template>

          <!-- Student-specific menu items -->
          <template v-if="isStudent">
            <li class="nav-divider" v-if="!collapsed">
              <span>
                <i class="fas fa-user-graduate me-2"></i>
                تحصیل
              </span>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'AvailableCourses' }"
                  active-class="active"
                  :title="collapsed ? 'دوره‌های موجود' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-search"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">دوره‌های موجود</span>
                <div v-if="!collapsed" class="nav-badge modern-badge modern-badge-info">
                  <span>جدید</span>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'StudentAssignments' }"
                  active-class="active"
                  :title="collapsed ? 'تکالیف' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-file-alt"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">تکالیف</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>


            <!-- آزمون‌ها - برای هر دو نقش -->
            <li class="nav-divider" v-if="!collapsed">
            <span>
              <i class="fas fa-clipboard-check me-2"></i>
              آزمون‌ها
            </span>
            </li>

            <template v-if="isTeacher">
              <li class="nav-item">
                <router-link
                    class="modern-nav-link"
                    :to="{ name: 'TeacherExams' }"
                    active-class="active"
                    :title="collapsed ? 'آزمون‌های من' : ''"
                >
                  <div class="nav-icon">
                    <i class="fas fa-clipboard-list"></i>
                  </div>
                  <span v-if="!collapsed" class="nav-text">آزمون‌های من</span>
                  <div v-if="!collapsed" class="nav-arrow">
                    <i class="fas fa-chevron-left"></i>
                  </div>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                    class="modern-nav-link"
                    :to="{ name: 'ExamCreator' }"
                    active-class="active"
                    :title="collapsed ? 'ایجاد آزمون جدید' : ''"
                >
                  <div class="nav-icon">
                    <i class="fas fa-plus-circle"></i>
                  </div>
                  <span v-if="!collapsed" class="nav-text">ایجاد آزمون جدید</span>
                  <div v-if="!collapsed" class="nav-arrow">
                    <i class="fas fa-chevron-left"></i>
                  </div>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                    class="modern-nav-link"
                    :to="{ name: 'QuestionBank' }"
                    active-class="active"
                    :title="collapsed ? 'بانک سوالات' : ''"
                >
                  <div class="nav-icon">
                    <i class="fas fa-question-circle"></i>
                  </div>
                  <span v-if="!collapsed" class="nav-text">بانک سوالات</span>
                  <div v-if="!collapsed" class="nav-arrow">
                    <i class="fas fa-chevron-left"></i>
                  </div>
                </router-link>
              </li>
            </template>

            <template v-if="isStudent">
              <li class="nav-item">
                <router-link
                    class="modern-nav-link"
                    :to="{ name: 'StudentExams' }"
                    active-class="active"
                    :title="collapsed ? 'آزمون‌های من' : ''"
                >
                  <div class="nav-icon">
                    <i class="fas fa-clipboard-check"></i>
                  </div>
                  <span v-if="!collapsed" class="nav-text">آزمون‌های من</span>
                  <div v-if="!collapsed" class="nav-arrow">
                    <i class="fas fa-chevron-left"></i>
                  </div>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                    class="modern-nav-link"
                    :to="{ name: 'StudentExamResults' }"
                    active-class="active"
                    :title="collapsed ? 'نتایج آزمون‌ها' : ''"
                >
                  <div class="nav-icon">
                    <i class="fas fa-chart-bar"></i>
                  </div>
                  <span v-if="!collapsed" class="nav-text">نتایج آزمون‌ها</span>
                  <div v-if="!collapsed" class="nav-arrow">
                    <i class="fas fa-chevron-left"></i>
                  </div>
                </router-link>
              </li>
            </template>
          </template>




          <li v-if="isTeacher" class="nav-item">
            <router-link
                class="modern-nav-link"
                :to="{ name: 'Students' }"
                active-class="active"
                :title="collapsed ? 'مدیریت دانش‌آموزان' : ''"
            >
              <div class="nav-icon">
                <i class="fas fa-users"></i>
              </div>
              <span v-if="!collapsed" class="nav-text">مدیریت دانش‌آموزان</span>
              <div v-if="!collapsed" class="nav-arrow">
                <i class="fas fa-chevron-left"></i>
              </div>
            </router-link>
          </li>

          <li v-if="isTeacher" class="nav-item">
            <router-link
                class="modern-nav-link"
                :to="{ name: 'StudentActivities' }"
                active-class="active"
                :title="collapsed ? 'فعالیت دانش‌آموزان' : ''"
            >
              <div class="nav-icon">
                <i class="fas fa-user-graduate"></i>
              </div>
              <span v-if="!collapsed" class="nav-text">فعالیت دانش‌آموزان</span>
              <div v-if="!collapsed" class="nav-arrow">
                <i class="fas fa-chevron-left"></i>
              </div>
            </router-link>
          </li>


          <!-- Common menu items -->
          <li class="nav-divider" v-if="!collapsed">
            <span>
              <i class="fas fa-cog me-2"></i>
              عمومی
            </span>
          </li>

          <li class="nav-item">
            <router-link
                class="modern-nav-link"
                :to="{ name: 'Profile' }"
                active-class="active"
                :title="collapsed ? 'پروفایل' : ''"
            >
              <div class="nav-icon">
                <i class="fas fa-user"></i>
              </div>
              <span v-if="!collapsed" class="nav-text">پروفایل</span>
              <div v-if="!collapsed" class="nav-arrow">
                <i class="fas fa-chevron-left"></i>
              </div>
            </router-link>
          </li>

          <li v-if="isTeacher" class="nav-item">
            <router-link
                class="modern-nav-link"
                :to="{ name: 'Reports' }"
                active-class="active"
                :title="collapsed ? 'گزارش‌ها' : ''"
            >
              <div class="nav-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <span v-if="!collapsed" class="nav-text">گزارش‌ها</span>
              <div v-if="!collapsed" class="nav-arrow">
                <i class="fas fa-chevron-left"></i>
              </div>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Overlay for mobile -->
    <div v-if="!collapsed && isMobile" class="sidebar-overlay" @click="closeSidebar"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUser } from '@/composables/useUser.js';
import { useRouter } from 'vue-router';

export default {
  name: 'Sidebar',
  emits: ['sidebar-collapsed'],
  setup(props, { emit }) {
    const { isTeacher, isStudent, currentUser, logout } = useUser();
    const router = useRouter();
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
      localStorage.setItem('sidebarCollapsed', collapsed.value.toString());
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

    const handleLogout = async () => {
      try {
        await logout();
        router.push({ name: 'Login' });
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    // Load preference from localStorage
    onMounted(() => {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        collapsed.value = savedState === 'true';
      }

      checkMobile();
      window.addEventListener('resize', checkMobile);
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
      getUserRole,
      handleLogout
    };
  }
}
</script>

<style scoped>
/* Sidebar Wrapper */
.sidebar-wrapper {
  position: relative;
  z-index: 1000;
}

/* Toggle Button */
.sidebar-toggle {
  position: fixed;
  top: 70px;
  right: 15px;
  z-index: 1001;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  font-size: 1rem;
}

.sidebar-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Modern Sidebar */
.modern-sidebar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(15px);
  border-left: 1px solid rgba(102, 126, 234, 0.1);
  height: calc(100vh - 56px);
  position: fixed;
  top: 56px;
  right: 0;
  width: 280px;
  overflow-y: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
}

.modern-sidebar.collapsed {
  width: 70px;
}

/* Sidebar Header */
.sidebar-header {
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 1rem;
}

.sidebar-logo {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  animation: float 6s ease-in-out infinite;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.header-subtitle {
  font-size: 0.8rem;
  opacity: 0.9;
  margin: 0;
}

.header-collapsed {
  text-align: center;
}

.sidebar-icon-collapsed {
  font-size: 1.5rem;
  color: white;
}

/* Navigation */
.sidebar-nav {
  padding: 0.5rem 0;
  flex: 1;
}

.nav-item {
  margin-bottom: 0.25rem;
}

/* Modern Nav Links */
.modern-nav-link {
  color: #495057;
  padding: 0.875rem 1.25rem;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  position: relative;
  text-decoration: none;
  margin: 0 0.75rem;
  border-radius: 12px;
  background: transparent;
}

.modern-sidebar.collapsed .modern-nav-link {
  justify-content: center;
  padding: 0.875rem;
  margin: 0 0.5rem;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.75rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.modern-sidebar.collapsed .nav-icon {
  margin-left: 0;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.3s ease;
  font-weight: 500;
}

.modern-sidebar.collapsed .nav-text {
  opacity: 0;
}

.nav-arrow {
  opacity: 0.5;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.nav-badge {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
  margin-left: auto;
}

/* Hover and Active States */
.modern-nav-link:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.modern-nav-link:hover .nav-arrow {
  opacity: 1;
  transform: translateX(-2px);
}

.modern-nav-link:hover .nav-icon {
  transform: scale(1.1);
  color: #667eea;
}

.modern-nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.modern-nav-link.active .nav-icon {
  color: white;
}

.modern-nav-link.active:hover {
  transform: translateX(-3px) scale(1.02);
}

/* Nav Dividers */
.nav-divider {
  margin: 1.5rem 0 1rem 0;
  padding: 0 1.25rem;
}

.nav-divider span {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.user-info.collapsed {
  justify-content: center;
  padding: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.75rem;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-info.collapsed .user-avatar {
  margin-left: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin-bottom: 0.5rem;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

/* Tooltip for collapsed sidebar */
.modern-sidebar.collapsed .modern-nav-link {
  position: relative;
}

.modern-sidebar.collapsed .modern-nav-link[title]:hover::after {
  content: attr(title);
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, rgba(33, 37, 41, 0.95), rgba(52, 58, 64, 0.95));
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  white-space: nowrap;
  font-size: 0.75rem;
  margin-right: 15px;
  z-index: 1002;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.2s ease-out;
}

.modern-sidebar.collapsed .modern-nav-link[title]:hover::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(33, 37, 41, 0.95);
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
  .modern-sidebar {
    width: 280px;
    transform: translateX(100%);
  }

  .modern-sidebar:not(.collapsed) {
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

/* Custom scrollbar */
.modern-sidebar::-webkit-scrollbar {
  width: 4px;
}

.modern-sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.modern-sidebar::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
}

.modern-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modern-sidebar {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(45, 55, 72, 0.9));
    border-left-color: rgba(102, 126, 234, 0.2);
  }

  .modern-nav-link {
    color: #e2e8f0;
  }

  .modern-nav-link:hover {
    color: #667eea;
  }

  .nav-divider span {
    color: #cbd5e0;
  }

  .user-name {
    color: #e2e8f0;
  }
}
</style>