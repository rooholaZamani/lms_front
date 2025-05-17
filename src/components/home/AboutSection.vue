<template>
  <section class="about-section">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-6">
          <h2>درباره سامانه  آموزش آنلاین</h2>
          <p>
            سامانه  آموزش آنلاین ما یک پلتفرم آموزشی آنلاین است که امکان دسترسی به محتوای آموزشی با کیفیت را برای همه فراهم می‌کند.
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
  </section>
</template>

<script>
export default {
  name: 'AboutSection'
}
</script>

<style scoped>
.about-section {
  background-color: #f8f9fa;
  padding: 80px 0;
  margin-bottom: 50px;
}

.about-image {
  text-align: center;
}
</style>