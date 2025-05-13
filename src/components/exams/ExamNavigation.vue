<template>
  <div class="exam-navigation">
    <div class="exam-nav-header d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0">پیمایش سوالات</h5>
      <div class="exam-nav-legend d-flex">
        <div class="legend-item">
          <span class="badge bg-success"></span> پاسخ داده شده
        </div>
        <div class="legend-item">
          <span class="badge bg-warning"></span> نیاز به بررسی
        </div>
        <div class="legend-item">
          <span class="badge bg-light border"></span> پاسخ داده نشده
        </div>
      </div>
    </div>
    <div class="exam-nav-items">
      <button v-for="index in totalQuestions"
              :key="index - 1"
              :class="{
                'btn-success': isAnswered(index - 1) && !isMarkedForReview(index - 1),
                'btn-warning': isMarkedForReview(index - 1),
                'btn-light border': !isAnswered(index - 1),
                'active': currentQuestion === index - 1
              }"
              class="btn btn-sm question-nav-item"
              @click="$emit('go-to-question', index - 1)">
        {{ index }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamNavigation',
  props: {
    currentQuestion: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    answers: {
      type: Array,
      required: true
    },
    reviewQuestions: {
      type: Array,
      required: true
    }
  },
  methods: {
    isAnswered(index) {
      return this.answers[index] !== null && this.answers[index] !== undefined;
    },
    isMarkedForReview(index) {
      return this.reviewQuestions.includes(index);
    }
  }
}
</script>

<style scoped>
.exam-navigation {
  background-color: white;
  border-radius: 5px;
  padding: 15px;
  border: 1px solid #dee2e6;
}

.exam-nav-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.legend-item .badge {
  width: 15px;
  height: 15px;
  margin-left: 5px;
}

.exam-nav-items {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.question-nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.question-nav-item.active {
  border: 2px solid #495057;
}
</style>