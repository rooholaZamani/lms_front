<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-user-graduate"></i>
        </div>
        <h1 class="modern-title">Student Activity Analysis</h1>
        <p class="modern-subtitle">Detailed analytics and progress tracking for individual students</p>
      </div>

      <!-- Student Selection -->
      <div class="modern-card animate-fade-in mb-4">
        <div class="modern-card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="fas fa-user-friends me-2"></i>
            Select Student
          </h5>
        </div>
        <div class="modern-card-body">
          <div class="row">
            <div class="col-md-6 modern-form-group">
              <label class="modern-form-label">Course</label>
              <select class="modern-form-control" v-model="selectedCourseId" @change="fetchStudentsForCourse">
                <option value="">Select a course</option>
                <option v-for="course in teachingCourses" :key="course.id" :value="course.id">
                  {{ course.title }}
                </option>
              </select>
            </div>
            <div class="col-md-6 modern-form-group">
              <label class="modern-form-label">Student</label>
              <select class="modern-form-control" v-model="selectedStudentId" @change="fetchStudentAnalytics" :disabled="!selectedCourseId">
                <option value="">Select a student</option>
                <option v-for="student in courseStudents" :key="student.studentId" :value="student.studentId">
                  {{ student.studentName }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <div v-if="selectedStudent && studentAnalytics" class="analytics-content">
          <!-- Student Overview -->
          <div class="modern-card animate-fade-in mb-4" style="animation-delay: 0.1s;">
            <div class="modern-card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="fas fa-chart-line me-2"></i>
                {{ selectedStudent.studentName }} - Overview
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="row">
                <div class="col-lg-8">
                  <div class="row">
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-primary">
                          <i class="fas fa-percentage"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.completionPercentage || 0 }}%</div>
                        <div class="modern-stat-label">Course Completion</div>
                      </div>
                    </div>
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-success">
                          <i class="fas fa-clipboard-check"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.examsTaken || 0 }}</div>
                        <div class="modern-stat-label">Exams Taken</div>
                      </div>
                    </div>
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-warning">
                          <i class="fas fa-star"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.averageExamScore || 0 }}</div>
                        <div class="modern-stat-label">Avg Exam Score</div>
                      </div>
                    </div>
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-info">
                          <i class="fas fa-dumbbell"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.exercisesTaken || 0 }}</div>
                        <div class="modern-stat-label">Exercises Done</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="progress-circle-container">
                    <div class="progress-circle" :class="getProgressClass(studentAnalytics.completionPercentage)">
                      <div class="progress-text">
                        <div class="progress-number">{{ studentAnalytics.completionPercentage || 0 }}%</div>
                        <div class="progress-label">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Charts -->
          <div class="row">
            <div class="col-lg-6 mb-4">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.2s;">
                <div class="modern-card-header bg-info text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    Exam Performance Trend
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="chart-container">
                    <LineChart
                        :width="500"
                        :height="300"
                        :data="examPerformanceData"
                        :margin="{ top: 20, right: 30, left: 20, bottom: 5 }"
                    >
                      <XAxis dataKey="examName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth="3" dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }} />
                      <Line type="monotone" dataKey="classAverage" stroke="#ffc107" strokeWidth="2" strokeDasharray="5 5" />
                    </LineChart>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6 mb-4">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.3s;">
                <div class="modern-card-header bg-warning text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-pie-chart me-2"></i>
                    Activity Distribution
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="chart-container">
                    <PieChart :width="500" :height="300">
                      <Pie
                          :data="activityDistributionData"
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          :label="renderCustomizedLabel"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                      >
                        <Cell v-for="(entry, index) in activityDistributionData" :key="`cell-${index}`" :fill="getActivityColor(index)" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Performance -->
          <div class="modern-card animate-fade-in mb-4" style="animation-delay: 0.4s;">
            <div class="modern-card-header bg-secondary text-white">
              <h5 class="mb-0">
                <i class="fas fa-list-alt me-2"></i>
                Detailed Performance Analysis
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="row">
                <div class="col-lg-6">
                  <h6 class="section-title">
                    <i class="fas fa-clock me-2"></i>
                    Time Analysis
                  </h6>
                  <div class="time-analysis">
                    <div class="time-item">
                      <div class="time-label">Average Time per Lesson</div>
                      <div class="time-value">{{ formatTime(studentAnalytics.averageTimePerLesson) }}</div>
                    </div>
                    <div class="time-item">
                      <div class="time-label">Average Time per Exam</div>
                      <div class="time-value">{{ formatTime(studentAnalytics.averageTimePerExam) }}</div>
                    </div>
                    <div class="time-item">
                      <div class="time-label">Total Study Time</div>
                      <div class="time-value">{{ formatTime(studentAnalytics.totalStudyTime) }}</div>
                    </div>
                    <div class="time-item">
                      <div class="time-label">Last Activity</div>
                      <div class="time-value">{{ formatDate(studentAnalytics.lastAccessed) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-6">
                  <h6 class="section-title">
                    <i class="fas fa-trophy me-2"></i>
                    Achievements & Progress
                  </h6>
                  <div class="achievements">
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.completedLessons >= studentAnalytics.totalLessons }">
                      <i class="fas fa-medal"></i>
                      <span>All Lessons Completed</span>
                    </div>
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.averageExamScore >= 80 }">
                      <i class="fas fa-star"></i>
                      <span>High Performer (80%+ avg)</span>
                    </div>
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.exercisesTaken >= 5 }">
                      <i class="fas fa-dumbbell"></i>
                      <span>Exercise Enthusiast</span>
                    </div>
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.streak >= 7 }">
                      <i class="fas fa-fire"></i>
                      <span>7-Day Streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Learning Progress Timeline -->
          <div class="modern-card animate-fade-in mb-4" style="animation-delay: 0.5s;">
            <div class="modern-card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-timeline me-2"></i>
                Learning Progress Timeline
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="chart-container">
                <AreaChart
                    :width="800"
                    :height="400"
                    :data="progressTimelineData"
                    :margin="{ top: 20, right: 30, left: 20, bottom: 5 }"
                >
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                      type="monotone"
                      dataKey="completionPercentage"
                      stroke="#667eea"
                      fillOpacity={1}
                      fill="url(#progressGradient)"
                  />
                </AreaChart>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="modern-card animate-fade-in" style="animation-delay: 0.6s;">
            <div class="modern-card-header bg-info text-white">
              <h5 class="mb-0">
                <i class="fas fa-history me-2"></i>
                Recent Activity
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="activity-timeline">
                <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
                  <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.description }}</div>
                    <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
                  </div>
                  <div class="activity-score" v-if="activity.score">
                    <span class="modern-badge modern-badge-success">{{ activity.score }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <div class="modern-logo large secondary mb-4">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h4 class="text-muted mb-3">Select a Student</h4>
          <p class="text-muted mb-4">
            Choose a course and student to view detailed activity analysis and progress tracking.
          </p>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'StudentActivities',
  components: {
    LoadingSpinner,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
  },
  mixins: [formMixin],
  setup() {
    const { formatDate, formatTime } = useFormatters();
    return { formatDate, formatTime };
  },
  data() {
    return {
      loading: false,
      teachingCourses: [],
      courseStudents: [],
      selectedCourseId: '',
      selectedStudentId: '',
      selectedStudent: null,
      studentAnalytics: null,
      examPerformanceData: [],
      activityDistributionData: [],
      progressTimelineData: [],
      recentActivities: []
    };
  },
  async created() {
    await this.fetchTeachingCourses();
  },
  methods: {
    async fetchTeachingCourses() {
      try {
        const response = await axios.get('/courses/teaching');
        this.teachingCourses = response.data;
      } catch (error) {
        console.error('Error fetching teaching courses:', error);
        this.showErrorToast('Error loading courses');
      }
    },

    async fetchStudentsForCourse() {
      if (!this.selectedCourseId) {
        this.courseStudents = [];
        return;
      }

      try {
        const response = await axios.get(`/analytics/teacher/course/${this.selectedCourseId}/participation`);
        this.courseStudents = response.data;
      } catch (error) {
        console.error('Error fetching course students:', error);
        this.showErrorToast('Error loading students');
      }
    },

    async fetchStudentAnalytics() {
      if (!this.selectedStudentId || !this.selectedCourseId) return;

      this.loading = true;
      try {
        this.selectedStudent = this.courseStudents.find(s => s.studentId == this.selectedStudentId);

        // Note: These APIs might need to be created or modified to accept studentId parameter
        const [performanceResponse, comparisonResponse] = await Promise.all([
          axios.get(`/analytics/student/${this.selectedStudentId}/performance`),
          axios.get(`/analytics/course/${this.selectedCourseId}/student-comparison?studentId=${this.selectedStudentId}`)
        ]);

        this.studentAnalytics = {
          ...this.selectedStudent,
          ...performanceResponse.data,
          ...comparisonResponse.data
        };

        await this.generateChartData();
        await this.fetchRecentActivities();
      } catch (error) {
        console.error('Error fetching student analytics:', error);
        this.showErrorToast('Error loading student analytics');
      } finally {
        this.loading = false;
      }
    },

    async generateChartData() {
      // Generate exam performance data
      // Note: This might need a new API endpoint to get student's exam history
      this.examPerformanceData = [
        { examName: 'Exam 1', score: 85, classAverage: 78 },
        { examName: 'Exam 2', score: 92, classAverage: 82 },
        { examName: 'Exam 3', score: 78, classAverage: 75 },
        { examName: 'Exam 4', score: 88, classAverage: 80 }
      ];

      // Generate activity distribution data
      this.activityDistributionData = [
        { name: 'Lessons Completed', value: this.studentAnalytics.completedLessons || 0 },
        { name: 'Exams Taken', value: this.studentAnalytics.examsTaken || 0 },
        { name: 'Exercises Done', value: this.studentAnalytics.exercisesTaken || 0 },
        { name: 'Content Viewed', value: this.studentAnalytics.viewedContent || 0 }
      ];

      // Generate progress timeline data
      // Note: This would need historical progress data
      this.progressTimelineData = this.generateProgressTimeline();
    },

    generateProgressTimeline() {
      const timeline = [];
      const today = new Date();

      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        timeline.push({
          date: date.toLocaleDateString(),
          completionPercentage: Math.min(100, (30 - i) * 3 + Math.random() * 10)
        });
      }

      return timeline;
    },

    async fetchRecentActivities() {
      // Note: This would need a new API endpoint for student activity history
      this.recentActivities = [
        {
          type: 'LESSON_COMPLETION',
          description: 'Completed lesson: Variables and Data Types',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          score: null
        },
        {
          type: 'EXAM_SUBMISSION',
          description: 'Submitted exam: Python Basics Quiz',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          score: 88
        },
        {
          type: 'EXERCISE_COMPLETION',
          description: 'Completed exercise: Quick Python Practice',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          score: 95
        },
        {
          type: 'CONTENT_VIEW',
          description: 'Viewed content: Introduction to Functions',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          score: null
        }
      ];
    },

    getProgressClass(percentage) {
      if (percentage >= 90) return 'excellent';
      if (percentage >= 70) return 'good';
      if (percentage >= 50) return 'average';
      return 'poor';
    },

    getActivityColor(index) {
      const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b'];
      return colors[index % colors.length];
    },

    getActivityIconClass(type) {
      switch (type) {
        case 'LESSON_COMPLETION': return 'activity-lesson';
        case 'EXAM_SUBMISSION': return 'activity-exam';
        case 'EXERCISE_COMPLETION': return 'activity-exercise';
        case 'CONTENT_VIEW': return 'activity-content';
        default: return 'activity-default';
      }
    },

    getActivityIcon(type) {
      switch (type) {
        case 'LESSON_COMPLETION': return 'fas fa-book-open';
        case 'EXAM_SUBMISSION': return 'fas fa-clipboard-check';
        case 'EXERCISE_COMPLETION': return 'fas fa-dumbbell';
        case 'CONTENT_VIEW': return 'fas fa-eye';
        default: return 'fas fa-circle';
      }
    },

    formatRelativeTime(timestamp) {
      const now = new Date();
      const diff = now - new Date(timestamp);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return 'Just now';
    },

    renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

      return (
          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
          </text>
      );
    }
  }
}
</script>

