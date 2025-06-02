<template>
  <div class="exam-question">
    <div class="modern-card animate-slide-up">
      <div class="modern-card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-question-circle me-2"></i>
          سوال {{ questionIndex + 1 }} از {{ totalQuestions }}
        </h5>
      </div>

      <div class="modern-card-body">
        <div class="form-section">
          <div class="question-text">{{ question.text }}</div>

          <!-- Multiple Choice Questions -->
          <div v-if="question.questionType === 'MULTIPLE_CHOICE'" class="options-section mt-4">
            <h6 class="section-title">
              <i class="fas fa-list-ul me-2"></i>
              گزینه‌ها را انتخاب کنید
            </h6>
            <div class="options-container">
              <div v-for="(option, index) in question.options" :key="index" class="option-item">
                <div class="form-check">
                  <input class="form-check-input"
                         type="radio"
                         :id="`option-${questionIndex}-${index}`"
                         :name="`question-${questionIndex}`"
                         :value="option.id || index"
                         v-model="selectedAnswer">
                  <label class="form-check-label" :for="`option-${questionIndex}-${index}`">
                    <div class="option-content">
                      <div class="option-marker">{{ String.fromCharCode(65 + index) }}</div>
                      <div class="option-text">{{ option.text || option }}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- True/False Questions -->
          <div v-else-if="question.questionType === 'TRUE_FALSE'" class="options-section mt-4">
            <h6 class="section-title">
              <i class="fas fa-check-double me-2"></i>
              یکی از گزینه‌های زیر را انتخاب کنید
            </h6>
            <div class="true-false-container">
              <div class="option-item">
                <div class="form-check">
                  <input class="form-check-input"
                         type="radio"
                         :id="`option-${questionIndex}-true`"
                         :name="`question-${questionIndex}`"
                         value="true"
                         v-model="selectedAnswer">
                  <label class="form-check-label" :for="`option-${questionIndex}-true`">
                    <div class="option-content true-option">
                      <div class="option-icon">
                        <i class="fas fa-check"></i>
                      </div>
                      <div class="option-text">درست</div>
                    </div>
                  </label>
                </div>
              </div>

              <div class="option-item">
                <div class="form-check">
                  <input class="form-check-input"
                         type="radio"
                         :id="`option-${questionIndex}-false`"
                         :name="`question-${questionIndex}`"
                         value="false"
                         v-model="selectedAnswer">
                  <label class="form-check-label" :for="`option-${questionIndex}-false`">
                    <div class="option-content false-option">
                      <div class="option-icon">
                        <i class="fas fa-times"></i>
                      </div>
                      <div class="option-text">نادرست</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Essay Questions -->
          <div v-else-if="question.questionType === 'ESSAY'" class="essay-section mt-4">
            <h6 class="section-title">
              <i class="fas fa-edit me-2"></i>
              پاسخ خود را بنویسید
            </h6>
            <div class="modern-form-group">
              <label :for="`essay-${questionIndex}`" class="modern-form-label">
                پاسخ تشریحی:
              </label>
              <textarea class="modern-form-control essay-textarea"
                        :id="`essay-${questionIndex}`"
                        v-model="selectedAnswer"
                        rows="6"
                        placeholder="پاسخ خود را اینجا بنویسید..."></textarea>
              <small class="form-text text-muted">
                <i class="fas fa-info-circle me-1"></i>
                لطفاً پاسخ کامل و مفصل ارائه دهید
              </small>
            </div>
          </div>

          <!-- Short Answer Questions -->
          <div v-else-if="question.questionType === 'SHORT_ANSWER'" class="short-answer-section mt-4">
            <h6 class="section-title">
              <i class="fas fa-pencil-alt me-2"></i>
              پاسخ کوتاه
            </h6>
            <div class="modern-form-group">
              <label :for="`short-answer-${questionIndex}`" class="modern-form-label">
                پاسخ کوتاه:
              </label>
              <input type="text"
                     class="modern-form-control"
                     :id="`short-answer-${questionIndex}`"
                     v-model="selectedAnswer"
                     placeholder="پاسخ خود را وارد کنید...">
              <small class="form-text text-muted">
                <i class="fas fa-lightbulb me-1"></i>
                پاسخ کوتاه و مستقیم ارائه دهید
              </small>
            </div>
          </div>

          <!-- Fill in the Blanks Questions -->
          <div v-else-if="question.questionType === 'FILL_IN_THE_BLANKS'" class="fill-blanks-section mt-4">
            <h6 class="section-title">
              <i class="fas fa-puzzle-piece me-2"></i>
              جاهای خالی را پر کنید
            </h6>
            <div class="modern-form-group">
              <label class="modern-form-label">متن با جاهای خالی:</label>
              <div class="blanks-container">
                <p class="blanks-text">{{ question.template || question.text }}</p>
                <div class="blanks-inputs">
                  <div v-for="(blank, index) in getBlankCount()" :key="index" class="blank-input-group">
                    <label :for="`blank-${questionIndex}-${index}`" class="modern-form-label">
                      جای خالی {{ index + 1 }}:
                    </label>
                    <input type="text"
                           class="modern-form-control"
                           :id="`blank-${questionIndex}-${index}`"
                           v-model="selectedAnswer[index]"
                           :placeholder="`جای خالی ${index + 1}`">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Matching Questions -->
          <div v-else-if="question.questionType === 'MATCHING'" class="matching-section mt-4">
            <h6 class="section-title">
              <i class="fas fa-arrows-alt-h me-2"></i>
              آیتم‌ها را با هم تطبیق دهید
            </h6>
            <div class="matching-container">
              <div class="matching-columns">
                <div class="left-column">
                  <h6>ستون اول</h6>
                  <div v-for="(pair, index) in question.matchingPairs" :key="'left-' + index"
                       class="matching-item left-item">
                    {{ pair.leftItem }}
                  </div>
                </div>
                <div class="right-column">
                  <h6>ستون دوم</h6>
                  <div v-for="(pair, index) in getShuffledRightItems()" :key="'right-' + index"
                       class="matching-item right-item"
                       @click="selectRightItem(pair, index)"
                       :class="{ selected: isRightItemSelected(pair) }">
                    {{ pair.rightItem }}
                  </div>
                </div>
              </div>
              <div class="matching-answers">
                <div v-for="(pair, index) in question.matchingPairs" :key="'answer-' + index"
                     class="matching-answer-row">
                  <span class="left-text">{{ pair.leftItem }}</span>
                  <i class="fas fa-arrow-left mx-2"></i>
                  <select v-model="selectedAnswer[pair.leftItem]" class="modern-form-control matching-select">
                    <option value="">انتخاب کنید</option>
                    <option v-for="rightItem in getAllRightItems()" :key="rightItem.rightItem" :value="rightItem.rightItem">
                      {{ rightItem.rightItem }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Categorization Questions -->
          <div v-else-if="question.questionType === 'CATEGORIZATION'" class="categorization-section mt-4">
            <h6 class="section-title">
              <i class="fas fa-layer-group me-2"></i>
              آیتم‌ها را در دسته‌های مناسب قرار دهید
            </h6>
            <div class="categorization-container">
              <div class="categories-display">
                <div v-for="category in question.categories" :key="category" class="category-box">
                  <h6 class="category-title">{{ category }}</h6>
                  <div class="category-items">
                    <div v-for="item in getItemsInCategory(category)" :key="item"
                         class="categorized-item">
                      {{ item }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="items-to-categorize">
                <h6>آیتم‌ها:</h6>
                <div v-for="item in question.categorizationItems" :key="item.text"
                     class="categorization-answer-row">
                  <span class="item-text">{{ item.text }}</span>
                  <select v-model="selectedAnswer[item.text]" class="modern-form-control category-select">
                    <option value="">انتخاب دسته</option>
                    <option v-for="category in question.categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Indicator -->
          <div class="question-progress mt-4">
            <div class="progress-info">
              <small class="text-muted">
                <i class="fas fa-list-ol me-1"></i>
                پیشرفت: {{ questionIndex + 1 }} از {{ totalQuestions }} سوال
              </small>
            </div>
            <div class="progress progress-sm">
              <div class="progress-bar bg-primary"
                   role="progressbar"
                   :style="`width: ${((questionIndex + 1) / totalQuestions) * 100}%`"
                   :aria-valuenow="((questionIndex + 1) / totalQuestions) * 100"
                   aria-valuemin="0"
                   aria-valuemax="100">
              </div>
            </div>
          </div>
        </div>
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
      type: [String, Number, Boolean, Object, Array],
      default: null
    }
  },
  data() {
    return {
      selectedAnswer: this.initializeAnswer()
    }
  },
  watch: {
    answer: {
      handler(newVal) {
        this.selectedAnswer = newVal || this.initializeAnswer();
      },
      deep: true
    },
    selectedAnswer: {
      handler(newVal) {
        this.$emit('answer-changed', this.questionIndex, newVal);
      },
      deep: true
    }
  },
  methods: {
    initializeAnswer() {
      if (this.answer !== null && this.answer !== undefined) {
        return this.answer;
      }

      switch (this.question.questionType) {
        case 'FILL_IN_THE_BLANKS':
          return Array(this.getBlankCount()).fill('');
        case 'MATCHING':
          return {};
        case 'CATEGORIZATION':
          return {};
        case 'MULTIPLE_CHOICE':
        case 'TRUE_FALSE':
        case 'ESSAY':
        case 'SHORT_ANSWER':
          return null;
        default:
          return null;
      }
    },

    getBlankCount() {
      if (this.question.questionType !== 'FILL_IN_THE_BLANKS') return 0;
      const text = this.question.template || this.question.text || '';
      const matches = text.match(/\{\}/g);
      return matches ? matches.length : 0;
    },

    getShuffledRightItems() {
      if (!this.question.matchingPairs) return [];
      const items = this.question.matchingPairs.map(pair => ({ rightItem: pair.rightItem }));
      return this.shuffleArray([...items]);
    },

    getAllRightItems() {
      if (!this.question.matchingPairs) return [];
      return this.question.matchingPairs.map(pair => ({ rightItem: pair.rightItem }));
    },

    getItemsInCategory(category) {
      if (!this.selectedAnswer || typeof this.selectedAnswer !== 'object') return [];
      return Object.keys(this.selectedAnswer).filter(key => this.selectedAnswer[key] === category);
    },

    shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
  }
}
</script>

