<template>
  <section class="features-section">
    <div class="container">
      <h2 class="text-center mb-5">ویژگی‌های سامانه</h2>
      <div class="row">
        <div class="col-md-4" v-for="(feature, index) in features" :key="index">
          <div class="card feature-card">
            <div class="card-body text-center">
              <div class="feature-icon">
                <i :class="feature.icon"></i>
              </div>
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-text">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
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
          title: 'دسترسی آسان',
          description: 'دسترسی به آموزش‌ها در هر زمان و هر مکان با دستگاه‌های مختلف',
          icon: 'fas fa-laptop'
        },
        {
          title: 'محتوای متنوع',
          description: 'ویدیو، متن و فایل‌های PDF برای سبک‌های مختلف یادگیری',
          icon: 'fas fa-film'
        },
        {
          title: 'پیشرفت تحصیلی',
          description: 'پیگیری پیشرفت یادگیری و نمرات آزمون‌ها به صورت آنلاین',
          icon: 'fas fa-chart-line'
        }
      ]
    };
  }
}
</script>

<style scoped>
.features-section {
  margin-bottom: 80px;
}

.feature-card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: transform 0.3s;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 20px;
}
</style>