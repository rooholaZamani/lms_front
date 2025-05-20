<template>
  <div class="teacher-dashboard">
    <h2>داشبورد معلم</h2>
    <p>خوش آمدید، {{ user.firstName }} {{ user.lastName }}</p>
    <div class="card">
      <div class="card-body">
        محتوای داشبورد اینجا نمایش داده خواهد شد.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleTeacherDashboard',
  props: {
    user: {
      type: Object,
      required: true
    }
  }
}
</script>