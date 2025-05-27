<!--<template>-->
<!--  <section class="modern-hero-section">-->
<!--    <div class="hero-background">-->
<!--      <div class="hero-gradient"></div>-->
<!--      <div class="hero-shapes">-->
<!--        <div class="shape shape-1"></div>-->
<!--        <div class="shape shape-2"></div>-->
<!--        <div class="shape shape-3"></div>-->
<!--        <div class="shape shape-4"></div>-->
<!--      </div>-->
<!--    </div>-->

<!--    <div class="container">-->
<!--      <div class="row align-items-center min-vh-100">-->
<!--        &lt;!&ndash; Content Column &ndash;&gt;-->
<!--        <div class="col-lg-6">-->
<!--          <div class="hero-content animate-slide-right">-->
<!--            &lt;!&ndash; Welcome Badge &ndash;&gt;-->
<!--            <div class="welcome-badge animate-fade-in" style="animation-delay: 0.2s;">-->
<!--              <i class="fas fa-star text-warning me-2"></i>-->
<!--              <span>به سامانه پیشرفته آموزش آنلاین خوش آمدید</span>-->
<!--            </div>-->

<!--            &lt;!&ndash; Main Title &ndash;&gt;-->
<!--            <h1 class="hero-title animate-slide-up" style="animation-delay: 0.3s;">-->
<!--              یادگیری را با-->
<!--              <span class="title-highlight">هوش مصنوعی</span>-->
<!--              تجربه کنید-->
<!--            </h1>-->

<!--            &lt;!&ndash; Subtitle &ndash;&gt;-->
<!--            <p class="hero-subtitle animate-slide-up" style="animation-delay: 0.4s;">-->
<!--              دسترسی به بهترین دوره‌های آموزشی آنلاین با اساتید مجرب،-->
<!--              محتوای به‌روز و تکنولوژی‌های پیشرفته. مسیر یادگیری خود را-->
<!--              با ما شروع کنید و آینده‌ای روشن بسازید.-->
<!--            </p>-->

<!--            &lt;!&ndash; Action Buttons &ndash;&gt;-->
<!--            <div class="hero-actions animate-slide-up" style="animation-delay: 0.5s;">-->
<!--              <router-link-->
<!--                  v-if="!isLoggedIn"-->
<!--                  :to="{ name: 'Register' }"-->
<!--                  class="modern-btn modern-btn-primary hero-btn">-->
<!--                <i class="fas fa-rocket me-2"></i>-->
<!--                شروع رایگان-->
<!--                <span class="btn-shine"></span>-->
<!--              </router-link>-->

<!--              <router-link-->
<!--                  v-if="isLoggedIn"-->
<!--                  :to="{ name: 'Dashboard' }"-->
<!--                  class="modern-btn modern-btn-success hero-btn">-->
<!--                <i class="fas fa-tachometer-alt me-2"></i>-->
<!--                داشبورد من-->
<!--                <span class="btn-shine"></span>-->
<!--              </router-link>-->

<!--              <button class="modern-btn modern-btn-outline hero-btn-secondary" @click="scrollToFeatures">-->
<!--                <i class="fas fa-play me-2"></i>-->
<!--                مشاهده ویدیو معرفی-->
<!--              </button>-->
<!--            </div>-->

<!--            &lt;!&ndash; Hero Stats &ndash;&gt;-->
<!--            <div class="hero-stats animate-fade-in" style="animation-delay: 0.6s;">-->
<!--              <div class="stats-grid">-->
<!--                <div class="stat-item">-->
<!--                  <div class="stat-number">-->
<!--                    <span class="counter" data-target="1000">0</span>+-->
<!--                  </div>-->
<!--                  <div class="stat-label">دانش‌آموز فعال</div>-->
<!--                </div>-->
<!--                <div class="stat-item">-->
<!--                  <div class="stat-number">-->
<!--                    <span class="counter" data-target="150">0</span>+-->
<!--                  </div>-->
<!--                  <div class="stat-label">دوره آموزشی</div>-->
<!--                </div>-->
<!--                <div class="stat-item">-->
<!--                  <div class="stat-number">-->
<!--                    <span class="counter" data-target="50">0</span>+-->
<!--                  </div>-->
<!--                  <div class="stat-label">استاد مجرب</div>-->
<!--                </div>-->
<!--                <div class="stat-item">-->
<!--                  <div class="stat-number">-->
<!--                    <span class="counter" data-target="98">0</span>%-->
<!--                  </div>-->
<!--                  <div class="stat-label">رضایت کاربران</div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->

