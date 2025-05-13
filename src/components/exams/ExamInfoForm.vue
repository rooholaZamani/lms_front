<template>
  <div class="exam-info-form">
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">اطلاعات آزمون</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveExamInfo">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="examTitle" class="form-label">عنوان آزمون <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="examTitle" v-model="examData.title" required>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="examDuration" class="form-label">مدت زمان (دقیقه) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="examDuration" v-model="examData.duration" min="1" required>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="examPassingScore" class="form-label">نمره قبولی (درصد)</label>
                <input type="number" class="form-control" id="examPassingScore" v-model="examData.passingScore" min="0" max="100">
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="examLesson" class="form-label">درس مربوطه <span class="text-danger">*</span></label>
                <select class="form-select" id="examLesson" v-model="examData.lessonId" required>
                  <option value="" disabled selected>انتخاب درس</option>
                  <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                    {{ lesson.title }} ({{ getCourseTitle(lesson) }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="examDescription" class="form-label">توضیحات آزمون</label>
            <textarea class="form-control" id="examDescription" v-model="examData.description" rows="3"></textarea>
          </div>

          <div class="mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="shuffleQuestions" v-model="examData.shuffleQuestions">
              <label class="form-check-label" for="shuffleQuestions">
                ترتیب سوالات تصادفی باشد
              </label>
            </div>
          </div>

          <div class="text-end">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ذخیره اطلاعات
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'ExamInfoForm',
  mixins: [formMixin],
  props: {
    examData: {
      type: Object,
      required: true
    },
    availableLessons: {
      type: Array,
      required: true
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  methods: {
    saveExamInfo() {
      this.$emit('save-exam-info');
    },
    getCourseTitle(lesson) {
      if (!lesson.course) return 'نامشخص';
      return lesson.course.title || 'نامشخص';
    }
  }
}
</script>