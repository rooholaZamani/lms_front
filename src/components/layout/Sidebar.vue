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
                  :title="collapsed ? 'درحال تدریس' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-chalkboard"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">درحال تدریس</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'AssignmentManager' }"
                  active-class="active"
                  :title="collapsed ? 'مدیریت تکالیف' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-tasks"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">مدیریت تکالیف</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'AssignmentGrading' }"
                  active-class="active"
                  :title="collapsed ? 'نمره‌گذاری تکالیف' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">نمره‌گذاری تکالیف</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'StudentActivities' }"
                  active-class="active"
                  :title="collapsed ? 'فعالیت دانش‌آموزان' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-users"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">فعالیت دانش‌آموزان</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
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

            <!-- آزمون‌ها - برای معلم -->
            <li class="nav-divider" v-if="!collapsed">
              <span>
                <i class="fas fa-clipboard-check me-2"></i>
                آزمون‌ها
              </span>
            </li>

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
                  :to="{ name: 'ExamManualGradingList' }"
                  active-class="active"
                  :title="collapsed ? 'نمره‌دهی دستی' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-edit"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">نمره‌دهی دستی</span>
                <!-- نشان تعداد آزمون‌های در انتظار -->
                <div v-if="!collapsed && pendingGradingCount > 0" class="nav-badge modern-badge modern-badge-warning">
                  <span>{{ pendingGradingCount }}</span>
                </div>
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
                  :title="collapsed ? 'ایجاد آزمون' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-plus-circle"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">ایجاد آزمون</span>
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
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
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

            <!-- آزمون‌ها - برای دانش‌آموز -->
            <li class="nav-divider" v-if="!collapsed">
              <span>
                <i class="fas fa-clipboard-check me-2"></i>
                آزمون‌ها
              </span>
            </li>

            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'StudentExams' }"
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
            <li class="nav-item">
              <router-link
                  class="modern-nav-link"
                  :to="{ name: 'MyActivities' }"
                  active-class="active"
                  :title="collapsed ? 'فعالیت‌های من' : ''"
              >
                <div class="nav-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <span v-if="!collapsed" class="nav-text">فعالیت‌های من</span>
                <div v-if="!collapsed" class="nav-arrow">
                  <i class="fas fa-chevron-left"></i>
                </div>
              </router-link>
            </li>
          </template>

          <!-- Common items -->
          <li class="nav-divider" v-if="!collapsed">
            <span>
              <i class="fas fa-cog me-2"></i>
              تنظیمات
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
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="user-info" :class="{ 'collapsed': collapsed }">
          <div class="user-avatar">
            {{ getUserInitials() }}
          </div>
          <div v-if="!collapsed" class="user-details">
            <div class="user-name">{{ getUserName() }}</div>
            <div class="user-role">
              <span class="modern-badge modern-badge-sm" :class="getRoleBadgeClass()">
                {{ getUserRole() }}
              </span>
            </div>
            <div class="user-actions">
              <button class="modern-btn modern-btn-sm modern-btn-outline" @click="handleLogout">
                <i class="fas fa-sign-out-alt me-1"></i>
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div v-if="!collapsed && isMobile" class="sidebar-overlay show" @click="closeSidebar"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUser } from '@/composables/useUser.js';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'Sidebar',
  emits: ['sidebar-collapsed'],
  setup(props, { emit }) {
    const { isTeacher, isStudent, currentUser, logout } = useUser();
    const router = useRouter();
    const collapsed = ref(false);
    const isMobile = ref(false);
    const pendingGradingCount = ref(0);

    // Check if mobile
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
      if (isMobile.value) {
        collapsed.value = true;
      } else {
      const saved = localStorage.getItem('sidebarCollapsed');
      collapsed.value = saved === 'true';
    }
    };

    // Fetch pending grading count for teachers
    const fetchPendingGradingCount = async () => {
      if (!isTeacher.value) return;

      try {
        const response = await axios.get('/exams/manual-grading-overview');
        if (response.data.success) {
          pendingGradingCount.value = response.data.totalPendingSubmissions || 0;
        }
      } catch (error) {
        console.error('Error fetching pending grading count:', error);
        pendingGradingCount.value = 0;
      }
    };

    const toggleSidebar = () => {
      collapsed.value = !collapsed.value;
      if (!isMobile.value) {
        localStorage.setItem('sidebarCollapsed', collapsed.value.toString());
      }
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

    const getUserInitials = () => {
      if (!currentUser.value) return 'K';

      if (currentUser.value.firstName && currentUser.value.lastName) {
        return `${currentUser.value.firstName.charAt(0)}${currentUser.value.lastName.charAt(0)}`;
      }

      return currentUser.value.username ? currentUser.value.username.charAt(0).toUpperCase() : 'K';
    };

    const getUserRole = () => {
      if (isTeacher.value) return 'استاد';
      if (isStudent.value) return 'دانش‌آموز';
      return 'کاربر';
    };

    const getRoleBadgeClass = () => {
      if (isTeacher.value) return 'modern-badge-success';
      if (isStudent.value) return 'modern-badge-info';
      return 'modern-badge-secondary';
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

      // Fetch pending grading count on mount and set interval
      fetchPendingGradingCount();

      // Update count every 5 minutes
      const interval = setInterval(fetchPendingGradingCount, 5 * 60 * 1000);

      onUnmounted(() => {
        window.removeEventListener('resize', checkMobile);
        clearInterval(interval);
      });
    });

    return {
      isTeacher,
      isStudent,
      currentUser,
      collapsed,
      isMobile,
      pendingGradingCount,
      toggleSidebar,
      closeSidebar,
      getUserName,
      getUserInitials,
      getUserRole,
      getRoleBadgeClass,
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
  margin-right: 0.5rem;
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
  border-radius: 12px;
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
  font-weight: 600;
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

/* Modern Badges */
.modern-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-badge-sm {
  padding: 0.1rem 0.4rem;
  font-size: 0.65rem;
}

.modern-badge-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
}

.modern-badge-success {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.modern-badge-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
  color: #212529;
}

.modern-badge-secondary {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

/* Modern Buttons */
.modern-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.modern-btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.modern-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modern-btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1002;
  margin-right: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-sidebar {
    width: 240px; /* کاهش عرض از 280 به 240 */
    transform: translateX(100%); /* مخفی کردن اولیه */
    top: 0; /* از بالای صفحه شروع شود */
    height: 100vh; /* تمام ارتفاع صفحه */
    z-index: 1050; /* بالاتر از سایر عناصر */
  }

  .modern-sidebar:not(.collapsed) {
    transform: translateX(0); /* نمایش کامل */
  }

  .modern-sidebar.collapsed {
    transform: translateX(100%); /* مخفی کردن کامل */
    width: 0; /* عرض صفر */
  }

  .sidebar-toggle {
    display: block;
    z-index: 1051;
  }
}

/* Scrollbar */
.modern-sidebar::-webkit-scrollbar {
  width: 4px;
}

.modern-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.modern-sidebar::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 2px;
}

.modern-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

@media (max-width: 480px) {
  .modern-sidebar {
    width: 220px; /* عرض کمتر برای موبایل‌های کوچک */
  }
}

@media (max-width: 360px) {
  .modern-sidebar {
    width: 200px; /* عرض خیلی کم برای موبایل‌های قدیمی */
  }
}

.modern-sidebar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 768px) {
  .modern-sidebar {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>