<!--            &lt;!&ndash; Trust Indicators &ndash;&gt;-->
<!--            <div class="trust-indicators animate-slide-up" style="animation-delay: 0.7s;">-->
<!--              <div class="trust-item">-->
<!--                <i class="fas fa-shield-alt text-success"></i>-->
<!--                <span>گواهینامه معتبر</span>-->
<!--              </div>-->
<!--              <div class="trust-item">-->
<!--                <i class="fas fa-clock text-info"></i>-->
<!--                <span>دسترسی مادام‌العمر</span>-->
<!--              </div>-->
<!--              <div class="trust-item">-->
<!--                <i class="fas fa-headset text-warning"></i>-->
<!--                <span>پشتیبانی 24/7</span>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; Visual Column &ndash;&gt;-->
<!--        <div class="col-lg-6">-->
<!--          <div class="hero-visual animate-slide-left" style="animation-delay: 0.4s;">-->
<!--            <div class="visual-container">-->
<!--              &lt;!&ndash; Main Device &ndash;&gt;-->
<!--              <div class="device-mockup">-->
<!--                <div class="device-screen">-->
<!--                  <div class="screen-content">-->
<!--                    <div class="course-preview">-->
<!--                      <div class="course-header">-->
<!--                        <div class="course-image"></div>-->
<!--                        <div class="course-info">-->
<!--                          <h6>دوره برنامه‌نویسی React</h6>-->
<!--                          <p>توسط استاد احمدی</p>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                      <div class="course-progress">-->
<!--                        <div class="progress-bar">-->
<!--                          <div class="progress-fill"></div>-->
<!--                        </div>-->
<!--                        <span>75% تکمیل شده</span>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->

<!--              &lt;!&ndash; Floating Elements &ndash;&gt;-->
<!--              <div class="floating-elements">-->
<!--                <div class="floating-card card-1">-->
<!--                  <i class="fas fa-brain"></i>-->
<!--                  <span>هوش مصنوعی</span>-->
<!--                </div>-->
<!--                <div class="floating-card card-2">-->
<!--                  <i class="fas fa-certificate"></i>-->
<!--                  <span>گواهینامه معتبر</span>-->
<!--                </div>-->
<!--                <div class="floating-card card-3">-->
<!--                  <i class="fas fa-users"></i>-->
<!--                  <span>کلاس آنلاین</span>-->
<!--                </div>-->
<!--                <div class="floating-card card-4">-->
<!--                  <i class="fas fa-mobile-alt"></i>-->
<!--                  <span>یادگیری موبایل</span>-->
<!--                </div>-->
<!--              </div>-->

<!--              &lt;!&ndash; Decorative Elements &ndash;&gt;-->
<!--              <div class="decorative-dots"></div>-->
<!--              <div class="decorative-circle"></div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Scroll Indicator &ndash;&gt;-->
<!--    <div class="scroll-indicator animate-bounce">-->
<!--      <button @click="scrollToFeatures" class="scroll-btn">-->
<!--        <i class="fas fa-chevron-down"></i>-->
<!--      </button>-->
<!--    </div>-->
<!--  </section>-->
<!--</template>-->

<!--<script>-->
<!--import { onMounted, ref } from 'vue';-->

