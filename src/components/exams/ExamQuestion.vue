<template>
  <div class="exam-question">
    <!-- Question Header -->
    <div class="question-text">
      <h5>{{ question.text }}</h5>
      <div class="question-meta">
        <span class="points-badge">{{ question.points }} امتیاز</span>
        <span v-if="question.timeLimit" class="time-badge">{{ question.timeLimit }} دقیقه</span>
      </div>
    </div>

    <!-- Question Content Based on Type -->
    <div class="question-content">

      <!-- Multiple Choice Questions -->
      <div v-if="question.questionType === 'MULTIPLE_CHOICE'" class="options-section">
        <div class="options-container">
          <div v-for="(answer, index) in question.answers"
               :key="answer.id"
               class="option-item"
               :class="{ selected: selectedAnswer === answer.id }"
               @click="selectedAnswer = answer.id">
            <div class="option-content">
              <div class="option-radio">
                <input type="radio" :value="answer.id" v-model="selectedAnswer" :id="'option-' + answer.id">
                <label :for="'option-' + answer.id"></label>
              </div>
              <div class="option-text">
                <span class="option-letter">{{ String.fromCharCode(65 + index) }})</span>
                {{ answer.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- True/False Questions -->
      <div v-else-if="question.questionType === 'TRUE_FALSE'" class="true-false-section">
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

      <!-- بخش SHORT_ANSWER و ESSAY -->
      <div v-else-if="['SHORT_ANSWER', 'ESSAY'].includes(question.questionType)" class="text-answer-section mt-4">
        <textarea
            :value="selectedAnswer || ''"
            @input="onTextAnswerChange($event.target.value)"
            class="modern-form-control"
            :rows="question.questionType === 'ESSAY' ? 6 : 3"
            :placeholder="question.questionType === 'ESSAY' ? 'پاسخ تشریحی خود را بنویسید...' : 'پاسخ کوتاه خود را بنویسید...'">
        </textarea>
      </div>

      <!-- Fill in the Blanks Questions -->
      <div v-else-if="question.questionType === 'FILL_IN_THE_BLANKS'" class="fill-blanks-section mt-4">
        <div class="template-display">
          <div class="template-content">
      <span v-for="(part, index) in getTemplateParts()" :key="index">
        <span v-if="part.type === 'text'">{{ part.content }}</span>
        <input
            v-else-if="part.type === 'blank'"
            type="text"
            class="blank-input"
            :value="selectedAnswer[part.blankIndex] || ''"
            @input="updateBlank(part.blankIndex, $event.target.value)"
            placeholder="..."
        />
      </span>
          </div>
        </div>
      </div>

      <!-- Matching Questions -->
      <div v-else-if="question.questionType === 'MATCHING'" class="matching-section mt-4">
        <h6 class="section-title">
          <i class="fas fa-link me-2"></i>
          آیتم‌های متناظر را به هم متصل کنید
        </h6>
        <div class="matching-container">
          <div class="matching-answers">
            <div v-for="(pair, index) in question.matchingPairs" :key="'answer-' + index"
                 class="matching-answer-row">
              <span class="left-text">{{ pair.leftItem }}</span>
              <i class="fas fa-arrow-left mx-2"></i>
              <select
                  :value="selectedAnswer[pair.leftItem] || ''"
                  @change="onMatchingSelectionChange(pair.leftItem, $event.target.value)"
                  class="modern-form-control matching-select">
                <option value="">انتخاب کنید</option>
                <option v-for="rightItem in getAllRightItems()"
                        :key="rightItem.rightItem"
                        :value="rightItem.rightItem">
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
          <div class="items-to-categorize">
            <h6>آیتم‌ها را دسته‌بندی کنید:</h6>
            <div v-for="(item, index) in question.answers" :key="'item-' + index"
                 class="categorization-answer-row">
              <span class="item-text">{{ item.text }}</span>
              <i class="fas fa-arrow-left mx-2"></i>
              <select
                  :value="selectedAnswer[item.text] || ''"
                  @change="onCategorizationSelectionChange(item.text, $event.target.value)"
                  class="modern-form-control category-select">
                <option value="">انتخاب دسته</option>
                <option v-for="category in question.categories"
                        :key="category"
                        :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Hint -->
      <div v-if="question.hint" class="hint-section mt-3">
        <div class="hint-box">
          <i class="fas fa-lightbulb text-warning me-2"></i>
          <span>{{ question.hint }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    question: {
      type: Object,
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    },
    showCorrectAnswer: {
      type: Boolean,
      default: false
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
        // Debug: نمایش پاسخ انتخاب شده
        console.log(`Question ${this.questionIndex} answer changed:`, newVal);

        // emit کردن پاسخ
        this.$emit('answer-changed', this.questionIndex, newVal);
      },
      deep: true,
      immediate: false // تا در mounted دوبار emit نشود
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
      // اگر پاسخ از قبل موجود است، همان را برگردان
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
              matchingAnswer[pair.leftItem] = ''; // مقدار اولیه خالی
            });
          }
          console.log('Initialized matching answer:', matchingAnswer);
          return matchingAnswer;

        case 'CATEGORIZATION':
          const categorizationAnswer = {};
          if (this.question.answers && Array.isArray(this.question.answers)) {
            this.question.answers.forEach(item => {
              categorizationAnswer[item.text] = ''; // مقدار اولیه خالی
            });
          }
          console.log('Initialized categorization answer:', categorizationAnswer);
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

    // 3. اصلاح انتخاب گزینه برای سوالات چندگزینه‌ای
    selectOption(answerId) {
      this.selectedAnswer = answerId;
      console.log(`Multiple choice answer selected: ${answerId}`);
      // watcher خودکار emit می‌کند
    },

    // 4. اصلاح انتخاب برای درست/غلط
    selectTrueFalse(answer) {
      this.selectedAnswer = answer;
      console.log(`True/False answer selected: ${answer}`);
      // watcher خودکار emit می‌کند
    },

    // 5. تصحیح updateBlank برای جای خالی
    updateBlank(index, value) {
      if (!Array.isArray(this.selectedAnswer)) {
        this.selectedAnswer = Array(this.getBlankCount()).fill('');
      }

      // کپی آرایه و تغییر مقدار
      const newAnswer = [...this.selectedAnswer];
      newAnswer[index] = value;
      this.selectedAnswer = newAnswer;

      console.log(`Blank ${index} updated to:`, value);
      console.log('All blanks:', newAnswer);
      // watcher خودکار emit می‌کند
    },

    // 6. اصلاح انتخاب برای سوالات تطبیقی
    onMatchingSelectionChange(leftItem, rightItem) {
      console.log(`Matching: ${leftItem} -> ${rightItem}`);

      // اطمینان از اینکه selectedAnswer یک object است
      if (!this.selectedAnswer || typeof this.selectedAnswer !== 'object') {
        this.selectedAnswer = {};
        // مقداردهی اولیه برای همه آیتم‌های چپ
        if (this.question.matchingPairs) {
          this.question.matchingPairs.forEach(pair => {
            this.selectedAnswer[pair.leftItem] = '';
          });
        }
      }

      // Vue.set استفاده کنید یا کل object را جایگزین کنید تا reactivity حفظ شود
      this.selectedAnswer = {
        ...this.selectedAnswer,
        [leftItem]: rightItem
      };

      console.log('Updated matching answer:', this.selectedAnswer);
      // watcher خودکار emit می‌کند
    },

    // 7. اصلاح انتخاب برای سوالات دسته‌بندی
    onCategorizationSelectionChange(itemText, category) {
      console.log(`Categorization: ${itemText} -> ${category}`);

      // اطمینان از اینکه selectedAnswer یک object است
      if (!this.selectedAnswer || typeof this.selectedAnswer !== 'object') {
        this.selectedAnswer = {};
        // مقداردهی اولیه برای همه آیتم‌ها
        if (this.question.answers) {
          this.question.answers.forEach(item => {
            this.selectedAnswer[item.text] = '';
          });
        }
      }

      // Vue.set استفاده کنید یا کل object را جایگزین کنید تا reactivity حفظ شود
      this.selectedAnswer = {
        ...this.selectedAnswer,
        [itemText]: category
      };

      console.log('Updated categorization answer:', this.selectedAnswer);
      // watcher خودکار emit می‌کند
    },

    // 8. تصحیح پاسخ سوالات متنی
    onTextAnswerChange(value) {
      this.selectedAnswer = value;
      console.log(`Text answer changed to: ${value}`);
      // watcher خودکار emit می‌کند
    },

    getBlankCount() {
      if (this.question.questionType !== 'FILL_IN_THE_BLANKS') return 0;
      const text = this.question.template || this.question.text || '';
      const matches = text.match(/\{\}/g);
      return matches ? matches.length : 0;
    },

    // اصلاح متد getTemplateParts برای جای خالی
    getTemplateParts() {
      if (!this.question.template) return [{type: 'text', content: this.question.text}];

      const template = this.question.template;
      const parts = [];
      let currentIndex = 0;
      let blankIndex = 0;

      while (currentIndex < template.length) {
        const blankPosition = template.indexOf('{}', currentIndex);

        if (blankPosition === -1) {
          // No more blanks, add remaining text
          if (currentIndex < template.length) {
            parts.push({
              type: 'text',
              content: template.substring(currentIndex)
            });
          }
          break;
        }

        // Add text before blank
        if (blankPosition > currentIndex) {
          parts.push({
            type: 'text',
            content: template.substring(currentIndex, blankPosition)
          });
        }

        // Add blank input
        parts.push({
          type: 'blank',
          blankIndex: blankIndex++
        });

        currentIndex = blankPosition + 2; // Skip '{}'
      }

      return parts;
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
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.question-text h5 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.question-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.points-badge, .time-badge {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

.points-badge {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.time-badge {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.2);
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

/* Form controls */
.modern-form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.modern-form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Fill in the blanks */
.template-display {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  line-height: 2;
  font-size: 1.1rem;
}

.template-with-inputs {
  display: inline;
}

.blank-input {
  display: inline-block;
  width: 120px;
  padding: 0.4rem 0.8rem;
  border: 2px solid #667eea;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  margin: 0 0.3rem;
  font-size: 1rem;
  vertical-align: baseline;
}

.blank-input:focus {
  outline: none;
  border-color: #4c63d2;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
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

/* Hint section */
.hint-section {
  margin-top: 1.5rem;
}

.hint-box {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.text-muted {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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

  .blank-input {
    width: 100px;
    margin: 0.2rem;
  }
}
</style>