<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section modern-page-bg">
      <div class="container">
        <div class="row align-items-center min-vh-100">
          <div class="col-lg-6 text-center text-lg-start">
            <div class="hero-content animate-slide-right">
              <div class="modern-logo large mb-4" style="margin: 0 auto 2rem; animation-delay: 0.2s;">
                <i class="fas fa-graduation-cap"></i>
              </div>

              <h1 class="hero-title mb-4 animate-slide-up" style="animation-delay: 0.3s;">
                سامانه آموزش آنلاین
                <span class="highlight">مدرن و پیشرفته</span>
              </h1>

              <p class="hero-subtitle mb-5 animate-slide-up" style="animation-delay: 0.4s;">
                یادگیری را با بهترین اساتید و جدیدترین روش‌های آموزشی تجربه کنید.
                دوره‌های متنوع، امکانات پیشرفته و پشتیبانی 24 ساعته در انتظار شماست.
              </p>

              <div class="hero-actions animate-slide-up" style="animation-delay: 0.5s;">
                <router-link v-if="!isLoggedIn" :to="{ name: 'Register' }" class="modern-btn modern-btn-success me-3">
                  <i class="fas fa-user-plus me-2"></i>
                  شروع یادگیری
                </router-link>

                <router-link v-if="isLoggedIn" :to="{ name: 'Dashboard' }" class="modern-btn modern-btn-primary me-3">
                  <i class="fas fa-tachometer-alt me-2"></i>
                  داشبورد من
                </router-link>

                <router-link :to="{ name: 'Courses' }" class="modern-btn modern-btn-outline text-white">
                  <i class="fas fa-book me-2"></i>
                  مشاهده دوره‌ها
                </router-link>
              </div>

              <!-- Stats -->
              <div class="hero-stats mt-5 animate-fade-in" style="animation-delay: 0.6s;">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number">500+</div>
                      <div class="stat-label">دانش‌آموز</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number">50+</div>
                      <div class="stat-label">دوره آموزشی</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number">20+</div>
                      <div class="stat-label">استاد مجرب</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="hero-visual animate-slide-left" style="animation-delay: 0.4s;">
              <div class="floating-elements">
                <div class="floating-card card-1">
                  <i class="fas fa-laptop-code"></i>
                  <span>برنامه‌نویسی</span>
                </div>
                <div class="floating-card card-2">
                  <i class="fas fa-paint-brush"></i>
                  <span>طراحی UI/UX</span>
                </div>
                <div class="floating-card card-3">
                  <i class="fas fa-chart-line"></i>
                  <span>تحلیل داده</span>
                </div>
                <div class="floating-card card-4">
                  <i class="fas fa-language"></i>
                  <span>زبان‌های خارجی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5" style="background: #f8f9fa;">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title animate-slide-up">
            <i class="fas fa-star text-warning me-2"></i>
            ویژگی‌های برتر سامانه
          </h2>
          <p class="section-subtitle animate-slide-up" style="animation-delay: 0.1s;">
            امکانات پیشرفته برای تجربه یادگیری بهتر
          </p>
        </div>

        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="modern-card text-center animate-slide-up" style="animation-delay: 0.2s;">
              <div class="feature-icon text-primary mb-3">
                <i class="fas fa-video fa-3x"></i>
              </div>
              <h5>دوره‌های ویدیویی</h5>
              <p class="text-muted">
                آموزش‌های تصویری با کیفیت HD و امکان تنظیم سرعت پخش
              </p>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="modern-card text-center animate-slide-up" style="animation-delay: 0.3s;">
              <div class="feature-icon text-success mb-3">
                <i class="fas fa-certificate fa-3x"></i>
              </div>
              <h5>گواهینامه معتبر</h5>
              <p class="text-muted">
                دریافت گواهینامه پس از تکمیل موفقیت‌آمیز دوره‌ها
              </p>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="modern-card text-center animate-slide-up" style="animation-delay: 0.4s;">
              <div class="feature-icon text-warning mb-3">
                <i class="fas fa-comments fa-3x"></i>
              </div>
              <h5>پشتیبانی آنلاین</h5>
              <p class="text-muted">
                چت زنده با اساتید و پاسخ سریع به سوالات شما
              </p>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="modern-card text-center animate-slide-up" style="animation-delay: 0.5s;">
              <div class="feature-icon text-info mb-3">
                <i class="fas fa-mobile-alt fa-3x"></i>
              </div>
              <h5>دسترسی موبایل</h5>
              <p class="text-muted">
                یادگیری در هر زمان و مکان با طراحی واکنشگرا
              </p>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="modern-card text-center animate-slide-up" style="animation-delay: 0.6s;">
              <div class="feature-icon text-danger mb-3">
                <i class="fas fa-tasks fa-3x"></i>
              </div>
              <h5>تمرین و آزمون</h5>
              <p class="text-muted">
                تست‌های متنوع برای سنجش میزان یادگیری شما
              </p>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="modern-card text-center animate-slide-up" style="animation-delay: 0.7s;">
              <div class="feature-icon text-secondary mb-3">
                <i class="fas fa-clock fa-3x"></i>
              </div>
              <h5>دسترسی مادام‌العمر</h5>
              <p class="text-muted">
                دسترسی دائمی به محتوای دوره‌های خریداری شده
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section py-5 modern-page-bg dark-gradient">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="about-content text-white animate-slide-right">
              <h2 class="mb-4">
                <i class="fas fa-lightbulb text-warning me-2"></i>
                درباره سامانه آموزش آنلاین
              </h2>
              <p class="mb-4">
                ما با هدف ارائه بهترین تجربه یادگیری آنلاین، مجموعه‌ای از دوره‌های متنوع و با کیفیت را در اختیار شما قرار داده‌ایم.
                تیم ما متشکل از اساتید مجرب و متخصصان حوزه‌های مختلف است که با استفاده از جدیدترین روش‌های آموزشی،
                محتوای ارزشمندی برای شما تولید می‌کنند.
              </p>

              <div class="about-features">
                <div class="feature-item mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  آموزش توسط اساتید مجرب و متخصص
                </div>
                <div class="feature-item mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  محتوای به‌روز و کاربردی
                </div>
                <div class="feature-item mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  پشتیبانی کامل در طول دوره
                </div>
                <div class="feature-item mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  گواهینامه معتبر پایان دوره
                </div>
              </div>

              <div class="mt-4">
                <router-link v-if="!isLoggedIn" :to="{ name: 'Register' }" class="modern-btn modern-btn-success me-3">
                  <i class="fas fa-rocket me-2"></i>
                  همین حالا شروع کنید
                </router-link>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="about-stats animate-slide-left">
              <div class="row">
                <div class="col-6 mb-4">
                  <div class="modern-stat-card">
                    <div class="modern-stat-icon text-primary">
                      <i class="fas fa-users"></i>
                    </div>
                    <div class="modern-stat-value">1000+</div>
                    <div class="modern-stat-label">دانش‌آموز راضی</div>
                  </div>
                </div>
                <div class="col-6 mb-4">
                  <div class="modern-stat-card">
                    <div class="modern-stat-icon text-success">
                      <i class="fas fa-book"></i>
                    </div>
                    <div class="modern-stat-value">100+</div>
                    <div class="modern-stat-label">دوره متنوع</div>
                  </div>
                </div>
                <div class="col-6 mb-4">
                  <div class="modern-stat-card">
                    <div class="modern-stat-icon text-warning">
                      <i class="fas fa-award"></i>
                    </div>
                    <div class="modern-stat-value">95%</div>
                    <div class="modern-stat-label">رضایت کاربران</div>
                  </div>
                </div>
                <div class="col-6 mb-4">
                  <div class="modern-stat-card">
                    <div class="modern-stat-icon text-info">
                      <i class="fas fa-clock"></i>
                    </div>
                    <div class="modern-stat-value">24/7</div>
                    <div class="modern-stat-label">پشتیبانی</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section py-5" style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 text-center text-white">
            <div class="animate-slide-up">
              <h2 class="mb-4">آماده شروع یادگیری هستید؟</h2>
              <p class="mb-4 fs-5">
                همین امروز به جمع هزاران دانش‌آموز موفق ما بپیوندید و مسیر یادگیری خود را شروع کنید.
              </p>

              <div class="cta-actions">
                <router-link v-if="!isLoggedIn" :to="{ name: 'Register' }" class="modern-btn modern-btn-outline text-white me-3">
                  <i class="fas fa-user-plus me-2"></i>
                  ثبت نام رایگان
                </router-link>

                <router-link :to="{ name: 'Courses' }" class="modern-btn" style="background: rgba(255,255,255,0.2); color: white;">
                  <i class="fas fa-search me-2"></i>
                  جستجوی دوره‌ها
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <site-footer />
  </div>
