<template>
  <div class="login-container">
    <div class="form-container">
      <div class="form-header">
        <div class="form-logo primary">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h1 class="form-title">ورود به سامانه مدیریت یادگیری</h1>
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="username" class="form-label">نام کاربری</label>
          <input type="text" class="form-control" id="username" v-model="formData.username" required autofocus>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">رمز عبور</label>
          <input type="password" class="form-control" id="password" v-model="formData.password" required>
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="remember-me" v-model="formData.rememberMe">
          <label class="form-check-label" for="remember-me">مرا به خاطر بسپار</label>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ورود
        </button>
      </form>

      <div class="form-footer">
        <p>حساب کاربری ندارید؟ <router-link :to="{ name: 'Register' }">ثبت نام</router-link></p>
        <p>بازگشت به <router-link :to="{ name: 'Home' }">صفحه اصلی</router-link></p>
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