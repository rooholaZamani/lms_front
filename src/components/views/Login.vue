<template>
  <div class="login-page">
    <!-- SVG Background -->
    <div class="background">
      <img src="@/assets/images/background.svg" class="svg-background" alt="background">
    </div>

    <!-- Login Form Container -->
    <div class="login-container">
      <div class="logo-container">
        <div class="logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
      </div>

      <h1 class="login-title">ورود به سامانه آموزش آنلاین</h1>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="login">
        <div class="form-group">
          <label class="form-label" for="username">نام کاربری</label>
          <input
              class="form-input"
              type="text"
              id="username"
              v-model="formData.username"
              required
              autofocus>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">رمز عبور</label>
          <input
              class="form-input"
              type="password"
              id="password"
              v-model="formData.password"
              required>
        </div>

        <div class="form-group remember-me">
          <input
              class="remember-checkbox"
              type="checkbox"
              id="remember-me"
              v-model="formData.rememberMe">
          <label for="remember-me">مرا به خاطر بسپار</label>
        </div>

        <button type="submit" class="login-button" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ورود
        </button>
      </form>

      <div class="footer-links">
        <router-link :to="{ name: 'Register' }">حساب کاربری ندارید؟ ثبت‌نام</router-link>
        <router-link :to="{ name: 'Home' }">بازگشت به صفحه اصلی</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'Login',
  mixins: [formMixin],
  data() {
    return {
      formData: {
        username: '',
        password: '',
        rememberMe: false
      }
    }
  },
  methods: {
    async login() {
      this.startSubmitting();

      try {
        const result = await this.$store.dispatch('login', {
          username: this.formData.username,
          password: this.formData.password
        });

        if (result.success) {
          // اگر کاربر از URL دیگری منتقل شده بود، به آن صفحه برگردد
          const redirectPath = this.$route.query.redirect || '/dashboard';
          this.$router.push(redirectPath);
        } else {
          this.finishSubmitting(null, result.message || 'نام کاربری یا رمز عبور اشتباه است');
        }
      } catch (err) {
        console.error(err);
        this.finishSubmitting(null, 'مشکلی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>

<style scoped>

.login-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}



.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.svg-background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  filter: blur(5px);
}

.login-container {
  width: 420px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: relative;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-checkbox {
  margin-left: 8px;
  width: 18px;
  height: 18px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.login-button:hover {
  background-color: #0069d9;
}

.login-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.footer-links {
  margin-top: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.alert {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>