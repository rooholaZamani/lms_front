<template>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- سربرگ -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-chart-line me-3"></i>
            گزارش‌ها و آمارهای سیستم
          </h2>
          <p class="text-white-50 mb-0">مشاهده کامل عملکرد و تحلیل جامع سیستم آموزشی</p>
        </div>

        <div class="d-flex gap-2">
          <div class="dropdown">
            <button class="modern-btn modern-btn-outline text-gray dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-filter me-1"></i> دوره
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" @click.prevent="selectCourse('')">همه دوره‌ها</a></li>
              <li v-for="course in courses" :key="course.id">
                <a class="dropdown-item" href="#" @click.prevent="selectCourse(course.id)">
                  {{ course.title }}
                </a>
              </li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="modern-btn modern-btn-outline text-gray dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-calendar me-1"></i> {{ selectedPeriodText }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" @click.prevent="selectPeriod('week')">هفته اخیر</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="selectPeriod('month')">ماه اخیر</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="selectPeriod('quarter')">سه ماه اخیر</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="selectPeriod('all')">تمام مدت</a></li>
            </ul>
          </div>
          <button class="modern-btn modern-btn-outline text-white" @click="exportReport">
            <i class="fas fa-download me-1"></i> دانلود گزارش
          </button>
          <button class="modern-btn modern-btn-outline text-white" @click="printReport">
            <i class="fas fa-print me-1"></i> چاپ
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- آمار کلی -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up">
              <div class="modern-stat-icon text-primary">
                <i class="fas fa-users"></i>
              </div>
              <div class="modern-stat-value">{{ stats.totalStudents }}</div>
              <div class="modern-stat-label">کل دانش‌آموزان</div>
              <div class="modern-stat-trend" v-if="stats.studentsTrend">
                <i :class="getTrendIcon(stats.studentsTrend)" class="me-1"></i>
                {{ Math.abs(stats.studentsTrend) }}% نسبت به قبل
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-book"></i>
              </div>
              <div class="modern-stat-value">{{ stats.totalCourses }}</div>
              <div class="modern-stat-label">کل دوره‌ها</div>
              <div class="modern-stat-trend" v-if="stats.coursesTrend">
                <i :class="getTrendIcon(stats.coursesTrend)" class="me-1"></i>
                {{ Math.abs(stats.coursesTrend) }}% نسبت به قبل
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="modern-stat-value">{{ stats.averageCompletion }}%</div>
              <div class="modern-stat-label">نرخ تکمیل میانگین</div>
              <div class="modern-stat-trend" v-if="stats.completionTrend">
                <i :class="getTrendIcon(stats.completionTrend)" class="me-1"></i>
                {{ Math.abs(stats.completionTrend) }}% نسبت به قبل
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-star"></i>
              </div>
              <div class="modern-stat-value">{{ stats.averageScore }}</div>
              <div class="modern-stat-label">میانگین نمرات</div>
              <div class="modern-stat-trend" v-if="stats.scoreTrend">
                <i :class="getTrendIcon(stats.scoreTrend)" class="me-1"></i>
                {{ Math.abs(stats.scoreTrend) }}% نسبت به قبل
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- نمودار تحلیل زمان -->
          <div class="col-md-8 mb-4">
            <div class="modern-card animate-slide-right">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-clock text-primary me-2"></i>
                  تحلیل میانگین زمان محتوا
                </h5>
                <div class="chart-controls d-flex gap-2">
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'time' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'time'">
                    زمان
                  </button>
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'difficulty' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'difficulty'">
                    سختی
                  </button>
                  <button class="modern-btn modern-btn-sm"
                          :class="chartType === 'completion' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                          @click="chartType = 'completion'">
                    تکمیل
                  </button>
                </div>
              </div>

              <div class="chart-container">
                <Charts
                    type="activity"
                    :data="timeAnalysisData"
                    height="350px"
                />
              </div>

              <!-- خلاصه تحلیل زمان -->
              <div class="mt-4">
                <h6 class="mb-3">
                  <i class="fas fa-info-circle text-info me-2"></i>
                  خلاصه تحلیل زمان سیستم
                </h6>
                <div class="row">
                  <div class="col-md-3 col-6 mb-2">
                    <div class="time-summary-item">
                      <div class="summary-value text-success">{{ systemSummary.fastestContent }}</div>
                      <div class="summary-label">سریع‌ترین محتوا</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-2">
                    <div class="time-summary-item">
                      <div class="summary-value text-warning">{{ systemSummary.slowestContent }}</div>
                      <div class="summary-label">کندترین محتوا</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-2">
                    <div class="time-summary-item">
                      <div class="summary-value text-info">{{ systemSummary.avgStudyTime }}</div>
                      <div class="summary-label">میانگین زمان مطالعه</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-2">
                    <div class="time-summary-item">
                      <div class="summary-value text-primary">{{ systemSummary.totalHours }}</div>
                      <div class="summary-label">کل ساعات سیستم</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- سوالات چالش‌برانگیز -->
          <div class="col-md-4 mb-4">
            <div class="modern-card animate-slide-left">
              <h5 class="modern-title mb-4">
                <i class="fas fa-brain text-warning me-2"></i>
                سوالات چالش‌برانگیز
              </h5>

              <div v-if="challengingQuestions.length === 0" class="text-center py-4">
                <div class="modern-logo large success mb-3">
                  <i class="fas fa-check-circle"></i>
                </div>
                <p class="text-muted">سوال چالش‌برانگیزی یافت نشد</p>
              </div>

              <div v-else class="challenging-questions-list">
                <div v-for="(question, index) in challengingQuestions" :key="question.id"
                     class="question-item mb-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="question-text">{{ question.text }}</div>
                    <span class="modern-badge" :class="getDifficultyBadgeClass(question.difficulty)">
                      {{ question.difficulty }}% سختی
                    </span>
                  </div>
                  <div class="question-stats">
                    <div class="stat-row">
                      <span class="stat-label">نرخ پاسخ صحیح:</span>
                      <span class="stat-value" :class="getSuccessRateClass(question.correctRate)">
                        {{ question.correctRate }}%
                      </span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">میانگین زمان:</span>
                      <span class="stat-value">{{ formatTime(question.avgTime) }}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">تعداد تلاش:</span>
                      <span class="stat-value">{{ question.attempts }}</span>
                    </div>
                  </div>
                  <div class="progress mt-2" style="height: 4px;">
                    <div class="progress-bar"
                         :class="getSuccessRateClass(question.correctRate, true)"
                         :style="`width: ${question.correctRate}%`"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- تحلیل سختی سوالات و عملکرد درس‌ها -->
        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.4s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-question-circle text-danger me-2"></i>
                تحلیل سختی سوالات
              </h5>
              <div class="chart-container">
                <Charts
                    type="scores"
                    :data="questionDifficultyData"
                    height="300px"
                />
              </div>

              <!-- خلاصه سختی سوالات -->
              <div class="difficulty-summary mt-3">
                <div class="row text-center">
                  <div class="col-3">
                    <div class="difficulty-item">
                      <div class="difficulty-value text-success">{{ difficultyStats.easy }}%</div>
                      <div class="difficulty-label">آسان</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="difficulty-item">
                      <div class="difficulty-value text-info">{{ difficultyStats.medium }}%</div>
                      <div class="difficulty-label">متوسط</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="difficulty-item">
                      <div class="difficulty-value text-warning">{{ difficultyStats.hard }}%</div>
                      <div class="difficulty-label">سخت</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="difficulty-item">
                      <div class="difficulty-value text-danger">{{ difficultyStats.veryHard }}%</div>
                      <div class="difficulty-label">خیلی سخت</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.5s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-book-open text-success me-2"></i>
                عملکرد درس‌ها
              </h5>
              <div class="chart-container">
                <Charts
                    type="activity"
                    :data="lessonPerformanceData"
                    height="300px"
                />
              </div>

              <!-- برترین و ضعیف‌ترین درس‌ها -->
              <div class="lesson-summary mt-3">
                <div class="row">
                  <div class="col-6">
                    <div class="summary-card bg-success-light">
                      <div class="summary-icon text-success">
                        <i class="fas fa-trophy"></i>
                      </div>
                      <div class="summary-content">
                        <div class="summary-title">بهترین درس</div>
                        <div class="summary-desc">{{ bestLesson.title }}</div>
                        <div class="summary-score">{{ bestLesson.score }}% موفقیت</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="summary-card bg-warning-light">
                      <div class="summary-icon text-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                      </div>
                      <div class="summary-content">
                        <div class="summary-title">نیازمند بهبود</div>
                        <div class="summary-desc">{{ challengingLesson.title }}</div>
                        <div class="summary-score">{{ challengingLesson.score }}% موفقیت</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- روند مشارکت و درگیری -->
        <div class="modern-card animate-slide-up mb-4" style="animation-delay: 0.6s;">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="modern-title mb-0">
              <i class="fas fa-chart-area text-info me-2"></i>
              روند مشارکت و درگیری دانش‌آموزان
            </h5>
            <div class="engagement-controls">
              <button class="modern-btn modern-btn-outline modern-btn-sm" @click="generateEngagementReport">
                <i class="fas fa-file-chart me-1"></i> گزارش مشارکت
              </button>
            </div>
          </div>

          <div class="chart-container">
            <Charts
                type="activity"
                :data="engagementTrendsData"
                height="400px"
            />
          </div>

          <!-- معیارهای مشارکت -->
          <div class="engagement-metrics mt-4">
            <h6 class="mb-3">
              <i class="fas fa-gauge me-2"></i>
              معیارهای کلیدی مشارکت
            </h6>
            <div class="row">
              <div class="col-md-3 col-6 mb-3">
                <div class="metric-card">
                  <div class="metric-icon text-primary">
                    <i class="fas fa-sign-in-alt"></i>
                  </div>
                  <div class="metric-value">{{ engagementMetrics.avgDailyLogins }}</div>
                  <div class="metric-label">میانگین ورود روزانه</div>
                  <div class="metric-change text-success">+{{ engagementMetrics.loginTrend }}%</div>
                </div>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <div class="metric-card">
                  <div class="metric-icon text-success">
                    <i class="fas fa-eye"></i>
                  </div>
                  <div class="metric-value">{{ engagementMetrics.avgContentViews }}</div>
                  <div class="metric-label">میانگین مشاهده محتوا</div>
                  <div class="metric-change text-success">+{{ engagementMetrics.viewTrend }}%</div>
                </div>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <div class="metric-card">
                  <div class="metric-icon text-warning">
                    <i class="fas fa-clipboard-check"></i>
                  </div>
                  <div class="metric-value">{{ engagementMetrics.avgExamSubmissions }}</div>
                  <div class="metric-label">میانگین ارسال آزمون</div>
                  <div class="metric-change text-warning">{{ engagementMetrics.examTrend >= 0 ? '+' : '' }}{{ engagementMetrics.examTrend }}%</div>
                </div>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <div class="metric-card">
                  <div class="metric-icon text-info">
                    <i class="fas fa-comments"></i>
                  </div>
                  <div class="metric-value">{{ engagementMetrics.avgDiscussions }}</div>
                  <div class="metric-label">میانگین بحث و گفتگو</div>
                  <div class="metric-change text-info">+{{ engagementMetrics.discussionTrend }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- دانش‌آموزان برتر و نیازمند کمک -->
        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.7s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-star text-warning me-2"></i>
                دانش‌آموزان برتر سیستم
              </h5>

              <div v-if="topPerformers.length === 0" class="text-center py-4">
                <div class="modern-logo large secondary mb-3">
                  <i class="fas fa-star"></i>
                </div>
                <p class="text-muted">اطلاعاتی موجود نیست</p>
              </div>

              <div v-else class="top-performers-list">
                <div v-for="(performer, index) in topPerformers" :key="performer.userId"
                     class="performer-item d-flex align-items-center mb-3">
                  <div class="performer-rank me-3">
                    <span class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</span>
                  </div>
                  <div class="performer-avatar me-3">
                    {{ getStudentInitials(performer) }}
                  </div>
                  <div class="performer-info flex-grow-1">
                    <div class="performer-name">{{ performer.name }}</div>
                    <div class="performer-details">
                      <span class="detail-item">نمره: {{ performer.score }}</span>
                      <span class="detail-item">پیشرفت: {{ performer.progress }}%</span>
                      <span class="detail-item">دوره: {{ performer.courseName }}</span>
                    </div>
                  </div>
                  <div class="performer-medal">
                    <i v-if="index === 0" class="fas fa-medal text-warning"></i>
                    <i v-else-if="index === 1" class="fas fa-medal" style="color: #c0c0c0;"></i>
                    <i v-else-if="index === 2" class="fas fa-medal" style="color: #cd7f32;"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.8s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-users text-danger me-2"></i>
                دانش‌آموزان نیازمند کمک
              </h5>

              <div v-if="strugglingStudents.length === 0" class="text-center py-4">
                <div class="modern-logo large success mb-3">
                  <i class="fas fa-thumbs-up"></i>
                </div>
                <p class="text-muted">همه دانش‌آموزان عملکرد مناسبی دارند</p>
              </div>

              <div v-else class="struggling-students-list">
                <div v-for="student in strugglingStudents" :key="student.id"
                     class="struggling-student-item d-flex align-items-center mb-3">
                  <div class="student-avatar me-3">
                    {{ getStudentInitials(student) }}
                  </div>
                  <div class="student-info flex-grow-1">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-metrics">
                      <span class="text-muted">پیشرفت: {{ student.progress }}%</span>
                      <span class="text-muted ms-2">نمره: {{ student.averageScore }}</span>
                      <span class="text-muted ms-2">مشکل: {{ student.issueType }}</span>
                    </div>
                    <div class="progress mt-1" style="height: 4px;">
                      <div class="progress-bar bg-danger"
                           :style="`width: ${student.progress}%`"></div>
                    </div>
                  </div>
                  <div class="student-actions">
                    <button class="modern-btn modern-btn-primary modern-btn-sm"
                            @click="contactStudent(student)"
                            title="ارسال پیام">
                      <i class="fas fa-envelope"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- فعالیت‌های اخیر سیستم -->
        <div class="modern-card animate-slide-up" style="animation-delay: 0.9s;">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="modern-title mb-0">
              <i class="fas fa-history text-info me-2"></i>
              فعالیت‌های اخیر سیستم
            </h5>
            <div class="d-flex gap-2">
              <button class="modern-btn modern-btn-secondary modern-btn-sm"
                      @click="refreshActivities">
                <i class="fas fa-sync-alt me-1"></i> بروزرسانی
              </button>
            </div>
          </div>

          <div v-if="recentActivities.length === 0" class="text-center py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-history"></i>
            </div>
            <h5 class="text-muted">فعالیت اخیری یافت نشد</h5>
          </div>

          <div v-else class="modern-table-container">
            <table class="modern-table table">
              <thead>
              <tr>
                <th><i class="fas fa-user me-1"></i> دانش‌آموز</th>
                <th><i class="fas fa-tasks me-1"></i> نوع فعالیت</th>
                <th><i class="fas fa-book me-1"></i> دوره</th>
                <th><i class="fas fa-play-circle me-1"></i> جزئیات</th>
                <th><i class="fas fa-clock me-1"></i> تاریخ</th>
                <th><i class="fas fa-star me-1"></i> نمره</th>
                <th><i class="fas fa-cogs me-1"></i> عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="activity in recentActivities" :key="activity.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="activity-avatar me-2">
                      {{ getStudentInitials(activity.student) }}
                    </div>
                    <div>
                      <div class="fw-bold">{{ getStudentName(activity.student) }}</div>
                      <small class="text-muted">{{ activity.student.email }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="modern-badge" :class="getActivityBadgeClass(activity.type)">
                    <i :class="getActivityIcon(activity.type)" class="me-1"></i>
                    {{ getActivityTypeText(activity.type) }}
                  </span>
                </td>
                <td>{{ activity.course?.title || 'نامشخص' }}</td>
                <td>{{ activity.details || '-' }}</td>
                <td>
                  <div>{{ formatDate(activity.date) }}</div>
                  <small class="text-muted">{{ getTimeAgo(activity.date) }}</small>
                </td>
                <td>
                  <span v-if="activity.score !== null" class="fw-bold text-success">
                    {{ activity.score }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="modern-btn modern-btn-primary modern-btn-sm"
                            @click="viewActivityDetails(activity)"
                            title="جزئیات">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button v-if="activity.type === 'exam' || activity.type === 'assignment'"
                            class="modern-btn modern-btn-info modern-btn-sm"
                            @click="viewSubmission(activity)"
                            title="مشاهده ارسالی">
                      <i class="fas fa-file-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- مودال دانلود گزارش -->
        <div class="modal fade" id="exportModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-download me-2"></i>
                  دانلود گزارش
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">نوع فایل:</label>
                  <select class="form-select" v-model="exportOptions.format">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">محتوای گزارش:</label>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="exportOptions.includeStats" id="includeStats">
                    <label class="form-check-label" for="includeStats">آمار کلی</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="exportOptions.includeActivities" id="includeActivities">
                    <label class="form-check-label" for="includeActivities">فعالیت‌های اخیر</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="exportOptions.includePerformance" id="includePerformance">
                    <label class="form-check-label" for="includePerformance">تحلیل عملکرد</label>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="button" class="btn btn-primary" @click="performExport">
                  <i class="fas fa-download me-1"></i>
                  دانلود
                </button>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Charts from '@/components/charts/Charts.vue';
import axios from 'axios';

export default {
  name: 'Reports',
  components: {
    LoadingSpinner,
    Charts
  },
  setup() {
    const { formatDate, formatTime } = useFormatters();

    return {
      formatDate,
      formatTime
    };
  },
  data() {
    return {
      loading: true,
      selectedCourseId: '',
      selectedPeriod: 'month',
      chartType: 'time',

      courses: [],

      stats: {
        totalStudents: 0,
        totalCourses: 0,
        averageCompletion: 0,
        averageScore: 0,
        studentsTrend: 0,
        coursesTrend: 0,
        completionTrend: 0,
        scoreTrend: 0
      },

      systemSummary: {
        fastestContent: 'آزمون‌ها',
        slowestContent: 'پروژه‌های گروهی',
        avgStudyTime: '۳۴.۵ دقیقه',
        totalHours: '۸۴۵۰ ساعت'
      },

      timeAnalysisData: [],
      questionDifficultyData: [],
      lessonPerformanceData: [],
      engagementTrendsData: [],
      challengingQuestions: [],

      difficultyStats: {
        easy: 25,
        medium: 40,
        hard: 25,
        veryHard: 10
      },

      bestLesson: {
        title: 'مقدمه‌ای بر برنامه‌نویسی',
        score: 94
      },

      challengingLesson: {
        title: 'برنامه‌نویسی شیءگرا',
        score: 68
      },

      engagementMetrics: {
        avgDailyLogins: 156,
        loginTrend: 12,
        avgContentViews: 342,
        viewTrend: 8,
        avgExamSubmissions: 45,
        examTrend: -3,
        avgDiscussions: 78,
        discussionTrend: 15
      },

      topPerformers: [],
      strugglingStudents: [],
      recentActivities: [],

      exportOptions: {
        format: 'pdf',
        includeStats: true,
        includeActivities: true,
        includePerformance: true
      }
    };
  },
  computed: {
    selectedPeriodText() {
      const periods = {
        week: 'هفته اخیر',
        month: 'ماه اخیر',
        quarter: 'سه ماه اخیر',
        all: 'تمام مدت'
      };
      return periods[this.selectedPeriod] || 'ماه اخیر';
    }
  },
  async created() {
    await this.initialize();
  },
  methods: {
    async initialize() {
      this.loading = true;
      try {
        await this.fetchCourses();
        await this.fetchOverallStats();
        await this.fetchAnalyticsData();
        await this.fetchRecentActivities();
      } catch (error) {
        console.error('خطا در بارگذاری گزارش‌ها:', error);
        this.$toast?.error('خطا در بارگذاری گزارش‌ها');
      } finally {
        this.loading = false;
      }
    },

    async fetchCourses() {
      try {
        const response = await axios.get('/courses/teaching');
        this.courses = response.data || [];
      } catch (error) {
        console.error('خطا در دریافت دوره‌ها:', error);
      }
    },

    async fetchOverallStats() {
      try {
        // دریافت آمار کلی سیستم
        this.stats = {
          totalStudents: 245,
          totalCourses: 12,
          averageCompletion: 73,
          averageScore: 82,
          studentsTrend: 12,
          coursesTrend: 8,
          completionTrend: 5,
          scoreTrend: 3
        };
      } catch (error) {
        console.error('خطا در دریافت آمار کلی:', error);
      }
    },

    async fetchAnalyticsData() {
      try {
        // تولید داده‌های تحلیل زمان جامع
        this.timeAnalysisData = [
          { date: '1403/09/01', views: 145, submissions: 89, completions: 76 },
          { date: '1403/09/08', views: 162, submissions: 95, completions: 82 },
          { date: '1403/09/15', views: 138, submissions: 78, completions: 65 },
          { date: '1403/09/22', views: 178, submissions: 112, completions: 98 },
          { date: '1403/09/29', views: 195, submissions: 128, completions: 105 }
        ];

        // تولید داده‌های تحلیل سختی سوالات
        this.questionDifficultyData = [
          { range: 'آسان (0-30%)', count: 35 },
          { range: 'متوسط (31-60%)', count: 42 },
          { range: 'سخت (61-80%)', count: 28 },
          { range: 'خیلی سخت (81-100%)', count: 12 }
        ];

        // تولید داده‌های عملکرد درس‌ها
        this.lessonPerformanceData = [
          { date: '1403/09/01', views: 89, submissions: 76, completions: 68 },
          { date: '1403/09/08', views: 94, submissions: 82, completions: 75 },
          { date: '1403/09/15', views: 87, submissions: 71, completions: 63 },
          { date: '1403/09/22', views: 96, submissions: 88, completions: 81 },
          { date: '1403/09/29', views: 102, submissions: 94, completions: 87 }
        ];

        // تولید داده‌های روند مشارکت
        this.engagementTrendsData = [];
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          this.engagementTrendsData.push({
            date: this.formatDate(date.toISOString()),
            views: Math.floor(Math.random() * 50) + 120,
            submissions: Math.floor(Math.random() * 30) + 70,
            completions: Math.floor(Math.random() * 25) + 45
          });
        }

        // تولید سوالات چالش‌برانگیز
        this.challengingQuestions = [
          {
            id: 1,
            text: 'کدام یک از روش‌های sorting در پایتون پیچیدگی زمانی O(n log n) دارد؟',
            difficulty: 85,
            correctRate: 34,
            avgTime: 4.2,
            attempts: 156
          },
          {
            id: 2,
            text: 'تفاوت بین deep copy و shallow copy چیست؟',
            difficulty: 78,
            correctRate: 42,
            avgTime: 3.8,
            attempts: 142
          },
          {
            id: 3,
            text: 'کلاس‌های abstract در پایتون چگونه پیاده‌سازی می‌شوند؟',
            difficulty: 82,
            correctRate: 38,
            avgTime: 5.1,
            attempts: 128
          }
        ];

        // تولید دانش‌آموزان برتر
        this.topPerformers = [
          { userId: 1, name: 'سارا احمدی', score: 95.2, progress: 98, courseName: 'پایتون پیشرفته' },
          { userId: 2, name: 'علی رضایی', score: 92.8, progress: 95, courseName: 'جاوا اسکریپت' },
          { userId: 3, name: 'فاطمه محمدی', score: 90.1, progress: 92, courseName: 'داده‌کاوی' },
          { userId: 4, name: 'حسین کریمی', score: 88.7, progress: 89, courseName: 'برنامه‌نویسی وب' },
          { userId: 5, name: 'مریم صادقی', score: 87.3, progress: 94, courseName: 'یادگیری ماشین' }
        ];

        // تولید دانش‌آموزان نیازمند کمک
        this.strugglingStudents = [
          { id: 1, name: 'محمد حسینی', averageScore: 45.2, progress: 23, issueType: 'مدیریت زمان' },
          { id: 2, name: 'زهرا کاظمی', averageScore: 52.8, progress: 34, issueType: 'درک مفاهیم' },
          { id: 3, name: 'رضا موسوی', averageScore: 58.1, progress: 42, issueType: 'مشارکت کم' }
        ];
      } catch (error) {
        console.error('خطا در دریافت داده‌های تحلیلی:', error);
      }
    },

    async fetchRecentActivities() {
      try {
        // تولید فعالیت‌های اخیر
        this.recentActivities = [
          {
            id: 1,
            type: 'exam',
            student: { name: 'سارا احمدی', email: 'sara@example.com' },
            course: { title: 'پایتون پیشرفته' },
            details: 'آزمون نهایی',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            score: 94
          },
          {
            id: 2,
            type: 'lesson',
            student: { name: 'علی رضایی', email: 'ali@example.com' },
            course: { title: 'جاوا اسکریپت' },
            details: 'تکمیل درس مبانی یادگیری ماشین',
            date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            score: null
          },
          {
            id: 3,
            type: 'assignment',
            student: { name: 'فاطمه محمدی', email: 'fatemeh@example.com' },
            course: { title: 'توسعه وب' },
            details: 'ارسال پروژه پورتفولیو',
            date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            score: 88
          }
        ];
      } catch (error) {
        console.error('خطا در دریافت فعالیت‌های اخیر:', error);
      }
    },

    selectCourse(courseId) {
      this.selectedCourseId = courseId;
      this.fetchAnalyticsData();
    },

    selectPeriod(period) {
      this.selectedPeriod = period;
      this.initialize();
    },

    async refreshActivities() {
      await this.fetchRecentActivities();
      this.$toast?.success('فعالیت‌ها بروزرسانی شد');
    },

    getTrendIcon(trend) {
      if (trend > 0) return 'fas fa-arrow-up text-success';
      if (trend < 0) return 'fas fa-arrow-down text-danger';
      return 'fas fa-minus text-muted';
    },

    getRankClass(index) {
      if (index === 0) return 'rank-gold';
      if (index === 1) return 'rank-silver';
      if (index === 2) return 'rank-bronze';
      return 'rank-default';
    },

    getDifficultyBadgeClass(difficulty) {
      if (difficulty >= 80) return 'modern-badge-danger';
      if (difficulty >= 60) return 'modern-badge-warning';
      if (difficulty >= 40) return 'modern-badge-info';
      return 'modern-badge-success';
    },

    getSuccessRateClass(rate, isProgressBar = false) {
      if (isProgressBar) {
        if (rate >= 70) return 'bg-success';
        if (rate >= 50) return 'bg-warning';
        return 'bg-danger';
      } else {
        if (rate >= 70) return 'text-success';
        if (rate >= 50) return 'text-warning';
        return 'text-danger';
      }
    },

    getStudentName(student) {
      if (!student) return 'نامشخص';
      return student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.username || 'نامشخص';
    },

    getStudentInitials(student) {
      if (!student) return 'N';
      const name = this.getStudentName(student);
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    },

    getActivityBadgeClass(type) {
      const classes = {
        exam: 'modern-badge-primary',
        assignment: 'modern-badge-warning',
        lesson: 'modern-badge-success',
        exercise: 'modern-badge-info'
      };
      return classes[type] || 'modern-badge-secondary';
    },

    getActivityIcon(type) {
      const icons = {
        exam: 'fas fa-clipboard-check',
        assignment: 'fas fa-file-alt',
        lesson: 'fas fa-book-open',
        exercise: 'fas fa-dumbbell'
      };
      return icons[type] || 'fas fa-circle';
    },

    getActivityTypeText(type) {
      const texts = {
        exam: 'آزمون',
        assignment: 'تکلیف',
        lesson: 'درس',
        exercise: 'تمرین'
      };
      return texts[type] || 'فعالیت';
    },

    getTimeAgo(dateString) {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${diffDays} روز قبل`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته قبل`;
      return `${Math.floor(diffDays / 30)} ماه قبل`;
    },

    async contactStudent(student) {
      this.$toast?.info(`پیام به ${this.getStudentName(student)} ارسال شد`);
    },

    viewActivityDetails(activity) {
      this.$toast?.info(`جزئیات ${this.getActivityTypeText(activity.type)}: ${activity.details}`);
    },

    viewSubmission(activity) {
      this.$toast?.info('مشاهده ارسالی');
    },

    generateEngagementReport() {
      this.$toast?.info('در حال تهیه گزارش مشارکت...');
    },

    exportReport() {
      const modal = new bootstrap.Modal(document.getElementById('exportModal'));
      modal.show();
    },

    async performExport() {
      try {
        this.$toast?.info(`در حال تهیه گزارش ${this.exportOptions.format.toUpperCase()}...`);

        // شبیه‌سازی فرآیند دانلود
        await new Promise(resolve => setTimeout(resolve, 2000));

        this.$toast?.success('گزارش با موفقیت دانلود شد');

        const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
        modal.hide();
      } catch (error) {
        console.error('خطا در دانلود:', error);
        this.$toast?.error('خطا در تهیه گزارش');
      }
    },

    printReport() {
      window.print();
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  min-height: 300px;
}

.chart-controls .modern-btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.time-summary-item {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.summary-value {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.8rem;
  color: #666;
}

.challenging-questions-list {
  max-height: 400px;
  overflow-y: auto;
}

.question-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.question-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.question-text {
  flex: 1;
  font-weight: 500;
  color: #333;
  margin-left: 1rem;
}

.question-stats {
  margin-top: 0.75rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 600;
}

.difficulty-summary {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.difficulty-item {
  padding: 0.5rem;
}

.difficulty-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.difficulty-label {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.8;
}

.lesson-summary .summary-card {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.lesson-summary .summary-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bg-success-light {
  background: rgba(40, 167, 69, 0.1);
}

.bg-warning-light {
  background: rgba(255, 193, 7, 0.1);
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.8);
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.summary-desc {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.summary-score {
  font-size: 0.8rem;
  font-weight: 600;
}

.engagement-metrics {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.8);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.metric-label {
  font-size: 0.8rem;
  color: #666;
  margin: 0.25rem 0;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 600;
}

.top-performers-list {
  max-height: 400px;
  overflow-y: auto;
}

.performer-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.performer-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
}

.rank-gold { background: linear-gradient(135deg, #FFD700, #FFA500); }
.rank-silver { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); }
.rank-bronze { background: linear-gradient(135deg, #CD7F32, #B8860B); }
.rank-default { background: linear-gradient(135deg, #667eea, #764ba2); }

.performer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.performer-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.performer-details {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #666;
}

.detail-item {
  white-space: nowrap;
}

.struggling-students-list {
  max-height: 400px;
  overflow-y: auto;
}

.struggling-student-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(220, 53, 69, 0.2);
  transition: all 0.2s ease;
}

.struggling-student-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
}

.student-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.student-metrics {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.activity-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.modern-stat-trend {
  font-size: 0.75rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .chart-container {
    height: 200px !important;
  }

  .challenging-questions-list,
  .top-performers-list,
  .struggling-students-list {
    max-height: 300px;
  }

  .question-item,
  .performer-item,
  .struggling-student-item {
    padding: 0.75rem;
  }

  .performer-details {
    flex-direction: column;
    gap: 0.25rem;
  }

  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 800px;
  }
}

/* Scrollbar Styling */
.challenging-questions-list::-webkit-scrollbar,
.top-performers-list::-webkit-scrollbar,
.struggling-students-list::-webkit-scrollbar {
  width: 6px;
}

.challenging-questions-list::-webkit-scrollbar-track,
.top-performers-list::-webkit-scrollbar-track,
.struggling-students-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.challenging-questions-list::-webkit-scrollbar-thumb,
.top-performers-list::-webkit-scrollbar-thumb,
.struggling-students-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.challenging-questions-list::-webkit-scrollbar-thumb:hover,
.top-performers-list::-webkit-scrollbar-thumb:hover,
.struggling-students-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Print Styles */
@media print {
  .modern-btn,
  .chart-controls,
  .dropdown {
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