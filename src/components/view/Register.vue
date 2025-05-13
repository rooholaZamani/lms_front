<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="register-logo">
          <i class="fas fa-user-plus"></i>
        </div>
        <h1 class="register-title">ثبت نام در سامانه مدیریت یادگیری</h1>
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-if="success" class="alert alert-success">
        {{ success }}
        <div class="mt-2">
          <router-link :to="{ name: 'Login' }" class="btn btn-primary">ورود به سیستم</router-link>
        </div>
      </div>

      <form v-if="!success" @submit.prevent="register">
        <div class="mb-3">
          <label for="username" class="form-label">نام کاربری</label>
          <input type="text" class="form-control" id="username" v-model="user.username" required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">رمز عبور</label>
          <input type="password" class="form-control" id="password" v-model="user.password" required>
        </div>
        <div class="mb-3">
          <label for="firstName" class="form-label">نام</label>
          <input type="text" class="form-control" id="firstName" v-model="user.firstName" required>
        </div>
        <div class="mb-3">
          <label for="lastName" class="form-label">نام خانوادگی</label>
          <input type="text" class="form-control" id="lastName" v-model="user.lastName" required>
        </div>
        <div class="mb-3">
          <label for="nationalId" class="form-label">شماره ملی</label>
          <input type="text" class="form-control" id="nationalId" v-model="user.nationalId" required>
        </div>
        <div class="mb-3">
          <label for="phoneNumber" class="form-label">شماره تلفن</label>
          <input type="text" class="form-control" id="phoneNumber" v-model="user.phoneNumber" required>
        </div>
        <div class="mb-3">
          <label for="age" class="form-label">سن</label>
          <input type="number" class="form-control" id="age" v-model="user.age" required>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">ایمیل</label>
          <input type="email" class="form-control" id="email" v-model="user.email" required>
        </div>
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" id="student" value="student" v-model="userType" checked>
            <label class="form-check-label" for="student">دانش آموز</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="teacher" value="teacher" v-model="userType">
            <label class="form-check-label" for="teacher">معلم</label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ثبت نام
        </button>
      </form>

      <div class="register-footer">
        <p>قبلاً ثبت نام کرده‌اید؟ <router-link :to="{ name: 'Login' }">ورود</router-link></p>
        <p>بازگشت به <router-link :to="{ name: 'Home' }">صفحه اصلی</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      user: {
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        nationalId: '',
        phoneNumber: '',
        age: null,
        email: '',
      },
      userType: 'student',
      loading: false,
      error: null,
      success: null
    }
  },
  methods: {
    async register() {
      this.loading = true
      this.error = null

      try {
        const registerData = {
          ...this.user,
          isTeacher: this.userType === 'teacher'
        }

        const result = await this.$store.dispatch('register', registerData)

        if (result.success) {
          this.success = result.message || 'ثبت نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.'
          this.user = {
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            nationalId: '',
            phoneNumber: '',
            age: null,
            email: '',
          }
        } else {
          this.error = result.message || 'مشکلی در ثبت نام رخ داد. لطفاً دوباره تلاش کنید.'
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-card {
  max-width: 600px;
  width: 100%;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.register-title {
  font-size: 1.5rem;
  color: #333;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #6c757d;
}
</style>