<style scoped>
.progress-circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 8px solid;
  background: rgba(255, 255, 255, 0.1);
}

.progress-circle.excellent {
  border-color: #27ae60;
  color: #27ae60;
}

.progress-circle.good {
  border-color: #3498db;
  color: #3498db;
}

.progress-circle.average {
  border-color: #f39c12;
  color: #f39c12;
}

.progress-circle.poor {
  border-color: #e74c3c;
  color: #e74c3c;
}

.progress-text {
  text-align: center;
}

.progress-number {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.progress-label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.chart-container {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
}

.time-analysis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.time-label {
  font-weight: 600;
  color: #495057;
}

.time-value {
  font-weight: 700;
  color: #667eea;
}

.achievements {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 8px;
  color: #6c757d;
  transition: all 0.3s ease;
}

.achievement-item.achieved {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border-left: 4px solid #27ae60;
}

.achievement-item i {
  font-size: 1.2rem;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: #667eea;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.activity-icon.activity-lesson {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.activity-icon.activity-exam {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.activity-icon.activity-exercise {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.activity-icon.activity-content {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.activity-icon.activity-default {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.85rem;
  color: #6c757d;
}

.activity-score {
  margin-left: auto;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    overflow-x: scroll;
  }

  .time-item,
  .activity-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .progress-circle {
    width: 100px;
    height: 100px;
  }

  .progress-number {
    font-size: 1.5rem;
  }
}
</style>