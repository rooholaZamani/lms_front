<template>
  <div class="exam-confirmation">
    <div class="card">
      <div class="card-header bg-warning">
        <h3 class="mb-0">آیا مطمئن هستید؟</h3>
      </div>
      <div class="card-body">
        <p>شما در حال پایان دادن به آزمون هستید. پس از تأیید، نمی‌توانید پاسخ‌های خود را تغییر دهید.</p>

        <div class="exam-stats mt-4">
          <div class="row">
            <div class="col-md-4">
              <div class="exam-stat-item">
                <h5>تعداد کل سوالات</h5>
                <div class="stat-number">{{ totalQuestions }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="exam-stat-item">
                <h5>پاسخ داده شده</h5>
                <div class="stat-number">{{ answeredCount }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="exam-stat-item">
                <h5>بدون پاسخ</h5>
                <div class="stat-number text-warning">{{ totalQuestions - answeredCount }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="unanswered-questions mt-4" v-if="unansweredQuestions.length > 0">
          <h5>سوالات بدون پاسخ:</h5>
          <div class="question-nav-items">
            <button v-for="index in unansweredQuestions"
                    :key="index"
                    class="btn btn-sm btn-danger question-nav-item"
                    @click="$emit('go-to-question', index)">
              {{ index + 1 }}
            </button>
          </div>
        </div>

        <div class="text-center mt-5">
          <button class="btn btn-secondary btn-lg me-2" @click="$emit('cancel')">
            <i class="fas fa-arrow-right me-1"></i> بازگشت به آزمون
          </button>
          <button class="btn btn-success btn-lg" @click="$emit('finish')">
            <i class="fas fa-check me-1"></i> تأیید و ارسال
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamFinishConfirmation',
  props: {
    answers: {
      type: Array,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    }
  },
  computed: {
    answeredCount() {
      return this.answers.filter(answer => answer !== null && answer !== undefined).length;
    },
    unansweredQuestions() {
      const unanswered = [];
      this.answers.forEach((answer, index) => {
        if (answer === null || answer === undefined) {
          unanswered.push(index);
        }
      });
      return unanswered;
    }
  }
}
</script>

<style scoped>
.exam-stats {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 20px;
}

.exam-stat-item {
  text-align: center;
  padding: 15px;
}

.exam-stat-item h5 {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
}

.unanswered-questions {
  background-color: #f8d7da;
  border-radius: 5px;
  padding: 15px;
}

.question-nav-items {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.question-nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>