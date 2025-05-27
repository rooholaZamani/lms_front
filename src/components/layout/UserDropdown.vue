<!--<template>-->
<!--  <div class="user-dropdown-container">-->
<!--    <div class="dropdown">-->
<!--      <button-->
<!--          class="modern-user-btn dropdown-toggle"-->
<!--          type="button"-->
<!--          data-bs-toggle="dropdown"-->
<!--          aria-expanded="false">-->
<!--        <div class="user-avatar">-->
<!--          <i class="fas fa-user"></i>-->
<!--        </div>-->
<!--        <div class="user-info">-->
<!--          <span class="user-name">{{ displayName }}</span>-->
<!--          <small class="user-role">{{ userRole }}</small>-->
<!--        </div>-->
<!--        <div class="dropdown-arrow">-->
<!--          <i class="fas fa-chevron-down"></i>-->
<!--        </div>-->
<!--      </button>-->

<!--      <ul class="dropdown-menu modern-dropdown-menu">-->
<!--        &lt;!&ndash; User Info Header &ndash;&gt;-->
<!--        <li class="dropdown-header">-->
<!--          <div class="dropdown-user-info">-->
<!--            <div class="dropdown-avatar">-->
<!--              <i class="fas fa-user"></i>-->
<!--            </div>-->
<!--            <div class="dropdown-details">-->
<!--              <div class="dropdown-name">{{ displayName }}</div>-->
<!--              <div class="dropdown-email">{{ user.email }}</div>-->
<!--              <span class="modern-badge modern-badge-primary">{{ userRole }}</span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </li>-->

<!--        <li><hr class="dropdown-divider"></li>-->

<!--        &lt;!&ndash; Profile Section &ndash;&gt;-->
<!--        <li class="dropdown-section">-->
<!--          <div class="section-title">-->
<!--            <i class="fas fa-user-cog me-2"></i>-->
<!--            حساب کاربری-->
<!--          </div>-->
<!--        </li>-->

<!--        <li>-->
<!--          <router-link class="dropdown-item modern-dropdown-item" :to="{ name: 'Profile' }">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-user-edit"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">پروفایل من</span>-->
<!--              <small class="item-subtitle">ویرایش اطلاعات شخصی</small>-->
<!--            </div>-->
<!--            <div class="item-arrow">-->
<!--              <i class="fas fa-chevron-left"></i>-->
<!--            </div>-->
<!--          </router-link>-->
<!--        </li>-->

<!--        <li>-->
<!--          <a class="dropdown-item modern-dropdown-item" href="#" @click.prevent="showPasswordModal = true">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-key"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">تغییر رمز عبور</span>-->
<!--              <small class="item-subtitle">امنیت حساب کاربری</small>-->
<!--            </div>-->
<!--            <div class="item-arrow">-->
<!--              <i class="fas fa-chevron-left"></i>-->
<!--            </div>-->
<!--          </a>-->
<!--        </li>-->

<!--        &lt;!&ndash; Quick Actions &ndash;&gt;-->
<!--        <li class="dropdown-section">-->
<!--          <div class="section-title">-->
<!--            <i class="fas fa-bolt me-2"></i>-->
<!--            دسترسی سریع-->
<!--          </div>-->
<!--        </li>-->

<!--        <li>-->
<!--          <router-link class="dropdown-item modern-dropdown-item" :to="{ name: 'Dashboard' }">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-tachometer-alt"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">داشبورد</span>-->
<!--              <small class="item-subtitle">صفحه اصلی شما</small>-->
<!--            </div>-->
<!--            <div class="item-arrow">-->
<!--              <i class="fas fa-chevron-left"></i>-->
<!--            </div>-->
<!--          </router-link>-->
<!--        </li>-->

<!--        <li v-if="isStudent">-->
<!--          <router-link class="dropdown-item modern-dropdown-item" :to="{ name: 'AvailableCourses' }">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-search"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">دوره‌های موجود</span>-->
<!--              <small class="item-subtitle">کشف دوره‌های جدید</small>-->
<!--            </div>-->
<!--            <div class="item-badge">-->
<!--              <span class="modern-badge modern-badge-success">جدید</span>-->
<!--            </div>-->
<!--          </router-link>-->
<!--        </li>-->

<!--        <li v-if="isTeacher">-->
<!--          <router-link class="dropdown-item modern-dropdown-item" :to="{ name: 'TeachingCourses' }">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-chalkboard-teacher"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">دوره‌های تدریس</span>-->
<!--              <small class="item-subtitle">مدیریت دوره‌های شما</small>-->
<!--            </div>-->
<!--            <div class="item-arrow">-->
<!--              <i class="fas fa-chevron-left"></i>-->
<!--            </div>-->
<!--          </router-link>-->
<!--        </li>-->

