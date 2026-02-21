<template>
  <div class="modern-page-bg success-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo success">
          <i class="fas fa-user-plus"></i>
        </div>
        <h1 class="modern-title">ثبت نام در سامانه آموزش آنلاین</h1>
        <p class="modern-subtitle">به جمع یادگیرندگان ما بپیوندید</p>
      </div>

      <div v-if="error" class="modern-alert modern-alert-danger">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <div v-if="success" class="modern-alert modern-alert-success">
        <i class="fas fa-check-circle me-2"></i>
        {{ success }}
        <div class="mt-3">
          <router-link :to="{ name: 'Login' }" class="modern-btn modern-btn-success">
            <i class="fas fa-sign-in-alt me-1"></i>
            ورود به سیستم
          </router-link>
        </div>
      </div>

      <form v-if="!success" @submit.prevent="register" class="animate-fade-in">
        <!-- User Type Selection -->
        <div class="modern-form-group">
          <label class="modern-form-label">نوع کاربری</label>
          <div class="user-type-selection">
            <div class="user-type-option" :class="{ active: userType === 'student' }">
              <input
                  class="form-check-input"
                  type="radio"
                  id="student"
                  value="student"
                  v-model="userType">
              <label for="student" class="user-type-label">
                <i class="fas fa-user-graduate"></i>
                <span>{{ $client.labels.student }}</span>
                <small>برای یادگیری دوره‌ها</small>
              </label>
            </div>
            <div class="user-type-option" :class="{ active: userType === 'teacher' }">
              <input
                  class="form-check-input"
                  type="radio"
                  id="teacher"
                  value="teacher"
                  v-model="userType">
              <label for="teacher" class="user-type-label">
                <i class="fas fa-chalkboard-teacher"></i>
                <span>{{ $client.labels.teacher }}</span>
                <small>برای تدریس و ایجاد دوره</small>
              </label>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="form-section">
          <h6 class="section-title">
            <i class="fas fa-user me-2"></i>
            اطلاعات شخصی
          </h6>

          <div class="row">
            <div class="col-md-6 modern-form-group">
              <label for="firstName" class="modern-form-label">نام</label>
              <input
                  type="text"
                  class="modern-form-control"
                  id="firstName"
                  v-model="formData.firstName"
                  required>
            </div>
            <div class="col-md-6 modern-form-group">
              <label for="lastName" class="modern-form-label">نام خانوادگی</label>
              <input
                  type="text"
                  class="modern-form-control"
                  id="lastName"
                  v-model="formData.lastName"
                  required>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 modern-form-group">
              <label for="nationalId" class="modern-form-label">شماره ملی</label>
              <input
                  type="text"
                  class="modern-form-control"
                  id="nationalId"
                  v-model="formData.nationalId"
                  maxlength="10"
                  required>
            </div>
            <div class="col-md-6 modern-form-group">
              <label for="age" class="modern-form-label">سن</label>
              <input
                  type="number"
                  class="modern-form-control"
                  id="age"
                  v-model="formData.age"
                  min="7"
                  max="100"
                  required>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="form-section">
          <h6 class="section-title">
            <i class="fas fa-address-book me-2"></i>
            اطلاعات تماس
          </h6>

          <div class="row">
            <div class="col-md-6 modern-form-group">
              <label for="email" class="modern-form-label">ایمیل</label>
              <input
                  type="email"
                  class="modern-form-control"
                  id="email"
                  v-model="formData.email"
                  required>
            </div>
            <div class="col-md-6 modern-form-group">
              <label for="phoneNumber" class="modern-form-label">شماره تلفن</label>
              <input
                  type="text"
                  class="modern-form-control"
                  id="phoneNumber"
                  v-model="formData.phoneNumber"
                  placeholder="09123456789"
                  required>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="form-section">
          <h6 class="section-title">
            <i class="fas fa-key me-2"></i>
            اطلاعات حساب کاربری
          </h6>

          <div class="row">
            <div class="col-md-6 modern-form-group">
              <label for="username" class="modern-form-label">نام کاربری</label>
              <input
                  type="text"
                  class="modern-form-control"
                  id="username"
                  v-model="formData.username"
                  required>
            </div>
            <div class="col-md-6 modern-form-group">
              <label for="password" class="modern-form-label">رمز عبور</label>
              <input
                  type="password"
                  class="modern-form-control"
                  id="password"
                  v-model="formData.password"
                  required>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="modern-form-group">
          <div class="form-check d-flex align-items-center">
            <input
                class="form-check-input me-2"
                type="checkbox"
                id="terms"
                v-model="acceptTerms"
                required>
            <label class="form-check-label" for="terms">
              <span>موافقت با </span>
              <a href="#" class="text-decoration-none fw-bold">قوانین و مقررات</a>
              <span> سیستم</span>
            </label>
          </div>
        </div>

        <button type="submit" class="modern-btn modern-btn-success w-100" :disabled="isSubmitting || !acceptTerms">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <i class="fas fa-user-plus me-1"></i>
          ثبت نام
        </button>
      </form>

      <div class="text-center mt-4">
        <div class="divider">
          <span>یا</span>
        </div>
        <p class="mb-2">
          <span class="text-muted">قبلاً ثبت نام کرده‌اید؟ </span>
          <router-link :to="{ name: 'Login' }" class="text-decoration-none fw-bold">
            ورود به سیستم
          </router-link>
        </p>
        <p class="mb-0">
          <router-link :to="{ name: 'Home' }" class="text-decoration-none">
            <i class="fas fa-home me-1"></i>
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
      userType: 'student',
      acceptTerms: false
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

      // اعتبارسنجی سن
      if (this.formData.age < 7 || this.formData.age > 100) {
        this.error = 'لطفاً یک سن معتبر بین 7 تا 100 وارد کنید.';
        return false;
      }

      // اعتبارسنجی شماره ملی
      if (this.formData.nationalId.length !== 10) {
        this.error = 'شماره ملی باید 10 رقم باشد.';
        return false;
      }

      // اعتبارسنجی نام کاربری
      if (this.formData.username.length < 3) {
        this.error = 'نام کاربری باید حداقل 3 کاراکتر باشد.';
        return false;
      }

      // اعتبارسنجی رمز عبور
      if (this.formData.password.length < 6) {
        this.error = 'رمز عبور باید حداقل 6 کاراکتر باشد.';
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

        const result = await this.$store.dispatch('auth/register', registerData);

        console.log('Registration result:', result);

        if (result.success) {
          this.resetForm(this.formData);
          this.userType = 'student';
          this.acceptTerms = false;
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
/* User type selection */
.user-type-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-type-option {
  position: relative;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.user-type-option:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.user-type-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.user-type-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.user-type-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  margin: 0;
}

.user-type-label i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #667eea;
}

.user-type-label span {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.user-type-label small {
  color: #6c757d;
  font-size: 0.75rem;
}

/* Form sections */
.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

/* Terms checkbox */
.form-check {
  background: rgba(255, 255, 255, 0.5);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-check-input:checked {
  background-color: #27ae60;
  border-color: #27ae60;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0 1rem;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.divider span {
  background: rgba(255, 255, 255, 0.9);
  padding: 0 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Links */
a {
  color: #27ae60;
  font-weight: 600;
}

a:hover {
  color: #229954;
  text-decoration: underline !important;
}

/* Custom form styling */
.modern-form-control:focus {
  border-color: #27ae60;
  box-shadow: 0 0 0 0.2rem rgba(39, 174, 96, 0.25);
}

/* Button styling */
.modern-btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease forwards;
}

/* Responsive */
@media (max-width: 768px) {
  .user-type-selection {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .user-type-label i {
    font-size: 1.5rem;
  }

  .modern-container.large {
    max-width: none;
    margin: 0 0.5rem;
  }
}

@media (max-width: 576px) {
  .modern-container.large {
    padding: 1.5rem;
  }

  .modern-title {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .user-type-option {
    background: rgba(45, 55, 72, 0.8);
    border-color: #4a5568;
  }

  .user-type-option.active {
    background: rgba(39, 174, 96, 0.2);
    border-color: #27ae60;
  }

  .user-type-label span {
    color: #e2e8f0;
  }

  .user-type-label small {
    color: #cbd5e0;
  }

  .form-section {
    background: rgba(45, 55, 72, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: #e2e8f0;
    border-bottom-color: rgba(39, 174, 96, 0.3);
  }

  .form-check {
    background: rgba(45, 55, 72, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .divider span {
    background: rgba(45, 55, 72, 0.9);
    color: #cbd5e0;
  }
}
</style>