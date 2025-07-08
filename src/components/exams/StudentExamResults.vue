<!--<template>-->
<!--  <div class="modern-page-bg info-gradient">-->
<!--    <div class="modern-container large animate-slide-up">-->
<!--      <div class="modern-header">-->
<!--        <button class="modern-btn modern-btn-outline mb-3" @click="$router.go(-1)">-->
<!--          <i class="fas fa-arrow-right me-1"></i>-->
<!--          بازگشت-->
<!--        </button>-->
<!--        <div class="modern-logo info">-->
<!--          <i class="fas fa-chart-bar"></i>-->
<!--        </div>-->
<!--        <h1 class="modern-title">نتایج آزمون‌های من</h1>-->
<!--        <p class="modern-subtitle">مشاهده نتایج و عملکرد در آزمون‌ها</p>-->
<!--      </div>-->

<!--      <loading-spinner :loading="loading">-->
<!--        <student-exams-table-->
<!--            v-if="!loading"-->
<!--            :exams="examResults"-->
<!--        />-->
<!--      </loading-spinner>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import axios from 'axios';-->
<!--import LoadingSpinner from '@/components/common/LoadingSpinner.vue';-->
<!--import StudentExamsTable from '@/components/exams/StudentExamsTable.vue';-->

<!--export default {-->
<!--  name: 'StudentExamResultsView',-->
<!--  components: {-->
<!--    LoadingSpinner,-->
<!--    StudentExamsTable-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      loading: true,-->
<!--      examResults: []-->
<!--    };-->
<!--  },-->
<!--  async created() {-->
<!--    await this.fetchExamResults();-->
<!--  },-->
<!--  methods: {-->
<!--    async fetchExamResults() {-->
<!--      try {-->
<!--        this.loading = true;-->
<!--        const response = await axios.get('/exams/submissions/student');-->
<!--        this.examResults = response.data;-->
<!--      } catch (error) {-->
<!--        console.error('Error fetching exam results:', error);-->
<!--        this.$toast?.error('خطا در دریافت نتایج آزمون‌ها');-->
<!--      } finally {-->
<!--        this.loading = false;-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->