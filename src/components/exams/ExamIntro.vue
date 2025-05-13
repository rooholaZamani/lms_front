<template>
  <div class="exam-intro">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h3 class="mb-0">{{ exam.title }}</h3>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-8">
            <h4>توضیحات آزمون</h4>
            <p>{{ exam.description }}</p>

            <h5>قوانین آزمون:</h5>
            <ul class="exam-rules">
              <li>مدت زمان آزمون: <strong>{{ exam.duration }} دقیقه</strong></li>
              <li>تعداد سوالات: <strong>{{ exam.questions ? exam.questions.length : 0 }} سوال</strong></li>
              <li>نمره قبولی: <strong>{{ exam.passingScore || 60 }}%</strong></li>
              <li>پس از شروع آزمون، نمی‌توانید آن را متوقف کنید.</li>
              <li>در صورت بستن صفحه یا خروج از آزمون، پاسخ‌های شما ذخیره نخواهد شد.</li>
            </ul>
          </div>
          <div class="col-md-4">
            <div class="exam-info-box">
              <div class="exam-info-item">
                <i class="fas fa-book"></i>
                <div>
                  <h5>درس</h5>
                  <p>{{ exam.lesson ? exam.lesson.title : 'نامشخص' }}</p>
                </div>
              </div>
              <div class="exam-info-item">
                <i class="fas fa-graduation-cap"></i>
                <div>
                  <h5>دوره</h5>
                  <p>{{ exam.lesson && exam.lesson.course ? exam.lesson.course.title : 'نامشخص' }}</p>
                </div>
              </div>
              <div class="exam-info-item">
                <i class="fas fa-clock"></i>
                <div>
                  <h5>زمان آزمون</h5>
                  <p>{{ exam.duration }} دقیقه</p>
                </div>
              </div>
              <div class="exam-info-item">
                <i class="fas fa-check-circle"></i>
                <div>
                  <h5>نمره قبولی</h5>
                  <p>{{ exam.passingScore || 60 }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-4">
          <button class="btn btn-primary btn-lg" @click="$emit('start-exam')">
            <i class="fas fa-play me-2"></i> شروع آزمون
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamIntro',
  props: {
    exam: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.exam-rules {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 5px;
  border-right: 4px solid #007bff;
  margin-top: 20px;
}

.exam-info-box {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 20px;
}

.exam-info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.exam-info-item i {
  font-size: 1.5rem;
  color: #007bff;
  margin-left: 15px;
  width: 30px;
  text-align: center;
}

.exam-info-item h5 {
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #6c757d;
}

.exam-info-item p {
  margin-bottom: 0;
  font-weight: bold;
}
</style>