<!--export default {-->
<!--  name: 'HeroSection',-->
<!--  props: {-->
<!--    isLoggedIn: {-->
<!--      type: Boolean,-->
<!--      default: false-->
<!--    }-->
<!--  },-->
<!--  setup() {-->
<!--    const countersStarted = ref(false);-->

<!--    const scrollToFeatures = () => {-->
<!--      const featuresSection = document.querySelector('.features-section');-->
<!--      if (featuresSection) {-->
<!--        featuresSection.scrollIntoView({ behavior: 'smooth' });-->
<!--      }-->
<!--    };-->

<!--    const animateCounters = () => {-->
<!--      if (countersStarted.value) return;-->

<!--      const counters = document.querySelectorAll('.counter');-->
<!--      const observer = new IntersectionObserver((entries) => {-->
<!--        entries.forEach(entry => {-->
<!--          if (entry.isIntersecting) {-->
<!--            const counter = entry.target;-->
<!--            const target = parseInt(counter.getAttribute('data-target'));-->
<!--            let current = 0;-->
<!--            const increment = target / 100;-->
<!--            const timer = setInterval(() => {-->
<!--              current += increment;-->
<!--              counter.textContent = Math.floor(current);-->
<!--              if (current >= target) {-->
<!--                counter.textContent = target;-->
<!--                clearInterval(timer);-->
<!--              }-->
<!--            }, 20);-->
<!--            observer.unobserve(counter);-->
<!--          }-->
<!--        });-->
<!--      });-->

<!--      counters.forEach(counter => observer.observe(counter));-->
<!--      countersStarted.value = true;-->
<!--    };-->

<!--    onMounted(() => {-->
<!--      // Animate counters when they come into view-->
<!--      setTimeout(animateCounters, 1000);-->

<!--      // Add parallax effect to floating elements-->
<!--      const handleMouseMove = (e) => {-->
<!--        const cards = document.querySelectorAll('.floating-card');-->
<!--        const x = e.clientX / window.innerWidth;-->
<!--        const y = e.clientY / window.innerHeight;-->

<!--        cards.forEach((card, index) => {-->
<!--          const speed = (index + 1) * 0.5;-->
<!--          const xPos = (x - 0.5) * speed * 20;-->
<!--          const yPos = (y - 0.5) * speed * 20;-->
<!--          card.style.transform = `translate(${xPos}px, ${yPos}px)`;-->
<!--        });-->
<!--      };-->

<!--      document.addEventListener('mousemove', handleMouseMove);-->

<!--      return () => {-->
<!--        document.removeEventListener('mousemove', handleMouseMove);-->
<!--      };-->
<!--    });-->

<!--    return {-->
<!--      scrollToFeatures-->
<!--    };-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--/* Modern Hero Section */-->
<!--.modern-hero-section {-->
<!--  position: relative;-->
<!--  min-height: 100vh;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  overflow: hidden;-->
<!--  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);-->
<!--}-->

<!--/* Hero Background */-->
<!--.hero-background {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  bottom: 0;-->
<!--  z-index: 1;-->
<!--}-->

<!--.hero-gradient {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  bottom: 0;-->
<!--  background: linear-gradient(135deg,-->
<!--  rgba(102, 126, 234, 0.9) 0%,-->
<!--  rgba(118, 75, 162, 0.8) 50%,-->
<!--  rgba(102, 126, 234, 0.9) 100%);-->
<!--}-->

<!--/* Animated Background Shapes */-->
<!--.hero-shapes {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  bottom: 0;-->
<!--}-->

<!--.shape {-->
<!--  position: absolute;-->
<!--  border-radius: 50%;-->
<!--  background: rgba(255, 255, 255, 0.1);-->
<!--  animation: float 6s ease-in-out infinite;-->
<!--}-->

<!--.shape-1 {-->
<!--  width: 120px;-->
<!--  height: 120px;-->
<!--  top: 10%;-->
<!--  left: 10%;-->
<!--  animation-delay: 0s;-->
<!--}-->

<!--.shape-2 {-->
<!--  width: 80px;-->
<!--  height: 80px;-->
<!--  top: 60%;-->
<!--  left: 5%;-->
<!--  animation-delay: 2s;-->
<!--}-->

<!--.shape-3 {-->
<!--  width: 150px;-->
<!--  height: 150px;-->
<!--  top: 20%;-->
<!--  right: 15%;-->
<!--  animation-delay: 4s;-->
<!--}-->

<!--.shape-4 {-->
<!--  width: 60px;-->
<!--  height: 60px;-->
<!--  bottom: 20%;-->
<!--  right: 20%;-->
<!--  animation-delay: 1s;-->
<!--}-->

<!--/* Content Styling */-->
<!--.container {-->
<!--  position: relative;-->
<!--  z-index: 2;-->
<!--}-->

<!--.hero-content {-->
<!--  color: white;-->
<!--  padding: 2rem 0;-->
<!--}-->

<!--/* Welcome Badge */-->
<!--.welcome-badge {-->
<!--  display: inline-flex;-->
<!--  align-items: center;-->
<!--  background: rgba(255, 255, 255, 0.15);-->
<!--  backdrop-filter: blur(10px);-->
<!--  padding: 0.75rem 1.5rem;-->
<!--  border-radius: 25px;-->
<!--  font-size: 0.9rem;-->
<!--  font-weight: 500;-->
<!--  margin-bottom: 2rem;-->
<!--  border: 1px solid rgba(255, 255, 255, 0.2);-->
<!--}-->

<!--/* Hero Title */-->
<!--.hero-title {-->
<!--  font-size: 3.5rem;-->
<!--  font-weight: 800;-->
<!--  line-height: 1.2;-->
<!--  margin-bottom: 2rem;-->
<!--}-->

<!--.title-highlight {-->
<!--  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);-->
<!--  -webkit-background-clip: text;-->
<!--  -webkit-text-fill-color: transparent;-->
<!--  background-clip: text;-->
<!--  position: relative;-->
<!--}-->

