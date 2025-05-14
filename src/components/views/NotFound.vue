<template>
  <div class="not-found">
    <div class="container text-center">
      <div class="error-code">404</div>
      <h1>صفحه مورد نظر یافت نشد</h1>
      <p>متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.</p>
      <router-link to="/" class="btn btn-primary">
        <i class="fas fa-home me-2"></i>بازگشت به صفحه اصلی
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  padding: 100px 0;
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-code {
  font-size: 150px;
  font-weight: bold;
  color: #f8f9fa;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #343a40;
}

p {
  color: #6c757d;
  margin-bottom: 30px;
}
</style>