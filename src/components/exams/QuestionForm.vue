<template>
  <div class="question-form">
    <form @submit.prevent="saveQuestion">
      <!-- متن سوال -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="fas fa-question-circle me-2"></i>
          متن سوال
        </h6>

        <div class="modern-form-group">
          <label for="questionText" class="modern-form-label">متن سوال <span class="text-danger">*</span></label>
          <textarea
              class="modern-form-control"
              id="questionText"
              v-model="questionData.text"
              rows="3"
              placeholder="متن سوال خود را وارد کنید..."
              required
          ></textarea>
        </div>

        <div class="modern-form-group">
          <label for="questionType" class="modern-form-label">نوع سوال <span class="text-danger">*</span></label>
          <select
              class="modern-form-control"
              id="questionType"
              v-model="questionData.type"
              required
              @change="handleTypeChange"
          >
            <option value="MULTIPLE_CHOICE">چند گزینه‌ای</option>
            <option value="TRUE_FALSE">درست/نادرست</option>
            <option value="SHORT_ANSWER">پاسخ کوتاه</option>
            <option value="ESSAY">تشریحی</option>
            <option value="FILL_IN_THE_BLANKS">پر کردن جاهای خالی</option>
            <option value="MATCHING">تطبیق</option>
            <option value="CATEGORIZATION">دسته‌بندی</option>
          </select>
        </div>
      </div>

      <!-- گزینه‌های سوال چند گزینه‌ای -->
      <div v-if="questionData.type === 'MULTIPLE_CHOICE'" class="form-section">
        <h6 class="section-title">
          <i class="fas fa-list me-2"></i>
          گزینه‌ها
        </h6>

        <div class="modern-form-group">
          <label class="modern-form-label">گزینه‌ها <span class="text-danger">*</span></label>
          <div class="options-container">
            <div v-for="(option, index) in questionData.options" :key="index" class="option-input-group">
              <div class="option-input">
                <div class="correct-selector">
                  <input
                      class="form-check-input"
                      type="radio"
                      :name="'correctOption'"
                      :value="index"
                      :checked="Number(questionData.correctOption) === index"
                      @change="questionData.correctOption = index"
                  >
                  <label class="option-label">{{ String.fromCharCode(65 + index) }}</label>
                </div>
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="questionData.options[index]"
                    :placeholder="`گزینه ${String.fromCharCode(65 + index)}`"
                    required
                >
                <button
                    type="button"
                    class="remove-option-btn"
                    @click="removeOption(index)"
                    :disabled="questionData.options.length <= 2"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <button
              type="button"
              class="modern-btn modern-btn-outline"
              @click="addOption"
              :disabled="questionData.options.length >= 6"
          >
            <i class="fas fa-plus me-1"></i> افزودن گزینه
          </button>
        </div>
      </div>

      <!-- گزینه‌های سوال درست/نادرست -->
      <div v-else-if="questionData.type === 'TRUE_FALSE'" class="form-section">
        <h6 class="section-title">
          <i class="fas fa-check-circle me-2"></i>
          پاسخ صحیح
        </h6>

        <div class="modern-form-group">
          <label class="modern-form-label">پاسخ صحیح <span class="text-danger">*</span></label>
          <div class="true-false-options">
            <div class="form-check-option">
              <input
                  class="form-check-input"
                  type="radio"
                  id="trueFalseTrue"
                  value="true"
                  v-model="questionData.correctOption"
              >
              <label class="form-check-label" for="trueFalseTrue">
                <i class="fas fa-check me-2 text-success"></i>
                درست
              </label>
            </div>
            <div class="form-check-option">
              <input
                  class="form-check-input"
                  type="radio"
                  id="trueFalseFalse"
                  value="false"
                  v-model="questionData.correctOption"
              >
              <label class="form-check-label" for="trueFalseFalse">
                <i class="fas fa-times me-2 text-danger"></i>
                نادرست
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- گزینه‌های سوال پاسخ کوتاه -->
      <div v-else-if="questionData.type === 'SHORT_ANSWER'" class="form-section">
        <h6 class="section-title">
          <i class="fas fa-edit me-2"></i>
          پاسخ صحیح
        </h6>

        <div class="modern-form-group">
          <label for="shortAnswerCorrect" class="modern-form-label">پاسخ صحیح <span class="text-danger">*</span></label>
          <input
              type="text"
              class="modern-form-control"
              id="shortAnswerCorrect"
              v-model="questionData.correctOption"
              placeholder="پاسخ صحیح را وارد کنید..."
              required
          >
        </div>
      </div>

      <!-- گزینه‌های سوال تشریحی -->
      <div v-else-if="questionData.type === 'ESSAY'" class="form-section">
        <h6 class="section-title">
          <i class="fas fa-file-alt me-2"></i>
          تنظیمات سوال تشریحی
        </h6>

        <div class="modern-form-group">
          <label for="essayMaxScore" class="modern-form-label">حداکثر نمره <span class="text-danger">*</span></label>
          <input
              type="number"
              class="modern-form-control"
              id="essayMaxScore"
              v-model="questionData.maxScore"
              min="1"
              max="100"
              placeholder="حداکثر نمره قابل کسب..."
              required
          >
        </div>
      </div>
      <!-- Fill in the Blanks Section -->
      <div v-else-if="questionData.type === 'FILL_IN_THE_BLANKS'" class="form-section">
        <h6 class="section-title">
          <i class="fas fa-puzzle-piece me-2"></i>
          پر کردن جاهای خالی
        </h6>

        <div class="modern-form-group">
          <label class="modern-form-label">متن با جاهای خالی (از {} استفاده کنید)</label>
          <textarea
              class="modern-form-control"
              v-model="questionData.template"
              rows="3"
              placeholder="مثال: پایتخت فرانسه {} و پایتخت آلمان {} است."
              required
          ></textarea>
        </div>

        <div class="modern-form-group">
          <label class="modern-form-label">پاسخ‌های صحیح</label>
          <div v-for="(blank, index) in questionData.blankAnswers" :key="index" class="blank-answer-group">
            <div class="row">
              <div class="col-md-6">
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="blank.correctAnswer"
                    :placeholder="`پاسخ جای خالی ${index + 1}`"
                    required
                >
              </div>
              <div class="col-md-4">
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="blank.acceptableAnswers"
                    placeholder="پاسخ‌های قابل قبول (با کاما جدا کنید)"
                >
              </div>
              <div class="col-md-2">
                <button type="button" class="modern-btn modern-btn-danger" @click="removeBlank(index)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button type="button" class="modern-btn modern-btn-outline" @click="addBlank">
            <i class="fas fa-plus me-1"></i> افزودن جای خالی
          </button>
        </div>
      </div>

      <!-- Matching Section -->
      <div v-else-if="questionData.type === 'MATCHING'" class="form-section">
        <h6 class="section-title">
          <i class="fas fa-arrows-alt-h me-2"></i>
          تطبیق آیتم‌ها
        </h6>

        <div class="modern-form-group">
          <label class="modern-form-label">جفت‌های تطبیق</label>
          <div v-for="(pair, index) in questionData.matchingPairs" :key="index" class="matching-pair-group">
            <div class="row">
              <div class="col-md-5">
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="pair.leftItem"
                    placeholder="آیتم سمت چپ"
                    required
                >
              </div>
              <div class="col-md-5">
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="pair.rightItem"
                    placeholder="آیتم سمت راست"
                    required
                >
              </div>
              <div class="col-md-2">
                <button type="button" class="modern-btn modern-btn-danger" @click="removeMatchingPair(index)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button type="button" class="modern-btn modern-btn-outline" @click="addMatchingPair">
            <i class="fas fa-plus me-1"></i> افزودن جفت
          </button>
        </div>
      </div>

      <!-- Categorization Section -->
      <div v-else-if="questionData.type === 'CATEGORIZATION'" class="form-section">
        <h6 class="section-title">
          <i class="fas fa-layer-group me-2"></i>
          دسته‌بندی
        </h6>

        <div class="modern-form-group">
          <label class="modern-form-label">دسته‌ها</label>
          <div v-for="(category, index) in questionData.categories" :key="index" class="category-input-group">
            <div class="row">
              <div class="col-md-10">
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="questionData.categories[index]"
                    :placeholder="`دسته ${index + 1}`"
                    required
                >
              </div>
              <div class="col-md-2">
                <button type="button" class="modern-btn modern-btn-danger" @click="removeCategory(index)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button type="button" class="modern-btn modern-btn-outline" @click="addCategory">
            <i class="fas fa-plus me-1"></i> افزودن دسته
          </button>
        </div>

        <div class="modern-form-group">
          <label class="modern-form-label">آیتم‌های دسته‌بندی</label>
          <div v-for="(item, index) in questionData.categorizationItems" :key="index" class="categorization-item-group">
            <div class="row">
              <div class="col-md-5">
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="item.text"
                    placeholder="متن آیتم"
                    required
                >
              </div>
              <div class="col-md-5">
                <select
                    class="modern-form-control"
                    v-model="item.correctCategory"
                    required
                >
                  <option value="">انتخاب دسته</option>
                  <option v-for="category in questionData.categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <button type="button" class="modern-btn modern-btn-danger" @click="removeCategorizationitem(index)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button type="button" class="modern-btn modern-btn-outline" @click="addCategorizationItem">
            <i class="fas fa-plus me-1"></i> افزودن آیتم
          </button>
        </div>
      </div>

      <!-- تنظیمات اضافی -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="fas fa-cogs me-2"></i>
          تنظیمات اضافی
        </h6>

        <div class="row">
          <div class="col-md-6 modern-form-group">
            <label for="questionPoints" class="modern-form-label">امتیاز سوال <span class="text-danger">*</span></label>
            <input
                type="number"
                class="modern-form-control"
                id="questionPoints"
                v-model="questionData.points"
                min="1"
                max="100"
                placeholder="امتیاز سوال..."
                required
            >
          </div>
          <div class="col-md-6 modern-form-group">
            <label for="questionTimeLimit" class="modern-form-label">محدودیت زمانی (ثانیه)</label>
            <input
                type="number"
                class="modern-form-control"
                id="questionTimeLimit"
                v-model="questionData.timeLimit"
                min="0"
                placeholder="زمان پاسخ‌دهی..."
            >
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 modern-form-group">
            <label for="questionDifficulty" class="modern-form-label">سطح دشواری (۱-۵)</label>
            <select class="modern-form-control" id="questionDifficulty" v-model="questionData.difficulty">
              <option value="">انتخاب کنید</option>
              <option value="1">۱ - بسیار آسان</option>
              <option value="2">۲ - آسان</option>
              <option value="3">۳ - متوسط</option>
              <option value="4">۴ - سخت</option>
              <option value="5">۵ - بسیار سخت</option>
            </select>
          </div>
          <div class="col-md-6 modern-form-group">
            <div class="form-check" style="margin-top: 2rem;">
              <input
                  class="form-check-input"
                  type="checkbox"
                  id="isRequired"
                  v-model="questionData.isRequired"
              >
              <label class="form-check-label" for="isRequired">
                <i class="fas fa-asterisk me-1 text-danger"></i>
                سوال اجباری
              </label>
            </div>
          </div>
        </div>

        <div class="modern-form-group">
          <label for="questionHint" class="modern-form-label">راهنمایی (اختیاری)</label>
          <input
              type="text"
              class="modern-form-control"
              id="questionHint"
              v-model="questionData.hint"
              placeholder="راهنمایی برای دانش‌آموزان..."
          >
        </div>

        <div class="modern-form-group">
          <label for="questionExplanation" class="modern-form-label">توضیحات تکمیلی (اختیاری)</label>
          <textarea
              class="modern-form-control"
              id="questionExplanation"
              v-model="questionData.explanation"
              rows="3"
              placeholder="توضیحات بیشتر درباره سوال..."
          ></textarea>
          <div class="form-text">این توضیحات پس از آزمون به دانش‌آموز نمایش داده خواهد شد.</div>
        </div>
      </div>

      <!-- دکمه‌های عمل -->
      <div class="form-actions">
        <button type="button" class="modern-btn modern-btn-secondary" @click="$emit('cancel')">
          <i class="fas fa-times me-1"></i>
          انصراف
        </button>
        <button type="submit" class="modern-btn modern-btn-success" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <i class="fas fa-save me-1"></i>
          {{ isEditing ? 'ذخیره تغییرات' : 'افزودن سوال' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'QuestionForm',
  mixins: [formMixin],
  props: {
    questionData: {
      type: Object,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    validateQuestion() {
      if (this.questionData.type === 'MULTIPLE_CHOICE') {
        const validOptions = this.questionData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          this.showErrorToast('حداقل دو گزینه برای سوال چندگزینه‌ای لازم است.');
          return false;
        }

        if (this.questionData.correctOption === null ||
            this.questionData.correctOption === undefined ||
            this.questionData.correctOption < 0 ||
            this.questionData.correctOption >= this.questionData.options.length) {
          this.showErrorToast('لطفاً پاسخ درست را انتخاب کنید.');
          return false;
        }
      } else if (this.questionData.type === 'TRUE_FALSE') {
        if (this.questionData.correctOption !== 'true' && this.questionData.correctOption !== 'false') {
          this.showErrorToast('لطفاً پاسخ درست را انتخاب کنید.');
          return false;
        }
      } else if (this.questionData.type === 'SHORT_ANSWER') {
        if (!this.questionData.correctOption || this.questionData.correctOption.trim() === '') {
          this.showErrorToast('لطفاً پاسخ صحیح را وارد کنید.');
          return false;
        }
      } else if (this.questionData.type === 'ESSAY') {
        if (!this.questionData.maxScore || this.questionData.maxScore < 1) {
          this.showErrorToast('لطفاً حداکثر نمره سوال را وارد کنید.');
          return false;
        }
      }

      if (!this.questionData.points || this.questionData.points < 1) {
        this.showErrorToast('لطفاً امتیاز سوال را وارد کنید.');
        return false;
      }

      return true;
    },
    saveQuestion() {
      if (!this.validateQuestion()) {
        return;
      }

      const formattedData = this.formatQuestionData();
      this.$emit('save', formattedData);
    },

    formatQuestionData() {
      const data = { ...this.questionData };

      if (data.type === 'MULTIPLE_CHOICE') {
        const validOptions = data.options.filter(opt => opt && opt.trim() !== '');
        data.options = validOptions.map((text, index) => ({
          text: text,
          correct: index === parseInt(data.correctOption),
          answerType: 'TEXT',
          points: index === parseInt(data.correctOption) ? (data.points || 10) : 0,
          orderIndex: index
        }));
      } else if (data.type === 'TRUE_FALSE') {
        data.options = [
          {
            text: 'True',
            correct: data.correctOption === 'true',
            answerType: 'TEXT',
            points: data.correctOption === 'true' ? (data.points || 10) : 0,
            orderIndex: 0
          },
          {
            text: 'False',
            correct: data.correctOption === 'false',
            answerType: 'TEXT',
            points: data.correctOption === 'false' ? (data.points || 10) : 0,
            orderIndex: 1
          }
        ];
      } else if (data.type === 'SHORT_ANSWER') {
        data.options = [
          {
            text: data.correctOption,
            correct: true,
            answerType: 'TEXT',
            points: data.points || 10,
            orderIndex: 0
          }
        ];
      } else if (data.type === 'ESSAY') {
        data.options = [
          {
            text: 'Essay Answer',
            correct: true,
            answerType: 'TEXT',
            points: data.maxScore || data.points || 10,
            orderIndex: 0
          }
        ];
      }

      data.questionType = data.type;
      delete data.type;
      delete data.correctOption;
      delete data.maxScore;

      if (!data.points) {
        data.points = 10;
      }

      if (data.type === 'FILL_IN_THE_BLANKS') {
        data.blankAnswers = data.blankAnswers.map((blank, index) => ({
          blankIndex: index,
          correctAnswer: blank.correctAnswer,
          acceptableAnswers: blank.acceptableAnswers ? blank.acceptableAnswers.split(',').map(s => s.trim()) : [],
          caseSensitive: false,
          points: Math.floor((data.points || 10) / data.blankAnswers.length)
        }));
      } else if (data.type === 'MATCHING') {
        data.matchingPairs = data.matchingPairs.map(pair => ({
          leftItem: pair.leftItem,
          rightItem: pair.rightItem,
          leftItemType: 'TEXT',
          rightItemType: 'TEXT',
          points: Math.floor((data.points || 10) / data.matchingPairs.length)
        }));
      } else if (data.type === 'CATEGORIZATION') {
        data.categorizationItems = data.categorizationItems.map(item => ({
          text: item.text,
          correctCategory: item.correctCategory,
          itemType: 'TEXT',
          points: Math.floor((data.points || 10) / data.categorizationItems.length)
        }));
      }

      return data;
    }

    },

    addOption() {
      if (!this.questionData.options) {
        this.questionData.options = [];
      }

      if (this.questionData.options.length < 6) {
        this.questionData.options.push('');
      }
    },

    removeOption(index) {
      if (this.questionData.options.length > 2) {
        this.questionData.options.splice(index, 1);

        if (this.questionData.correctOption === index) {
          this.questionData.correctOption = 0;
        } else if (this.questionData.correctOption > index) {
          this.questionData.correctOption--;
        }
      } else {
        this.showErrorToast('حداقل دو گزینه برای سوال چندگزینه‌ای لازم است.');
      }
    },

    handleTypeChange() {
      if (this.questionData.type === 'MULTIPLE_CHOICE') {
        if (!this.questionData.options || this.questionData.options.length < 2) {
          this.questionData.options = ['', '', '', ''];
          this.questionData.correctOption = 0;
        }
      } else if (this.questionData.type === 'TRUE_FALSE') {
        this.questionData.correctOption = 'true';
      } else if (this.questionData.type === 'SHORT_ANSWER') {
        this.questionData.correctOption = '';
      } else if (this.questionData.type === 'ESSAY') {
        this.questionData.maxScore = 10;
      }
      if (this.questionData.type === 'FILL_IN_THE_BLANKS') {
        this.questionData.template = '';
        this.questionData.blankAnswers = [{ correctAnswer: '', acceptableAnswers: '', blankIndex: 0 }];
      } else if (this.questionData.type === 'MATCHING') {
        this.questionData.matchingPairs = [{ leftItem: '', rightItem: '', leftItemType: 'TEXT', rightItemType: 'TEXT' }];
      } else if (this.questionData.type === 'CATEGORIZATION') {
        this.questionData.categories = ['دسته ۱', 'دسته ۲'];
        this.questionData.categorizationItems = [{ text: '', correctCategory: '', itemType: 'TEXT' }];
      }

    },
    addBlank() {
      this.questionData.blankAnswers.push({
        correctAnswer: '',
        acceptableAnswers: '',
        blankIndex: this.questionData.blankAnswers.length
      });
    },

    removeBlank(index) {
      if (this.questionData.blankAnswers.length > 1) {
        this.questionData.blankAnswers.splice(index, 1);
      }
    },
    addMatchingPair() {
      this.questionData.matchingPairs.push({
        leftItem: '',
        rightItem: '',
        leftItemType: 'TEXT',
        rightItemType: 'TEXT'
      });
    },

    removeMatchingPair(index) {
      if (this.questionData.matchingPairs.length > 1) {
        this.questionData.matchingPairs.splice(index, 1);
      }
    },
    addCategory() {
      this.questionData.categories.push('');
    },

    removeCategory(index) {
      if (this.questionData.categories.length > 2) {
        this.questionData.categories.splice(index, 1);
      }
    },

    addCategorizationItem() {
      this.questionData.categorizationItems.push({
        text: '',
        correctCategory: '',
        itemType: 'TEXT'
      });
    },
    removeCategorizationItem(index) {
      if (this.questionData.categorizationItems.length > 1) {
        this.questionData.categorizationItems.splice(index, 1);
      }
    },
}
</script>

<style scoped>
.question-form {
  max-width: 100%;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.option-input-group {
  width: 100%;
}

.option-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
}

.correct-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.option-label {
  font-weight: 600;
  color: #667eea;
  min-width: 20px;
  text-align: center;
  margin: 0;
}

.option-input input.modern-form-control {
  flex: 1;
  margin: 0;
}

.remove-option-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-option-btn:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.2);
  transform: scale(1.1);
}

.remove-option-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.true-false-options {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.form-check-option {
  display: flex;
  align-items: center;
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 150px;
}

.form-check-option:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: #667eea;
}

.form-check-option input[type="radio"] {
  margin-left: 0.75rem;
}

.form-check-option label {
  margin: 0;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.form-text {
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .true-false-options {
    flex-direction: column;
  }

  .form-check-option {
    min-width: auto;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .option-input {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .correct-selector {
    width: 100%;
    justify-content: center;
  }
}
</style>