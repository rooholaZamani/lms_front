<template>
  <div class="exam-question" :class="{ 'review-mode': isReviewMode }">
    <!-- Question Header -->
    <div class="question-header">
      <div class="question-number-badge">
        سوال {{ questionNumber }}
      </div>
      <div v-if="isReviewMode" class="result-badge" :class="isCorrect ? 'correct' : 'incorrect'">
        <i :class="isCorrect ? 'fas fa-check' : 'fas fa-times'"></i>
        {{ isCorrect ? 'درست' : 'نادرست' }}
      </div>
    </div>

    <!-- Question Text -->
    <div class="question-text">
      <h5>{{ question.text }}</h5>
      <div class="question-meta">
        <span v-if="isReviewMode && earnedPoints !== null && totalPoints !== null" class="score-badge" :class="earnedPoints > 0 ? 'earned' : 'no-earned'">
          {{ earnedPoints }}/{{ totalPoints }} امتیاز
        </span>
        <span v-else class="points-badge">{{ question.points }} امتیاز</span>
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
               :class="{
                 selected: currentAnswer === answer.id,
                 'student-answer': isReviewMode && currentAnswer === answer.id,
                 'correct-answer': isReviewMode && answer.correct,
                 'incorrect-answer': isReviewMode && currentAnswer === answer.id && !answer.correct
               }"
               @click="!isReviewMode && (currentAnswer = answer.id)">
            <div class="option-content">
              <div class="option-radio">
                <input
                    type="radio"
                    :value="answer.id"
                    v-model="currentAnswer"
                    :id="'option-' + answer.id"
                    :disabled="isReviewMode">
                <label :for="'option-' + answer.id"></label>
              </div>
              <div class="option-text">
                <span class="option-letter">{{ String.fromCharCode(65 + index) }})</span>
                {{ answer.text }}
                <span v-if="isReviewMode && answer.correct" class="correct-indicator">
                  <i class="fas fa-check text-success"></i>
                  پاسخ صحیح
                </span>
                <span v-if="isReviewMode && currentAnswer === answer.id && !answer.correct" class="student-indicator">
                  <i class="fas fa-arrow-left text-primary"></i>
                  پاسخ شما
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- True/False Questions -->
      <div v-else-if="question.questionType === 'TRUE_FALSE'" class="true-false-section">
        <div class="options-container">
          <div class="option-item"
               :class="{
                 selected: currentAnswer === 'true' || currentAnswer === true || currentAnswer === 7,
                 'student-answer': isReviewMode && (currentAnswer === 'true' || currentAnswer === true || currentAnswer === 7),
                 'correct-answer': isReviewMode && getCorrectTrueFalseAnswer() === 'true',
                 'incorrect-answer': isReviewMode && (currentAnswer === 'true' || currentAnswer === true || currentAnswer === 7) && getCorrectTrueFalseAnswer() !== 'true'
               }"
               @click="!isReviewMode && (currentAnswer = 'true')">
            <div class="option-content">
              <div class="option-radio">
                <input
                    type="radio"
                    value="true"
                    v-model="currentAnswer"
                    id="true-option"
                    :disabled="isReviewMode">
                <label for="true-option"></label>
              </div>
              <div class="option-text">
                <span class="option-letter">الف)</span>
                صحیح
                <span v-if="isReviewMode && getCorrectTrueFalseAnswer() === 'true'" class="correct-indicator">
                  <i class="fas fa-check text-success"></i>
                  پاسخ صحیح
                </span>
                <span v-if="isReviewMode && (currentAnswer === 'true' || currentAnswer === true || currentAnswer === 7) && getCorrectTrueFalseAnswer() !== 'true'" class="student-indicator">
                  <i class="fas fa-arrow-left text-primary"></i>
                  پاسخ شما
                </span>
              </div>
            </div>
          </div>
          <div class="option-item"
               :class="{
                 selected: currentAnswer === 'false' || currentAnswer === false || currentAnswer === 8,
                 'student-answer': isReviewMode && (currentAnswer === 'false' || currentAnswer === false || currentAnswer === 8),
                 'correct-answer': isReviewMode && getCorrectTrueFalseAnswer() === 'false',
                 'incorrect-answer': isReviewMode && (currentAnswer === 'false' || currentAnswer === false || currentAnswer === 8) && getCorrectTrueFalseAnswer() !== 'false'
               }"
               @click="!isReviewMode && (currentAnswer = 'false')">
            <div class="option-content">
              <div class="option-radio">
                <input
                    type="radio"
                    value="false"
                    v-model="currentAnswer"
                    id="false-option"
                    :disabled="isReviewMode">
                <label for="false-option"></label>
              </div>
              <div class="option-text">
                <span class="option-letter">ب)</span>
                نادرست
                <span v-if="isReviewMode && getCorrectTrueFalseAnswer() === 'false'" class="correct-indicator">
                  <i class="fas fa-check text-success"></i>
                  پاسخ صحیح
                </span>
                <span v-if="isReviewMode && (currentAnswer === 'false' || currentAnswer === false || currentAnswer === 8) && getCorrectTrueFalseAnswer() !== 'false'" class="student-indicator">
                  <i class="fas fa-arrow-left text-primary"></i>
                  پاسخ شما
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Short Answer & Essay Questions -->
      <div v-else-if="['SHORT_ANSWER', 'ESSAY'].includes(question.questionType)" class="text-answer-section mt-4">
        <div v-if="isReviewMode" class="review-answer-display">
          <div class="answer-row">
            <span class="answer-label">پاسخ شما:</span>
            <div class="answer-value user-answer" :class="isCorrect ? 'correct' : 'incorrect'">
              {{ currentAnswer || 'پاسخ داده نشده' }}
            </div>
          </div>
          <div v-if="question.questionType === 'SHORT_ANSWER' && question.correctOption" class="answer-row">
            <span class="answer-label">پاسخ صحیح:</span>
            <div class="answer-value correct-answer">
              {{ question.correctOption }}
            </div>
          </div>
          <div v-else-if="question.questionType === 'ESSAY'" class="answer-row">
            <span class="answer-label">وضعیت:</span>
            <div class="answer-value">
              نیاز به بررسی دستی دارد
            </div>
          </div>
        </div>
        <div v-else>
          <textarea
              v-model="currentAnswer"
              class="modern-form-control"
              :rows="question.questionType === 'ESSAY' ? 6 : 3"
              :placeholder="question.questionType === 'ESSAY' ? 'پاسخ تشریحی خود را بنویسید...' : 'پاسخ کوتاه خود را بنویسید...'">
          </textarea>
        </div>
      </div>

      <!-- Fill in the Blanks Questions -->
      <div v-else-if="question.questionType === 'FILL_IN_THE_BLANKS'" class="fill-blanks-section mt-4">
        <div class="template-display">
          <div class="template-content">
            <span v-for="(part, index) in getTemplateParts()" :key="index">
              <span v-if="part.type === 'text'">{{ part.content }}</span>
              <span v-else-if="part.type === 'blank'" class="blank-wrapper">
                <input
                    v-if="!isReviewMode"
                    type="text"
                    class="blank-input"
                    :class="getBlankInputClass(part.blankIndex)"
                    :value="currentAnswer && currentAnswer[part.blankIndex] || ''"
                    @input="updateBlankWithResize(part.blankIndex, $event)"
                    @focus="onBlankFocus(part.blankIndex)"
                    @blur="onBlankBlur(part.blankIndex)"
                    :placeholder="`جای خالی ${part.blankIndex + 1}`"
                    :title="`پاسخ جای خالی شماره ${part.blankIndex + 1} را وارد کنید`"
                    autocomplete="off"
                    spellcheck="false"
                    :ref="`blank-${part.blankIndex}`"
                />
                <span v-else class="blank-review" :class="isBlankCorrect(part.blankIndex) ? 'correct' : 'incorrect'">
                  {{ currentAnswer && currentAnswer[part.blankIndex] || '...' }}
                  <span v-if="showCorrectAnswer && question.blankAnswers && question.blankAnswers[part.blankIndex]" class="correct-blank">
                    (صحیح: {{ question.blankAnswers[part.blankIndex].correctAnswer }})
                  </span>
                </span>
              </span>
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
                  v-if="!isReviewMode"
                  :value="currentAnswer && currentAnswer[pair.leftItem] || ''"
                  @change="updateMatching(pair.leftItem, $event.target.value)"
                  class="form-select matching-select">
                <option value="">انتخاب کنید</option>
                <option v-for="rightItem in getAllRightItems()"
                        :key="rightItem.rightItem"
                        :value="rightItem.rightItem">
                  {{ rightItem.rightItem }}
                </option>
              </select>
              <div v-else class="matching-review">
                <span class="student-selection" :class="isMatchingCorrect(pair) ? 'correct' : 'incorrect'">
                  {{ currentAnswer && currentAnswer[pair.leftItem] || 'انتخاب نشده' }}
                </span>
                <span v-if="showCorrectAnswer" class="correct-selection">
                  (صحیح: {{ pair.rightItem }})
                </span>
              </div>
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
          <div class="categorization-items">
            <h6>آیتم‌ها را دسته‌بندی کنید:</h6>
            <div v-for="(item, index) in question.answers" :key="'item-' + index"
                 class="categorization-item-row">
              <span class="item-text">{{ item.text }}</span>
              <i class="fas fa-arrow-left mx-2"></i>
              <select
                  v-if="!isReviewMode"
                  :value="currentAnswer && currentAnswer[item.text] || ''"
                  @change="updateCategorization(item.text, $event.target.value)"
                  class="form-select categorization-select">
                <option value="">انتخاب دسته</option>
                <option v-for="category in question.categories"
                        :key="category"
                        :value="category">
                  {{ category }}
                </option>
              </select>
              <div v-else class="categorization-review">
                <span class="student-category" :class="isCategoryCorrect(item) ? 'correct' : 'incorrect'">
                  {{ currentAnswer && currentAnswer[item.text] || 'انتخاب نشده' }}
                </span>
                <span v-if="showCorrectAnswer" class="correct-category">
                  (صحیح: {{ item.category }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Hint -->
      <div v-if="question.hint && !isReviewMode" class="hint-section mt-3">
        <div class="hint-box">
          <i class="fas fa-lightbulb text-warning me-2"></i>
          <span>{{ question.hint }}</span>
        </div>
      </div>

      <!-- Question Explanation (در review mode) -->
      <div v-if="isReviewMode && showExplanation && question.explanation" class="explanation-section mt-4">
        <div class="explanation-box">
          <h6 class="explanation-title">
            <i class="fas fa-info-circle me-2"></i>
            توضیحات:
          </h6>
          <p class="explanation-text">{{ question.explanation }}</p>
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
    questionNumber: {
      type: Number,
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
    selectedAnswer: {
      type: [String, Number, Boolean, Object, Array],
      default: null
    },
    showCorrectAnswer: {
      type: Boolean,
      default: false
    },
    showExplanation: {
      type: Boolean,
      default: false
    },
    isReviewMode: {
      type: Boolean,
      default: false
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    isMarkedForReview: {
      type: Boolean,
      default: false
    },
    earnedPoints: {
      type: Number,
      default: null
    },
    totalPoints: {
      type: Number,
      default: null
    }
  },
  emits: ['answer-selected', 'answer-changed', 'mark-for-review'],

  data() {
    return {
      localAnswer: this.selectedAnswer
    }
  },

  watch: {
    selectedAnswer: {
      handler(newVal) {
        this.localAnswer = newVal;
      },
      deep: true,
      immediate: true
    }
  },

  computed: {
    currentAnswer: {
      get() {
        return this.isReviewMode ? this.selectedAnswer : this.localAnswer;
      },
      set(value) {
        if (!this.isReviewMode) {
          this.localAnswer = value;
          this.$emit('answer-changed', this.questionIndex, value);
        }
      }
    }
  },

  created() {
    // Debug logging for question structure analysis
    if (this.question.questionType === 'FILL_IN_THE_BLANKS') {
      console.log('FILL_IN_THE_BLANKS Question Debug Info:', {
        questionId: this.question.id,
        questionNumber: this.questionNumber,
        questionText: this.question.text,
        hasTemplate: !!this.question.template,
        template: this.question.template,
        hasBlankAnswers: !!this.question.blankAnswers,
        blankAnswersCount: this.question.blankAnswers ? this.question.blankAnswers.length : 0,
        templateParts: this.getTemplateParts()
      });
    }
  },

  methods: {
    updateBlank(blankIndex, value) {
      const newAnswer = Array.isArray(this.currentAnswer) ? [...this.currentAnswer] : [];
      newAnswer[blankIndex] = value;
      this.currentAnswer = newAnswer;
    },

    updateBlankWithResize(blankIndex, event) {
      const value = event.target.value;
      this.updateBlank(blankIndex, value);

      // Auto-resize the input based on content
      this.resizeInput(event.target);
    },

    resizeInput(input) {
      // Create a temporary span to measure text width
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.fontSize = window.getComputedStyle(input).fontSize;
      span.style.fontFamily = window.getComputedStyle(input).fontFamily;
      span.style.fontWeight = window.getComputedStyle(input).fontWeight;
      span.textContent = input.value || input.placeholder;

      document.body.appendChild(span);
      const textWidth = span.offsetWidth;
      document.body.removeChild(span);

      // Set input width with padding
      const newWidth = Math.max(80, Math.min(400, textWidth + 40));
      input.style.width = newWidth + 'px';
    },

    onBlankFocus(blankIndex) {
      // Add focus indication or help text if needed
      console.log(`Focus on blank ${blankIndex}`);
    },

    onBlankBlur(blankIndex) {
      // Validate or provide feedback when leaving the field
      console.log(`Blur on blank ${blankIndex}`);
    },

    getBlankInputClass(blankIndex) {
      const answer = this.currentAnswer && this.currentAnswer[blankIndex];
      return {
        'has-content': answer && answer.trim().length > 0,
        'is-empty': !answer || answer.trim().length === 0
      };
    },

    updateMatching(leftItem, rightItem) {
      const newAnswer = { ...this.currentAnswer };
      newAnswer[leftItem] = rightItem;
      this.currentAnswer = newAnswer;
    },

    updateCategorization(item, category) {
      const newAnswer = { ...this.currentAnswer };
      newAnswer[item] = category;
      this.currentAnswer = newAnswer;
    },

    getTemplateParts() {
      // Enhanced fallback logic for missing templates
      if (!this.question.template) {
        console.log('FILL_IN_THE_BLANKS question missing template, creating fallback:', {
          questionId: this.question.id,
          questionText: this.question.text,
          questionType: this.question.questionType
        });

        return this.createFallbackTemplate();
      }

      const template = this.question.template;
      const parts = [];
      let currentIndex = 0;
      let blankIndex = 0;

      while (currentIndex < template.length) {
        const blankPosition = template.indexOf('{}', currentIndex);

        if (blankPosition === -1) {
          if (currentIndex < template.length) {
            parts.push({
              type: 'text',
              content: template.substring(currentIndex)
            });
          }
          break;
        }

        if (blankPosition > currentIndex) {
          parts.push({
            type: 'text',
            content: template.substring(currentIndex, blankPosition)
          });
        }

        parts.push({
          type: 'blank',
          blankIndex: blankIndex++
        });

        currentIndex = blankPosition + 2;
      }

      return parts;
    },

    createFallbackTemplate() {
      const questionText = this.question.text || '';
      const parts = [];

      // Pattern 1: Look for "..." in text and replace with blank
      const dotPattern = /\.{3,}/g;
      if (dotPattern.test(questionText)) {
        let lastIndex = 0;
        let blankIndex = 0;
        let match;

        // Reset regex for iteration
        dotPattern.lastIndex = 0;

        while ((match = dotPattern.exec(questionText)) !== null) {
          // Add text before the dots
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: questionText.substring(lastIndex, match.index)
            });
          }

          // Add blank input
          parts.push({
            type: 'blank',
            blankIndex: blankIndex++
          });

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last dots
        if (lastIndex < questionText.length) {
          parts.push({
            type: 'text',
            content: questionText.substring(lastIndex)
          });
        }

        return parts;
      }

      // Pattern 2: Look for underscores "____"
      const underscorePattern = /_{3,}/g;
      if (underscorePattern.test(questionText)) {
        let lastIndex = 0;
        let blankIndex = 0;
        let match;

        underscorePattern.lastIndex = 0;

        while ((match = underscorePattern.exec(questionText)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: questionText.substring(lastIndex, match.index)
            });
          }

          parts.push({
            type: 'blank',
            blankIndex: blankIndex++
          });

          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < questionText.length) {
          parts.push({
            type: 'text',
            content: questionText.substring(lastIndex)
          });
        }

        return parts;
      }

      // Pattern 3: Fallback - add question text and one input field at the end
      return [
        {
          type: 'text',
          content: questionText
        },
        {
          type: 'text',
          content: ' '
        },
        {
          type: 'blank',
          blankIndex: 0
        }
      ];
    },

    getAllRightItems() {
      if (!this.question.matchingPairs) return [];
      return this.question.matchingPairs.map(pair => ({ rightItem: pair.rightItem }));
    },

    getCorrectTrueFalseAnswer() {
      if (this.question.answers && Array.isArray(this.question.answers)) {
        const correctAnswer = this.question.answers.find(ans => ans.correct);
        return correctAnswer ? (correctAnswer.text.toLowerCase() === 'true' ? 'true' : 'false') : 'true';
      }
      return 'true';
    },

    isBlankCorrect(blankIndex) {
      if (!this.question.blankAnswers || !this.currentAnswer || !Array.isArray(this.currentAnswer)) return false;
      const blank = this.question.blankAnswers[blankIndex];
      const studentAnswer = this.currentAnswer[blankIndex];
      if (!blank || !studentAnswer) return false;

      const correctAnswers = [blank.correctAnswer, ...blank.acceptableAnswers];
      if (blank.caseSensitive) {
        return correctAnswers.includes(studentAnswer);
      } else {
        return correctAnswers.some(correct =>
            correct.toLowerCase() === studentAnswer.toLowerCase()
        );
      }
    },

    isMatchingCorrect(pair) {
      if (!this.currentAnswer || typeof this.currentAnswer !== 'object') return false;
      return this.currentAnswer[pair.leftItem] === pair.rightItem;
    },

    isCategoryCorrect(item) {
      if (!this.currentAnswer || typeof this.currentAnswer !== 'object') return false;
      return this.currentAnswer[item.text] === item.category;
    }
  }
}
</script>

