<template>
  <div class="stats-card">
    <div class="icon"><i :class="icon"></i></div>
    <div class="number">{{ value }}</div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }
}
</script>