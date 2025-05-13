<template>
  <section class="hero-section">
    <div class="container">
      <h1>به سامانه مدیریت یادگیری خوش آمدید</h1>
      <p class="lead">دسترسی آسان به آموزش‌های با کیفیت</p>
      <div class="hero-buttons">
        <router-link :to="{ name: 'Register' }" class="btn btn-light btn-lg">شروع یادگیری</router-link>
        <router-link v-if="!isLoggedIn" :to="{ name: 'Login' }" class="btn btn-outline-light btn-lg ms-2">ورود</router-link>
        <router-link v-else :to="{ name: 'Dashboard' }" class="btn btn-outline-light btn-lg ms-2">داشبورد من</router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.hero-section {
  background-color: #007bff;
  color: white;
  padding: 80px 0;
  text-align: center;
  margin-bottom: 50px;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.hero-buttons {
  margin-top: 30px;
}
</style>