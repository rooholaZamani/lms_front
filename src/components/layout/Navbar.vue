<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">سامانه  آموزش آنلاین</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav me-auto">
<!--          <li class="nav-item">-->
<!--            <router-link class="nav-link" :to="{ name: 'Dashboard' }">داشبورد</router-link>-->
<!--          </li>-->

<!--          <li class="nav-item" v-if="isTeacher">-->
<!--            <router-link class="nav-link" :to="{ name: 'TeachingCourses' }">دوره‌های من</router-link>-->
<!--          </li>-->

<!--          <li class="nav-item" v-if="isStudent">-->
<!--            <router-link class="nav-link" :to="{ name: 'Courses' }">دوره‌های من</router-link>-->
<!--          </li>-->

          <li class="nav-item" v-if="isStudent">
            <router-link class="nav-link" :to="{ name: 'AvailableCourses' }">دوره‌های موجود</router-link>
          </li>
        </ul>

        <div class="d-flex">
          <user-dropdown v-if="user" :user="user" @logout="logout" />
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import UserDropdown from '@/components/layout/UserDropdown.vue';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Navbar',
  components: {
    UserDropdown
  },
  setup() {
    const { currentUser, isTeacher, isStudent, logout } = useUser();

    const handleLogout = async () => {
      await logout();
      // انتقال به صفحه ورود
      window.location.href = '/login';
    };

    return {
      user: currentUser,
      isTeacher,
      isStudent,
      logout: handleLogout
    };
  }
}
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
}

.nav-link {
  margin: 0 5px;
}
</style>