<!--.title-highlight::after {-->
<!--  content: '';-->
<!--  position: absolute;-->
<!--  bottom: -5px;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  height: 3px;-->
<!--  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);-->
<!--  border-radius: 2px;-->
<!--}-->

<!--/* Hero Subtitle */-->
<!--.hero-subtitle {-->
<!--  font-size: 1.25rem;-->
<!--  line-height: 1.6;-->
<!--  margin-bottom: 3rem;-->
<!--  opacity: 0.95;-->
<!--  max-width: 500px;-->
<!--}-->

<!--/* Hero Actions */-->
<!--.hero-actions {-->
<!--  display: flex;-->
<!--  gap: 1rem;-->
<!--  margin-bottom: 3rem;-->
<!--  flex-wrap: wrap;-->
<!--}-->

<!--.hero-btn {-->
<!--  font-size: 1.1rem;-->
<!--  padding: 1rem 2rem;-->
<!--  position: relative;-->
<!--  overflow: hidden;-->
<!--}-->

<!--.hero-btn-secondary {-->
<!--  background: rgba(255, 255, 255, 0.1);-->
<!--  border: 2px solid rgba(255, 255, 255, 0.3);-->
<!--  color: white;-->
<!--  backdrop-filter: blur(10px);-->
<!--}-->

<!--.btn-shine {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: -100%;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);-->
<!--  transition: left 0.6s;-->
<!--}-->

<!--.hero-btn:hover .btn-shine {-->
<!--  left: 100%;-->
<!--}-->

<!--/* Hero Stats */-->
<!--.hero-stats {-->
<!--  margin-bottom: 2rem;-->
<!--  padding-top: 2rem;-->
<!--  border-top: 1px solid rgba(255, 255, 255, 0.2);-->
<!--}-->

<!--.stats-grid {-->
<!--  display: grid;-->
<!--  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));-->
<!--  gap: 2rem;-->
<!--}-->

<!--.stat-item {-->
<!--  text-align: center;-->
<!--}-->

<!--.stat-number {-->
<!--  font-size: 2rem;-->
<!--  font-weight: 700;-->
<!--  margin-bottom: 0.5rem;-->
<!--  color: #f39c12;-->
<!--}-->

<!--.stat-label {-->
<!--  font-size: 0.9rem;-->
<!--  opacity: 0.9;-->
<!--}-->

<!--/* Trust Indicators */-->
<!--.trust-indicators {-->
<!--  display: flex;-->
<!--  gap: 2rem;-->
<!--  flex-wrap: wrap;-->
<!--}-->

<!--.trust-item {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 0.5rem;-->
<!--  font-size: 0.9rem;-->
<!--  opacity: 0.9;-->
<!--}-->

<!--.trust-item i {-->
<!--  font-size: 1.1rem;-->
<!--}-->

<!--/* Hero Visual */-->
<!--.hero-visual {-->
<!--  position: relative;-->
<!--  height: 600px;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--}-->

<!--.visual-container {-->
<!--  position: relative;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--}-->

