<template>
  <div class="question-list">
    <div v-if="questions.length === 0" class="alert alert-info text-center">
      <p>هنوز سوالی برای این آزمون تعریف نشده است.</p>
      <button class="btn btn-primary mt-2" @click="$emit('add-question')">
        <i class="fas fa-plus"></i> افزودن سوال جدید
      </button>
    </div>

    <div v-else>
      <div v-for="(question, index) in questions" :key="question.id" class="question-item">
        <div class="question-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <span class="question-number">{{ index + 1 }}</span>
            {{ question.text }}
          </h5>
          <div class="question-actions">
            <span class="badge" :class="getQuestionTypeBadgeClass(question.type)">
              {{ getQuestionTypeText(question.type) }}
            </span>
            <button class="btn btn-sm btn-outline-success ms-2" @click="$emit('edit-question', question)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger ms-1" @click="$emit('delete-question', question)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="question-details">
          <!-- نمایش گزینه‌ها برای سوال چند گزینه‌ای -->
          <div v-if="question.type === 'MULTIPLE_CHOICE' && question.options" class="options-list mt-3">
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
              <div class="form-check">
                <input class="form-check-input" type="radio" :checked="question.correctOption == optIndex" disabled>
                <label class="form-check-label" :class="{'text-success fw-bold': question.correctOption == optIndex}">
                  {{ option }}
                  <span v-if="question.correctOption == optIndex" class="badge bg-success ms-2">پاسخ صحیح</span>
                </label>
              </div>
            </div>
          </div>

          <!-- نمایش پاسخ درست/نادرست -->
          <div v-else-if="question.type === 'TRUE_FALSE'" class="mt-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" :checked="question.correctOption === 'true'" disabled>
              <label class="form-check-label" :class="{'text-success fw-bold': question.correctOption === 'true'}">
                درست
                <span v-if="question.correctOption === 'true'" class="badge bg-success ms-2">پاسخ صحیح</span>
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" :checked="question.correctOption === 'false'" disabled>
              <label class="form-check-label" :class="{'text-success fw-bold': question.correctOption === 'false'}">
                نادرست
                <span v-if="question.correctOption === 'false'" class="badge bg-success ms-2">پاسخ صحیح</span>
              </label>
            </div>
          </div>

          <!-- نمایش پاسخ کوتاه -->
          <div v-else-if="question.type === 'SHORT_ANSWER'" class="mt-3">
            <div class="input-group">
              <span class="input-group-text">پاسخ صحیح:</span>
              <input type="text" class="form-control" :value="question.correctOption" disabled>
            </div>
          </div>

          <!-- نمایش اطلاعات سوال تشریحی -->
          <div v-else-if="question.type === 'ESSAY'" class="mt-3 p-2 border rounded">
            <div class="d-flex justify-content-between align-items-center">
              <span>سوال تشریحی - نیاز به بررسی استاد</span>
              <span class="badge bg-info">{{ question.maxScore || 10 }} نمره</span>
            </div>
          </div>

          <!-- نمایش توضیحات اضافی -->
          <div v-if="question.explanation" class="explanation mt-3">
            <div class="form-floating">
              <textarea class="form-control" :value="question.explanation" disabled></textarea>
              <label>توضیحات تکمیلی</label>
            </div>
          </div>
        </div>

        <!-- بعد از نمایش توضیحات -->
        <div v-if="question.hint" class="hint mt-2">
          <div class="alert alert-info">
            <i class="fas fa-lightbulb me-2"></i>
            <strong>راهنمایی:</strong> {{ question.hint }}
          </div>
        </div>

        <div class="question-meta mt-2 d-flex gap-3">
  <span v-if="question.timeLimit" class="badge bg-secondary">
    <i class="fas fa-clock me-1"></i> {{ question.timeLimit }} ثانیه
  </span>
          <span v-if="question.difficulty" class="badge bg-info">
    <i class="fas fa-tachometer-alt me-1"></i> سطح {{ question.difficulty }}
  </span>
          <span v-if="question.isRequired" class="badge bg-danger">
    <i class="fas fa-asterisk me-1"></i> اجباری
  </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionList',
  props: {
    questions: {
      type: Array,
      required: true
    }
  },
  methods: {
    getQuestionTypeBadgeClass(type) {
      switch (type) {
        case 'MULTIPLE_CHOICE':
          return 'bg-primary';
        case 'TRUE_FALSE':
          return 'bg-success';
        case 'SHORT_ANSWER':
          return 'bg-info';
        case 'ESSAY':
          return 'bg-warning';
        default:
          return 'bg-secondary';
      }
    },

    getQuestionTypeText(type) {
      switch (type) {
        case 'MULTIPLE_CHOICE':
          return 'چند گزینه‌ای';
        case 'TRUE_FALSE':
          return 'درست/نادرست';
        case 'SHORT_ANSWER':
          return 'پاسخ کوتاه';
        case 'ESSAY':
          return 'تشریحی';
        default:
          return 'نامشخص';
      }
    }
  }
}
</script>

<style scoped>
.question-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #dee2e6;
}

.question-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 10px;
}

.question-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  margin-left: 8px;
}

.question-actions {
  display: flex;
  align-items: center;
}

.options-list {
  margin-top: 10px;
}

.option-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.explanation {
  margin-top: 15px;
  background-color: #e8f4f8;
  padding: 10px;
  border-radius: 4px;
}
</style>