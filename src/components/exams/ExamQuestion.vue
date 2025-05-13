<template>
  <div class="question-container">
    <h4 class="question-number">سوال {{ questionIndex + 1 }} از {{ totalQuestions }}</h4>
    <div class="question-text">{{ question.text }}</div>

    <!-- سوال چند گزینه‌ای -->
    <div v-if="question.type === 'MULTIPLE_CHOICE'" class="options-container mt-4">
      <div v-for="(option, index) in question.options" :key="index" class="option-item">
        <div class="form-check">
          <input class="form-check-input" type="radio"
                 :id="`option-${index}`"
                 :name="`question-${questionIndex}`"
                 :value="index"
                 v-model="selectedAnswer">
          <label class="form-check-label" :for="`option-${index}`">
            {{ option }}
          </label>
        </div>
      </div>
    </div>

    <!-- سوال درست/نادرست -->
    <div v-else-if="question.type === 'TRUE_FALSE'" class="options-container mt-4">
      <div class="option-item">
        <div class="form-check">
          <input class="form-check-input" type="radio"
                 id="option-true"
                 :name="`question-${questionIndex}`"
                 value="true"
                 v-model="selectedAnswer">
          <label class="form-check-label" for="option-true">
            درست
          </label>
        </div>
      </div>
      <div class="option-item">
        <div class="form-check">
          <input class="form-check-input" type="radio"
                 id="option-false"
                 :name="`question-${questionIndex}`"
                 value="false"
                 v-model="selectedAnswer">
          <label class="form-check-label" for="option-false">
            نادرست
          </label>
        </div>
      </div>
    </div>

    <!-- سوال تشریحی -->
    <div v-else-if="question.type === 'ESSAY'" class="mt-4">
      <div class="form-group">
        <label for="essay-answer">پاسخ خود را بنویسید:</label>
        <textarea class="form-control mt-2"
                  id="essay-answer"
                  v-model="selectedAnswer"
                  rows="5"></textarea>
      </div>
    </div>

    <!-- سوال کوتاه پاسخ -->
    <div v-else-if="question.type === 'SHORT_ANSWER'" class="mt-4">
      <div class="form-group">
        <label for="short-answer">پاسخ کوتاه:</label>
        <input type="text" class="form-control mt-2"
               id="short-answer"
               v-model="selectedAnswer">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamQuestion',
  props: {
    question: {
      type: Object,
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    answer: {
      type: [String, Number, Boolean, Object],
      default: null
    }
  },
  data() {
    return {
      selectedAnswer: this.answer
    }
  },
  watch: {
    answer(newVal) {
      this.selectedAnswer = newVal;
    },
    selectedAnswer(newVal) {
      this.$emit('answer-changed', this.questionIndex, newVal);
    }
  }
}
</script>

<style scoped>
.question-number {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.question-text {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 10px 15px;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: #e9ecef;
}
</style>