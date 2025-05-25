<template>
  <section class="modern-features-section">
    <div class="container">
      <!-- Section Header -->
      <div class="section-header text-center">
        <div class="section-badge animate-fade-in">
          <i class="fas fa-gem me-2"></i>
          ویژگی‌های منحصر به فرد
        </div>

        <h2 class="section-title animate-slide-up" style="animation-delay: 0.1s;">
          چرا سامانه ما را انتخاب کنید؟
        </h2>

        <p class="section-subtitle animate-slide-up" style="animation-delay: 0.2s;">
          مجموعه‌ای از ویژگی‌های پیشرفته و کاربردی که تجربه یادگیری شما را متحول می‌کند
        </p>
      </div>

      <!-- Features Grid -->
      <div class="features-grid">
        <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card modern-card animate-slide-up"
            :style="{ 'animation-delay': `${(index + 1) * 0.1}s` }">

          <!-- Feature Icon -->
          <div class="feature-icon-container">
            <div class="feature-icon" :class="feature.iconClass">
              <i :class="feature.icon"></i>
            </div>
            <div class="icon-background"></div>
          </div>

          <!-- Feature Content -->
          <div class="feature-content">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>

            <!-- Feature Benefits -->
            <ul class="feature-benefits">
              <li v-for="(benefit, idx) in feature.benefits" :key="idx">
                <i class="fas fa-check text-success me-2"></i>
                {{ benefit }}
              </li>
            </ul>

            <!-- Feature Action -->
            <div class="feature-action">
              <button class="feature-btn modern-btn modern-btn-outline">
                <span>بیشتر بدانید</span>
                <i class="fas fa-arrow-left ms-2"></i>
              </button>
            </div>
          </div>

          <!-- Hover Effect -->
          <div class="card-hover-effect"></div>
        </div>
      </div>

      <!-- Additional Features -->
      <div class="additional-features">
        <div class="row">
          <div class="col-lg-6">
            <div class="feature-highlight modern-card animate-slide-right">
              <div class="highlight-icon">
                <i class="fas fa-brain"></i>
              </div>
              <div class="highlight-content">
                <h4>هوش مصنوعی پیشرفته</h4>
                <p>
                  سیستم هوش مصنوعی ما مسیر یادگیری شما را شخصی‌سازی می‌کند و
                  بهترین محتوا را در زمان مناسب پیشنهاد می‌دهد.
                </p>
                <div class="highlight-stats">
                  <div class="stat">
                    <span class="stat-number">95%</span>
                    <span class="stat-label">دقت پیشنهادات</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">3x</span>
                    <span class="stat-label">سرعت یادگیری</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="feature-highlight modern-card animate-slide-left">
              <div class="highlight-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="highlight-content">
                <h4>تحلیل پیشرفت هوشمند</h4>
                <p>
                  گزارش‌های تفصیلی از پیشرفت شما با نمودارهای تعاملی و
                  پیشنهادات بهبود عملکرد.
                </p>
                <div class="highlight-stats">
                  <div class="stat">
                    <span class="stat-number">100+</span>
                    <span class="stat-label">معیار ارزیابی</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">24/7</span>
                    <span class="stat-label">رصد پیشرفت</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technology Stack -->
      <div class="tech-stack animate-fade-in">
        <h4 class="tech-title text-center mb-4">تکنولوژی‌های مورد استفاده</h4>
        <div class="tech-logos">
          <div class="tech-item" v-for="tech in technologies" :key="tech.name">
            <div class="tech-logo">
              <i :class="tech.icon"></i>
            </div>
            <span class="tech-name">{{ tech.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Elements -->
    <div class="section-background">
      <div class="bg-pattern"></div>
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FeaturesSection',
  data() {
    return {
      features: [
        {
          title: 'دسترسی چندپلتفرمه',
          description: 'یادگیری در هر زمان و مکان با دستگاه‌های مختلف و سینک خودکار پیشرفت',
          icon: 'fas fa-laptop-mobile',
          iconClass: 'icon-blue',
          benefits: [
            'سازگار با موبایل، تبلت و دسکتاپ',
            'دانلود آفلاین محتوا',
            'سینک خودکار پیشرفت'
          ]
        },
        {
          title: 'محتوای تعاملی و متنوع',
          description: 'ویدیو، انیمیشن، شبیه‌سازی و تمرین‌های عملی برای یادگیری مؤثر',
          icon: 'fas fa-play-circle',
          iconClass: 'icon-green',
          benefits: [
            'ویدیوهای کیفیت 4K',
            'شبیه‌سازی‌های تعاملی',
            'تمرین‌های عملی و پروژه محور'
          ]
        },
        {
          title: 'ارزیابی هوشمند',
          description: 'سیستم ارزیابی پیشرفته با آزمون‌های تطبیقی و فیدبک فوری',
          icon: 'fas fa-brain',
          iconClass: 'icon-purple',
          benefits: [
            'آزمون‌های تطبیقی',
            'فیدبک فوری و شخصی',
            'تحلیل نقاط قوت و ضعف'
          ]
        },
        {
          title: 'گواهینامه‌های معتبر',
          description: 'گواهینامه‌های بین‌المللی معتبر با امکان تأیید دیجیتال',
          icon: 'fas fa-certificate',
          iconClass: 'icon-orange',
          benefits: [
            'گواهینامه‌های بین‌المللی',
            'تأیید دیجیتال blockchain',
            'قابل اشتراک‌گذاری در LinkedIn'
          ]
        },
        {
          title: 'پشتیبانی آنلاین',
          description: 'تیم پشتیبانی متخصص 24/7 و چت زنده با اساتید',
          icon: 'fas fa-headset',
          iconClass: 'icon-teal',
          benefits: [
            'پشتیبانی 24 ساعته',
            'چت زنده با اساتید',
            'انجمن دانش‌آموزان'
          ]
        },
        {
          title: 'یادگیری اجتماعی',
          description: 'تعامل با سایر دانش‌آموزان، گروه‌های مطالعه و پروژه‌های تیمی',
          icon: 'fas fa-users',
          iconClass: 'icon-pink',
          benefits: [
            'گروه‌های مطالعه',
            'پروژه‌های تیمی',
            'رقابت‌های دوستانه'
          ]
        }
      ],
      technologies: [
        { name: 'Vue.js', icon: 'fab fa-vuejs' },
        { name: 'Node.js', icon: 'fab fa-node-js' },
        { name: 'Docker', icon: 'fab fa-docker' },
        { name: 'AWS', icon: 'fab fa-aws' },
        { name: 'MongoDB', icon: 'fas fa-database' },
        { name: 'Redis', icon: 'fas fa-memory' }
      ]
    };
  }
}
</script>

<style scoped>
/* Modern Features Section */
.modern-features-section {
  position: relative;
  padding: 5rem 0;
  background: #f8f9fa;
  overflow: hidden;
}

/* Section Header */
.section-header {
  margin-bottom: 4rem;
}

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

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

/* Feature Card */
.feature-card {
  position: relative;
  padding: 2.5rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.feature-card:hover .card-hover-effect {
  opacity: 1;
  transform: scale(1);
}

/* Feature Icon */
.feature-icon-container {
  position: relative;
  margin-bottom: 2rem;
}

.feature-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  position: relative;
  z-index: 2;
}

.icon-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.icon-green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.icon-purple { background: linear-gradient(135deg, #8360c3 0%, #2ebf91 100%); }
.icon-orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.icon-teal { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.icon-pink { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

.icon-background {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 20px;
  z-index: 1;
}

/* Feature Content */
.feature-content {
  position: relative;
  z-index: 2;
}

.feature-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.feature-description {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Feature Benefits */
.feature-benefits {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.feature-benefits li {
  padding: 0.5rem 0;
  color: #495057;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

/* Feature Action */
.feature-action {
  margin-top: auto;
}

.feature-btn {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-btn:hover {
  transform: translateX(-3px);
}

.feature-btn span {
  position: relative;
  z-index: 2;
}

/* Card Hover Effect */
.card-hover-effect {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all 0.4s ease;
  z-index: 1;
}

/* Additional Features */
.additional-features {
  margin-bottom: 4rem;
}

.feature-highlight {
  padding: 2.5rem;
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.feature-highlight:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
}

.highlight-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  flex-shrink: 0;
}

.highlight-content h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.highlight-content p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.highlight-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

/* Technology Stack */
.tech-stack {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.tech-title {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 2rem;
}

.tech-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
}

.tech-item:hover {
  transform: scale(1.1);
}

.tech-logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #667eea;
}

.tech-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
}

/* Background Elements */
.section-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.bg-shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: -150px;
  animation: float 8s ease-in-out infinite;
}

.bg-shape-2 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  right: -100px;
  animation: float 8s ease-in-out infinite 4s;
}

/* Responsive Design */
@media (max-width: 992px) {
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .feature-highlight {
    flex-direction: column;
    text-align: center;
  }

  .highlight-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .modern-features-section {
    padding: 3rem 0;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    padding: 2rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .section-subtitle {
    font-size: 1.1rem;
  }

  .tech-logos {
    gap: 2rem;
  }

  .tech-logo {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .feature-card {
    padding: 1.5rem;
  }

  .feature-highlight {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .highlight-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .tech-stack {
    padding: 2rem 1rem;
  }
}
</style>