<!--/* Device Mockup */-->
<!--.device-mockup {-->
<!--  position: relative;-->
<!--  width: 350px;-->
<!--  height: 500px;-->
<!--  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));-->
<!--  border-radius: 20px;-->
<!--  padding: 20px;-->
<!--  backdrop-filter: blur(15px);-->
<!--  border: 1px solid rgba(255, 255, 255, 0.2);-->
<!--  margin: 0 auto;-->
<!--  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);-->
<!--}-->

<!--.device-screen {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  background: #fff;-->
<!--  border-radius: 15px;-->
<!--  overflow: hidden;-->
<!--  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--.screen-content {-->
<!--  padding: 2rem;-->
<!--  height: 100%;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  justify-content: center;-->
<!--}-->

<!--.course-preview {-->
<!--  background: #f8f9fa;-->
<!--  border-radius: 12px;-->
<!--  padding: 1.5rem;-->
<!--  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--.course-header {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 1rem;-->
<!--  margin-bottom: 1.5rem;-->
<!--}-->

<!--.course-image {-->
<!--  width: 60px;-->
<!--  height: 60px;-->
<!--  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);-->
<!--  border-radius: 8px;-->
<!--}-->

<!--.course-info h6 {-->
<!--  margin: 0 0 0.25rem 0;-->
<!--  color: #333;-->
<!--  font-weight: 600;-->
<!--}-->

<!--.course-info p {-->
<!--  margin: 0;-->
<!--  color: #6c757d;-->
<!--  font-size: 0.9rem;-->
<!--}-->

<!--.course-progress {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 1rem;-->
<!--}-->

<!--.progress-bar {-->
<!--  flex: 1;-->
<!--  height: 8px;-->
<!--  background: #e9ecef;-->
<!--  border-radius: 4px;-->
<!--  overflow: hidden;-->
<!--}-->

<!--.progress-fill {-->
<!--  width: 75%;-->
<!--  height: 100%;-->
<!--  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);-->
<!--  border-radius: 4px;-->
<!--  animation: progressFill 2s ease-in-out;-->
<!--}-->

<!--@keyframes progressFill {-->
<!--  from { width: 0%; }-->
<!--  to { width: 75%; }-->
<!--}-->

<!--/* Floating Cards */-->
<!--.floating-elements {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  bottom: 0;-->
<!--  pointer-events: none;-->
<!--}-->

<!--.floating-card {-->
<!--  position: absolute;-->
<!--  background: rgba(255, 255, 255, 0.15);-->
<!--  backdrop-filter: blur(10px);-->
<!--  border-radius: 12px;-->
<!--  padding: 1rem;-->
<!--  color: white;-->
<!--  text-align: center;-->
<!--  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);-->
<!--  transition: transform 0.3s ease;-->
<!--  border: 1px solid rgba(255, 255, 255, 0.2);-->
<!--}-->

<!--.floating-card i {-->
<!--  font-size: 1.5rem;-->
<!--  margin-bottom: 0.5rem;-->
<!--  display: block;-->
<!--}-->

<!--.floating-card span {-->
<!--  font-size: 0.8rem;-->
<!--  font-weight: 600;-->
<!--}-->

<!--.card-1 {-->
<!--  top: 5%;-->
<!--  right: 10%;-->
<!--  animation: float 6s ease-in-out infinite;-->
<!--}-->

<!--.card-2 {-->
<!--  top: 25%;-->
<!--  left: 5%;-->
<!--  animation: float 6s ease-in-out infinite 1.5s;-->
<!--}-->

<!--.card-3 {-->
<!--  bottom: 25%;-->
<!--  right: 5%;-->
<!--  animation: float 6s ease-in-out infinite 3s;-->
<!--}-->

<!--.card-4 {-->
<!--  bottom: 5%;-->
<!--  left: 15%;-->
<!--  animation: float 6s ease-in-out infinite 4.5s;-->
<!--}-->

<!--/* Decorative Elements */-->
<!--.decorative-dots {-->
<!--  position: absolute;-->
<!--  top: 15%;-->
<!--  left: 20%;-->
<!--  width: 100px;-->
<!--  height: 100px;-->
<!--  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 2px, transparent 2px);-->
<!--  background-size: 20px 20px;-->
<!--  animation: fadeInOut 4s ease-in-out infinite;-->
<!--}-->