<!--        &lt;!&ndash; Settings & Support &ndash;&gt;-->
<!--        <li class="dropdown-section">-->
<!--          <div class="section-title">-->
<!--            <i class="fas fa-cog me-2"></i>-->
<!--            تنظیمات و پشتیبانی-->
<!--          </div>-->
<!--        </li>-->

<!--        <li>-->
<!--          <a class="dropdown-item modern-dropdown-item" href="#" @click.prevent="showPreferences = true">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-sliders-h"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">تنظیمات</span>-->
<!--              <small class="item-subtitle">شخصی‌سازی حساب</small>-->
<!--            </div>-->
<!--            <div class="item-arrow">-->
<!--              <i class="fas fa-chevron-left"></i>-->
<!--            </div>-->
<!--          </a>-->
<!--        </li>-->

<!--        <li>-->
<!--          <a class="dropdown-item modern-dropdown-item" href="#" @click.prevent="openSupport">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-headset"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">پشتیبانی</span>-->
<!--              <small class="item-subtitle">راهنمایی و کمک</small>-->
<!--            </div>-->
<!--            <div class="item-arrow">-->
<!--              <i class="fas fa-external-link-alt"></i>-->
<!--            </div>-->
<!--          </a>-->
<!--        </li>-->

<!--        <li><hr class="dropdown-divider"></li>-->

<!--        &lt;!&ndash; Logout &ndash;&gt;-->
<!--        <li>-->
<!--          <a class="dropdown-item modern-dropdown-item logout-item" href="#" @click.prevent="handleLogout">-->
<!--            <div class="item-icon">-->
<!--              <i class="fas fa-sign-out-alt"></i>-->
<!--            </div>-->
<!--            <div class="item-content">-->
<!--              <span class="item-title">خروج از حساب</span>-->
<!--              <small class="item-subtitle">پایان جلسه کاری</small>-->
<!--            </div>-->
<!--            <div class="item-arrow">-->
<!--              <i class="fas fa-chevron-left"></i>-->
<!--            </div>-->
<!--          </a>-->
<!--        </li>-->
<!--      </ul>-->
<!--    </div>-->

<!--    &lt;!&ndash; Status Indicator &ndash;&gt;-->
<!--    <div class="status-indicator online" title="آنلاین"></div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { computed, ref } from 'vue';-->
<!--import { useUser } from '@/composables/useUser.js';-->

<!--export default {-->
<!--  name: 'UserDropdown',-->
<!--  props: {-->
<!--    user: {-->
<!--      type: Object,-->
<!--      required: true-->
<!--    }-->
<!--  },-->
<!--  emits: ['logout'],-->
<!--  setup(props, { emit }) {-->
<!--    const { isTeacher, isStudent } = useUser();-->
<!--    const showPasswordModal = ref(false);-->
<!--    const showPreferences = ref(false);-->

<!--    const displayName = computed(() => {-->
<!--      return props.user.firstName && props.user.lastName-->
<!--          ? `${props.user.firstName} ${props.user.lastName}`-->
<!--          : props.user.username;-->
<!--    });-->

<!--    const userRole = computed(() => {-->
<!--      if (isTeacher.value) return 'استاد';-->
<!--      if (isStudent.value) return 'دانش‌آموز';-->
<!--      return 'کاربر';-->
<!--    });-->

<!--    const handleLogout = () => {-->
<!--      emit('logout');-->
<!--    };-->

<!--    const openSupport = () => {-->
<!--      // Open support in new tab or show support modal-->
<!--      window.open('mailto:support@example.com', '_blank');-->
<!--    };-->

<!--    return {-->
<!--      isTeacher,-->
<!--      isStudent,-->
<!--      displayName,-->
<!--      userRole,-->
<!--      showPasswordModal,-->
<!--      showPreferences,-->
<!--      handleLogout,-->
<!--      openSupport-->
<!--    };-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--/* User Dropdown Container */-->
<!--.user-dropdown-container {-->
<!--  position: relative;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--}-->

<!--/* Modern User Button */-->
<!--.modern-user-btn {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 0.75rem;-->
<!--  padding: 0.5rem 1rem;-->
<!--  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));-->
<!--  border: 1px solid rgba(102, 126, 234, 0.2);-->
<!--  border-radius: 12px;-->
<!--  color: #333;-->
<!--  transition: all 0.3s ease;-->
<!--  min-width: 200px;-->
<!--  text-align: left;-->
<!--}-->

<!--.modern-user-btn:hover {-->
<!--  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));-->
<!--  border-color: rgba(102, 126, 234, 0.3);-->
<!--  transform: translateY(-1px);-->
<!--  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);-->
<!--}-->

