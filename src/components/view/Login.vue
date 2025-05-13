<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h1 class="login-title">ورود به سامانه مدیریت یادگیری</h1>
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="username" class="form-label">نام کاربری</label>
          <input type="text" class="form-control" id="username" v-model="username" required autofocus>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">رمز عبور</label>
          <input type="password" class="form-control" id="password" v-model="password" required>
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="remember-me" v-model="rememberMe">
          <label class="form-check-label" for="remember-me">مرا به خاطر بسپار</label>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ورود
        </button>
      </form>

      <div class="login-footer">
        <p>حساب کاربری ندارید؟ <router-link :to="{ name: 'Register' }">ثبت نام</router-link></p>
        <p>بازگشت به <router-link :to="{ name: 'Home' }">صفحه اصلی</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: null
    }
  },
  methods: {
    async login() {
      this.loading = true
      this.error = null

      try {
        const result = await this.$store.dispatch('login', {
          username: this.username,
          password: this.password
        })

        if (result.success) {
          // اگر کاربر از URL دیگری منتقل شده بود، به آن صفحه برگردد
          const redirectPath = this.$route.query.redirect || '/dashboard'
          this.$router.push(redirectPath)
        } else {
          this.error = result.message || 'نام کاربری یا رمز عبور اشتباه است'
        }
      } catch (err) {
        this.error = 'مشکلی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  max-width: 400px;
  width: 100%;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.login-title {
  font-size: 1.5rem;
  color: #333;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #6c757d;
}
</style>