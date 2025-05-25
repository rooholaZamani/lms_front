<template>
  <div class="modern-page-bg warning-gradient">
    <div class="modern-container animate-fade-in">
      <div class="modern-error-container">
        <div class="modern-logo large warning">
          <i class="fas fa-ban"></i>
        </div>

        <div class="modern-error-code">403</div>
        <h1 class="modern-error-title">دسترسی مجاز نیست</h1>
        <p class="modern-error-message">
          متأسفانه شما مجوز دسترسی به این بخش را ندارید.
          <br>
          لطفاً با مدیر سیستم تماس بگیرید یا به صفحه مناسب بازگردید.
        </p>

        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link :to="{ name: 'Dashboard' }" class="modern-btn modern-btn-primary">
            <i class="fas fa-home me-2"></i>
            بازگشت به داشبورد
          </router-link>

          <button @click="goBack" class="modern-btn modern-btn-outline">
            <i class="fas fa-arrow-right me-2"></i>
            بازگشت به صفحه قبل
          </button>
        </div>

        <!-- Help Section -->
        <div class="modern-card mt-4">
          <h5 class="mb-3">
            <i class="fas fa-info-circle text-info me-2"></i>
            راهنمایی
          </h5>
          <div class="row text-start">
            <div class="col-md-6">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="fas fa-user-check text-primary me-2"></i>
                  بررسی حساب کاربری مناسب
                </li>
                <li class="mb-2">
                  <i class="fas fa-key text-warning me-2"></i>
                  درخواست دسترسی‌های لازم
                </li>
              </ul>
            </div>
            <div class="col-md-6">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="fas fa-headset text-success me-2"></i>
                  تماس با پشتیبانی
                </li>
                <li class="mb-2">
                  <i class="fas fa-sign-out-alt text-danger me-2"></i>
                  خروج و ورود مجدد
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- User Role Info -->
        <div class="modern-card mt-3" v-if="currentUser">
          <div class="d-flex align-items-center justify-content-center">
            <div class="text-center">
              <i class="fas fa-user-circle text-primary" style="font-size: 2rem;"></i>
              <h6 class="mt-2 mb-1">{{ getUserName() }}</h6>
              <span class="modern-badge modern-badge-secondary">{{ getUserRole() }}</span>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="mt-4 p-3 rounded" style="background: rgba(255, 255, 255, 0.1);">
          <div class="row text-center">
            <div class="col-md-4 mb-2">
              <i class="fas fa-envelope text-primary"></i>
              <small class="d-block mt-1">support@example.com</small>
            </div>
            <div class="col-md-4 mb-2">
              <i class="fas fa-phone text-success"></i>
              <small class="d-block mt-1">021-12345678</small>
            </div>
            <div class="col-md-4 mb-2">
              <i class="fas fa-clock text-warning"></i>
              <small class="d-block mt-1">24/7 پشتیبانی</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Forbidden',
  setup() {
    const { currentUser, isTeacher, isStudent } = useUser();

    return {
      currentUser,
      isTeacher,
      isStudent
    };
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push({ name: 'Dashboard' });
      }
    },

    getUserName() {
      if (this.currentUser) {
        return this.currentUser.firstName && this.currentUser.lastName
            ? `${this.currentUser.firstName} ${this.currentUser.lastName}`
            : this.currentUser.username;
      }
      return 'کاربر';
    },

    getUserRole() {
      if (this.isTeacher) {
        return 'استاد';
      } else if (this.isStudent) {
        return 'دانش‌آموز';
      }
      return 'کاربر';
    }
  },
  mounted() {
    document.title = 'دسترسی مجاز نیست - سامانه آموزش آنلاین';
  }
}
</script>

<style scoped>
/* Component specific styles */
.modern-error-container {
  animation: slideInUp 0.8s ease forwards;
}

.modern-error-code {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

/* Pulse animation for ban icon */
.modern-logo.warning i {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Custom hover effects */
.modern-btn:hover {
  transform: translateY(-3px) scale(1.05);
}

/* User info styling */
.fa-user-circle {
  margin-bottom: 0.5rem;
}

/* Contact info styling */
.contact-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .modern-error-code {
    background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modern-error-code {
    font-size: 6rem;
  }

  .modern-error-title {
    font-size: 1.5rem;
  }

  .modern-error-message {
    font-size: 1rem;
  }

  .contact-info .row > div {
    margin-bottom: 1rem;
  }
}
</style>