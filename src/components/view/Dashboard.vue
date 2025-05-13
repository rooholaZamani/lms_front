<template>
  <div class="dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-2 d-none d-md-block">
          <Sidebar />
        </div>

        <!-- Main Content -->
        <div class="col-md-10 col-sm-12 px-4 py-3">
          <!-- داشبورد معلم -->
          <template v-if="isTeacher">
            <TeacherDashboard :user="user" />
          </template>

          <!-- داشبورد دانش‌آموز -->
          <template v-else>
            <StudentDashboard :user="user" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/layout/Sidebar.vue'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard.vue'
import StudentDashboard from '@/components/dashboard/StudentDashboard.vue'

export default {
  name: 'Dashboard',
  components: {
    Sidebar,
    TeacherDashboard,
    StudentDashboard
  },
  computed: {
    user() {
      return this.$store.getters.currentUser
    },
    isTeacher() {
      return this.$store.getters.userRole.isTeacher
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: calc(100vh - 56px);
  background-color: #f8f9fa;
}
</style>