<template>
  <div class="sidebar bg-dark">
    <div class="position-sticky">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link class="sidebar-link" :class="{ active: $route.name === 'Dashboard' }" :to="{ name: 'Dashboard' }">
            <i class="fas fa-tachometer-alt"></i> داشبورد
          </router-link>
        </li>

        <!-- لینک‌های مشترک -->
        <li class="nav-item">
          <router-link class="sidebar-link" :class="{ active: $route.path.includes('/courses') && !$route.path.includes('/available') }"
                      :to="isTeacher ? { name: 'TeachingCourses' } : { name: 'Courses' }">
            <i class="fas fa-book"></i> {{ isTeacher ? 'دوره‌های من' : 'دوره‌های من' }}
          </router-link>
        </li>

        <!-- لینک‌های دانش‌آموز -->
        <template v-if="isStudent">
          <li class="nav-item">
            <router-link class="sidebar-link" :class="{ active: $route.path.includes('/available') }" :to="{ name: 'AvailableCourses' }">
              <i class="fas fa-search"></i> جستجوی دوره‌ها
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="sidebar-link" :class="{ active: $route.path.includes('/exams') }" :to="{ name: 'Exams' }">
              <i class="fas fa-graduation-cap"></i> آزمون‌های من
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="sidebar-link" :class="{ active: $route.name === 'Progress' }" :to="{ name: 'Progress' }">
              <i class="fas fa-chart-line"></i> پیشرفت تحصیلی
            </router-link>
          </li>
        </template>

        <!-- لینک‌های استاد -->
        <template v-if="isTeacher">
          <li class="nav-item">
            <router-link class="sidebar-link" :class="{ active: $route.path.includes('/exams') }" :to="{ name: 'TeacherExams' }">
              <i class="fas fa-clipboard-check"></i> آزمون‌ها
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="sidebar-link" :class="{ active: $route.name === 'Students' }" :to="{ name: 'Students' }">
              <i class="fas fa-users"></i> دانش‌آموزان
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="sidebar-link" :class="{ active: $route.name === 'Reports' }" :to="{ name: 'Reports' }">
              <i class="fas fa-chart-bar"></i> گزارش‌ها
            </router-link>
          </li>
        </template>

        <li class="nav-item">
          <router-link class="sidebar-link" :class="{ active: $route.name === 'Profile' }" :to="{ name: 'Profile' }">
            <i class="fas fa-user-cog"></i> پروفایل
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  computed: {
    isTeacher() {
      return this.$store.getters.userRole.isTeacher
    },
    isStudent() {
      return this.$store.getters.userRole.isStudent
    }
  }
}
</script>

<style scoped>
.sidebar {
  color: white;
  min-height: calc(100vh - 56px);
  padding-top: 20px;
}

.sidebar-link {
  color: #f8f9fa;
  text-decoration: none;
  display: block;
  padding: 10px 15px;
  transition: background-color 0.3s;
}

.sidebar-link:hover, .sidebar-link.active {
  background-color: #495057;
}

.sidebar-link i {
  margin-left: 8px;
}
</style>