</template>

<script>
import SiteFooter from '@/components/layout/SiteFooter.vue';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Home',
  components: {
    SiteFooter
  },
  setup() {
    const { isLoggedIn } = useUser();

    return {
      isLoggedIn
    };
  }
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin-bottom: 2rem;
}

.hero-title .highlight {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.hero-actions .modern-btn {
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

/* Hero Stats */
.hero-stats {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 2rem;
}

.stat-item {
  padding: 1rem 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  min-width: 150px;
}

.floating-card:hover {
  transform: translateY(-10px) scale(1.05);
}

.floating-card i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.floating-card span {
  font-weight: 600;
  font-size: 0.9rem;
}

.card-1 {
  top: 10%;
  right: 20%;
  animation: float 6s ease-in-out infinite;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
}

.card-2 {
  top: 30%;
  left: 10%;
  animation: float 6s ease-in-out infinite 1.5s;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.2));
}

.card-3 {
  bottom: 30%;
  right: 10%;
  animation: float 6s ease-in-out infinite 3s;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.2), rgba(46, 204, 113, 0.2));
}

.card-4 {
  bottom: 10%;
  left: 30%;
  animation: float 6s ease-in-out infinite 4.5s;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(230, 126, 34, 0.2));
}

/* Sections */
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 3rem;
}

/* Feature Icons */
.feature-icon {
  margin-bottom: 1rem;
}

/* About Features */
.feature-item {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

/* CTA Section */
.cta-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
}

.cta-actions .modern-btn {
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-left {
  animation: slideInLeft 0.8s ease forwards;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions .modern-btn {
    width: 100%;
    margin-bottom: 1rem;
  }

  .hero-visual {
    height: 300px;
    margin-top: 3rem;
  }

  .floating-card {
    min-width: 120px;
    padding: 1rem;
  }

  .floating-card i {
    font-size: 1.5rem;
  }

  .floating-card span {
    font-size: 0.8rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-section h2 {
    font-size: 2rem;
  }

  .cta-actions .modern-btn {
    width: 100%;
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 2rem 0;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-stats .stat-number {
    font-size: 1.5rem;
  }

  .floating-elements {
    display: none;
  }

  .section-title {
    font-size: 1.75rem;
  }
}
</style>