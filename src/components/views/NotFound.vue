<template>
  <div class="modern-page-bg danger-gradient">
    <div class="modern-container animate-fade-in">
      <div class="modern-error-container">
        <div class="modern-logo large danger">
          <i class="fas fa-search"></i>
        </div>

        <div class="modern-error-code">404</div>
        <h1 class="modern-error-title">صفحه مورد نظر یافت نشد</h1>
        <p class="modern-error-message">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
          <br>
          لطفاً آدرس را بررسی کنید یا به صفحه اصلی بازگردید.
        </p>

        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/" class="modern-btn modern-btn-primary">
            <i class="fas fa-home me-2"></i>
            بازگشت به صفحه اصلی
          </router-link>

          <button @click="goBack" class="modern-btn modern-btn-outline">
            <i class="fas fa-arrow-right me-2"></i>
            صفحه قبل
          </button>
        </div>

        <!-- Additional Help Section -->
        <div class="modern-card mt-4">
          <h5 class="mb-3">
            <i class="fas fa-lightbulb text-warning me-2"></i>
            راهنمایی
          </h5>
          <div class="row text-start">
            <div class="col-md-6">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  آدرس URL را بررسی کنید
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  از منوی اصلی استفاده کنید
                </li>
              </ul>
            </div>
            <div class="col-md-6">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  با پشتیبانی تماس بگیرید
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  صفحه را رفرش کنید
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="mt-4">
          <h6 class="mb-3">لینک‌های مفید:</h6>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <router-link to="/dashboard" class="text-decoration-none">
              <span class="modern-badge modern-badge-primary">داشبورد</span>
            </router-link>
            <router-link to="/courses" class="text-decoration-none">
              <span class="modern-badge modern-badge-success">دوره‌ها</span>
            </router-link>
            <router-link to="/profile" class="text-decoration-none">
              <span class="modern-badge modern-badge-secondary">پروفایل</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
      }
    }
  },
  mounted() {
    document.title = 'صفحه یافت نشد - سامانه آموزش آنلاین';
  }
}
</script>

<style scoped>
/* Component specific styles */
.modern-error-container {
  animation: slideInUp 0.8s ease forwards;
}

.modern-error-code {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.quick-links {
  margin-top: 2rem;
}

/* Custom hover effects for this page */
.modern-btn:hover {
  transform: translateY(-3px) scale(1.05);
}

.modern-badge:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .modern-error-code {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
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
}
</style>