<template>
  <div>
    <!-- اضافه کردن پس‌زمینه SVG به صفحه اصلی -->
    <background-svg />

    <!-- Hero Section -->
    <hero-section :is-logged-in="isLoggedIn" />

    <!-- Features -->
    <features-section />

    <!-- About Section -->
    <about-section />

    <!-- Footer -->
    <site-footer />
  </div>
</template>

<script>
import HeroSection from '@/components/home/HeroSection.vue';
import FeaturesSection from '@/components/home/FeaturesSection.vue';
import AboutSection from '@/components/home/AboutSection.vue';
import SiteFooter from '@/components/layout/SiteFooter.vue';
import BackgroundSVG from '@/components/common/BackgroundSVG.vue';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Home',
  components: {
    HeroSection,
    FeaturesSection,
    AboutSection,
    SiteFooter,
    BackgroundSVG
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
/* می‌توانید برخی از استایل‌های خاص صفحه اصلی را اینجا اضافه کنید */
/* برای مثال، ممکن است بخواهید تنظیمات خاصی برای افزایش خوانایی محتوا روی پس‌زمینه داشته باشید */

/* افزایش کنتراست بخش‌های مختلف صفحه اصلی با پس‌زمینه */
:deep(.hero-section) {
  background-color: rgba(0, 123, 255, 0.8); /* رنگ پس‌زمینه نیمه‌شفاف */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px); /* بلور اضافی برای خوانایی بهتر */
}

:deep(.features-section),
:deep(.about-section) {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 30px auto;
  max-width: 1400px;
}
</style>