<template>
  <div class="modern-page-bg">
    <div class="modern-container animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h1 class="modern-title">ورود به سامانه آموزش آنلاین</h1>
      </div>

      <div v-if="error" class="modern-alert modern-alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="login">
        <div class="modern-form-group">
          <label class="modern-form-label" for="username">نام کاربری</label>
          <input
              class="modern-form-control"
              type="text"
              id="username"
              v-model="formData.username"
              required
              autofocus>
        </div>

        <div class="modern-form-group">
          <label class="modern-form-label" for="password">رمز عبور</label>
          <input
              class="modern-form-control"
              type="password"
              id="password"
              v-model="formData.password"
              required>
        </div>

        <div class="modern-form-group">
          <div class="form-check">
            <input
                class="form-check-input"
                type="checkbox"
                id="remember-me"
                v-model="formData.rememberMe">
            <label class="form-check-label" for="remember-me">مرا به خاطر بسپار</label>
          </div>
        </div>

        <button type="submit" class="modern-btn modern-btn-primary w-100" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ورود
        </button>
      </form>

      <div class="text-center mt-3">
        <p class="mb-2">
          <router-link :to="{ name: 'Register' }" class="text-decoration-none">
            حساب کاربری ندارید؟ ثبت‌نام
          </router-link>
        </p>
        <p class="mb-0">
          <router-link :to="{ name: 'Home' }" class="text-decoration-none">
            بازگشت به صفحه اصلی
          </router-link>
        </p>
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
        const result = await this.$store.dispatch('auth/login', {
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
/* Custom styles for this component only */
.form-check {
  margin-bottom: 0.5rem;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

a {
  color: #667eea;
  font-weight: 600;
}

a:hover {
  color: #5a6cb8;
  text-decoration: underline !important;
}

/* Responsive */
@media (max-width: 576px) {
  .modern-container {
    padding: 1.5rem;
  }

  .modern-title {
    font-size: 1.25rem;
  }
}
</style>