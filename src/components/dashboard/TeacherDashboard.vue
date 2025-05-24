<template>
  <div class="teacher-dashboard">
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="dashboard-title">داشبورد معلم</h2>
      <div>
        <button class="btn btn-primary me-2" @click="showCreateCourseModal">
          <i class="fas fa-plus me-1"></i> ایجاد دوره جدید
        </button>
        <button class="btn btn-outline-secondary" @click="refreshData">
          <i class="fas fa-sync-alt me-1"></i> بروزرسانی
        </button>
      </div>
    </div>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6 mb-3">
        <stat-card
            icon="fas fa-book"
            :value="stats.totalCourses"
            label="تعداد دوره‌ها"
        />
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <stat-card
            icon="fas fa-user-graduate"
            :value="stats.totalStudents"
            label="تعداد دانش‌آموزان"
        />
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <stat-card
            icon="fas fa-clipboard-check"
            :value="stats.activeAssignments"
            label="تکالیف در انتظار بررسی"
        />
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <stat-card
            icon="fas fa-chart-line"
            :value="stats.averageProgress + '%'"
            label="میانگین پیشرفت دانش‌آموزان"
        />
      </div>
    </div>

    <!-- دوره‌های در حال تدریس -->
    <div class="card mb-4">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">دوره‌های من</h5>
        <router-link :to="{ name: 'TeachingCourses' }" class="btn btn-sm btn-light">
          مشاهده همه
        </router-link>
      </div>
      <div class="card-body">
        <loading-spinner :loading="loadingCourses">
          <template v-if="courses.length === 0">
            <empty-state
                title="شما هنوز دوره‌ای ایجاد نکرده‌اید"
                icon="book"
            >
              <button class="btn btn-primary mt-3" @click="showCreateCourseModal">
                ایجاد دوره جدید
              </button>
            </empty-state>
          </template>

          <template v-else>
            <div class="row">
              <!-- کارت دوره‌ها -->
              <div v-for="course in courses.slice(0, 3)" :key="course.id" class="col-md-4 mb-3">
                <div class="card h-100 course-card">
                  <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">{{ course.title }}</h5>
                  </div>
                  <div class="card-body">
                    <p v-if="course.description" class="card-text">{{ truncateText(course.description, 100) }}</p>

                    <div class="d-flex justify-content-between mb-3">
                      <span>تعداد دانش‌آموزان:</span>
                      <span>{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}</span>
                    </div>

                    <div class="d-flex justify-content-between mb-2">
                      <span>تعداد دروس:</span>
                      <span>{{ course.lessons ? course.lessons.length : 0 }}</span>
                    </div>

                    <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="btn btn-primary mt-3 w-100">
                      مدیریت دوره
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </loading-spinner>
      </div>
    </div>
  </div>

  <!-- مودال ایجاد دوره جدید -->
  <base-modal
      modal-id="createCourseModal"
      title="ایجاد دوره جدید"
      header-class="bg-primary text-white"
      ref="createCourseModal"
  >
    <form @submit.prevent="createCourse">
      <div class="mb-3">
        <label for="courseTitle" class="form-label">عنوان دوره</label>
        <input type="text" class="form-control" id="courseTitle" v-model="newCourse.title" required>
      </div>
      <div class="mb-3">
        <label for="courseDescription" class="form-label">توضیحات دوره</label>
        <textarea class="form-control" id="courseDescription" v-model="newCourse.description" rows="4"></textarea>
      </div>
      <div class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        پس از ایجاد دوره، می‌توانید دروس و محتوای آن را اضافه کنید.
      </div>

      <div slot="footer">
        <button type="button" class="btn btn-secondary" @click="$refs.createCourseModal.hide()">انصراف</button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ایجاد دوره
        </button>
      </div>
    </form>
  </base-modal>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import StatCard from '@/components/common/StatCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import StudentActivityTable from '@/components/dashboard/StudentActivityTable.vue';
import ScoresDistributionChart from '@/components/charts/ScoresDistributionChart.vue';
import ActivityChart from '@/components/charts/ActivityChart.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import axios from 'axios';