<style scoped>
.exam-question {
  margin-bottom: 2rem;
}

/* Question text styling */
.question-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

/* Options section */
.options-section,
.essay-section,
.short-answer-section,
.fill-blanks-section {
  margin-top: 2rem;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.option-item {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.option-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.form-check {
  margin: 0;
  width: 100%;
}

.form-check-input {
  display: none;
}

.form-check-label {
  display: block;
  width: 100%;
  padding: 1.5rem;
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.option-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.true-option .option-icon {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
}

.false-option .option-icon {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.option-text {
  flex: 1;
  font-weight: 500;
  color: #333;
  font-size: 1rem;
  line-height: 1.4;
}

/* Selected state */
.form-check-input:checked + .form-check-label {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.form-check-input:checked + .form-check-label .option-marker {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  transform: scale(1.1);
}

.form-check-input:checked + .form-check-label .option-text {
  color: #667eea;
  font-weight: 600;
}

/* True/False container */
.true-false-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

/* Essay textarea */
.essay-textarea {
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

/* Fill in the blanks */
.blanks-container {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
}

.blanks-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #495057;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.blanks-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blank-input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.blank-input-group .modern-form-label {
  min-width: 120px;
  margin-bottom: 0;
  font-size: 0.9rem;
}

.blank-input-group .modern-form-control {
  flex: 1;
}

/* Progress indicator */
.question-progress {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 1rem;
}

.progress-info {
  margin-bottom: 0.5rem;
}

.progress-sm {
  height: 6px;
  border-radius: 3px;
}

/* Form text styling */
.form-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .question-text {
    font-size: 1.1rem;
    padding: 1rem;
  }

  .option-content {
    gap: 0.75rem;
  }

  .option-marker,
  .option-icon {
    width: 25px;
    height: 25px;
    font-size: 0.8rem;
  }

  .option-text {
    font-size: 0.9rem;
  }

  .form-check-label {
    padding: 1rem;
  }

  .true-false-container {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .blank-input-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .blank-input-group .modern-form-label {
    min-width: auto;
  }
}

@media (max-width: 576px) {
  .question-text {
    font-size: 1rem;
    padding: 0.75rem;
  }

  .essay-textarea {
    min-height: 120px;
  }

  .blanks-container {
    padding: 1rem;
  }

  .blanks-text {
    padding: 0.75rem;
    font-size: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .question-text {
    background: rgba(102, 126, 234, 0.1);
    color: #e2e8f0;
  }

  .option-item {
    background: rgba(45, 55, 72, 0.8);
    border-color: #4a5568;
  }

  .option-text {
    color: #e2e8f0;
  }

  .form-check-input:checked + .form-check-label .option-text {
    color: #90cdf4;
  }

  .blanks-container {
    background: rgba(45, 55, 72, 0.8);
    border-color: #4a5568;
  }

  .blanks-text {
    background: rgba(74, 85, 104, 0.8);
    border-color: #4a5568;
    color: #e2e8f0;
  }
}

/* Animations */
.animate-slide-up {
  animation: slideInUp 0.6s ease forwards;
}

/* Print styles */
@media print {
  .question-progress {
    display: none;
  }

  .option-item {
    break-inside: avoid;
  }
}
</style>