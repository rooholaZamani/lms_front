/**
 * Composable برای مدیریت آنالیتیکس و گزارش‌ها
 */
import { ref, computed } from 'vue';
import axios from 'axios';

export function useAnalytics() {
    // State
    const loading = ref(false);
    const error = ref(null);

    // Student Analytics Data
    const studentPerformance = ref({
        totalCourses: 0,
        completedCourses: 0,
        averageCompletion: 0,
        examsTaken: 0,
        passedExams: 0,
        averageExamScore: 0,
        exercisesTaken: 0,
        averageExerciseScore: 0,
        recentActivity: []
    });

    const studentComparison = ref({
        studentProgress: 0,
        averageProgress: 0,
        studentExamScore: 0,
        averageExamScore: 0,
        studentRank: 0,
        totalStudents: 0
    });

    const recentExams = ref([]);

    // Teacher Analytics Data
    const coursePerformance = ref({
        studentCount: 0,
        averageProgress: 0,
        averageExamScore: 0,
        passingRate: 0,
        completionRate: 0
    });

    const topPerformers = ref({
        topByScore: [],
        topByProgress: [],
        topByParticipation: []
    });

    const strugglingStudents = ref([]);
    const difficultLessons = ref([]);
    const participationMetrics = ref([]);

    // Computed
    const hasError = computed(() => !!error.value);
    const isLoading = computed(() => loading.value);

    // Student Analytics Methods
    const fetchStudentPerformance = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get('/analytics/student/performance');
            studentPerformance.value = {
                totalCourses: response.data.totalCourses || 0,
                completedCourses: response.data.completedCourses || 0,
                averageCompletion: response.data.averageCompletion || 0,
                examsTaken: response.data.examsTaken || 0,
                passedExams: response.data.passedExams || 0,
                averageExamScore: response.data.averageExamScore || 0,
                exercisesTaken: response.data.exercisesTaken || 0,
                averageExerciseScore: response.data.averageExerciseScore || 0,
                recentActivity: response.data.recentActivity || []
            };
            return studentPerformance.value;
        } catch (err) {
            error.value = 'خطا در دریافت اطلاعات عملکرد دانش‌آموز';
            console.error('Error fetching student performance:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchStudentComparison = async (courseId) => {
        if (!courseId) return null;

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/analytics/course/${courseId}/student-comparison`);
            studentComparison.value = {
                studentProgress: response.data.studentProgress || 0,
                averageProgress: response.data.averageProgress || 0,
                studentExamScore: response.data.studentExamScore || 0,
                averageExamScore: response.data.averageExamScore || 0,
                studentRank: response.data.studentRank || 0,
                totalStudents: response.data.totalStudents || 0
            };
            return studentComparison.value;
        } catch (err) {
            error.value = 'خطا در دریافت اطلاعات مقایسه';
            console.error('Error fetching student comparison:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchRecentExams = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get('/exams/submissions/student');
            recentExams.value = (response.data || []).map(submission => ({
                id: submission.id,
                title: submission.exam?.title || 'نامشخص',
                courseName: getCourseName(submission),
                score: submission.score || 0,
                classAverage: submission.classAverage || 0,
                passed: submission.passed,
                date: submission.submissionTime,
                exam: submission.exam
            }));
            return recentExams.value;
        } catch (err) {
            error.value = 'خطا در دریافت آزمون‌های اخیر';
            console.error('Error fetching recent exams:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchExamDetails = async (examId) => {
        if (!examId) return null;

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/analytics/student/exam/${examId}/details`);
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت جزئیات آزمون';
            console.error('Error fetching exam details:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Teacher Analytics Methods
    const fetchCoursePerformance = async (courseId) => {
        if (!courseId) return null;

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/analytics/teacher/course/${courseId}/performance`);
            coursePerformance.value = {
                studentCount: response.data.studentCount || 0,
                averageProgress: response.data.averageProgress || 0,
                averageExamScore: response.data.averageExamScore || 0,
                passingRate: response.data.passingRate || 0,
                completionRate: response.data.completionRate || 0,
                totalEnrollments: response.data.totalEnrollments || 0,
                activeStudents: response.data.activeStudents || 0
            };
            return coursePerformance.value;
        } catch (err) {
            error.value = 'خطا در دریافت عملکرد دوره';
            console.error('Error fetching course performance:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchTopPerformers = async (courseId) => {
        if (!courseId) return null;

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/analytics/course/${courseId}/top-performers`);
            topPerformers.value = {
                topByScore: response.data.topByScore || [],
                topByProgress: response.data.topByProgress || [],
                topByParticipation: response.data.topByParticipation || []
            };
            return topPerformers.value;
        } catch (err) {
            error.value = 'خطا در دریافت دانش‌آموزان برتر';
            console.error('Error fetching top performers:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchStrugglingStudents = async (courseId) => {
        if (!courseId) return [];

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/analytics/teacher/course/${courseId}/struggling-students`);
            strugglingStudents.value = response.data || [];
            return strugglingStudents.value;
        } catch (err) {
            error.value = 'خطا در دریافت دانش‌آموزان نیازمند کمک';
            console.error('Error fetching struggling students:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchDifficultLessons = async (courseId) => {
        if (!courseId) return [];

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/analytics/teacher/course/${courseId}/difficult-lessons`);
            difficultLessons.value = response.data || [];
            return difficultLessons.value;
        } catch (err) {
            error.value = 'خطا در دریافت درس‌های دشوار';
            console.error('Error fetching difficult lessons:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchParticipationMetrics = async (courseId) => {
        if (!courseId) return [];

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/analytics/teacher/course/${courseId}/participation`);
            participationMetrics.value = response.data || [];
            return participationMetrics.value;
        } catch (err) {
            error.value = 'خطا در دریافت معیارهای مشارکت';
            console.error('Error fetching participation metrics:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Exercise Analytics
    const fetchExerciseDifficulty = async (exerciseId) => {
        if (!exerciseId) return null;

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/exercises/${exerciseId}/difficulty`);
            return {
                exerciseId: response.data.exerciseId,
                totalSubmissions: response.data.totalSubmissions || 0,
                passRate: response.data.passRate || 0,
                averageScore: response.data.averageScore || 0,
                averageTimePerQuestion: response.data.averageTimePerQuestion || 0,
                overallDifficulty: response.data.overallDifficulty || 0,
                questionDifficulty: response.data.questionDifficulty || []
            };
        } catch (err) {
            error.value = 'خطا در دریافت تحلیل سختی تمرین';
            console.error('Error fetching exercise difficulty:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Progress Statistics
    const fetchProgressStats = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get('/progress/stats');
            return {
                totalCourses: response.data.totalCourses || 0,
                completedCourses: response.data.completedCourses || 0,
                averageProgress: response.data.averageProgress || 0
            };
        } catch (err) {
            error.value = 'خطا در دریافت آمار پیشرفت';
            console.error('Error fetching progress stats:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchStudentProgress = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get('/progress');
            return response.data || [];
        } catch (err) {
            error.value = 'خطا در دریافت پیشرفت دانش‌آموز';
            console.error('Error fetching student progress:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchCourseProgress = async (courseId) => {
        if (!courseId) return null;

        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(`/progress/${courseId}`);
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت پیشرفت دوره';
            console.error('Error fetching course progress:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Comprehensive Analytics Fetch
    const fetchStudentAnalytics = async (courseId = null) => {
        const promises = [
            fetchStudentPerformance(),
            fetchRecentExams(),
            fetchProgressStats()
        ];

        if (courseId) {
            promises.push(fetchStudentComparison(courseId));
        }

        try {
            const results = await Promise.allSettled(promises);
            const errors = results.filter(result => result.status === 'rejected');

            if (errors.length > 0) {
                console.warn('Some analytics requests failed:', errors);
            }

            return {
                performance: studentPerformance.value,
                comparison: courseId ? studentComparison.value : null,
                recentExams: recentExams.value,
                progressStats: results[2].status === 'fulfilled' ? results[2].value : null
            };
        } catch (err) {
            error.value = 'خطا در دریافت آنالیتیکس دانش‌آموز';
            throw err;
        }
    };

    const fetchTeacherAnalytics = async (courseId) => {
        if (!courseId) return null;

        const promises = [
            fetchCoursePerformance(courseId),
            fetchTopPerformers(courseId),
            fetchStrugglingStudents(courseId),
            fetchDifficultLessons(courseId),
            fetchParticipationMetrics(courseId)
        ];

        try {
            const results = await Promise.allSettled(promises);
            const errors = results.filter(result => result.status === 'rejected');

            if (errors.length > 0) {
                console.warn('Some teacher analytics requests failed:', errors);
            }

            return {
                performance: coursePerformance.value,
                topPerformers: topPerformers.value,
                strugglingStudents: strugglingStudents.value,
                difficultLessons: difficultLessons.value,
                participation: participationMetrics.value
            };
        } catch (err) {
            error.value = 'خطا در دریافت آنالیتیکس معلم';
            throw err;
        }
    };

    // Utility Functions
    const calculateScorePercentage = (score, totalPossible) => {
        if (!totalPossible || totalPossible === 0) return 0;
        return Math.round((score / totalPossible) * 100);
    };

    const calculateRankPercentage = (rank, total) => {
        if (total <= 1) return 50;
        return ((rank - 1) / (total - 1)) * 100;
    };

    const getPerformanceLevel = (percentage) => {
        if (percentage >= 90) return { level: 'excellent', label: 'عالی', color: '#28a745' };
        if (percentage >= 80) return { level: 'good', label: 'خوب', color: '#17a2b8' };
        if (percentage >= 70) return { level: 'average', label: 'متوسط', color: '#ffc107' };
        if (percentage >= 60) return { level: 'poor', label: 'ضعیف', color: '#fd7e14' };
        return { level: 'fail', label: 'نیاز به بهبود', color: '#dc3545' };
    };

    const getCourseName = (submission) => {
        if (!submission || !submission.exam || !submission.exam.lesson || !submission.exam.lesson.course) {
            return 'نامشخص';
        }
        return submission.exam.lesson.course.title;
    };

    const generateProgressReport = (progressData) => {
        const totalProgress = progressData.reduce((sum, course) => sum + course.completionPercentage, 0);
        const averageProgress = progressData.length > 0 ? totalProgress / progressData.length : 0;

        const completedCourses = progressData.filter(course => course.completionPercentage >= 100).length;
        const inProgressCourses = progressData.filter(course =>
            course.completionPercentage > 0 && course.completionPercentage < 100
        ).length;
        const notStartedCourses = progressData.filter(course => course.completionPercentage === 0).length;

        return {
            averageProgress: Math.round(averageProgress),
            totalCourses: progressData.length,
            completedCourses,
            inProgressCourses,
            notStartedCourses,
            performanceLevel: getPerformanceLevel(averageProgress)
        };
    };

    const clearError = () => {
        error.value = null;
    };
    const fetchSystemOverview = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/system-overview');
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت نمای کلی سیستم';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchTimeAnalysis = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/time-analysis');
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت تحلیل زمان';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchQuestionDifficultyAnalysis = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/question-difficulty');
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت تحلیل سختی سوالات';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchLessonPerformanceAnalysis = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/lesson-performance');
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت تحلیل عملکرد درس‌ها';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchEngagementTrends = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/engagement-trends');
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت روندهای مشارکت';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchChallengingQuestions = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/challenging-questions');
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت سوالات چالش‌برانگیز';
            throw err;
        } finally {
            loading.value = false;
        }
    }
    const fetchStudentTimeAnalysis = async (studentId) => {
        try {
            const response = await axios.get(`/analytics/student/${studentId}/time-analysis`);
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت تحلیل زمان دانش‌آموز';
            throw err;
        }
    };

    const fetchStudentActivityTimeline = async (studentId) => {
        try {
            const response = await axios.get(`/analytics/student/${studentId}/activity-timeline`);
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت جدول زمانی فعالیت';
            throw err;
        }
    };

    const fetchDailyEngagementStats = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/daily-engagement');
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت آمار مشارکت روزانه';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const resetAnalytics = () => {
        studentPerformance.value = {
            totalCourses: 0,
            completedCourses: 0,
            averageCompletion: 0,
            examsTaken: 0,
            passedExams: 0,
            averageExamScore: 0,
            exercisesTaken: 0,
            averageExerciseScore: 0,
            recentActivity: []
        };

        studentComparison.value = {
            studentProgress: 0,
            averageProgress: 0,
            studentExamScore: 0,
            averageExamScore: 0,
            studentRank: 0,
            totalStudents: 0
        };

        recentExams.value = [];
        coursePerformance.value = {
            studentCount: 0,
            averageProgress: 0,
            averageExamScore: 0,
            passingRate: 0,
            completionRate: 0
        };

        topPerformers.value = {
            topByScore: [],
            topByProgress: [],
            topByParticipation: []
        };

        strugglingStudents.value = [];
        difficultLessons.value = [];
        participationMetrics.value = [];
        error.value = null;
    };

    return {
        // State
        loading: isLoading,
        error: hasError,
        errorMessage: error,

        // Student Data
        studentPerformance,
        studentComparison,
        recentExams,

        // Teacher Data
        coursePerformance,
        topPerformers,
        strugglingStudents,
        difficultLessons,
        participationMetrics,

        // Student Methods
        fetchStudentPerformance,
        fetchStudentComparison,
        fetchRecentExams,
        fetchExamDetails,
        fetchProgressStats,
        fetchStudentProgress,
        fetchCourseProgress,

        // Teacher Methods
        fetchCoursePerformance,
        fetchTopPerformers,
        fetchStrugglingStudents,
        fetchDifficultLessons,
        fetchParticipationMetrics,

        // Exercise Methods
        fetchExerciseDifficulty,

        // Comprehensive Methods
        fetchStudentAnalytics,
        fetchTeacherAnalytics,

        // Utility Methods
        calculateScorePercentage,
        calculateRankPercentage,
        getPerformanceLevel,
        generateProgressReport,
        clearError,
        resetAnalytics,
        fetchSystemOverview,
        fetchTimeAnalysis,
        fetchQuestionDifficultyAnalysis,
        fetchLessonPerformanceAnalysis,
        fetchEngagementTrends,
        fetchChallengingQuestions,
        fetchDailyEngagementStats
    };
}