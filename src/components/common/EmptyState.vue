<template>
  <div class="modern-empty-state" :class="{ 'compact': compact }">
    <div class="empty-visual">
      <div v-if="icon" class="empty-icon">
        <div class="icon-container">
          <i :class="`fas fa-${icon}`"></i>
        </div>
      </div>

      <div v-else-if="image" class="empty-image">
        <img :src="image" :alt="title" />
      </div>

      <div v-else class="default-icon">
        <div class="icon-container">
          <i class="fas fa-inbox"></i>
        </div>
      </div>
    </div>

    <div class="empty-content">
      <h4 class="empty-title">{{ title }}</h4>
      <p v-if="description" class="empty-description">{{ description }}</p>
    </div>

    <div v-if="$slots.default" class="empty-actions">
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
.modern-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(233, 236, 239, 0.4));
  border-radius: 16px;
  border: 2px dashed rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease-out;
}

.modern-empty-state.compact {
  padding: 2rem 1rem;
}

.empty-visual {
  margin-bottom: 2rem;
}

.empty-icon,
.default-icon {
  margin-bottom: 0.5rem;
}

.icon-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto;
  border: 4px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
  animation: float 6s ease-in-out infinite;
}

.modern-empty-state.compact .icon-container {
  width: 80px;
  height: 80px;
  font-size: 2rem;
}

.empty-image {
  max-width: 200px;
  margin: 0 auto;
  opacity: 0.8;
}

.modern-empty-state.compact .empty-image {
  max-width: 120px;
}

.empty-image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.empty-content {
  margin-bottom: 2rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modern-empty-state.compact .empty-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.empty-description {
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

.modern-empty-state.compact .empty-description {
  font-size: 0.9rem;
  max-width: 350px;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modern-empty-state {
    padding: 3rem 1.5rem;
  }

  .modern-empty-state.compact {
    padding: 1.5rem 1rem;
  }

  .icon-container {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
  }

  .modern-empty-state.compact .icon-container {
    width: 70px;
    height: 70px;
    font-size: 1.75rem;
  }

  .empty-title {
    font-size: 1.25rem;
  }

  .modern-empty-state.compact .empty-title {
    font-size: 1.1rem;
  }

  .empty-description {
    font-size: 0.9rem;
  }

  .empty-actions {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .modern-empty-state {
    padding: 2rem 1rem;
    border-radius: 12px;
  }

  .icon-container {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }

  .empty-title {
    font-size: 1.1rem;
  }

  .empty-description {
    font-size: 0.85rem;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modern-empty-state {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.8), rgba(74, 85, 104, 0.4));
    border-color: rgba(102, 126, 234, 0.3);
  }

  .icon-container {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.08));
    border-color: rgba(102, 126, 234, 0.2);
  }

  .empty-description {
    color: #cbd5e0;
  }
}
</style>