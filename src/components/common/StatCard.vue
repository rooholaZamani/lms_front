<!--<template>-->
<!--  <div class="modern-stat-card animate-slide-up">-->
<!--    <div class="modern-stat-icon" :class="iconColorClass">-->
<!--      <i :class="icon"></i>-->
<!--    </div>-->
<!--    <div class="modern-stat-value">{{ formattedValue }}</div>-->
<!--    <div class="modern-stat-label">{{ label }}</div>-->

<!--    &lt;!&ndash; اضافه کردن نشانگر تغییر در صورت وجود &ndash;&gt;-->
<!--    <div v-if="change !== undefined" class="stat-change" :class="changeClass">-->
<!--      <i :class="changeIcon"></i>-->
<!--      <span>{{ Math.abs(change) }}%</span>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  name: 'StatCard',-->
<!--  props: {-->
<!--    icon: {-->
<!--      type: String,-->
<!--      required: true-->
<!--    },-->
<!--    value: {-->
<!--      type: [Number, String],-->
<!--      required: true-->
<!--    },-->
<!--    label: {-->
<!--      type: String,-->
<!--      required: true-->
<!--    },-->
<!--    color: {-->
<!--      type: String,-->
<!--      default: 'primary',-->
<!--      validator: (value) => ['primary', 'success', 'warning', 'danger', 'info', 'secondary'].includes(value)-->
<!--    },-->
<!--    change: {-->
<!--      type: Number,-->
<!--      default: undefined-->
<!--    }-->
<!--  },-->
<!--  computed: {-->
<!--    formattedValue() {-->
<!--      if (typeof this.value === 'number') {-->
<!--        return new Intl.NumberFormat('fa-IR').format(this.value);-->
<!--      }-->
<!--      return this.value;-->
<!--    },-->
<!--    iconColorClass() {-->
<!--      return `text-${this.color}`;-->
<!--    },-->
<!--    changeClass() {-->
<!--      if (this.change === undefined) return '';-->
<!--      return this.change >= 0 ? 'change-positive' : 'change-negative';-->
<!--    },-->
<!--    changeIcon() {-->
<!--      if (this.change === undefined) return '';-->
<!--      return this.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.modern-stat-card {-->
<!--  background: rgba(255, 255, 255, 0.95);-->
<!--  backdrop-filter: blur(15px);-->
<!--  border-radius: 16px;-->
<!--  padding: 1.5rem;-->
<!--  text-align: center;-->
<!--  border: 1px solid rgba(255, 255, 255, 0.2);-->
<!--  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);-->
<!--  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);-->
<!--  position: relative;-->
<!--  overflow: hidden;-->
<!--}-->

<!--.modern-stat-card::before {-->
<!--  content: '';-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  height: 4px;-->
<!--  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);-->
<!--}-->

<!--.modern-stat-card:hover {-->
<!--  transform: translateY(-5px);-->
<!--  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.2);-->
<!--}-->

<!--.modern-stat-icon {-->
<!--  font-size: 2.5rem;-->
<!--  margin-bottom: 1rem;-->
<!--  opacity: 0.9;-->
<!--  transition: all 0.3s ease;-->
<!--}-->

<!--.modern-stat-card:hover .modern-stat-icon {-->
<!--  transform: scale(1.1);-->
<!--}-->

<!--.modern-stat-value {-->
<!--  font-size: 2rem;-->
<!--  font-weight: 700;-->
<!--  color: #2c3e50;-->
<!--  margin-bottom: 0.5rem;-->
<!--  line-height: 1.2;-->
<!--}-->

<!--.modern-stat-label {-->
<!--  color: #6c757d;-->
<!--  font-weight: 600;-->
<!--  font-size: 0.9rem;-->
<!--  text-transform: uppercase;-->
<!--  letter-spacing: 0.5px;-->
<!--  margin-bottom: 0.5rem;-->
<!--}-->

<!--.stat-change {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  gap: 0.25rem;-->
<!--  font-size: 0.8rem;-->
<!--  font-weight: 600;-->
<!--  padding: 0.25rem 0.5rem;-->
<!--  border-radius: 20px;-->
<!--  margin-top: 0.5rem;-->
<!--}-->

<!--.change-positive {-->
<!--  background: rgba(40, 167, 69, 0.1);-->
<!--  color: #28a745;-->
<!--}-->

<!--.change-negative {-->
<!--  background: rgba(220, 53, 69, 0.1);-->
<!--  color: #dc3545;-->
<!--}-->

<!--/* Color variations for icons */-->
<!--.text-primary { color: #667eea !important; }-->
<!--.text-success { color: #27ae60 !important; }-->
<!--.text-warning { color: #f39c12 !important; }-->
<!--.text-danger { color: #e74c3c !important; }-->
<!--.text-info { color: #3498db !important; }-->
<!--.text-secondary { color: #6c757d !important; }-->

<!--/* Responsive */-->
<!--@media (max-width: 768px) {-->
<!--  .modern-stat-card {-->
<!--    padding: 1rem;-->
<!--  }-->

<!--  .modern-stat-icon {-->
<!--    font-size: 2rem;-->
<!--  }-->

<!--  .modern-stat-value {-->
<!--    font-size: 1.5rem;-->
<!--  }-->

<!--  .modern-stat-label {-->
<!--    font-size: 0.8rem;-->
<!--  }-->
<!--}-->

<!--/* Dark mode support */-->
<!--@media (prefers-color-scheme: dark) {-->
<!--  .modern-stat-card {-->
<!--    background: rgba(45, 55, 72, 0.95);-->
<!--    border-color: rgba(255, 255, 255, 0.1);-->
<!--  }-->

<!--  .modern-stat-value {-->
<!--    color: #e2e8f0;-->
<!--  }-->

<!--  .modern-stat-label {-->
<!--    color: #cbd5e0;-->
<!--  }-->
<!--}-->

<!--/* Animation */-->
<!--.animate-slide-up {-->
<!--  animation: slideInUp 0.6s ease forwards;-->
<!--}-->

<!--@keyframes slideInUp {-->
<!--  from {-->
<!--    opacity: 0;-->
<!--    transform: translateY(30px);-->
<!--  }-->
<!--  to {-->
<!--    opacity: 1;-->
<!--    transform: translateY(0);-->
<!--  }-->
<!--}-->
<!--</style>-->