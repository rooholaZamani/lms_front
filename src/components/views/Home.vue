<template>
  <div>
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
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Home',
  components: {
    HeroSection,
    FeaturesSection,
    AboutSection,
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