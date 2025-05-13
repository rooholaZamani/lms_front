<template>
  <div class="question-form">
    <form @submit.prevent="saveQuestion">
      <div class="mb-3">
        <label for="questionText" class="form-label">متن سوال <span class="text-danger">*</span></label>
        <textarea class="form-control" id="questionText" v-model="questionData.text" rows="3" required></textarea>
      </div>

      <div class="mb-3">
        <label for="questionType" class="form-label">نوع سوال <span class="text-danger">*</span></label>
        <select class="form-select" id="questionType" v-model="questionData.type" required>
          <option value="MULTIPLE_CHOICE">چند گزینه‌ای</option>
          <option value="TRUE_FALSE">درست/نادرست</option>
          <option value="SHORT_ANSWER">پاسخ کوتاه</option>
          <option value="ESSAY">تشریحی</option>
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
                     v-model="questionData.correctOption">
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

      <div class="text-end">
        <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">انصراف</button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
    saveQuestion() {
      // اعتبارسنجی فرم بر اساس نوع سوال
      if (!this.validateQuestion()) {
        return;
      }

      this.$emit('save');
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