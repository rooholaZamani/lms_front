<template>
  <div class="modern-page-bg danger-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo danger">
          <i class="fas fa-chart-line"></i>
        </div>
        <h1 class="modern-title">تحلیل عملکرد</h1>
        <p class="modern-subtitle">بررسی و تحلیل جامع عملکرد دانش‌آموزان و دوره‌ها</p>
      </div>

      <!-- Course Selection and Controls -->
      <div class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.2s;">
        <div class="row align-items-center">
          <div class="col-md-4 modern-form-group">
            <label for="courseSelect" class="modern-form-label">انتخاب دوره برای تحلیل:</label>
            <select
                class="modern-form-control"
                id="courseSelect"
                v-model="selectedCourse"
                @change="handleCourseChange">
              <option value="">انتخاب کنید...</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="col-md-3 modern-form-group">
            <label for="periodSelect" class="modern-form-label">بازه زمانی:</label>
            <select class="modern-form-control" id="periodSelect" v-model="selectedPeriod" @change="handlePeriodChange">
              <option value="week">هفته گذشته</option>
              <option value="month">ماه گذشته</option>
              <option value="quarter">سه ماه گذشته</option>
              <option value="all">تمام مدت</option>
            </select>
          </div>
          <div class="col-md-3 modern-form-group">
            <label for="analysisType" class="modern-form-label">نوع تحلیل:</label>
            <select class="modern-form-control" id="analysisType" v-model="analysisType" @change="updateAnalysisView">
              <option value="overview">نمای کلی</option>
              <option value="detailed">تحلیل تفصیلی</option>
              <option value="comparison">مقایسه‌ای</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="modern-btn modern-btn-outline text-white w-100" @click="exportReport">
              <i class="fas fa-download me-1"></i> گزارش
            </button>
          </div>
        </div>
      </div>

      <template v-if="selectedCourse">
        <!-- Advanced Key Metrics -->
        <div class="row mb-4">
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
              <div class="modern-stat-icon text-primary">
                <i class="fas fa-users"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.totalStudents }}</div>
              <div class="modern-stat-label">کل دانش‌آموزان</div>
              <div class="modern-stat-trend" v-if="metrics.studentsTrend">
                <i :class="getTrendIcon(metrics.studentsTrend)" class="me-1"></i>
                {{ Math.abs(metrics.studentsTrend) }}% نسبت به قبل
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.4s;">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.averageProgress }}%</div>
              <div class="modern-stat-label">میانگین پیشرفت</div>
              <div class="modern-stat-trend" v-if="metrics.progressTrend">
                <i :class="getTrendIcon(metrics.progressTrend)" class="me-1"></i>
                {{ Math.abs(metrics.progressTrend) }}%
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.5s;">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-star"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.averageScore }}</div>
              <div class="modern-stat-label">میانگین نمرات</div>
              <div class="modern-stat-performance" :class="getPerformanceClass(metrics.averageScore)">
                {{ getPerformanceLabel(metrics.averageScore) }}
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.6s;">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.completionRate }}%</div>
              <div class="modern-stat-label">نرخ تکمیل</div>
              <div class="modern-stat-subtitle">
                {{ metrics.completedStudents }} از {{ metrics.totalStudents }} نفر
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Analytics Row -->
        <div class="row mb-4">
          <!-- Performance Distribution Chart -->
          <div class="col-lg-8 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.7s;">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-chart-bar text-primary me-2"></i>
                  توزیع عملکرد دانش‌آموزان
                </h5>
                <div class="chart-controls">
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'scores' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'scores'; updateChart()">
                    نمرات
                  </button>
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'progress' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'progress'; updateChart()">
                    پیشرفت
                  </button>
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'participation' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'participation'; updateChart()">
                    مشارکت
                  </button>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="performanceChart" width="400" height="250"></canvas>
              </div>

              <!-- Chart Summary -->
              <div class="chart-summary mt-3">
                <div class="row text-center">
                  <div class="col-3">
                    <div class="summary-item">
                      <div class="summary-value text-success">{{ distributionData.excellent }}%</div>
                      <div class="summary-label">عالی (90+)</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="summary-item">
                      <div class="summary-value text-info">{{ distributionData.good }}%</div>
                      <div class="summary-label">خوب (70-89)</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="summary-item">
                      <div class="summary-value text-warning">{{ distributionData.average }}%</div>
                      <div class="summary-label">متوسط (50-69)</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="summary-item">
                      <div class="summary-value text-danger">{{ distributionData.poor }}%</div>
                      <div class="summary-label">ضعیف (<50)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Insights -->
          <div class="col-lg-4 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.8s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-lightbulb text-warning me-2"></i>
                بینش‌های سریع
              </h5>

              <div class="insights-list">
                <div v-for="insight in quickInsights" :key="insight.id" class="insight-item">
                  <div class="insight-icon" :class="insight.iconClass">
                    <i :class="insight.icon"></i>
                  </div>
                  <div class="insight-content">
                    <div class="insight-title">{{ insight.title }}</div>
                    <div class="insight-description">{{ insight.description }}</div>
                  </div>
                </div>
              </div>

              <!-- Engagement Score -->
              <div class="engagement-score mt-4">
                <h6 class="mb-3">امتیاز مشارکت کلی</h6>
                <div class="score-circle" :class="getEngagementClass(engagementScore)">
                  <div class="score-content">
                    <div class="score-number">{{ engagementScore }}</div>
                    <div class="score-label">از 100</div>
                  </div>
                </div>
                <div class="score-description mt-2">
                  <small>{{ getEngagementDescription(engagementScore) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Analysis Section -->
        <div class="row mb-4">
          <!-- Advanced Difficult Lessons -->
          <div class="col-lg-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.9s;">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                  درس‌های چالش‌برانگیز
                </h5>
                <button class="modern-btn modern-btn-outline modern-btn-sm" @click="analyzeLessonDifficulty">
                  <i class="fas fa-analytics me-1"></i> تحلیل عمیق
                </button>
              </div>

              <div v-if="difficultLessons.length === 0" class="text-center py-4">
                <div class="modern-logo large success mb-3">
                  <i class="fas fa-check-circle"></i>
                </div>
                <p class="text-muted">درس چالش‌برانگیزی یافت نشد</p>
              </div>

              <div v-else>
                <div v-for="lesson in difficultLessons" :key="lesson.id" class="lesson-difficulty-item mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="lesson-info">
                      <h6 class="lesson-title mb-1">{{ lesson.title }}</h6>
                      <div class="lesson-meta">
                        <span class="meta-item">
                          <i class="fas fa-users me-1"></i>
                          {{ lesson.totalAttempts }} تلاش
                        </span>
                        <span class="meta-item">
                          <i class="fas fa-clock me-1"></i>
                          {{ lesson.averageTime }} دقیقه
                        </span>
                      </div>
                    </div>
                    <div class="difficulty-badge">
                      <span class="modern-badge" :class="getDifficultyBadgeClass(lesson.difficultyScore)">
                        {{ lesson.difficultyScore }}% سختی
                      </span>
                    </div>
                  </div>

                  <div class="difficulty-metrics">
                    <div class="metric-row">
                      <div class="metric-item">
                        <span class="metric-label">نرخ شکست</span>
                        <div class="metric-bar">
                          <div class="metric-fill bg-danger" :style="`width: ${lesson.failureRate}%`"></div>
                        </div>
                        <span class="metric-value">{{ lesson.failureRate }}%</span>
                      </div>
                    </div>

                    <div class="metric-row">
                      <div class="metric-item">
                        <span class="metric-label">تلاش مجدد</span>
                        <div class="metric-bar">
                          <div class="metric-fill bg-warning" :style="`width: ${(lesson.retryCount / lesson.totalAttempts) * 100}%`"></div>
                        </div>
                        <span class="metric-value">{{ lesson.retryCount }}</span>
                      </div>
                    </div>

                    <div class="metric-row">
                      <div class="metric-item">
                        <span class="metric-label">زمان بیشتر از حد</span>
                        <div class="metric-bar">
                          <div class="metric-fill bg-info" :style="`width: ${lesson.overtimePercentage}%`"></div>
                        </div>
                        <span class="metric-value">{{ lesson.overtimePercentage }}%</span>
                      </div>
                    </div>
                  </div>

                  <div class="lesson-actions mt-3">
                    <button class="modern-btn modern-btn-primary modern-btn-sm me-2"
                            @click="viewLessonDetails(lesson)">
                      <i class="fas fa-eye me-1"></i> جزئیات
                    </button>
                    <button class="modern-btn modern-btn-info modern-btn-sm me-2"
                            @click="generateRecommendations(lesson)">
                      <i class="fas fa-lightbulb me-1"></i> پیشنهادات
                    </button>
                    <button class="modern-btn modern-btn-secondary modern-btn-sm"
                            @click="contactStrugglingStudents(lesson)">
                      <i class="fas fa-envelope me-1"></i> ارتباط با دانش‌آموزان
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Struggling Students -->
          <div class="col-lg-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 1s;">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-users text-info me-2"></i>
                  دانش‌آموزان نیازمند کمک
                </h5>
                <div class="struggling-controls">
                  <select class="form-select form-select-sm" v-model="strugglingFilter" @change="filterStrugglingStudents">
                    <option value="all">همه</option>
                    <option value="critical">بحرانی</option>
                    <option value="moderate">متوسط</option>
                    <option value="mild">خفیف</option>
                  </select>
                </div>
              </div>

              <div v-if="filteredStrugglingStudents.length === 0" class="text-center py-4">
                <div class="modern-logo large success mb-3">
                  <i class="fas fa-thumbs-up"></i>
                </div>
                <p class="text-muted">همه دانش‌آموزان عملکرد مناسبی دارند</p>
              </div>

              <div v-else class="struggling-students-list">
                <div v-for="student in filteredStrugglingStudents" :key="student.id"
                     class="struggling-student-item">
                  <div class="student-header">
                    <div class="student-avatar me-3">
                      {{ getStudentInitials(student) }}
                    </div>
                    <div class="student-main-info flex-grow-1">
                      <div class="student-name">{{ getStudentName(student) }}</div>
                      <div class="student-status">
                        <span class="status-badge" :class="getStrugglingLevelClass(student.strugglingLevel)">
                          {{ getStrugglingLevelText(student.strugglingLevel) }}
                        </span>
                      </div>
                    </div>
                    <div class="student-priority">
                      <div class="priority-indicator" :class="getPriorityClass(student.priority)">
                        {{ student.priority }}
                      </div>
                    </div>
                  </div>

                  <div class="student-metrics">
                    <div class="metrics-grid">
                      <div class="metric-card">
                        <div class="metric-value" :class="getScoreClass(student.averageScore)">
                          {{ student.averageScore }}
                        </div>
                        <div class="metric-label">میانگین نمره</div>
                      </div>
                      <div class="metric-card">
                        <div class="metric-value text-info">{{ student.progress }}%</div>
                        <div class="metric-label">پیشرفت</div>
                      </div>
                      <div class="metric-card">
                        <div class="metric-value text-warning">{{ student.missedDeadlines }}</div>
                        <div class="metric-label">ضرب‌الاجل از دست رفته</div>
                      </div>
                      <div class="metric-card">
                        <div class="metric-value text-secondary">{{ student.inactivityDays }}</div>
                        <div class="metric-label">روز عدم فعالیت</div>
                      </div>
                    </div>

                    <div class="progress-trend mt-3">
                      <div class="trend-title">روند پیشرفت:</div>
                      <div class="trend-chart">
                        <div v-for="(point, index) in student.progressTrend" :key="index"
                             class="trend-point"
                             :style="`height: ${point}%; background-color: ${getTrendColor(point, index)}`">
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="student-actions">
                    <button class="modern-btn modern-btn-primary modern-btn-sm"
                            @click="createInterventionPlan(student)">
                      <i class="fas fa-clipboard-list me-1"></i> برنامه مداخله
                    </button>
                    <button class="modern-btn modern-btn-info modern-btn-sm"
                            @click="sendEncouragement(student)">
                      <i class="fas fa-heart me-1"></i> تشویق
                    </button>
                    <button class="modern-btn modern-btn-warning modern-btn-sm"
                            @click="scheduleFollowUp(student)">
                      <i class="fas fa-calendar-check me-1"></i> پیگیری
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Participation and Engagement Analysis -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="modern-card animate-slide-up" style="animation-delay: 1.1s;">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-chart-pie text-success me-2"></i>
                  تحلیل مشارکت و درگیری
                </h5>
                <div class="engagement-controls">
                  <button class="modern-btn modern-btn-sm modern-btn-outline" @click="generateEngagementReport">
                    <i class="fas fa-file-chart me-1"></i> گزارش مشارکت
                  </button>
                </div>
              </div>

              <div class="engagement-analysis">
                <div class="row">
                  <div class="col-lg-8">
                    <!-- Participation Timeline -->
                    <h6 class="mb-3">
                      <i class="fas fa-calendar-alt me-2"></i>
                      تایم‌لاین مشارکت
                    </h6>
                    <div class="participation-timeline">
                      <div v-for="activity in participationTimeline" :key="activity.id"
                           class="timeline-item">
                        <div class="timeline-date">{{ formatDate(activity.date) }}</div>
                        <div class="timeline-content">
                          <div class="activity-type" :class="getActivityTypeClass(activity.type)">
                            <i :class="getActivityIcon(activity.type)"></i>
                            {{ getActivityTypeText(activity.type) }}
                          </div>
                          <div class="activity-details">
                            <strong>{{ activity.count }}</strong> دانش‌آموز شرکت کرده
                            <span class="participation-rate" :class="getParticipationRateClass(activity.participationRate)">
                              ({{ activity.participationRate }}% از کل)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-lg-4">
                    <!-- Engagement Metrics -->
                    <h6 class="mb-3">
                      <i class="fas fa-gauge me-2"></i>
                      معیارهای درگیری
                    </h6>
                    <div class="engagement-metrics">
                      <div class="engagement-metric">
                        <div class="metric-header">
                          <span class="metric-name">مشارکت در آزمون‌ها</span>
                          <span class="metric-score" :class="getEngagementScoreClass(engagementMetrics.examParticipation)">
                            {{ engagementMetrics.examParticipation }}%
                          </span>
                        </div>
                        <div class="metric-progress">
                          <div class="progress-fill"
                               :class="getEngagementScoreClass(engagementMetrics.examParticipation)"
                               :style="`width: ${engagementMetrics.examParticipation}%`"></div>
                        </div>
                      </div>

                      <div class="engagement-metric">
                        <div class="metric-header">
                          <span class="metric-name">ارسال تکالیف</span>
                          <span class="metric-score" :class="getEngagementScoreClass(engagementMetrics.assignmentSubmission)">
                            {{ engagementMetrics.assignmentSubmission }}%
                          </span>
                        </div>
                        <div class="metric-progress">
                          <div class="progress-fill"
                               :class="getEngagementScoreClass(engagementMetrics.assignmentSubmission)"
                               :style="`width: ${engagementMetrics.assignmentSubmission}%`"></div>
                        </div>
                      </div>

                      <div class="engagement-metric">
                        <div class="metric-header">
                          <span class="metric-name">فعالیت در چت</span>
                          <span class="metric-score" :class="getEngagementScoreClass(engagementMetrics.chatActivity)">
                            {{ engagementMetrics.chatActivity }}%
                          </span>
                        </div>
                        <div class="metric-progress">
                          <div class="progress-fill"
                               :class="getEngagementScoreClass(engagementMetrics.chatActivity)"
                               :style="`width: ${engagementMetrics.chatActivity}%`"></div>
                        </div>
                      </div>

                      <div class="engagement-metric">
                        <div class="metric-header">
                          <span class="metric-name">مشاهده محتوا</span>
                          <span class="metric-score" :class="getEngagementScoreClass(engagementMetrics.contentConsumption)">
                            {{ engagementMetrics.contentConsumption }}%
                          </span>
                        </div>
                        <div class="metric-progress">
                          <div class="progress-fill"
                               :class="getEngagementScoreClass(engagementMetrics.contentConsumption)"
                               :style="`width: ${engagementMetrics.contentConsumption}%`"></div>
                        </div>
                      </div>
                    </div>

                    <!-- Overall Engagement Score -->
                    <div class="overall-engagement mt-4">
                      <h6 class="text-center mb-3">امتیاز کلی درگیری</h6>
                      <div class="engagement-circle" :class="getEngagementClass(overallEngagement)">
                        <div class="engagement-score-text">
                          <div class="score">{{ overallEngagement }}</div>
                          <div class="label">از 100</div>
                        </div>
                      </div>
                      <div class="engagement-description text-center mt-2">
                        <small>{{ getEngagementDescription(overallEngagement) }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State for No Course Selected -->
      <div v-else class="modern-card animate-slide-up" style="animation-delay: 0.3s;">
        <div class="text-center py-5">
          <div class="modern-logo large secondary mb-4">
            <i class="fas fa-chart-bar"></i>
          </div>
          <h4>تحلیل عملکرد پیشرفته</h4>
          <p class="text-muted mb-4">
            لطفاً یک دوره انتخاب کنید تا تحلیل جامع عملکرد نمایش داده شود.
          </p>
          <div class="empty-state-features">
            <div class="feature-list">
              <div class="feature-item">
                <i class="fas fa-chart-line text-primary"></i>
                <span>تحلیل عمیق عملکرد دانش‌آموزان</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-users text-success"></i>
                <span>شناسایی دانش‌آموزان نیازمند کمک</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>تشخیص درس‌های چالش‌برانگیز</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-chart-pie text-info"></i>
                <span>معیارهای مشارکت و درگیری</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="text-center mt-4">
        <button class="modern-btn modern-btn-outline text-white me-3" @click="refreshData">
          <i class="fas fa-sync-alt me-1"></i> بروزرسانی اطلاعات
        </button>
        <button v-if="selectedCourse" class="modern-btn modern-btn-success" @click="generateComprehensiveReport">
          <i class="fas fa-download me-1"></i> گزارش جامع دوره
        </button>
      </div>

      <!-- Modals and Additional Components -->
      <!-- Lesson Details Modal -->
      <div class="modal fade" id="lessonDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-book me-2"></i>
                تحلیل تفصیلی درس: {{ selectedLesson?.title }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" v-if="selectedLesson">
              <!-- Lesson analysis content -->
              <div class="lesson-analysis">
                <div class="row">
                  <div class="col-md-6">
                    <h6>آمار کلی</h6>
                    <div class="stats-list">
                      <div class="stat-row">
                        <span>تعداد کل دانش‌آموزان:</span>
                        <strong>{{ selectedLesson.totalStudents }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>تعداد تلاش‌ها:</span>
                        <strong>{{ selectedLesson.totalAttempts }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>نرخ موفقیت:</span>
                        <strong class="text-success">{{ 100 - selectedLesson.failureRate }}%</strong>
                      </div>
                      <div class="stat-row">
                        <span>میانگین زمان:</span>
                        <strong>{{ selectedLesson.averageTime }} دقیقه</strong>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6>پیشنهادات بهبود</h6>
                    <div class="recommendations-list">
                      <div v-for="recommendation in selectedLesson.recommendations"
                           :key="recommendation.id" class="recommendation-item">
                        <div class="recommendation-icon">
                          <i :class="recommendation.icon"></i>
                        </div>
                        <div class="recommendation-text">{{ recommendation.text }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
              <button type="button" class="btn btn-primary" @click="implementRecommendations">
                <i class="fas fa-check me-1"></i>
                اعمال پیشنهادات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useAnalytics } from '@/composables/useAnalytics.js';
import { useFormatters } from '@/composables/useFormatters.js';
import axios from 'axios';

export default {
  name: 'PerformanceAnalysis',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate } = useFormatters();
    const {
      loading,
      error,
      coursePerformance,
      topPerformers,
      strugglingStudents,
      difficultLessons,
      participationMetrics,
      fetchTeacherAnalytics,
      fetchCoursePerformance,
      fetchParticipationMetrics
    } = useAnalytics();

    // State
    const selectedCourse = ref('');
    const selectedPeriod = ref('month');
    const analysisType = ref('overview');
    const chartType = ref('scores');
    const strugglingFilter = ref('all');
    const performanceChart = ref(null);
    const selectedLesson = ref(null);

    const courses = ref([]);

    // Computed metrics
    const metrics = computed(() => ({
      totalStudents: coursePerformance.value.studentCount || 0,
      averageProgress: Math.round(coursePerformance.value.averageProgress || 0),
      averageScore: Math.round(coursePerformance.value.averageExamScore || 0),
      completionRate: Math.round(coursePerformance.value.completionRate || 0),
      completedStudents: Math.round((coursePerformance.value.completionRate || 0) * (coursePerformance.value.studentCount || 0) / 100),
      studentsTrend: Math.floor(Math.random() * 20) - 10, // Mock trend data
      progressTrend: Math.floor(Math.random() * 15) - 7,
      passingRate: Math.round(coursePerformance.value.passingRate || 0)
    }));

    // Distribution data for charts
    const distributionData = ref({
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    });

    // Quick insights
    const quickInsights = ref([]);

    // Engagement data
    const engagementScore = ref(0);
    const overallEngagement = ref(0);
    const engagementMetrics = ref({
      examParticipation: 0,
      assignmentSubmission: 0,
      chatActivity: 0,
      contentConsumption: 0
    });

    // Participation timeline
    const participationTimeline = ref([]);

    // Filtered struggling students
    const filteredStrugglingStudents = computed(() => {
      if (strugglingFilter.value === 'all') {
        return strugglingStudents.value;
      }
      return strugglingStudents.value.filter(student =>
          student.strugglingLevel === strugglingFilter.value
      );
    });

    // Methods
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const handleCourseChange = async () => {
      if (selectedCourse.value) {
        await fetchAnalytics();
      }
    };

    const handlePeriodChange = async () => {
      if (selectedCourse.value) {
        await fetchAnalytics();
      }
    };

    const fetchAnalytics = async () => {
      if (!selectedCourse.value) return;

      try {
        const analytics = await fetchTeacherAnalytics(selectedCourse.value);

        if (analytics) {
          calculateDistributionData();
          generateQuickInsights();
          calculateEngagementMetrics();
          generateParticipationTimeline();

          await nextTick();
          initializeChart();
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        window.toast?.error('خطا در دریافت تحلیل‌های عملکرد');
      }
    };

    const calculateDistributionData = () => {
      // Mock distribution calculation - in real app, calculate from actual data
      const total = metrics.value.totalStudents;
      if (total === 0) {
        distributionData.value = { excellent: 0, good: 0, average: 0, poor: 0 };
        return;
      }

      const avgScore = metrics.value.averageScore;

      // Generate realistic distribution based on average score
      if (avgScore >= 85) {
        distributionData.value = { excellent: 35, good: 40, average: 20, poor: 5 };
      } else if (avgScore >= 75) {
        distributionData.value = { excellent: 20, good: 45, average: 25, poor: 10 };
      } else if (avgScore >= 65) {
        distributionData.value = { excellent: 10, good: 30, average: 40, poor: 20 };
      } else {
        distributionData.value = { excellent: 5, good: 20, average: 35, poor: 40 };
      }
    };

    const generateQuickInsights = () => {
      quickInsights.value = [];

      const avgScore = metrics.value.averageScore;
      const completionRate = metrics.value.completionRate;
      const strugglingCount = strugglingStudents.value.length;

      if (avgScore >= 85) {
        quickInsights.value.push({
          id: 'high_performance',
          icon: 'fas fa-trophy',
          iconClass: 'insight-icon-success',
          title: 'عملکرد عالی',
          description: 'دانش‌آموزان عملکرد بسیار خوبی دارند'
        });
      } else if (avgScore < 65) {
        quickInsights.value.push({
          id: 'low_performance',
          icon: 'fas fa-exclamation-triangle',
          iconClass: 'insight-icon-warning',
          title: 'نیاز به بهبود',
          description: 'میانگین نمرات پایین‌تر از حد انتظار است'
        });
      }

      if (completionRate >= 80) {
        quickInsights.value.push({
          id: 'high_completion',
          icon: 'fas fa-check-circle',
          iconClass: 'insight-icon-success',
          title: 'نرخ تکمیل بالا',
          description: 'اکثر دانش‌آموزان دوره را تکمیل می‌کنند'
        });
      }

      if (strugglingCount > 0) {
        quickInsights.value.push({
          id: 'struggling_students',
          icon: 'fas fa-hands-helping',
          iconClass: 'insight-icon-info',
          title: 'نیاز به توجه',
          description: `${strugglingCount} دانش‌آموز نیاز به کمک دارند`
        });
      }

      if (difficultLessons.value.length > 0) {
        quickInsights.value.push({
          id: 'difficult_lessons',
          icon: 'fas fa-brain',
          iconClass: 'insight-icon-warning',
          title: 'درس‌های چالش‌برانگیز',
          description: `${difficultLessons.value.length} درس نیاز به بازنگری دارد`
        });
      }
    };

    const calculateEngagementMetrics = () => {
      // Mock engagement calculation - in real app, calculate from actual participation data
      const baseEngagement = Math.max(30, Math.min(95, metrics.value.averageProgress + Math.floor(Math.random() * 20) - 10));

      engagementMetrics.value = {
        examParticipation: Math.max(40, baseEngagement + Math.floor(Math.random() * 20) - 10),
        assignmentSubmission: Math.max(50, baseEngagement + Math.floor(Math.random() * 15) - 7),
        chatActivity: Math.max(20, baseEngagement - 20 + Math.floor(Math.random() * 30) - 15),
        contentConsumption: Math.max(60, baseEngagement + Math.floor(Math.random() * 10) - 5)
      };

      const totalEngagement = Object.values(engagementMetrics.value).reduce((sum, val) => sum + val, 0);
      overallEngagement.value = Math.round(totalEngagement / 4);
      engagementScore.value = overallEngagement.value;
    };

    const generateParticipationTimeline = () => {
      // Mock timeline data - in real app, fetch from participation API
      const now = new Date();
      participationTimeline.value = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const totalStudents = metrics.value.totalStudents;
        const participationRate = Math.max(40, Math.min(95, 70 + Math.floor(Math.random() * 40) - 20));
        const count = Math.round((participationRate / 100) * totalStudents);

        participationTimeline.value.push({
          id: i,
          date: date.toISOString(),
          type: i % 3 === 0 ? 'exam' : i % 2 === 0 ? 'assignment' : 'lesson',
          count,
          participationRate
        });
      }
    };

    const initializeChart = () => {
      const canvas = performanceChart.value;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      // Simple chart implementation (in real app, use Chart.js or similar)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw distribution chart
      const data = distributionData.value;
      const colors = ['#28a745', '#17a2b8', '#ffc107', '#dc3545'];
      const labels = ['عالی', 'خوب', 'متوسط', 'ضعیف'];
      const values = [data.excellent, data.good, data.average, data.poor];

      let startAngle = 0;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      values.forEach((value, index) => {
        const sliceAngle = (value / 100) * 2 * Math.PI;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();

        startAngle += sliceAngle;
      });
    };

    const updateAnalysisView = () => {
      // Update view based on analysis type
      if (selectedCourse.value) {
        fetchAnalytics();
      }
    };

    const updateChart = () => {
      if (selectedCourse.value) {
        nextTick(() => {
          initializeChart();
        });
      }
    };

    const refreshData = () => {
      if (selectedCourse.value) {
        fetchAnalytics();
      } else {
        fetchCourses();
      }
    };

    // Utility methods
    const getTrendIcon = (trend) => {
      if (trend > 0) return 'fas fa-arrow-up text-success';
      if (trend < 0) return 'fas fa-arrow-down text-danger';
      return 'fas fa-minus text-muted';
    };

    const getPerformanceClass = (score) => {
      if (score >= 90) return 'text-success';
      if (score >= 80) return 'text-info';
      if (score >= 70) return 'text-warning';
      return 'text-danger';
    };

    const getPerformanceLabel = (score) => {
      if (score >= 90) return 'عالی';
      if (score >= 80) return 'خوب';
      if (score >= 70) return 'متوسط';
      return 'نیاز به بهبود';
    };

    const getEngagementClass = (score) => {
      if (score >= 80) return 'engagement-excellent';
      if (score >= 60) return 'engagement-good';
      if (score >= 40) return 'engagement-average';
      return 'engagement-poor';
    };

    const getEngagementDescription = (score) => {
      if (score >= 80) return 'درگیری بسیار عالی - دانش‌آموزان بسیار فعال هستند';
      if (score >= 60) return 'درگیری خوب - مشارکت مناسب در فعالیت‌ها';
      if (score >= 40) return 'درگیری متوسط - نیاز به تشویق بیشتر';
      return 'درگیری ضعیف - نیاز به بررسی جدی';
    };

    const getEngagementScoreClass = (score) => {
      if (score >= 80) return 'score-excellent';
      if (score >= 60) return 'score-good';
      if (score >= 40) return 'score-average';
      return 'score-poor';
    };

    const getDifficultyBadgeClass = (score) => {
      if (score >= 80) return 'modern-badge-danger';
      if (score >= 60) return 'modern-badge-warning';
      if (score >= 40) return 'modern-badge-info';
      return 'modern-badge-success';
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username || student.name || 'نامشخص';
    };

    const getStudentInitials = (student) => {
      if (!student) return 'N';
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      }
      return (student.username || student.name || 'U').charAt(0).toUpperCase();
    };

    const getStrugglingLevelClass = (level) => {
      const classes = {
        critical: 'status-critical',
        moderate: 'status-moderate',
        mild: 'status-mild'
      };
      return classes[level] || 'status-mild';
    };

    const getStrugglingLevelText = (level) => {
      const texts = {
        critical: 'بحرانی',
        moderate: 'متوسط',
        mild: 'خفیف'
      };
      return texts[level] || 'نامشخص';
    };

    const getPriorityClass = (priority) => {
      if (priority === 'high') return 'priority-high';
      if (priority === 'medium') return 'priority-medium';
      return 'priority-low';
    };

    const getScoreClass = (score) => {
      if (score >= 85) return 'text-success';
      if (score >= 70) return 'text-info';
      if (score >= 60) return 'text-warning';
      return 'text-danger';
    };

    const getTrendColor = (point, index) => {
      const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745'];
      return colors[Math.floor(point / 25)] || '#6c757d';
    };

    const getActivityTypeClass = (type) => {
      const classes = {
        exam: 'activity-exam',
        assignment: 'activity-assignment',
        lesson: 'activity-lesson'
      };
      return classes[type] || 'activity-default';
    };

    const getActivityIcon = (type) => {
      const icons = {
        exam: 'fas fa-clipboard-check',
        assignment: 'fas fa-file-alt',
        lesson: 'fas fa-play-circle'
      };
      return icons[type] || 'fas fa-circle';
    };

    const getActivityTypeText = (type) => {
      const texts = {
        exam: 'آزمون',
        assignment: 'تکلیف',
        lesson: 'درس'
      };
      return texts[type] || 'فعالیت';
    };

    const getParticipationRateClass = (rate) => {
      if (rate >= 80) return 'rate-excellent';
      if (rate >= 60) return 'rate-good';
      if (rate >= 40) return 'rate-average';
      return 'rate-poor';
    };

    const filterStrugglingStudents = () => {
      // Filter is handled by computed property
    };

    // Action methods
    const analyzeLessonDifficulty = () => {
      window.toast?.info('در حال تحلیل عمیق درس‌های چالش‌برانگیز...');
    };

    const viewLessonDetails = (lesson) => {
      selectedLesson.value = {
        ...lesson,
        totalStudents: metrics.value.totalStudents,
        totalAttempts: lesson.totalAttempts || Math.floor(Math.random() * 50) + 20,
        recommendations: [
          {
            id: 1,
            icon: 'fas fa-video',
            text: 'اضافه کردن ویدیو توضیحی برای این درس'
          },
          {
            id: 2,
            icon: 'fas fa-question-circle',
            text: 'ایجاد سوالات تمرینی بیشتر'
          },
          {
            id: 3,
            icon: 'fas fa-comments',
            text: 'برگزاری جلسه پرسش و پاسخ'
          }
        ]
      };

      const modal = new bootstrap.Modal(document.getElementById('lessonDetailsModal'));
      modal.show();
    };

    const generateRecommendations = (lesson) => {
      window.toast?.info(`در حال تولید پیشنهادات برای درس "${lesson.title}"...`);
    };

    const contactStrugglingStudents = (lesson) => {
      window.toast?.info('در حال ارسال پیام به دانش‌آموزان با مشکل در این درس...');
    };

    const createInterventionPlan = (student) => {
      window.toast?.info(`در حال ایجاد برنامه مداخله برای ${getStudentName(student)}...`);
    };

    const sendEncouragement = async (student) => {
      try {
        // Send encouragement message via chat
        await axios.post(`/chat/course/${selectedCourse.value}/send`, null, {
          params: {
            message: `سلام ${getStudentName(student)}! شما در مسیر درستی هستید. ادامه دهید! 💪`
          }
        });
        window.toast?.success('پیام تشویقی ارسال شد');
      } catch (error) {
        console.error('Error sending encouragement:', error);
        window.toast?.error('خطا در ارسال پیام');
      }
    };

    const scheduleFollowUp = (student) => {
      window.toast?.info(`پیگیری برای ${getStudentName(student)} برنامه‌ریزی شد`);
    };

    const generateEngagementReport = () => {
      window.toast?.info('در حال تهیه گزارش مشارکت...');
    };

    const exportReport = () => {
      window.toast?.info('در حال تهیه گزارش Excel...');
    };

    const generateComprehensiveReport = () => {
      window.toast?.info('در حال تهیه گزارش جامع دوره...');
    };

    const implementRecommendations = () => {
      window.toast?.success('پیشنهادات اعمال شد');
      const modal = bootstrap.Modal.getInstance(document.getElementById('lessonDetailsModal'));
      modal?.hide();
    };

    // Lifecycle
    onMounted(async () => {
      await fetchCourses();
      if (courses.value.length > 0) {
        selectedCourse.value = courses.value[0].id;
        await fetchAnalytics();
      }
    });

    onUnmounted(() => {
      // Cleanup if needed
    });

    return {
      // Reactive state
      loading,
      error,
      selectedCourse,
      selectedPeriod,
      analysisType,
      chartType,
      strugglingFilter,
      performanceChart,
      selectedLesson,
      courses,

      // Computed
      metrics,
      distributionData,
      quickInsights,
      engagementScore,
      overallEngagement,
      engagementMetrics,
      participationTimeline,
      filteredStrugglingStudents,

      // Data from composable
      coursePerformance,
      topPerformers,
      strugglingStudents,
      difficultLessons,
      participationMetrics,

      // Methods
      handleCourseChange,
      handlePeriodChange,
      updateAnalysisView,
      updateChart,
      refreshData,
      filterStrugglingStudents,

      // Utility methods
      getTrendIcon,
      getPerformanceClass,
      getPerformanceLabel,
      getEngagementClass,
      getEngagementDescription,
      getEngagementScoreClass,
      getDifficultyBadgeClass,
      getStudentName,
      getStudentInitials,
      getStrugglingLevelClass,
      getStrugglingLevelText,
      getPriorityClass,
      getScoreClass,
      getTrendColor,
      getActivityTypeClass,
      getActivityIcon,
      getActivityTypeText,
      getParticipationRateClass,

      // Action methods
      analyzeLessonDifficulty,
      viewLessonDetails,
      generateRecommendations,
      contactStrugglingStudents,
      createInterventionPlan,
      sendEncouragement,
      scheduleFollowUp,
      generateEngagementReport,
      exportReport,
      generateComprehensiveReport,
      implementRecommendations,

      // Utility
      formatDate
    };
  }
}
</script>

<style scoped>
/* Enhanced Chart Container */
.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.chart-container canvas {
  max-width: 100%;
  max-height: 100%;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-controls .modern-btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 6px;
}

.chart-summary {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item {
  padding: 0.5rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.summary-label {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.8;
}

/* Enhanced Stat Cards */
.modern-stat-trend {
  font-size: 0.7rem;
  margin-top: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.modern-stat-performance {
  font-size: 0.75rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.modern-stat-subtitle {
  font-size: 0.7rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

/* Quick Insights */
.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.insight-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
  flex-shrink: 0;
}

.insight-icon-success { background: linear-gradient(135deg, #28a745, #20c997); }
.insight-icon-warning { background: linear-gradient(135deg, #ffc107, #fd7e14); }
.insight-icon-info { background: linear-gradient(135deg, #17a2b8, #007bff); }
.insight-icon-danger { background: linear-gradient(135deg, #dc3545, #e83e8c); }

.insight-content {
  flex: 1;
}

.insight-title {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.insight-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* Engagement Score Circle */
.engagement-score {
  text-align: center;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  border: 6px solid;
}

.engagement-excellent { border-color: #28a745; }
.engagement-good { border-color: #17a2b8; }
.engagement-average { border-color: #ffc107; }
.engagement-poor { border-color: #dc3545; }

.score-content {
  text-align: center;
}

.score-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.score-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
}

.score-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

/* Enhanced Lesson Difficulty */
.lesson-difficulty-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.lesson-difficulty-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.lesson-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.meta-item {
  display: flex;
  align-items: center;
}

.difficulty-badge {
  flex-shrink: 0;
}

.difficulty-metrics {
  margin-top: 1rem;
}

.metric-row {
  margin-bottom: 1rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-label {
  min-width: 120px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.metric-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.metric-value {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: white;
  font-size: 0.85rem;
}

.lesson-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Enhanced Struggling Students */
.struggling-students-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.struggling-student-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.struggling-student-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.student-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.student-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  flex-shrink: 0;
}

.student-main-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.student-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-critical { background: #dc3545; color: white; }
.status-moderate { background: #ffc107; color: #000; }
.status-mild { background: #17a2b8; color: white; }

.student-priority {
  flex-shrink: 0;
}

.priority-indicator {
  padding: 0.5rem;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
}

.priority-high { background: #dc3545; }
.priority-medium { background: #ffc107; }
.priority-low { background: #28a745; }

.student-metrics {
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-card .metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}

.metric-card .metric-label {
  font-size: 0.7rem;
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.7);
}

.progress-trend {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.75rem;
}

.trend-title {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.trend-chart {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 30px;
}

.trend-point {
  flex: 1;
  min-height: 4px;
  border-radius: 1px;
  transition: all 0.2s ease;
}

.student-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Struggling Controls */
.struggling-controls {
  max-width: 150px;
}

.struggling-controls .form-select {
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.struggling-controls .form-select option {
  background: #2d3748;
  color: white;
}

/* Participation Analysis */
.engagement-analysis {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.participation-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-date {
  min-width: 100px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.timeline-content {
  flex: 1;
}

.activity-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.activity-exam { background: #007bff; color: white; }
.activity-assignment { background: #ffc107; color: #000; }
.activity-lesson { background: #28a745; color: white; }
.activity-default { background: #6c757d; color: white; }

.activity-details {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.participation-rate {
  margin-left: 0.5rem;
  font-weight: 600;
}

.rate-excellent { color: #28a745; }
.rate-good { color: #17a2b8; }
.rate-average { color: #ffc107; }
.rate-poor { color: #dc3545; }

/* Engagement Metrics */
.engagement-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.engagement-metric {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.metric-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.metric-score {
  font-weight: 700;
  font-size: 0.9rem;
}

.score-excellent { color: #28a745; }
.score-good { color: #17a2b8; }
.score-average { color: #ffc107; }
.score-poor { color: #dc3545; }

.metric-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.score-excellent { background: #28a745; }
.progress-fill.score-good { background: #17a2b8; }
.progress-fill.score-average { background: #ffc107; }
.progress-fill.score-poor { background: #dc3545; }

.overall-engagement {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.engagement-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 4px solid;
}

.engagement-score-text {
  text-align: center;
}

.engagement-score-text .score {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.engagement-score-text .label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Empty State */
.empty-state-features {
  max-width: 400px;
  margin: 0 auto;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-item i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

/* Modal Enhancements */
.lesson-analysis {
  background: rgba(248, 249, 250, 0.95);
  border-radius: 8px;
  padding: 1.5rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-row:last-child {
  border-bottom: none;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.recommendation-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.recommendation-text {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .chart-container {
    height: 200px;
  }

  .chart-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .insights-list {
    gap: 0.75rem;
  }

  .insight-item {
    padding: 0.75rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .lesson-actions,
  .student-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .lesson-actions .modern-btn,
  .student-actions .modern-btn {
    width: 100%;
  }

  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .engagement-metrics .engagement-metric {
    padding: 0.75rem;
  }

  .empty-state-features {
    max-width: 100%;
  }
}

/* Scrollbar Styling */
.struggling-students-list::-webkit-scrollbar,
.participation-timeline::-webkit-scrollbar {
  width: 6px;
}

.struggling-students-list::-webkit-scrollbar-track,
.participation-timeline::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.struggling-students-list::-webkit-scrollbar-thumb,
.participation-timeline::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.struggling-students-list::-webkit-scrollbar-thumb:hover,
.participation-timeline::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Print Styles */
@media print {
  .modern-btn,
  .chart-controls,
  .lesson-actions,
  .student-actions {
    display: none !important;
  }

  .modern-card {
    break-inside: avoid;
    margin-bottom: 1rem;
  }

  .chart-container {
    border: 1px solid #ccc;
  }
}
</style>