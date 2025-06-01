<template>
  <div class="question-list">
    <div v-if="questions.length === 0" class="settings-grid empty-state">
      <div class="modern-logo large secondary mb-4">
        <i class="fas fa-question-circle"></i>
      </div>
      <h4 class="setting-title mb-3 text-warning">هنوز سوالی برای این آزمون تعریف نشده است</h4>
      <p class="text-info mb-4">برای شروع، اولین سوال خود را اضافه کنید</p>
      <button class="modern-btn modern-btn-primary" @click="$emit('add-question')">
        <i class="fas fa-plus me-1"></i> افزودن سوال جدید
      </button>
    </div>

    <div v-else class="questions-container">
      <div v-for="(question, index) in questions" :key="question.id" class="question-card modern-card animate-fade-in">
        <div class="question-header">
          <div class="question-number">
            <span class="number-badge">{{ index + 1 }}</span>
          </div>
          <div class="question-title-area">
            <h6 class="question-text">{{ question.text }}</h6>
            <div class="question-meta">
              <span class="modern-badge" :class="getQuestionTypeBadgeClass(question.type)">
                {{ getQuestionTypeText(question.type) }}
              </span>
              <span v-if="question.points" class="modern-badge modern-badge-info">
                {{ question.points }} امتیاز
              </span>
              <span v-if="question.timeLimit" class="modern-badge modern-badge-warning">
                <i class="fas fa-clock me-1"></i> {{ question.timeLimit }}ث
              </span>
              <span v-if="question.difficulty" class="modern-badge modern-badge-secondary">
                <i class="fas fa-tachometer-alt me-1"></i> سطح {{ question.difficulty }}
              </span>
              <span v-if="question.isRequired" class="modern-badge modern-badge-danger">
                <i class="fas fa-asterisk me-1"></i> اجباری
              </span>
            </div>
          </div>
          <div class="question-actions">
            <button class="action-btn success" @click="$emit('edit-question', question)" title="ویرایش">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn danger" @click="$emit('delete-question', question)" title="حذف">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>

        <div class="question-content">
          <!-- نمایش گزینه‌ها برای سوال چند گزینه‌ای -->
          <div v-if="question.type === 'MULTIPLE_CHOICE' && question.options" class="options-section">
            <h6 class="section-subtitle">گزینه‌ها:</h6>
            <div class="options-list">
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                <div class="option-indicator" :class="{ 'correct': question.correctOption == optIndex }">
                  {{ String.fromCharCode(65 + optIndex) }}
                </div>
                <span class="option-text" :class="{ 'correct-answer': question.correctOption == optIndex }">
                  {{ option }}
                </span>
                <span v-if="question.correctOption == optIndex" class="correct-badge">
                  <i class="fas fa-check"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- نمایش پاسخ درست/نادرست -->
          <div v-else-if="question.type === 'TRUE_FALSE'" class="options-section">
            <h6 class="section-subtitle">پاسخ صحیح:</h6>
            <div class="true-false-options">
              <div class="option-item" :class="{ 'selected': question.correctOption === 'true' }">
                <span class="option-text">درست</span>
                <span v-if="question.correctOption === 'true'" class="correct-badge">
                  <i class="fas fa-check"></i>
                </span>
              </div>
              <div class="option-item" :class="{ 'selected': question.correctOption === 'false' }">
                <span class="option-text">نادرست</span>
                <span v-if="question.correctOption === 'false'" class="correct-badge">
                  <i class="fas fa-check"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- نمایش پاسخ کوتاه -->
          <div v-else-if="question.type === 'SHORT_ANSWER'" class="answer-section">
            <h6 class="section-subtitle">پاسخ صحیح:</h6>
            <div class="answer-display">
              <i class="fas fa-quote-left me-2 text-primary"></i>
              <span>{{ question.correctOption }}</span>
            </div>
          </div>

          <!-- نمایش اطلاعات سوال تشریحی -->
          <div v-else-if="question.type === 'ESSAY'" class="essay-section">
            <div class="essay-info">
              <i class="fas fa-edit text-warning me-2"></i>
              <span>سوال تشریحی - نیاز به بررسی دستی استاد</span>
              <span v-if="question.maxScore" class="modern-badge modern-badge-info ms-auto">
                حداکثر {{ question.maxScore }} نمره
              </span>
            </div>
          </div>

          <!-- Matching Questions Display -->
          <div v-else-if="question.type === 'MATCHING'" class="matching-display">
            <h6 class="section-subtitle">جفت‌های تطبیق:</h6>
            <div class="matching-pairs-list">
              <div v-for="(pair, index) in question.matchingPairs" :key="index" class="matching-pair-item">
                <span class="left-item">{{ pair.leftItem }}</span>
                <i class="fas fa-arrow-left mx-2"></i>
                <span class="right-item">{{ pair.rightItem }}</span>
              </div>
            </div>
          </div>

          <!-- Categorization Questions Display -->
          <div v-else-if="question.type === 'CATEGORIZATION'" class="categorization-display">
            <h6 class="section-subtitle">دسته‌ها و آیتم‌ها:</h6>
            <div class="categories-preview">
              <div class="categories-list">
                <strong>دسته‌ها:</strong> {{ question.categories ? question.categories.join(', ') : 'نامشخص' }}
              </div>
              <div class="items-list">
                <strong>آیتم‌ها:</strong>
                <span v-for="(item, index) in question.categorizationItems" :key="index">
        {{ item.text }}{{ index < question.categorizationItems.length - 1 ? ', ' : '' }}
      </span>
              </div>
            </div>
          </div>

          <!-- Fill in the Blanks Display -->
          <div v-else-if="question.type === 'FILL_IN_THE_BLANKS'" class="fill-blanks-display">
            <h6 class="section-subtitle">الگو:</h6>
            <div class="template-text">{{ question.template || question.text }}</div>
            <div v-if="question.blankAnswers" class="blank-answers">
              <strong>پاسخ‌ها:</strong>
              <span v-for="(blank, index) in question.blankAnswers" :key="index" class="blank-answer">
      {{ blank.correctAnswer }}{{ index < question.blankAnswers.length - 1 ? ', ' : '' }}
    </span>
            </div>
          </div>


          <!-- نمایش توضیحات اضافی -->
          <div v-if="question.explanation" class="explanation-section">
            <h6 class="section-subtitle">
              <i class="fas fa-lightbulb me-1 text-warning"></i>
              توضیحات تکمیلی:
            </h6>
            <div class="explanation-content">
              {{ question.explanation }}
            </div>
          </div>

          <!-- نمایش راهنمایی -->
          <div v-if="question.hint" class="hint-section">
            <h6 class="section-subtitle">
              <i class="fas fa-question-circle me-1 text-info"></i>
              راهنمایی:
            </h6>
            <div class="hint-content">
              {{ question.hint }}
            </div>
          </div>
        </div>
      </div>

      <!-- دکمه افزودن سوال جدید -->
      <div class="add-question-card">
        <button class="modern-btn modern-btn-outline w-100" @click="$emit('add-question')">
          <i class="fas fa-plus me-2"></i>
          افزودن سوال جدید
        </button>
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
          return 'modern-badge-primary';
        case 'TRUE_FALSE':
          return 'modern-badge-success';
        case 'SHORT_ANSWER':
          return 'modern-badge-info';
        case 'ESSAY':
          return 'modern-badge-warning';
        case 'FILL_IN_THE_BLANKS':
          return 'modern-badge-warning';
        case 'MATCHING':
          return 'modern-badge-danger';
        case 'CATEGORIZATION':
          return 'modern-badge-dark';
        default:
          return 'modern-badge-secondary';
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
        case 'FILL_IN_THE_BLANKS':
          return 'پر کردن جاهای خالی';
        case 'MATCHING':
          return 'تطبیق';
        case 'CATEGORIZATION':
          return 'دسته‌بندی';
        default:
          return 'نامشخص';
      }
    }
  }
}
</script>