<!--.modern-user-btn:focus {-->
<!--  outline: none;-->
<!--  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);-->
<!--}-->

<!--/* User Avatar */-->
<!--.user-avatar {-->
<!--  width: 35px;-->
<!--  height: 35px;-->
<!--  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);-->
<!--  border-radius: 50%;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  color: white;-->
<!--  font-size: 0.9rem;-->
<!--  flex-shrink: 0;-->
<!--}-->

<!--/* User Info */-->
<!--.user-info {-->
<!--  flex: 1;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  min-width: 0;-->
<!--}-->

<!--.user-name {-->
<!--  font-weight: 600;-->
<!--  font-size: 0.9rem;-->
<!--  color: #333;-->
<!--  white-space: nowrap;-->
<!--  overflow: hidden;-->
<!--  text-overflow: ellipsis;-->
<!--}-->

<!--.user-role {-->
<!--  font-size: 0.75rem;-->
<!--  color: #667eea;-->
<!--  font-weight: 500;-->
<!--}-->

<!--/* Dropdown Arrow */-->
<!--.dropdown-arrow {-->
<!--  color: #6c757d;-->
<!--  font-size: 0.75rem;-->
<!--  transition: transform 0.3s ease;-->
<!--}-->

<!--.modern-user-btn[aria-expanded="true"] .dropdown-arrow {-->
<!--  transform: rotate(180deg);-->
<!--}-->

<!--/* Modern Dropdown Menu */-->
<!--.modern-dropdown-menu {-->
<!--  background: rgba(255, 255, 255, 0.98);-->
<!--  backdrop-filter: blur(20px);-->
<!--  border: 1px solid rgba(102, 126, 234, 0.1);-->
<!--  border-radius: 16px;-->
<!--  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);-->
<!--  padding: 0;-->
<!--  min-width: 320px;-->
<!--  margin-top: 0.5rem;-->
<!--  animation: dropdownFadeIn 0.3s ease-out;-->
<!--}-->

<!--@keyframes dropdownFadeIn {-->
<!--  from {-->
<!--    opacity: 0;-->
<!--    transform: translateY(-10px) scale(0.95);-->
<!--  }-->
<!--  to {-->
<!--    opacity: 1;-->
<!--    transform: translateY(0) scale(1);-->
<!--  }-->
<!--}-->

<!--/* Dropdown Header */-->
<!--.dropdown-header {-->
<!--  padding: 1.5rem;-->
<!--  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);-->
<!--  color: white;-->
<!--  border-radius: 16px 16px 0 0;-->
<!--}-->

<!--.dropdown-user-info {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 1rem;-->
<!--}-->

<!--.dropdown-avatar {-->
<!--  width: 50px;-->
<!--  height: 50px;-->
<!--  background: rgba(255, 255, 255, 0.2);-->
<!--  border-radius: 50%;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  font-size: 1.2rem;-->
<!--}-->

<!--.dropdown-details {-->
<!--  flex: 1;-->
<!--}-->

<!--.dropdown-name {-->
<!--  font-weight: 700;-->
<!--  font-size: 1rem;-->
<!--  margin-bottom: 0.25rem;-->
<!--}-->

<!--.dropdown-email {-->
<!--  font-size: 0.8rem;-->
<!--  opacity: 0.9;-->
<!--  margin-bottom: 0.5rem;-->
<!--}-->

<!--/* Section Titles */-->
<!--.dropdown-section {-->
<!--  padding: 0.75rem 1rem 0.5rem;-->
<!--}-->

<!--.section-title {-->
<!--  font-size: 0.75rem;-->
<!--  font-weight: 700;-->
<!--  color: #6c757d;-->
<!--  text-transform: uppercase;-->
<!--  letter-spacing: 0.5px;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--}-->

<!--/* Modern Dropdown Items */-->
<!--.modern-dropdown-item {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 1rem;-->
<!--  padding: 1rem 1.5rem;-->
<!--  color: #333;-->
<!--  text-decoration: none;-->
<!--  transition: all 0.3s ease;-->
<!--  border: none;-->
<!--  background: none;-->
<!--  width: 100%;-->
<!--  position: relative;-->
<!--}-->

<!--.modern-dropdown-item:hover {-->
<!--  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));-->
<!--  color: #667eea;-->
<!--  text-decoration: none;-->
<!--  transform: translateX(-2px);-->
<!--}-->

<!--.modern-dropdown-item:active {-->
<!--  transform: translateX(-2px) scale(0.98);-->
<!--}-->

