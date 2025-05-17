<template>
  <footer class="footer-section">
    <div class="container text-center">
      <p>تمامی حقوق محفوظ است &copy; {{ currentYear }} سامانه  آموزش آنلاین</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'SiteFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
}
</script>

<style scoped>
.footer-section {
  background-color: #343a40;
  color: white;
  padding: 20px 0;
}
</style>