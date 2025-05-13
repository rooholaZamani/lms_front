<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">سامانه مدیریت یادگیری</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'Dashboard' }">داشبورد</router-link>
          </li>
          <li class="nav-item" v-if="isTeacher">
            <router-link class="nav-link" :to="{ name: 'TeachingCourses' }">دوره‌های من</router-link>
          </li>
          <li class="nav-item" v-if="isStudent">
            <router-link class="nav-link" :to="{ name: 'Courses' }">دوره‌های من</router-link>
          </li>
          <li class="nav-item" v-if="isStudent">
            <router-link class="nav-link" :to="{ name: 'AvailableCourses' }">دوره‌های موجود</router-link>
          </li>
        </ul>
        <div class="d-flex">
          <div class="dropdown">
            <button v-if="user" class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-user"></i> {{ user.firstName ? user.firstName + ' ' + user.lastName : user.username }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" :to="{ name: 'Profile' }">
                  <i class="fas fa-user-cog"></i> پروفایل
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">
                  <i class="fas fa-sign-out-alt"></i> خروج
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  computed: {
    user() {
      return this.$store.getters.currentUser
    },
    isTeacher() {
      return this.$store.getters.userRole.isTeacher
    },
    isStudent() {
      return this.$store.getters.userRole.isStudent
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('logout')
      this.$router.push({ name: 'Login' })
    }
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