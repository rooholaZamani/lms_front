<template>
  <section class="modern-about-section">
    <div class="container">
      <div class="row align-items-center">
        <!-- Content Column -->
        <div class="col-lg-6">
          <div class="about-content animate-slide-right">
            <!-- Section Badge -->
            <div class="section-badge">
              <i class="fas fa-lightbulb me-2"></i>
              درباره ما
            </div>

            <!-- Main Title -->
            <h2 class="about-title">
              آینده آموزش در
              <span class="title-highlight">دستان شماست</span>
            </h2>

            <!-- Description -->
            <p class="about-description">
              ما با هدف دموکراتیک کردن آموزش و ارائه بهترین تجربه یادگیری آنلاین،
              پلتفرمی هوشمند و کاربرپسند طراحی کرده‌ایم که در آن همه می‌توانند
              به بهترین منابع آموزشی دسترسی داشته باشند.
            </p>

            <!-- Key Features -->
            <div class="about-features">
              <div class="feature-item" v-for="(feature, index) in aboutFeatures" :key="index">
                <div class="feature-icon">
                  <i :class="feature.icon"></i>
                </div>
                <div class="feature-content">
                  <h6 class="feature-title">{{ feature.title }}</h6>
                  <p class="feature-desc">{{ feature.description }}</p>
                </div>
              </div>
            </div>

            <!-- Mission Statement -->
            <div class="mission-statement modern-card">
              <div class="mission-icon">
                <i class="fas fa-rocket"></i>
              </div>
              <div class="mission-content">
                <h5>ماموریت ما</h5>
                <p>
                  ایجاد محیطی که در آن یادگیری لذت‌بخش، مؤثر و در دسترس همه باشد.
                  ما معتقدیم که هر فردی حق دسترسی به آموزش با کیفیت را دارد.
                </p>
              </div>
            </div>

            <!-- CTA Button -->
            <div class="about-cta">
              <router-link :to="{ name: 'Register' }" class="modern-btn modern-btn-primary">
                <i class="fas fa-rocket me-2"></i>
                همین حالا شروع کنید
                <span class="btn-shine"></span>
              </router-link>

              <button class="modern-btn modern-btn-outline ms-3" @click="openVideoModal">
                <i class="fas fa-play me-2"></i>
                تماشای ویدیو معرفی
              </button>
            </div>
          </div>
        </div>

        <!-- Visual Column -->
        <div class="col-lg-6">
          <div class="about-visual animate-slide-left">
            <!-- Main Visual Container -->
            <div class="visual-container">
              <!-- Statistics Cards -->
              <div class="stats-floating">
                <div class="stat-card stat-card-1 modern-card">
                  <div class="stat-icon">
                    <i class="fas fa-users text-primary"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ animatedStats.students }}</div>
                    <div class="stat-label">دانش‌آموز فعال</div>
                  </div>
                </div>

                <div class="stat-card stat-card-2 modern-card">
                  <div class="stat-icon">
                    <i class="fas fa-graduation-cap text-success"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ animatedStats.courses }}</div>
                    <div class="stat-label">دوره تخصصی</div>
                  </div>
                </div>

                <div class="stat-card stat-card-3 modern-card">
                  <div class="stat-icon">
                    <i class="fas fa-medal text-warning"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ animatedStats.certificates }}</div>
                    <div class="stat-label">گواهینامه صادر شده</div>
                  </div>
                </div>

                <div class="stat-card stat-card-4 modern-card">
                  <div class="stat-icon">
                    <i class="fas fa-star text-danger"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ animatedStats.satisfaction }}%</div>
                    <div class="stat-label">رضایت کاربران</div>
                  </div>
                </div>
              </div>

              <!-- Central Illustration -->
              <div class="central-illustration">
                <div class="illustration-bg"></div>
                <div class="illustration-content">
                  <div class="main-circle">
                    <div class="inner-circle">
                      <i class="fas fa-brain"></i>
                    </div>
                  </div>

                  <!-- Orbiting Elements -->
                  <div class="orbit orbit-1">
                    <div class="orbit-item">
                      <i class="fas fa-book"></i>
                    </div>
                  </div>

                  <div class="orbit orbit-2">
                    <div class="orbit-item">
                      <i class="fas fa-laptop"></i>
                    </div>
                  </div>

                  <div class="orbit orbit-3">
                    <div class="orbit-item">
                      <i class="fas fa-mobile-alt"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Decorative Elements -->
              <div class="decorative-elements">
                <div class="deco-dot deco-dot-1"></div>
                <div class="deco-dot deco-dot-2"></div>
                <div class="deco-dot deco-dot-3"></div>
                <div class="deco-line deco-line-1"></div>
                <div class="deco-line deco-line-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="team-section">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h3 class="team-title">تیم ما</h3>
            <p class="team-subtitle">
              متخصصان با تجربه‌ای که برای موفقیت شما تلاش می‌کنند
            </p>
          </div>
        </div>

        <div class="team-grid">
          <div
              v-for="(member, index) in teamMembers"
              :key="index"
              class="team-member modern-card animate-slide-up"
              :style="{ 'animation-delay': `${index * 0.1}s` }">

            <div class="member-avatar">
              <div class="avatar-bg" :class="member.avatarClass">
                <i :class="member.icon"></i>
              </div>
              <div class="member-status"></div>
            </div>

            <div class="member-info">
              <h6 class="member-name">{{ member.name }}</h6>
              <p class="member-role">{{ member.role }}</p>
              <p class="member-desc">{{ member.description }}</p>
            </div>

            <div class="member-social">
              <a href="#" class="social-link">
                <i class="fab fa-linkedin"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Elements -->
    <div class="section-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';

