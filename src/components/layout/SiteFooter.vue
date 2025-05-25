<template>
  <footer class="modern-footer">
    <div class="footer-main">
      <div class="container">
        <div class="row">
          <!-- Brand Column -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-brand">
              <div class="brand-logo">
                <div class="logo-icon">
                  <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="logo-text">
                  <h5 class="brand-name">سامانه آموزش آنلاین</h5>
                  <p class="brand-tagline">آینده یادگیری</p>
                </div>
              </div>

              <p class="footer-description">
                پلتفرمی نوین برای یادگیری آنلاین با بهترین اساتید و محتوای به‌روز.
                ما کمک می‌کنیم تا مهارت‌های جدید کسب کنید و آینده‌ای بهتر بسازید.
              </p>

              <!-- Social Links -->
              <div class="social-links">
                <a href="#" class="social-link" title="تلگرام">
                  <i class="fab fa-telegram"></i>
                </a>
                <a href="#" class="social-link" title="اینستاگرام">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="social-link" title="لینکدین">
                  <i class="fab fa-linkedin"></i>
                </a>
                <a href="#" class="social-link" title="توییتر">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="social-link" title="یوتیوب">
                  <i class="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-section">
              <h6 class="footer-title">
                <i class="fas fa-link me-2"></i>
                دسترسی سریع
              </h6>
              <ul class="footer-links">
                <li>
                  <router-link to="/" class="footer-link">
                    <i class="fas fa-home me-2"></i>
                    صفحه اصلی
                  </router-link>
                </li>
                <li>
                  <router-link to="/courses" class="footer-link">
                    <i class="fas fa-book me-2"></i>
                    دوره‌ها
                  </router-link>
                </li>
                <li>
                  <router-link to="/about" class="footer-link">
                    <i class="fas fa-info-circle me-2"></i>
                    درباره ما
                  </router-link>
                </li>
                <li>
                  <router-link to="/contact" class="footer-link">
                    <i class="fas fa-envelope me-2"></i>
                    تماس با ما
                  </router-link>
                </li>
                <li>
                  <router-link to="/blog" class="footer-link">
                    <i class="fas fa-blog me-2"></i>
                    وبلاگ
                  </router-link>
                </li>
              </ul>
            </div>
          </div>

          <!-- Support & Help -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-section">
              <h6 class="footer-title">
                <i class="fas fa-question-circle me-2"></i>
                راهنمایی
              </h6>
              <ul class="footer-links">
                <li>
                  <a href="#" class="footer-link">
                    <i class="fas fa-headset me-2"></i>
                    پشتیبانی
                  </a>
                </li>
                <li>
                  <a href="#" class="footer-link">
                    <i class="fas fa-file-alt me-2"></i>
                    راهنمای استفاده
                  </a>
                </li>
                <li>
                  <a href="#" class="footer-link">
                    <i class="fas fa-shield-alt me-2"></i>
                    حریم خصوصی
                  </a>
                </li>
                <li>
                  <a href="#" class="footer-link">
                    <i class="fas fa-gavel me-2"></i>
                    قوانین و مقررات
                  </a>
                </li>
                <li>
                  <a href="#" class="footer-link">
                    <i class="fas fa-cookie-bite me-2"></i>
                    سیاست کوکی‌ها
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-section">
              <h6 class="footer-title">
                <i class="fas fa-map-marker-alt me-2"></i>
                اطلاعات تماس
              </h6>

              <div class="contact-info">
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="contact-content">
                    <span class="contact-label">آدرس:</span>
                    <span class="contact-value">تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-phone"></i>
                  </div>
                  <div class="contact-content">
                    <span class="contact-label">تلفن:</span>
                    <span class="contact-value">
                      <a href="tel:+982188123456">۰۲۱-۸۸۱۲۳۴۵۶</a>
                    </span>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div class="contact-content">
                    <span class="contact-label">ایمیل:</span>
                    <span class="contact-value">
                      <a href="mailto:info@example.com">info@example.com</a>
                    </span>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="contact-content">
                    <span class="contact-label">ساعات کاری:</span>
                    <span class="contact-value">شنبه تا پنج‌شنبه، ۹ الی ۱۸</span>
                  </div>
                </div>
              </div>

              <!-- Newsletter Signup -->
              <div class="newsletter-signup">
                <h6 class="newsletter-title">
                  <i class="fas fa-bell me-2"></i>
                  عضویت در خبرنامه
                </h6>
                <p class="newsletter-desc">
                  از آخرین اخبار و دوره‌های جدید مطلع شوید
                </p>
                <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
                  <div class="input-group">
                    <input
                        type="email"
                        class="modern-form-control"
                        placeholder="ایمیل شما..."
                        v-model="newsletterEmail"
                        required>
                    <button type="submit" class="modern-btn modern-btn-primary" :disabled="isSubscribing">
                      <span v-if="isSubscribing" class="spinner-border spinner-border-sm" role="status"></span>
                      <i v-else class="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="footer-copyright">
              <p>
                © {{ currentYear }} سامانه آموزش آنلاین.
                <span class="highlight">تمامی حقوق محفوظ است.</span>
              </p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="footer-meta">
              <div class="payment-methods">
                <span class="payment-label">روش‌های پرداخت:</span>
                <div class="payment-icons">
                  <div class="payment-icon" title="کارت‌های بانکی">
                    <i class="fas fa-credit-card"></i>
                  </div>
                  <div class="payment-icon" title="پرداخت اینترنتی">
                    <i class="fas fa-globe"></i>
                  </div>
                  <div class="payment-icon" title="کیف پول دیجیتال">
                    <i class="fas fa-wallet"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll to Top Button -->
    <div class="scroll-to-top" :class="{ 'show': showScrollTop }" @click="scrollToTop">
      <button class="scroll-btn modern-btn modern-btn-primary">
        <i class="fas fa-arrow-up"></i>
      </button>
    </div>

    <!-- Background Elements -->
    <div class="footer-background">
      <div class="bg-pattern"></div>
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
    </div>
  </footer>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'SiteFooter',
  setup() {
    const newsletterEmail = ref('');
    const isSubscribing = ref(false);
    const showScrollTop = ref(false);

    const currentYear = computed(() => {
      return new Date().getFullYear();
    });

    const subscribeNewsletter = async () => {
      isSubscribing.value = true;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Show success message (you can use toast or notification)
        console.log('Newsletter subscription successful:', newsletterEmail.value);

        // Reset form
        newsletterEmail.value = '';

        // Here you would typically show a success message
        alert('با موفقیت در خبرنامه عضو شدید!');

      } catch (error) {
        console.error('Newsletter subscription error:', error);
        alert('خطا در عضویت. لطفاً دوباره تلاش کنید.');
      } finally {
        isSubscribing.value = false;
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    const handleScroll = () => {
      showScrollTop.value = window.pageYOffset > 300;
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      newsletterEmail,
      isSubscribing,
      showScrollTop,
      currentYear,
      subscribeNewsletter,
      scrollToTop
    };
  }
}
</script>

