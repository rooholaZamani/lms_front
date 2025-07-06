<template>
  <div class="exam-question">
    <div class="modern-card">
      <div class="question-text">
        {{ question.text }}
      </div>

      <div class="question-content">
        <!-- Multiple Choice Questions -->
        <div v-if="question.questionType === 'MULTIPLE_CHOICE'" class="options-section">
          <div class="options-container">
            <div v-for="(option, index) in question.answers" :key="index"
                 class="option-item"
                 :class="{ selected: selectedAnswer === index }"
                 @click="selectedAnswer = index">
              <div class="option-content">
                <div class="option-radio">
                  <input type="radio"
                         :value="index"
                         v-model="selectedAnswer"
                         :id="`option-${questionIndex}-${index}`">
                  <label :for="`option-${questionIndex}-${index}`"></label>
                </div>
                <div class="option-text">
                  <span class="option-letter">{{ String.fromCharCode(65 + index) }})</span>
                  {{ option.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- True/False Questions -->
        <div v-else-if="question.questionType === 'TRUE_FALSE'" class="options-section">
          <div class="options-container">
            <div class="option-item"
                 :class="{ selected: selectedAnswer === 'true' }"
                 @click="selectedAnswer = 'true'">
              <div class="option-content">
                <div class="option-radio">
                  <input type="radio" value="true" v-model="selectedAnswer" id="true-option">
                  <label for="true-option"></label>
                </div>
                <div class="option-text">
                  <span class="option-letter">الف)</span>
                  صحیح
                </div>
              </div>
            </div>
            <div class="option-item"
                 :class="{ selected: selectedAnswer === 'false' }"
                 @click="selectedAnswer = 'false'">
              <div class="option-content">
                <div class="option-radio">
                  <input type="radio" value="false" v-model="selectedAnswer" id="false-option">
                  <label for="false-option"></label>
                </div>
                <div class="option-text">
                  <span class="option-letter">ب)</span>
                  نادرست
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Short Answer Questions -->
        <div v-else-if="question.questionType === 'SHORT_ANSWER'" class="short-answer-section">
          <textarea
              v-model="selectedAnswer"
              class="modern-form-control"
              rows="3"
              placeholder="پاسخ خود را بنویسید..."
              maxlength="500">
          </textarea>
          <small class="text-muted">حداکثر 500 کاراکتر</small>
        </div>

        <!-- Essay Questions -->
        <div v-else-if="question.questionType === 'ESSAY'" class="essay-section">
          <textarea
              v-model="selectedAnswer"
              class="modern-form-control"
              rows="8"
              placeholder="پاسخ تشریحی خود را بنویسید..."
              maxlength="2000">
          </textarea>
          <small class="text-muted">حداکثر 2000 کاراکتر</small>
        </div>

        <!-- Fill in the Blanks Questions -->
        <div v-else-if="question.questionType === 'FILL_IN_THE_BLANKS'" class="fill-blanks-section">
          <div class="template-display">
            <div v-html="getTemplateWithBlanks()"></div>
          </div>
        </div>

        <!-- Matching Questions -->
        <div v-else-if="question.questionType === 'MATCHING'" class="matching-section mt-4">
          <h6 class="section-title">
            <i class="fas fa-link me-2"></i>
            آیتم‌های متناظر را به هم متصل کنید
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
              <div v-for="item in question.answers" :key="item.text"
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
      selectedAnswer: this.initializeAnswer(),
      shuffledRightItems: []
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
  mounted() {
    // Initialize shuffled items for matching questions
    if (this.question.questionType === 'MATCHING') {
      this.shuffledRightItems = this.getShuffledRightItems();
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
          const matchingAnswer = {};
          if (this.question.matchingPairs && Array.isArray(this.question.matchingPairs)) {
            this.question.matchingPairs.forEach(pair => {
              matchingAnswer[pair.leftItem] = '';
            });
          }
          return matchingAnswer;

        case 'CATEGORIZATION':
          const categorizationAnswer = {};
          if (this.question.answers && Array.isArray(this.question.answers)) {
            this.question.answers.forEach(item => {
              categorizationAnswer[item.text] = '';
            });
          }
          return categorizationAnswer;

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

    getTemplateWithBlanks() {
      if (!this.question.template) return this.question.text;

      let template = this.question.template;
      const blanks = this.selectedAnswer || [];

      blanks.forEach((blank, index) => {
        const input = `<input type="text"
                              class="blank-input"
                              v-model="selectedAnswer[${index}]"
                              placeholder="..."
                              @input="updateBlank(${index}, $event.target.value)">`;
        template = template.replace('{}', input);
      });

      return template;
    },

    updateBlank(index, value) {
      if (!Array.isArray(this.selectedAnswer)) {
        this.selectedAnswer = Array(this.getBlankCount()).fill('');
      }
      this.$set(this.selectedAnswer, index, value);
    },

    // Matching Methods
    getShuffledRightItems() {
      if (!this.question.matchingPairs) return [];
      const items = this.question.matchingPairs.map(pair => ({ rightItem: pair.rightItem }));
      return this.shuffleArray([...items]);
    },

    getAllRightItems() {
      if (!this.question.matchingPairs) return [];
      return this.question.matchingPairs.map(pair => ({ rightItem: pair.rightItem }));
    },

    selectRightItem(item, index) {
      // Optional: Handle visual selection for matching
      console.log('Selected right item:', item);
    },

    isRightItemSelected(item) {
      if (!this.selectedAnswer || typeof this.selectedAnswer !== 'object') return false;
      return Object.values(this.selectedAnswer).includes(item.rightItem);
    },

    // Categorization Methods
    getItemsInCategory(category) {
      if (!this.selectedAnswer || typeof this.selectedAnswer !== 'object') return [];
      return Object.keys(this.selectedAnswer).filter(key => this.selectedAnswer[key] === category);
    },

    // Utility Methods
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
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.option-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.option-content {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1rem;
}

.option-radio {
  position: relative;
  flex-shrink: 0;
}

.option-radio input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.option-radio label {
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid #667eea;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  margin: 0;
}

.option-radio input[type="radio"]:checked + label::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #667eea;
}

.option-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-letter {
  font-weight: 600;
  color: #667eea;
  min-width: 30px;
}

/* Matching Questions */
.matching-section {
  padding: 1.5rem;
  background: rgba(248, 249, 250, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.matching-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.matching-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.left-column,
.right-column {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.left-column h6,
.right-column h6 {
  text-align: center;
  margin-bottom: 1rem;
  color: #667eea;
  font-weight: 600;
}

.matching-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.matching-item.left-item {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
}

.matching-item.right-item {
  background: rgba(40, 167, 69, 0.05);
  border-color: rgba(40, 167, 69, 0.2);
  cursor: pointer;
}

.matching-item.right-item:hover {
  background: rgba(40, 167, 69, 0.1);
  transform: translateY(-1px);
}

.matching-item.right-item.selected {
  background: rgba(40, 167, 69, 0.15);
  border-color: #28a745;
}

.matching-answers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.matching-answer-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.left-text {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.matching-select {
  flex: 1;
  max-width: 200px;
}

/* Categorization Questions */
.categorization-section {
  padding: 1.5rem;
  background: rgba(248, 249, 250, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.categorization-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.categories-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.category-box {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  min-height: 120px;
}

.category-title {
  text-align: center;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.categorized-item {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.items-to-categorize {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.items-to-categorize h6 {
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.categorization-answer-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(248, 249, 250, 0.5);
  border-radius: 6px;
}

.item-text {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.category-select {
  flex: 1;
  max-width: 200px;
}

/* Fill in the blanks */
.template-display {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  line-height: 1.8;
}

.blank-input {
  display: inline-block;
  width: 120px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #667eea;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  margin: 0 0.25rem;
}

.blank-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Progress indicator */
.question-progress {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.progress-info {
  margin-bottom: 0.5rem;
}

.progress-sm {
  height: 6px;
}

.progress-bar {
  transition: width 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .matching-columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .categories-display {
    grid-template-columns: 1fr;
  }

  .matching-answer-row,
  .categorization-answer-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .matching-select,
  .category-select {
    max-width: none;
  }
}
</style>