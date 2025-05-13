<template>
  <div class="empty-state" :class="{ 'compact': compact }">
    <div v-if="icon" class="empty-icon">
      <i :class="`fas fa-${icon}`"></i>
    </div>
    <div v-else-if="image" class="empty-image">
      <img :src="image" :alt="title" />
    </div>
    <h4 class="empty-title">{{ title }}</h4>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <div v-if="$slots.default" class="empty-action">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    compact: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.empty-state.compact {
  padding: 1.5rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: #adb5bd;
  margin-bottom: 1.5rem;
}

.empty-state.compact .empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.empty-image {
  margin-bottom: 1.5rem;
  max-width: 200px;
}

.empty-state.compact .empty-image {
  max-width: 120px;
  margin-bottom: 1rem;
}

.empty-image img {
  width: 100%;
  height: auto;
}

.empty-title {
  font-size: 1.5rem;
  color: #495057;
  margin-bottom: 0.75rem;
}

.empty-state.compact .empty-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.empty-state.compact .empty-description {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  max-width: 300px;
}

.empty-action {
  margin-top: 0.5rem;
}
</style>