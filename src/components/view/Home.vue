<template>
  <div>
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1>به سامانه مدیریت یادگیری خوش آمدید</h1>
        <p class="lead">دسترسی آسان به آموزش‌های با کیفیت</p>
        <div class="hero-buttons">
          <router-link :to="{ name: 'Register' }" class="btn btn-light btn-lg">شروع یادگیری</router-link>
          <router-link v-if="!isLoggedIn" :to="{ name: 'Login' }" class="btn btn-outline-light btn-lg ms-2">ورود</router-link>
          <router-link v-else :to="{ name: 'Dashboard' }" class="btn btn-outline-light btn-lg ms-2">داشبورد من</router-link>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="container features-section">
      <h2 class="text-center mb-5">ویژگی‌های سامانه</h2>
      <div class="row">
        <div class="col-md-4">
          <div class="card feature-card">
            <div class="card-body text-center">
              <div class="feature-icon">
                <i class="fas fa-laptop"></i>
              </div>
              <h3 class="card-title">دسترسی آسان</h3>
              <p class="card-text">دسترسی به آموزش‌ها در هر زمان و هر مکان با دستگاه‌های مختلف</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card feature-card">
            <div class="card-body text-center">
              <div class="feature-icon">
                <i class="fas fa-film"></i>
              </div>
              <h3 class="card-title">محتوای متنوع</h3>
              <p class="card-text">ویدیو، متن و فایل‌های PDF برای سبک‌های مختلف یادگیری</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card feature-card">
            <div class="card-body text-center">
              <div class="feature-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <h3 class="card-title">پیشرفت تحصیلی</h3>
              <p class="card-text">پیگیری پیشرفت یادگیری و نمرات آزمون‌ها به صورت آنلاین</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- About Section -->
    <div class="about-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h2>درباره سامانه مدیریت یادگیری</h2>
            <p>
              سامانه مدیریت یادگیری ما یک پلتفرم آموزشی آنلاین است که امکان دسترسی به محتوای آموزشی با کیفیت را برای همه فراهم می‌کند.
              این سامانه با هدف تسهیل فرآیند یادگیری و آموزش طراحی شده است.
            </p>
            <p>
              معلمان می‌توانند دوره‌های آموزشی خود را ایجاد کنند و دانش‌آموزان می‌توانند در این دوره‌ها ثبت‌نام کرده و از محتوای آموزشی استفاده کنند.
              همچنین امکان ارزیابی پیشرفت تحصیلی و برگزاری آزمون‌های آنلاین نیز وجود دارد.
            </p>
            <router-link :to="{ name: 'Register' }" class="btn btn-primary">همین حالا شروع کنید</router-link>
          </div>
          <div class="col-md-6">
            <div class="about-image">
              <img src="@/assets/images/education.svg" alt="آموزش آنلاین" class="img-fluid">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer-section">
      <div class="container text-center">
        <p>تمامی حقوق محفوظ است &copy; 2025 سامانه مدیریت یادگیری</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Home',
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    }
  }
}
</script>

<style scoped>
.hero-section {
  background-color: #007bff;
  color: white;
  padding: 80px 0;
  text-align: center;
  margin-bottom: 50px;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.hero-buttons {
  margin-top: 30px;
}

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

.about-section {
  background-color: #f8f9fa;
  padding: 80px 0;
  margin-bottom: 50px;
}

.about-image {
  text-align: center;
}

.footer-section {
  background-color: #343a40;
  color: white;
  padding: 20px 0;
}
</style>