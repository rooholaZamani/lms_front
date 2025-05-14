<template>
  <div class="svg-background-container">
    <img src="@/assets/images/background.svg" class="svg-background-image" alt="background">
  </div>
</template>

<script>
export default {
  name: 'BackgroundSVG'
}
</script>

<style scoped>
.svg-background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.svg-background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  filter: blur(70px);
}
</style>