<!--/* Item Components */-->
<!--.item-icon {-->
<!--  width: 20px;-->
<!--  height: 20px;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  font-size: 1rem;-->
<!--  color: #6c757d;-->
<!--  transition: all 0.3s ease;-->
<!--}-->

<!--.modern-dropdown-item:hover .item-icon {-->
<!--  color: #667eea;-->
<!--  transform: scale(1.1);-->
<!--}-->

<!--.item-content {-->
<!--  flex: 1;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--}-->

<!--.item-title {-->
<!--  font-weight: 600;-->
<!--  font-size: 0.9rem;-->
<!--  margin-bottom: 0.1rem;-->
<!--}-->

<!--.item-subtitle {-->
<!--  font-size: 0.75rem;-->
<!--  color: #6c757d;-->
<!--  line-height: 1.2;-->
<!--}-->

<!--.item-arrow {-->
<!--  color: #6c757d;-->
<!--  font-size: 0.75rem;-->
<!--  opacity: 0;-->
<!--  transition: all 0.3s ease;-->
<!--}-->

<!--.modern-dropdown-item:hover .item-arrow {-->
<!--  opacity: 1;-->
<!--  transform: translateX(-2px);-->
<!--}-->

<!--.item-badge {-->
<!--  margin-left: 0.5rem;-->
<!--}-->

<!--/* Logout Item */-->
<!--.logout-item {-->
<!--  border-top: 1px solid rgba(231, 76, 60, 0.1);-->
<!--  margin-top: 0.5rem;-->
<!--}-->

<!--.logout-item:hover {-->
<!--  background: linear-gradient(135deg, rgba(231, 76, 60, 0.08), rgba(192, 57, 43, 0.08));-->
<!--  color: #e74c3c;-->
<!--}-->

<!--.logout-item:hover .item-icon {-->
<!--  color: #e74c3c;-->
<!--}-->

<!--/* Status Indicator */-->
<!--.status-indicator {-->
<!--  position: absolute;-->
<!--  top: -2px;-->
<!--  right: -2px;-->
<!--  width: 12px;-->
<!--  height: 12px;-->
<!--  border-radius: 50%;-->
<!--  border: 2px solid white;-->
<!--}-->

<!--.status-indicator.online {-->
<!--  background: #28a745;-->
<!--  animation: pulse 2s infinite;-->
<!--}-->

<!--.status-indicator.offline {-->
<!--  background: #6c757d;-->
<!--}-->

<!--@keyframes pulse {-->
<!--  0% {-->
<!--    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);-->
<!--  }-->
<!--  70% {-->
<!--    box-shadow: 0 0 0 6px rgba(40, 167, 69, 0);-->
<!--  }-->
<!--  100% {-->
<!--    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);-->
<!--  }-->
<!--}-->

<!--/* Divider */-->
<!--.dropdown-divider {-->
<!--  margin: 0.5rem 0;-->
<!--  border-color: rgba(102, 126, 234, 0.1);-->
<!--}-->

<!--/* Responsive */-->
<!--@media (max-width: 768px) {-->
<!--  .modern-user-btn {-->
<!--    min-width: 150px;-->
<!--    padding: 0.5rem;-->
<!--  }-->

<!--  .user-info {-->
<!--    display: none;-->
<!--  }-->

<!--  .modern-dropdown-menu {-->
<!--    min-width: 280px;-->
<!--    margin-right: -50px;-->
<!--  }-->

<!--  .modern-dropdown-item {-->
<!--    padding: 0.875rem 1rem;-->
<!--  }-->

<!--  .dropdown-header {-->
<!--    padding: 1rem;-->
<!--  }-->
<!--}-->

<!--@media (max-width: 480px) {-->
<!--  .modern-dropdown-menu {-->
<!--    min-width: 260px;-->
<!--    margin-right: -80px;-->
<!--  }-->
<!--}-->

<!--/* Dark Mode Support */-->
<!--@media (prefers-color-scheme: dark) {-->
<!--  .modern-dropdown-menu {-->
<!--    background: rgba(45, 55, 72, 0.98);-->
<!--    border-color: rgba(102, 126, 234, 0.2);-->
<!--  }-->

<!--  .modern-dropdown-item {-->
<!--    color: #e2e8f0;-->
<!--  }-->

<!--  .modern-dropdown-item:hover {-->
<!--    color: #667eea;-->
<!--  }-->

<!--  .item-subtitle {-->
<!--    color: #cbd5e0;-->
<!--  }-->

<!--  .section-title {-->
<!--    color: #cbd5e0;-->
<!--  }-->

<!--  .user-name {-->
<!--    color: #e2e8f0;-->
<!--  }-->

<!--  .modern-user-btn {-->
<!--    color: #e2e8f0;-->
<!--  }-->
<!--}-->
<!--</style>-->