<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h5 class="text-center text-primary">منوی اصلی</h5>
    </div>
    <nav class="sidebar-nav">
      <ul class="nav flex-column">
        <!-- Common menu items -->
        <li class="nav-item">
          <router-link class="nav-link" :to="{ name: 'Dashboard' }" active-class="active">
            <i class="fas fa-tachometer-alt me-2"></i>
            داشبورد
          </router-link>
        </li>

        <li class="nav-item">
          <router-link class="nav-link" :to="{ name: 'Courses' }" active-class="active">
            <i class="fas fa-book me-2"></i>
            دوره‌ها
          </router-link>
        </li>

        <!-- Teacher-specific menu items -->
        <template v-if="isTeacher">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'TeachingCourses' }" active-class="active">
              <i class="fas fa-chalkboard-teacher me-2"></i>
              دوره‌های تدریس
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'PendingAssignments' }" active-class="active">
              <i class="fas fa-tasks me-2"></i>
              تکالیف در حال بررسی
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'StudentActivities' }" active-class="active">
              <i class="fas fa-user-graduate me-2"></i>
              فعالیت دانش‌آموزان
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'PerformanceAnalysis' }" active-class="active">
              <i class="fas fa-chart-line me-2"></i>
              تحلیل عملکرد
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'TeacherExams' }" active-class="active">
              <i class="fas fa-clipboard-check me-2"></i>
              آزمون‌های من
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'QuestionBank' }" active-class="active">
              <i class="fas fa-question-circle me-2"></i>
              بانک سوالات
            </router-link>
          </li>
        </template>

        <!-- Student-specific menu items -->
        <template v-if="isStudent">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'AvailableCourses' }" active-class="active">
              <i class="fas fa-search me-2"></i>
              دوره‌های موجود
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'StudentAssignments' }" active-class="active">
              <i class="fas fa-file-alt me-2"></i>
              تکالیف
            </router-link>
          </li>
        </template>

        <!-- Common menu items -->
        <li class="nav-item">
          <router-link class="nav-link" :to="{ name: 'Profile' }" active-class="active">
            <i class="fas fa-user me-2"></i>
            پروفایل
          </router-link>
        </li>

        <li class="nav-item">
          <router-link class="nav-link" :to="{ name: 'Reports' }" active-class="active">
            <i class="fas fa-chart-bar me-2"></i>
            گزارش‌ها
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Sidebar',
  setup() {
    const { isTeacher, isStudent } = useUser();

    return {
      isTeacher,
      isStudent
    };
  }
}
</script>

<style scoped>
.sidebar {
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  height: calc(100vh - 56px);
  position: sticky;
  top: 56px;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #fff;
}

.sidebar-nav {
  padding: 0.5rem 0;
}

.nav-link {
  color: #495057;
  padding: 0.75rem 1rem;
  border-radius: 0;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #e9ecef;
  color: #007bff;
}

.nav-link.active {
  background-color: #007bff;
  color: white;
}

.nav-link i {
  width: 20px;
  text-align: center;
}
</style>