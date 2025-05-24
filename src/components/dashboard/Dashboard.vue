<template>
  <div class="dashboard">
    <div class="container-fluid px-4 py-3">
      <template v-if="isTeacher">
        <TeacherDashboard :user="user"/>
      </template>
      <template v-else>
        <StudentDashboard :user="user" />
      </template>
    </div>
  </div>
</template>

<script>
import TeacherDashboard from '@/components/dashboard/TeacherDashboard.vue';
import StudentDashboard from '@/components/dashboard/StudentDashboard.vue';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Dashboard',
  components: {
    TeacherDashboard,
    StudentDashboard
  },
  setup() {
    const { currentUser, isTeacher } = useUser();

    return {
      user: currentUser,
      isTeacher
    };
  }
}
</script>

<style scoped>
.dashboard {
  min-height: calc(100vh - 56px);
  background-color: #f8f9fa;
}

/* اطمینان از responsive بودن */
@media (max-width: 768px) {
  .dashboard .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>