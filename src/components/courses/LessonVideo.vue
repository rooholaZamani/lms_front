<template>
  <div class="video-container mb-3">
    <h5>ویدیوی آموزشی</h5>
    <div class="ratio ratio-16x9">
      <video controls>
        <source :src="videoUrl" type="video/mp4">
        مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
      </video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LessonVideo',
  props: {
    videoUrl: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.video-container {
  background-color: #000;
  border-radius: 5px;
  overflow: hidden;
}
</style>