export default {
  name: 'AboutSection',
  setup() {
    const animatedStats = reactive({
      students: 0,
      courses: 0,
      certificates: 0,
      satisfaction: 0
    });

    const aboutFeatures = ref([
      {
        icon: 'fas fa-check-circle text-success',
        title: 'اساتید مجرب',
        description: 'بیش از 10 سال تجربه در حوزه‌های تخصصی'
      },
      {
        icon: 'fas fa-clock text-info',
        title: 'آموزش 24/7',
        description: 'دسترسی همیشگی به محتوای آموزشی'
      },
      {
        icon: 'fas fa-certificate text-warning',
        title: 'گواهینامه معتبر',
        description: 'گواهینامه‌های بین‌المللی و قابل اعتماد'
      },
      {
        icon: 'fas fa-headset text-primary',
        title: 'پشتیبانی کامل',
        description: 'راهنمایی و پاسخگویی در تمام مراحل'
      }
    ]);

    const teamMembers = ref([
      {
        name: 'دکتر علی محمدی',
        role: 'مدیر آموزش',
        description: 'متخصص فناوری اطلاعات با 15 سال تجربه',
        icon: 'fas fa-user-tie',
        avatarClass: 'avatar-blue'
      },
      {
        name: 'مریم احمدی',
        role: 'طراح تجربه کاربری',
        description: 'طراح UX/UI با تجربه در پروژه‌های بین‌المللی',
        icon: 'fas fa-palette',
        avatarClass: 'avatar-purple'
      },
      {
        name: 'حسین رضایی',
        role: 'توسعه‌دهنده ارشد',
        description: 'متخصص فول‌استک با تسلط بر تکنولوژی‌های مدرن',
        icon: 'fas fa-code',
        avatarClass: 'avatar-green'
      },
      {
        name: 'فاطمه کریمی',
        role: 'مشاور آموزشی',
        description: 'کارشناس روان‌شناسی تربیتی و مشاوره تحصیلی',
        icon: 'fas fa-brain',
        avatarClass: 'avatar-orange'
      }
    ]);

    const openVideoModal = () => {
      // Open video modal logic
      console.log('Opening video modal...');
    };

    const animateNumbers = () => {
      const targets = {
        students: 2500,
        courses: 150,
        certificates: 1800,
        satisfaction: 98
      };

      Object.keys(targets).forEach(key => {
        const target = targets[key];
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            animatedStats[key] = target;
            clearInterval(timer);
          } else {
            animatedStats[key] = Math.floor(current);
          }
        }, duration / steps);
      });
    };

    onMounted(() => {
      // Start number animation when component is mounted
      setTimeout(animateNumbers, 500);
    });

    return {
      animatedStats,
      aboutFeatures,
      teamMembers,
      openVideoModal
    };
  }
}
</script>

<style scoped>
/* Modern About Section */
.modern-about-section {
  position: relative;
  padding: 5rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow: hidden;
}

/* Section Badge */
.section-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

/* About Title */
.about-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.title-highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

