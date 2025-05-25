<template>
  <div class="register-container">
    <div class="form-container">
      <div class="form-header">
        <div class="form-logo success">
          <i class="fas fa-user-plus"></i>
        </div>
        <h1 class="form-title">ثبت نام در سامانه  آموزش آنلاین</h1>
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
          <input type="text" class="form-control" id="username" v-model="formData.username" required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">رمز عبور</label>
          <input type="password" class="form-control" id="password" v-model="formData.password" required>
        </div>
        <div class="mb-3">
          <label for="firstName" class="form-label">نام</label>
          <input type="text" class="form-control" id="firstName" v-model="formData.firstName" required>
        </div>
        <div class="mb-3">
          <label for="lastName" class="form-label">نام خانوادگی</label>
          <input type="text" class="form-control" id="lastName" v-model="formData.lastName" required>
        </div>
        <div class="mb-3">
          <label for="nationalId" class="form-label">شماره ملی</label>
          <input type="text" class="form-control" id="nationalId" v-model="formData.nationalId" required>
        </div>
        <div class="mb-3">
          <label for="phoneNumber" class="form-label">شماره تلفن</label>
          <input type="text" class="form-control" id="phoneNumber" v-model="formData.phoneNumber" required>
        </div>
        <div class="mb-3">
          <label for="age" class="form-label">سن</label>
          <input type="number" class="form-control" id="age" v-model="formData.age" required>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">ایمیل</label>
          <input type="email" class="form-control" id="email" v-model="formData.email" required>
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
        <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ثبت نام
        </button>
      </form>

      <div class="form-footer">
        <p>قبلاً ثبت نام کرده‌اید؟ <router-link :to="{ name: 'Login' }">ورود</router-link></p>
        <p>بازگشت به <router-link :to="{ name: 'Home' }">صفحه اصلی</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'Register',
  mixins: [formMixin],
  data() {
    return {
      formData: {
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        nationalId: '',
        phoneNumber: '',
        age: null,
        email: '',
      },
      userType: 'student'
    }
  },
  methods: {
    validateForm() {
      // اعتبارسنجی ایمیل
      if (!this.isValidEmail(this.formData.email)) {
        this.error = 'لطفاً یک ایمیل معتبر وارد کنید.';
        return false;
      }

      // اعتبارسنجی شماره تلفن
      if (!this.isValidIranianPhone(this.formData.phoneNumber)) {
        this.error = 'لطفاً یک شماره تلفن معتبر ایرانی وارد کنید (مثال: 09123456789).';
        return false;
      }

      // اعتبارسنجی کد ملی
      // if (!this.isValidIranianNationalId(this.formData.nationalId)) {
      //   this.error = 'لطفاً یک کد ملی معتبر 10 رقمی وارد کنید.';
      //   return false;
      // }

      // اعتبارسنجی سن
      if (this.formData.age < 7 || this.formData.age > 100) {
        this.error = 'لطفاً یک سن معتبر بین 7 تا 100 وارد کنید.';
        return false;
      }

      return true;
    },

    async register() {
      this.startSubmitting();

      // اعتبارسنجی فرم
      if (!this.validateForm()) {
        this.isSubmitting = false;
        return;
      }

      try {
        const registerData = {
          ...this.formData,
          isTeacher: this.userType === 'teacher'
        };

        console.log('Submitting registration with data:', registerData);

        // FIXED: Using correct namespaced action path
        const result = await this.$store.dispatch('auth/register', registerData);

        console.log('Registration result:', result);

        if (result.success) {
          this.resetForm(this.formData);
          this.finishSubmitting(result.message || 'ثبت نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.');
        } else {
          this.finishSubmitting(null, result.message || 'مشکلی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید.');
        }
      } catch (err) {
        console.error('Registration error:', err);
        this.finishSubmitting(null, 'مشکلی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 2rem;
}

.form-title {
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.form-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
}

.alert {
  border-radius: 10px;
  border: none;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-success {
  background-color: #d1edff;
  color: #0c5460;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.form-footer p {
  margin: 0.5rem 0;
  color: #6c757d;
}

.form-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .register-container {
    padding: 1rem 0.5rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.25rem;
  }
}
</style>