<style scoped>
.question-list {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.question-number {
  flex-shrink: 0;
}

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
}

.question-title-area {
  flex: 1;
  min-width: 0;
}

.question-text {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.question-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.action-btn.danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.success:hover {
  background: rgba(40, 167, 69, 0.2);
}

.action-btn.danger:hover {
  background: rgba(220, 53, 69, 0.2);
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-subtitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.options-section, .answer-section, .essay-section, .explanation-section, .hint-section {
  background: rgba(248, 249, 250, 0.5);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.05);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.option-item.selected {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.option-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.option-indicator.correct {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.option-text {
  flex: 1;
  font-weight: 500;
}

.option-text.correct-answer {
  color: #28a745;
  font-weight: 600;
}

.correct-badge {
  color: #28a745;
  font-size: 0.9rem;
}

.true-false-options {
  display: flex;
  gap: 1rem;
}

.true-false-options .option-item {
  flex: 1;
  justify-content: center;
}

.answer-display {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-weight: 500;
}

.essay-info {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  gap: 0.5rem;
}

.explanation-content, .hint-content {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  line-height: 1.6;
  color: #495057;
}

.add-question-card {
  padding: 1rem;
}

@media (max-width: 768px) {
  .question-header {
    flex-direction: column;
    gap: 1rem;
  }

  .question-actions {
    align-self: stretch;
    justify-content: center;
  }

  .true-false-options {
    flex-direction: column;
  }

  .question-meta {
    justify-content: center;
  }
}
</style>