<style scoped>
/* Modern Footer */
.modern-footer {
  position: relative;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ecf0f1;
  overflow: hidden;
}

/* Footer Main */
.footer-main {
  padding: 4rem 0 2rem;
  position: relative;
  z-index: 2;
}

/* Footer Brand */
.footer-brand {
  margin-bottom: 2rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  animation: float 6s ease-in-out infinite;
}

.brand-name {
  color: #ecf0f1;
  font-weight: 700;
  margin-bottom: 0.25rem;
  font-size: 1.3rem;
}

.brand-tagline {
  color: #667eea;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

.footer-description {
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.social-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* Footer Sections */
.footer-section {
  margin-bottom: 2rem;
}

.footer-title {
  color: #ecf0f1;
  font-weight: 700;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  position: relative;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1px;
}

/* Footer Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}

.footer-link:hover {
  color: #667eea;
  text-decoration: none;
  transform: translateX(-3px);
}

.footer-link i {
  width: 20px;
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Contact Info */
.contact-info {
  margin-bottom: 2rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(-3px);
}

.contact-icon {
  width: 35px;
  height: 35px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.contact-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-label {
  font-size: 0.8rem;
  color: #95a5a6;
  font-weight: 600;
}

.contact-value {
  color: #ecf0f1;
  font-size: 0.9rem;
}

.contact-value a {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-value a:hover {
  color: #667eea;
}

/* Newsletter Signup */
.newsletter-signup {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.newsletter-title {
  color: #ecf0f1;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.newsletter-desc {
  color: #bdc3c7;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.newsletter-form .input-group {
  display: flex;
  gap: 0.5rem;
}

.newsletter-form .modern-form-control {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ecf0f1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.newsletter-form .modern-form-control::placeholder {
  color: #95a5a6;
}

.newsletter-form .modern-form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.newsletter-form .modern-btn {
  padding: 0.75rem 1rem;
  min-width: 50px;
}

/* Footer Bottom */
.footer-bottom {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.footer-copyright p {
  margin: 0;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.footer-copyright .highlight {
  color: #667eea;
  font-weight: 600;
}

/* Footer Meta */
.footer-meta {
  text-align: right;
}

.payment-methods {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.payment-label {
  color: #95a5a6;
  font-size: 0.85rem;
  font-weight: 500;
}

.payment-icons {
  display: flex;
  gap: 0.5rem;
}

.payment-icon {
  width: 35px;
  height: 35px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bdc3c7;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.payment-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #667eea;
  transform: scale(1.1);
}

/* Scroll to Top */
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 1000;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.scroll-to-top.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.scroll-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.scroll-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Background Elements */
.footer-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.02);
}

.bg-shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation: float 20s ease-in-out infinite;
}

.bg-shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  right: -100px;
  animation: float 25s ease-in-out infinite reverse;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Responsive Design */
@media (max-width: 992px) {
  .footer-main {
    padding: 3rem 0 1.5rem;
  }

  .brand-logo {
    justify-content: center;
    text-align: center;
  }

  .footer-brand {
    text-align: center;
    margin-bottom: 3rem;
  }

  .social-links {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .footer-main {
    padding: 2rem 0 1rem;
  }

  .footer-bottom {
    text-align: center;
  }

  .footer-meta {
    text-align: center;
    margin-top: 1rem;
  }

  .payment-methods {
    justify-content: center;
    flex-direction: column;
    gap: 0.75rem;
  }

  .scroll-to-top {
    bottom: 1rem;
    left: 1rem;
  }

  .scroll-btn {
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 576px) {
  .newsletter-form .input-group {
    flex-direction: column;
  }

  .newsletter-form .modern-btn {
    width: 100%;
  }

  .contact-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .footer-copyright {
    text-align: center;
    margin-bottom: 1rem;
  }

  .bg-shape-1,
  .bg-shape-2 {
    display: none;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .modern-footer {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .newsletter-form .modern-form-control {
    background: rgba(255, 255, 255, 0.05);
  }
}

/* Print styles */
@media print {
  .modern-footer {
    background: white !important;
    color: black !important;
  }

  .scroll-to-top {
    display: none !important;
  }

  .social-links,
  .newsletter-signup {
    display: none !important;
  }
}
</style>