/* About Description */
.about-description {
  font-size: 1.1rem;
  color: #6c757d;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

/* About Features */
.about-features {
  margin-bottom: 2.5rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(-5px);
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.feature-desc {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

/* Mission Statement */
.mission-statement {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border: 1px solid rgba(102, 126, 234, 0.1);
  margin-bottom: 2.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.mission-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.mission-content h5 {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.mission-content p {
  color: #6c757d;
  margin: 0;
  line-height: 1.6;
}

/* About CTA */
.about-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.modern-btn:hover .btn-shine {
  left: 100%;
}

/* Visual Container */
.visual-container {
  position: relative;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Floating Statistics */
.stats-floating {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.stat-card {
  position: absolute;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 150px;
  animation: float 6s ease-in-out infinite;
}

.stat-card-1 { top: 10%; left: 10%; animation-delay: 0s; }
.stat-card-2 { top: 20%; right: 5%; animation-delay: 1.5s; }
.stat-card-3 { bottom: 20%; left: 5%; animation-delay: 3s; }
.stat-card-4 { bottom: 10%; right: 15%; animation-delay: 4.5s; }

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

/* Central Illustration */
.central-illustration {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.illustration-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 50%;
}

.illustration-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.main-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.inner-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

/* Orbiting Elements */
.orbit {
  position: absolute;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.orbit-1 {
  width: 180px;
  height: 180px;
  animation: rotate 15s linear infinite;
}

.orbit-2 {
  width: 220px;
  height: 220px;
  animation: rotate 20s linear infinite reverse;
}

.orbit-3 {
  width: 260px;
  height: 260px;
  animation: rotate 25s linear infinite;
}

.orbit-item {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Decorative Elements */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.deco-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.deco-dot-1 { top: 15%; left: 20%; animation-delay: 0s; }
.deco-dot-2 { top: 70%; right: 25%; animation-delay: 1s; }
.deco-dot-3 { bottom: 25%; left: 30%; animation-delay: 2s; }

.deco-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: slideInOut 3s ease-in-out infinite;
}

.deco-line-1 {
  top: 30%;
  left: 10%;
  width: 60px;
  animation-delay: 0s;
}

.deco-line-2 {
  bottom: 40%;
  right: 10%;
  width: 80px;
  animation-delay: 1.5s;
}

/* Team Section */
.team-section {
  margin-top: 5rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.team-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.team-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  max-width: 500px;
  margin: 0 auto;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.team-member {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.team-member:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.team-member::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.member-avatar {
  position: relative;
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
}

.avatar-bg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  position: relative;
}

.avatar-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.avatar-purple { background: linear-gradient(135deg, #8360c3 0%, #2ebf91 100%); }
.avatar-green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.avatar-orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

.member-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  background: #28a745;
  border: 3px solid white;
  border-radius: 50%;
}

.member-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.member-role {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.member-desc {
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 1.5rem;
}

.member-social {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.social-link {
  width: 35px;
  height: 35px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
}

/* Background Elements */
.section-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
  rgba(102, 126, 234, 0.03) 0%,
  rgba(118, 75, 162, 0.03) 100%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes slideInOut {
  0%, 100% { transform: translateX(-100%); opacity: 0; }
  50% { transform: translateX(0); opacity: 1; }
}

/* Responsive Design */
@media (max-width: 992px) {
  .about-title {
    font-size: 2rem;
  }

  .visual-container {
    height: 500px;
  }

  .central-illustration {
    width: 250px;
    height: 250px;
  }

  .main-circle {
    width: 100px;
    height: 100px;
  }

  .inner-circle {
    width: 70px;
    height: 70px;
    font-size: 1.5rem;
  }

  .orbit-1 { width: 150px; height: 150px; }
  .orbit-2 { width: 180px; height: 180px; }
  .orbit-3 { width: 210px; height: 210px; }
}

@media (max-width: 768px) {
  .modern-about-section {
    padding: 3rem 0;
  }

  .about-title {
    font-size: 1.75rem;
  }

  .about-cta {
    flex-direction: column;
  }

  .visual-container {
    height: 400px;
    margin-top: 2rem;
  }

  .stat-card {
    min-width: 130px;
    padding: 0.75rem;
  }

  .stat-number {
    font-size: 1.2rem;
  }

  .team-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .team-member {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .about-title {
    font-size: 1.5rem;
  }

  .about-description {
    font-size: 1rem;
  }

  .feature-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .visual-container {
    height: 300px;
  }

  .central-illustration {
    width: 200px;
    height: 200px;
  }

  .stat-card {
    position: relative !important;
    margin-bottom: 1rem;
    top: auto !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
  }

  .stats-floating {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 2rem;
  }

  .team-title {
    font-size: 1.5rem;
  }

  .mission-statement {
    flex-direction: column;
    text-align: center;
  }
}
</style>