<!--.decorative-circle {-->
<!--  position: absolute;-->
<!--  bottom: 10%;-->
<!--  right: 25%;-->
<!--  width: 150px;-->
<!--  height: 150px;-->
<!--  border: 2px solid rgba(255, 255, 255, 0.2);-->
<!--  border-radius: 50%;-->
<!--  animation: rotate 20s linear infinite;-->
<!--}-->

<!--/* Scroll Indicator */-->
<!--.scroll-indicator {-->
<!--  position: absolute;-->
<!--  bottom: 2rem;-->
<!--  left: 50%;-->
<!--  transform: translateX(-50%);-->
<!--  z-index: 3;-->
<!--}-->

<!--.scroll-btn {-->
<!--  background: rgba(255, 255, 255, 0.1);-->
<!--  border: 2px solid rgba(255, 255, 255, 0.3);-->
<!--  color: white;-->
<!--  width: 50px;-->
<!--  height: 50px;-->
<!--  border-radius: 50%;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  cursor: pointer;-->
<!--  transition: all 0.3s ease;-->
<!--  backdrop-filter: blur(10px);-->
<!--}-->

<!--.scroll-btn:hover {-->
<!--  background: rgba(255, 255, 255, 0.2);-->
<!--  transform: translateY(-3px);-->
<!--}-->

<!--/* Animations */-->
<!--@keyframes float {-->
<!--  0%, 100% { transform: translateY(0px); }-->
<!--  50% { transform: translateY(-15px); }-->
<!--}-->

<!--@keyframes fadeInOut {-->
<!--  0%, 100% { opacity: 0.3; }-->
<!--  50% { opacity: 0.7; }-->
<!--}-->

<!--@keyframes rotate {-->
<!--  from { transform: rotate(0deg); }-->
<!--  to { transform: rotate(360deg); }-->
<!--}-->

<!--@keyframes bounce {-->
<!--  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }-->
<!--  40% { transform: translateY(-10px); }-->
<!--  60% { transform: translateY(-5px); }-->
<!--}-->

<!--.animate-bounce {-->
<!--  animation: bounce 2s infinite;-->
<!--}-->

<!--/* Responsive Design */-->
<!--@media (max-width: 992px) {-->
<!--  .hero-title {-->
<!--    font-size: 2.5rem;-->
<!--  }-->

<!--  .hero-subtitle {-->
<!--    font-size: 1.1rem;-->
<!--  }-->

<!--  .device-mockup {-->
<!--    width: 280px;-->
<!--    height: 400px;-->
<!--  }-->

<!--  .floating-card {-->
<!--    padding: 0.75rem;-->
<!--  }-->

<!--  .stats-grid {-->
<!--    grid-template-columns: repeat(2, 1fr);-->
<!--    gap: 1.5rem;-->
<!--  }-->
<!--}-->

<!--@media (max-width: 768px) {-->
<!--  .hero-title {-->
<!--    font-size: 2rem;-->
<!--  }-->

<!--  .hero-actions {-->
<!--    flex-direction: column;-->
<!--    align-items: stretch;-->
<!--  }-->

<!--  .hero-btn {-->
<!--    text-align: center;-->
<!--  }-->

<!--  .device-mockup {-->
<!--    width: 250px;-->
<!--    height: 350px;-->
<!--  }-->

<!--  .hero-visual {-->
<!--    height: 400px;-->
<!--    margin-top: 2rem;-->
<!--  }-->

<!--  .trust-indicators {-->
<!--    justify-content: center;-->
<!--  }-->
<!--}-->

<!--@media (max-width: 576px) {-->
<!--  .hero-title {-->
<!--    font-size: 1.75rem;-->
<!--  }-->

<!--  .stats-grid {-->
<!--    grid-template-columns: 1fr 1fr;-->
<!--    gap: 1rem;-->
<!--  }-->

<!--  .stat-number {-->
<!--    font-size: 1.5rem;-->
<!--  }-->

<!--  .floating-card {-->
<!--    display: none;-->
<!--  }-->
<!--}-->
<!--</style>-->