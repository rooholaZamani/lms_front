<template>
  <div class="question-form">
    <form @submit.prevent="saveQuestion">
      <div class="mb-3">
        <label for="questionText" class="form-label">متن سوال <span class="text-danger">*</span></label>
        <textarea class="form-control" id="questionText" v-model="questionData.text" rows="3" required></textarea>
      </div>

      <div class="mb-3">
        <label for="questionType" class="form-label">نوع سوال <span class="text-danger">*</span></label>
        <select class="form-select" id="questionType" v-model="questionData.type" required @change="handleTypeChange">
          <option value="MULTIPLE_CHOICE">چند گزینه‌ای</option>
          <option value="TRUE_FALSE">درست/نادرست</option>
          <option value="SHORT_ANSWER">پاسخ کوتاه</option>
          <option value="ESSAY">تشریحی</option>
          <!-- اضافه کردن انواع جدید -->
          <option value="FILL_IN_THE_BLANKS">جای خالی</option>
          <option value="MATCHING">تطبیقی</option>
          <option value="CATEGORIZATION">دسته‌بندی</option>
        </select>
      </div>

      <!-- گزینه‌های سوال چند گزینه‌ای -->
      <div v-if="questionData.type === 'MULTIPLE_CHOICE'" class="mb-3">
        <label class="form-label">گزینه‌ها <span class="text-danger">*</span></label>
        <div v-for="(option, index) in questionData.options" :key="index" class="option-input-group mb-2">
          <div class="input-group">
            <div class="input-group-text">
              <input class="form-check-input" type="radio"
                     :name="'correctOption'"
                     :value="index"
                     :checked="Number(questionData.correctOption) === index"
                     @change="questionData.correctOption = index">
            </div>
            <input type="text" class="form-control" v-model="questionData.options[index]"
                   :placeholder="`گزینه ${index + 1}`" required>
            <button type="button" class="btn btn-outline-danger" @click="removeOption(index)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addOption"
                :disabled="questionData.options.length >= 6">
          <i class="fas fa-plus"></i> افزودن گزینه
        </button>
      </div>

      <!-- گزینه‌های سوال درست/نادرست -->
      <div v-else-if="questionData.type === 'TRUE_FALSE'" class="mb-3">
        <label class="form-label">پاسخ صحیح <span class="text-danger">*</span></label>
        <div class="form-check">
          <input class="form-check-input" type="radio" id="trueFalseTrue"
                 value="true" v-model="questionData.correctOption">
          <label class="form-check-label" for="trueFalseTrue">درست</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" id="trueFalseFalse"
                 value="false" v-model="questionData.correctOption">
          <label class="form-check-label" for="trueFalseFalse">نادرست</label>
        </div>
      </div>

      <!-- گزینه‌های سوال پاسخ کوتاه -->
      <div v-else-if="questionData.type === 'SHORT_ANSWER'" class="mb-3">
        <label for="shortAnswerCorrect" class="form-label">پاسخ صحیح <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="shortAnswerCorrect"
               v-model="questionData.correctOption" required>
      </div>

      <!-- گزینه‌های سوال تشریحی -->
      <div v-else-if="questionData.type === 'ESSAY'" class="mb-3">
        <label for="essayMaxScore" class="form-label">حداکثر نمره <span class="text-danger">*</span></label>
        <input type="number" class="form-control" id="essayMaxScore"
               v-model="questionData.maxScore" min="1" max="100" required>
      </div>

      <div class="mb-3">
        <label for="questionExplanation" class="form-label">توضیحات تکمیلی (اختیاری)</label>
        <textarea class="form-control" id="questionExplanation"
                  v-model="questionData.explanation" rows="2"></textarea>
        <div class="form-text">این توضیحات پس از آزمون به دانش‌آموز نمایش داده خواهد شد.</div>
      </div>

      <div class="mb-3">
        <label for="questionPoints" class="form-label">امتیاز سوال <span class="text-danger">*</span></label>
        <input type="number" class="form-control" id="questionPoints"
               v-model="questionData.points" min="1" max="100" required>
      </div>

      <div class="text-end">
        <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">انصراف</button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isEditing ? 'ذخیره تغییرات' : 'افزودن سوال' }}
        </button>
      </div>
      <!-- اضافه کردن فیلدهای جدید -->
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="questionHint" class="form-label">راهنمایی (اختیاری)</label>
            <input type="text" class="form-control" id="questionHint" v-model="questionData.hint">
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="questionTimeLimit" class="form-label">محدودیت زمانی (ثانیه) (اختیاری)</label>
            <input type="number" class="form-control" id="questionTimeLimit" v-model="questionData.timeLimit" min="0">
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="questionDifficulty" class="form-label">سطح دشواری (1-5)</label>
            <input type="number" class="form-control" id="questionDifficulty" v-model="questionData.difficulty" min="1" max="5" step="0.5">
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" id="isRequired" v-model="questionData.isRequired">
              <label class="form-check-label" for="isRequired">
                سوال اجباری
              </label>
            </div>
          </div>
        </div>
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
    saveQuestion() {
      // اعتبارسنجی فرم بر اساس نوع سوال
      if (!this.validateQuestion()) {
        return;
      }

      // تبدیل داده‌ها به فرمت مورد نیاز API
      const formattedData = this.formatQuestionData();

      this.$emit('save', formattedData);
    },

    formatQuestionData() {
      const data = { ...this.questionData };

      if (data.type === 'MULTIPLE_CHOICE') {
        // برای سوال چند گزینه‌ای، از answers استفاده کنید نه options
        data.answers = data.options.map((text, index) => ({
          text: text,
          correct: index === parseInt(data.correctOption),
          answerType: 'TEXT',
          points: index === parseInt(data.correctOption) ? (data.points || 10) : 0,
          orderIndex: index
        }));
        // options را حذف کنید
        delete data.options;
      } else if (data.type === 'TRUE_FALSE') {
        data.answers = [
          {
            text: 'درست',
            correct: data.correctOption === 'true',
            answerType: 'TEXT',
            points: data.correctOption === 'true' ? (data.points || 10) : 0,
            orderIndex: 0
          },
          {
            text: 'نادرست',
            correct: data.correctOption === 'false',
            answerType: 'TEXT',
            points: data.correctOption === 'false' ? (data.points || 10) : 0,
            orderIndex: 1
          }
        ];
      }

      // تنظیم questionType به جای type
      data.questionType = data.type;
      delete data.type;

      // اطمینان از وجود points
      if (!data.points) {
        data.points = 10;
      }

      return data;
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

        // اگر گزینه انتخاب شده حذف شد، گزینه اول را به عنوان پاسخ درست انتخاب می‌کنیم
        if (this.questionData.correctOption === index) {
          this.questionData.correctOption = 0;
        } else if (this.questionData.correctOption > index) {
          // تنظیم مجدد شاخص گزینه درست اگر بعد از گزینه حذف شده باشد
          this.questionData.correctOption--;
        }
      } else {
        this.showErrorToast('حداقل دو گزینه برای سوال چندگزینه‌ای لازم است.');
      }
    },

    handleTypeChange() {
      // تنظیم مقادیر پیش‌فرض بر اساس نوع سوال
      if (this.questionData.type === 'MULTIPLE_CHOICE') {
        // اطمینان از وجود آرایه گزینه‌ها
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
    },

    validateQuestion() {
      if (this.questionData.type === 'MULTIPLE_CHOICE') {
        // حداقل باید دو گزینه با مقدار غیر خالی وجود داشته باشد
        const validOptions = this.questionData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          this.showErrorToast('حداقل دو گزینه برای سوال چندگزینه‌ای لازم است.');
          return false;
        }

        // اطمینان از این که گزینه درست انتخاب شده و در محدوده قابل قبول است
        if (this.questionData.correctOption === null ||
            this.questionData.correctOption === undefined ||
            this.questionData.correctOption < 0 ||
            this.questionData.correctOption >= this.questionData.options.length) {
          this.showErrorToast('لطفاً پاسخ درست را انتخاب کنید.');
          return false;
        }
      } else if (this.questionData.type === 'TRUE_FALSE') {
        // اطمینان از این که یک گزینه انتخاب شده است
        if (this.questionData.correctOption !== 'true' && this.questionData.correctOption !== 'false') {
          this.showErrorToast('لطفاً پاسخ درست را انتخاب کنید.');
          return false;
        }
      } else if (this.questionData.type === 'SHORT_ANSWER') {
        // اطمینان از پر کردن فیلد پاسخ صحیح
        if (!this.questionData.correctOption || this.questionData.correctOption.trim() === '') {
          this.showErrorToast('لطفاً پاسخ صحیح را وارد کنید.');
          return false;
        }
      } else if (this.questionData.type === 'ESSAY') {
        // اطمینان از وارد کردن نمره
        if (!this.questionData.maxScore || this.questionData.maxScore < 1) {
          this.showErrorToast('لطفاً حداکثر نمره سوال را وارد کنید.');
          return false;
        }
      }

      // بررسی مقدار points
      if (!this.questionData.points || this.questionData.points < 1) {
        this.showErrorToast('لطفاً امتیاز سوال را وارد کنید.');
        return false;
      }

      return true;
    }
  }
}
</script>

<style scoped>
.option-input-group {
  margin-bottom: 10px;
}
</style>