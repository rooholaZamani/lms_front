<template>
  <div class="forbidden-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="error-content">
            <!-- Error Icon -->
            <div class="error-icon">
              <i class="fas fa-ban"></i>
            </div>

            <!-- Error Title -->
            <h1 class="error-title">403</h1>
            <h2 class="error-subtitle">دسترسی مجاز نیست</h2>

            <!-- Error Message -->
            <p class="error-message">
              متأسفانه شما مجوز دسترسی به این بخش را ندارید.
              <br>
              لطفاً با مدیر سیستم تماس بگیرید یا به صفحه اصلی بازگردید.
            </p>

            <!-- Action Buttons -->
            <div class="error-actions">
              <router-link :to="{ name: 'Dashboard' }" class="btn btn-primary me-3">
                <i class="fas fa-home me-2"></i>
                بازگشت به داشبورد
              </router-link>

              <button @click="goBack" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-right me-2"></i>
                بازگشت به صفحه قبل
              </button>
            </div>

            <!-- Additional Help -->
            <div class="help-section mt-4">
              <h5>راهنمایی:</h5>
              <ul class="help-list">
                <li>اطمینان حاصل کنید که با حساب کاربری مناسب وارد شده‌اید</li>
                <li>ممکن است نیاز به دسترسی‌های خاص داشته باشید</li>
                <li>در صورت نیاز با پشتیبانی تماس بگیرید</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Forbidden',
  methods: {
    goBack() {
      // بررسی اینکه آیا صفحه قبلی در تاریخچه وجود دارد یا نه
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        // اگر تاریخچه‌ای وجود ندارد، به داشبورد برو
        this.$router.push({ name: 'Dashboard' });
      }
    }
  },
  mounted() {
    // تنظیم title صفحه
    document.title = 'دسترسی مجاز نیست - سامانه آموزش آنلاین';
  }
}
</script>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.error-content {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.error-icon {
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: 1rem;
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

.error-title {
  font-size: 4rem;
  font-weight: 700;
  color: #dc3545;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-subtitle {
  font-size: 1.75rem;
  color: #495057;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.error-message {
  font-size: 1.1rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.error-actions {
  margin-bottom: 2rem;
}

.btn {
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.help-section {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: right;
}

.help-section h5 {
  color: #495057;
  margin-bottom: 1rem;
  font-weight: 600;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-list li {
  padding: 0.5rem 0;
  color: #6c757d;
  position: relative;
  padding-right: 1.5rem;
}

.help-list li::before {
  content: "•";
  color: #007bff;
  font-size: 1.2rem;
  position: absolute;
  right: 0;
  top: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .forbidden-page {
    padding: 1rem;
  }

  .error-content {
    padding: 2rem 1.5rem;
  }

  .error-title {
    font-size: 3rem;
  }

  .error-subtitle {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-content {
    background: #2d3748;
    color: #e2e8f0;
  }

  .error-subtitle {
    color: #cbd5e0;
  }

  .error-message {
    color: #a0aec0;
  }

  .help-section {
    background-color: #4a5568;
  }

  .help-section h5 {
    color: #e2e8f0;
  }

  .help-list li {
    color: #cbd5e0;
  }
}
</style>