export default {
  name: 'TeacherDashboard',
  components: {
    LoadingSpinner,
    StatCard,
    EmptyState,
    BaseModal,
    StudentActivityTable,
    ScoresDistributionChart,
    ActivityChart
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { formatDate, truncateText } = useFormatters();

    // State
    const activeTab = ref('assignments');
    const loadingCourses = ref(true);
    const loadingAssignments = ref(true);
    const loadingStudentActivities = ref(false);
    const loadingAnalytics = ref(false);
    const isSubmitting = ref(false);

    const courses = ref([]);
    const assignments = ref([]);
    const studentActivities = ref([]);
    const selectedCourseId = ref(null);
    const scoresData = ref([]);
    const activityData = ref([]);
    const difficultLessons = ref([]);
    const strugglingStudents = ref([]);

    const stats = reactive({
      totalCourses: 0,
      totalStudents: 0,
      activeAssignments: 0,
      averageProgress: 0
    });

    const newCourse = reactive({
      title: '',
      description: ''
    });

    const createCourseModal = ref(null);

    // Computed
    const selectedCourse = computed(() => {
      if (!selectedCourseId.value) return null;
      return courses.value.find(course => course.id === selectedCourseId.value);
    });

    // Methods
    const fetchData = async () => {
      try {
        await fetchCourses();
        await fetchAssignments();
        calculateStats();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        window.showError(error);
      }
    };

    const fetchCourses = async () => {
      loadingCourses.value = true;
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data;

        if (courses.value.length > 0 && !selectedCourseId.value) {
          selectedCourseId.value = courses.value[0].id;
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        loadingCourses.value = false;
      }
    };

    const safelyAccessProperty = (obj, path, defaultValue = null) => {
      return path.split('.').reduce((prev, curr) => {
        return prev && prev[curr] !== undefined ? prev[curr] : defaultValue;
      }, obj);
    };

    const fetchAssignments = async () => {
      loadingAssignments.value = true;
      try {
        // Fetch all pending assignments across all courses
        const pendingAssignments = [];

        for (const course of courses.value) {
          try {
            // Get all lessons for the course
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data;

            // For each lesson, get assignments
            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const lessonAssignments = assignmentsResponse.data;

                // For each assignment, get submissions
                for (const assignment of lessonAssignments) {
                  try {
                    const submissionsResponse = await axios.get(`/assignments/${assignment.id}/submissions`);
                    const submissions = submissionsResponse.data;

                    // Add non-graded submissions to the pending list
                    const nonGradedSubmissions = submissions
                        .filter(submission => !submission.graded)
                        .map(submission => ({
                          ...submission,
                          title: assignment.title,
                          description: assignment.description,
                          course: course
                        }));

                    pendingAssignments.push(...nonGradedSubmissions);
                  } catch (error) {
                    console.error(`Error fetching submissions for assignment ${assignment.id}:`, error);
                  }
                }
              } catch (error) {
                console.error(`Error fetching assignments for lesson ${lesson.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching lessons for course ${course.id}:`, error);
          }
        }

        assignments.value = pendingAssignments;
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        loadingAssignments.value = false;
      }
    };

    // Update fetchStudentActivities method
    const fetchStudentActivities = async () => {
      if (!selectedCourseId.value) return;

      loadingStudentActivities.value = true;
      try {
        // Get all enrolled students for the course
        const courseDetailsResponse = await axios.get(`/courses/${selectedCourseId.value}`);
        const courseDetails = courseDetailsResponse.data || {};
        const enrolledStudents = safelyAccessProperty(courseDetails, 'course.enrolledStudents', []);

        // Get participation data
        const participationResponse = await axios.get(`/analytics/teacher/course/${selectedCourseId.value}/participation`);
        const participationData = participationResponse.data || [];

        // Combine data with safe property access
        studentActivities.value = enrolledStudents.map(student => {
          if (!student) return null;

          const participation = participationData.find(p => p && p.studentId === student.id) || {};
          return {
            ...student,
            course: safelyAccessProperty(courseDetails, 'course', {}),
            progress: safelyAccessProperty(participation, 'progress', 0),
            lastActivity: safelyAccessProperty(participation, 'lastActivity'),
            performance: getPerformanceLevel(safelyAccessProperty(participation, 'averageScore')),
            trend: safelyAccessProperty(participation, 'trend', 'stable')
          };
        }).filter(Boolean); // Filter out any null values
      } catch (error) {
        console.error('Error fetching student activities:', error);
        window.showError(error);
      } finally {
        loadingStudentActivities.value = false;
      }
    };

    const fetchAnalytics = async () => {
      if (!selectedCourseId.value) return;

      loadingAnalytics.value = true;
      try {
        // Get course performance
        const performanceResponse = await axios.get(`/analytics/teacher/course/${selectedCourseId.value}/performance`);
        const performanceData = performanceResponse.data;

        // Generate scores distribution data
        scoresData.value = generateScoresDistribution(performanceData.examScores || []);

        // Generate activity data (last 30 days)
        activityData.value = generateActivityData(performanceData.activityData || {});

        // Get difficult lessons
        const difficultLessonsResponse = await axios.get(`/analytics/teacher/course/${selectedCourseId.value}/difficult-lessons`);
        difficultLessons.value = difficultLessonsResponse.data || [];

        // Get struggling students
        const strugglingStudentsResponse = await axios.get(`/analytics/teacher/course/${selectedCourseId.value}/struggling-students`);
        strugglingStudents.value = strugglingStudentsResponse.data || [];
      } catch (error) {
        console.error('Error fetching analytics:', error);
        window.showError(error);
      } finally {
        loadingAnalytics.value = false;
      }
    };

    const calculateStats = () => {
      // Calculate total courses
      stats.totalCourses = courses.value.length;

      // Calculate total students (unique students across all courses)
      const uniqueStudents = new Set();
      courses.value.forEach(course => {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(student => {
            uniqueStudents.add(student.id);
          });
        }
      });
      stats.totalStudents = uniqueStudents.size;

      // Calculate active assignments
      stats.activeAssignments = assignments.value.length;

      // Calculate average progress
      let totalProgress = 0;
      let studentCount = 0;

      studentActivities.value.forEach(student => {
        if (student.progress) {
          totalProgress += student.progress;
          studentCount++;
        }
      });

      stats.averageProgress = studentCount > 0 ? Math.round(totalProgress / studentCount) : 0;
    };

    const getPerformanceLevel = (score) => {
      if (!score) return 'average';
      if (score >= 85) return 'excellent';
      if (score >= 70) return 'good';
      if (score >= 50) return 'average';
      return 'poor';
    };

    const generateScoresDistribution = (scores) => {
      // Create ranges: 0-10, 11-20, ..., 91-100
      const ranges = Array.from({ length: 10 }, (_, i) => `${i * 10 + 1}-${(i + 1) * 10}`);
      const distribution = ranges.map(range => {
        const [min, max] = range.split('-').map(Number);
        const count = scores.filter(score => score >= min && score <= max).length;
        return { range, count };
      });

      return distribution;
    };

    const generateActivityData = (activityData) => {
      // Generate data for the last 30 days
      const result = [];
      const now = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        result.push({
          date: dateString,
          views: activityData[dateString]?.views || 0,
          submissions: activityData[dateString]?.submissions || 0,
          completions: activityData[dateString]?.completions || 0
        });
      }

      return result;
    };

    const showCreateCourseModal = () => {
      createCourseModal.value.show();
    };

    const createCourse = async () => {
      isSubmitting.value = true;
      try {
        await axios.post('/courses', newCourse);
        window.toast.success('دوره جدید با موفقیت ایجاد شد.');
        createCourseModal.value.hide();

        // Reset form
        newCourse.title = '';
        newCourse.description = '';

        // Refresh courses
        await fetchCourses();
        calculateStats();
      } catch (error) {
        console.error('Error creating course:', error);
        window.showError(error);
      } finally {
        isSubmitting.value = false;
      }
    };

    const gradeAssignment = (assignment) => {
      // In a real application, navigate to grading page or show grading modal
      console.log('Grade assignment:', assignment);
    };

    const viewStudentProgress = (student) => {
      // In a real application, navigate to student progress page or show progress modal
      console.log('View progress:', student);
    };

    const sendMessageToStudent = (student) => {
      // In a real application, show message composer modal
      console.log('Send message to:', student);
    };

    const refreshData = async () => {
      await fetchData();
      if (activeTab.value === 'studentActivities') {
        await fetchStudentActivities();
      } else if (activeTab.value === 'analytics') {
        await fetchAnalytics();
      }
    };

    const getInitials = (student) => {
      if (!student) return 'N/A';

      const firstName = student.firstName || '';
      const lastName = student.lastName || '';

      const firstInitial = firstName ? firstName.charAt(0) : '';
      const lastInitial = lastName ? lastName.charAt(0) : '';

      return (firstInitial + lastInitial).toUpperCase();
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    };

    const getCourseTitle = (course) => {
      if (!course) return 'نامشخص';
      return course.title || 'نامشخص';
    };

    // Watchers
    watch(activeTab, (newTab) => {
      if (newTab === 'studentActivities' && selectedCourseId.value) {
        fetchStudentActivities();
      } else if (newTab === 'analytics' && selectedCourseId.value) {
        fetchAnalytics();
      }
    });

    watch(selectedCourseId, (newCourseId) => {
      if (newCourseId) {
        if (activeTab.value === 'studentActivities') {
          fetchStudentActivities();
        } else if (activeTab.value === 'analytics') {
          fetchAnalytics();
        }
      }
    });

    // Lifecycle hooks
    onMounted(() => {
      fetchData();
    });

    return {
      activeTab,
      loadingCourses,
      loadingAssignments,
      loadingStudentActivities,
      loadingAnalytics,
      isSubmitting,
      courses,
      assignments,
      studentActivities,
      selectedCourseId,
      selectedCourse,
      scoresData,
      activityData,
      difficultLessons,
      strugglingStudents,
      stats,
      newCourse,
      createCourseModal,
      formatDate,
      truncateText,
      getInitials,
      getStudentName,
      getCourseTitle,
      showCreateCourseModal,
      createCourse,
      gradeAssignment,
      viewStudentProgress,
      sendMessageToStudent,
      refreshData,
      fetchStudentActivities,
      fetchAnalytics
    };
  }
}
</script>

<style scoped>
.dashboard-title {
  margin-bottom: 1.5rem;
}

.dashboard-subtitle {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.course-card {
  transition: transform 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
}

.assignment-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #495057;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #495057;
}

.progress {
  height: 6px;
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
}
</style>