<style scoped>
.exam-question {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.exam-question.review-mode {
  border-left: 4px solid #007bff;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-number-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.result-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-badge.correct {
  background: #d4edda;
  color: #155724;
}

.result-badge.incorrect {
  background: #f8d7da;
  color: #721c24;
}

.question-text h5 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.question-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.points-badge {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.score-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.score-badge.earned {
  background: #28a745;
}

.score-badge.no-earned {
  background: #dc3545;
}

.time-badge {
  background: #ffc107;
  color: #212529;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Options Styles */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.option-item:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.option-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.option-item.correct-answer {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.option-item.incorrect-answer {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-radio input[type="radio"] {
  display: none;
}

.option-radio label {
  width: 20px;
  height: 20px;
  border: 2px solid #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.option-radio input[type="radio"]:checked + label {
  background: #667eea;
}

.option-radio input[type="radio"]:checked + label::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.option-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-letter {
  font-weight: 600;
  color: #667eea;
  min-width: 30px;
}

.correct-indicator, .student-indicator {
  margin-right: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Review Mode Styles */
.review-answer-display {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.answer-row {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
  gap: 1rem;
}

.answer-row:last-child {
  margin-bottom: 0;
}

.answer-label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
  flex-shrink: 0;
}

.answer-value {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background: white;
}

.answer-value.user-answer.correct {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  color: #155724;
}

.answer-value.user-answer.incorrect {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  color: #721c24;
}

.answer-value.correct-answer {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  color: #155724;
  font-weight: 600;
}

/* Form Controls */
.modern-form-control {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.modern-form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Fill in the Blanks */
.template-content {
  font-size: 1.1rem;
  line-height: 1.8;
}

.blank-input {
  display: inline-block;
  min-width: 120px;
  max-width: 300px;
  padding: 0.35rem 0.6rem;
  border: 2px solid #667eea;
  border-radius: 6px;
  background: rgba(102, 126, 234, 0.05);
  text-align: center;
  margin: 0 0.25rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  resize: horizontal;
  direction: ltr; /* For mixed content */
}

.blank-input:focus {
  outline: none;
  border-color: #4c63d2;
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  transform: scale(1.02);
}

.blank-input:hover {
  border-color: #5a73d8;
  background: rgba(102, 126, 234, 0.08);
}

.blank-input::placeholder {
  color: #8892b0;
  font-size: 0.9rem;
  font-style: italic;
}

/* Auto-resize input based on content */
.blank-input[data-auto-resize] {
  width: auto;
  min-width: 80px;
  max-width: 400px;
}

/* Visual feedback for filled vs empty inputs */
.blank-input.has-content {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

.blank-input.has-content:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.blank-input.is-empty:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .blank-input {
    min-width: 80px;
    max-width: 200px;
    font-size: 0.9rem;
    padding: 0.3rem 0.5rem;
  }

  .template-content {
    font-size: 1rem;
    line-height: 1.6;
  }
}

.blank-review {
  display: inline-block;
  min-width: 120px;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  margin: 0 0.25rem;
  font-weight: 600;
}

.blank-review.correct {
  background: rgba(40, 167, 69, 0.2);
  color: #155724;
}

.blank-review.incorrect {
  background: rgba(220, 53, 69, 0.2);
  color: #721c24;
}

.correct-blank {
  display: block;
  font-size: 0.8rem;
  color: #28a745;
  margin-top: 0.25rem;
}

/* Matching & Categorization */
.matching-answer-row, .categorization-item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.left-text, .item-text {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.matching-select, .categorization-select {
  flex: 1;
  max-width: 200px;
}

.matching-review, .categorization-review {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-selection, .student-category {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.student-selection.correct, .student-category.correct {
  background: rgba(40, 167, 69, 0.2);
  color: #155724;
}

.student-selection.incorrect, .student-category.incorrect {
  background: rgba(220, 53, 69, 0.2);
  color: #721c24;
}

.correct-selection, .correct-category {
  font-size: 0.8rem;
  color: #28a745;
  font-weight: 600;
}

/* Hint & Explanation */
.hint-box, .explanation-box {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

.explanation-box {
  background: rgba(23, 162, 184, 0.1);
  border-color: rgba(23, 162, 184, 0.3);
}

.explanation-title {
  color: #17a2b8;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.explanation-text {
  margin: 0;
  line-height: 1.6;
  color: #495057;
}

/* Responsive */
@media (max-width: 768px) {
  .exam-question {
    padding: 1.5rem;
  }

  .question-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .answer-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .answer-label {
    min-width: auto;
  }

  .matching-answer-row, .categorization-item-row {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}
</style>