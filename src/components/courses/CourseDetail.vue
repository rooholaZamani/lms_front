<template>
  <div class="modern-page-bg course-detail-container">
    <div class="container-fluid p-4">
      <loading-spinner :loading="loading">
        <div v-if="course">
          <!-- Course Header -->
          <course-header
              :course="course"
              :is-teacher="isTeacher"
              :is-teacher-of-course="isTeacherOfCourse"
              :is-enrolled="isEnrolled"
              @edit-course="showEditCourseModal"
              @add-lesson="showAddLessonModal"
              @enroll-course="enrollInCourse"
              @view-progress="viewStudentOwnProgress"
          />

          <!-- Tabs for different sections -->
          <div class="modern-card course-content-tabs animate-slide-up" style="animation-delay: 0.1s;">
            <ul class="nav nav-tabs modern-nav-tabs" id="courseTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link modern-nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview"
                        type="button" role="tab" aria-controls="overview" aria-selected="true">
                  <i class="fas fa-info-circle me-2"></i>
                  معرفی دوره
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link modern-nav-link" id="lessons-tab" data-bs-toggle="tab" data-bs-target="#lessons"
                        type="button" role="tab" aria-controls="lessons" aria-selected="false">
                  <i class="fas fa-book-open me-2"></i>
                  درس‌ها
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link modern-nav-link" id="students-tab" data-bs-toggle="tab" data-bs-target="#students"
                        type="button" role="tab" aria-controls="students" aria-selected="false">
                  <i class="fas fa-users me-2"></i>
                  دانش‌آموزان
                </button>
              </li>
              <li v-if="isEnrolled || isTeacherOfCourse" class="nav-item" role="presentation">
                <button class="nav-link" id="chat-tab" data-bs-toggle="tab" data-bs-target="#chat"
                        type="button" role="tab" aria-controls="chat" aria-selected="false">
                  <i class="fas fa-comments me-2"></i>
                  گفتگوی دوره
                </button>
              </li>
              <li v-if="isTeacher && isTeacherOfCourse" class="nav-item" role="presentation">
                <button class="nav-link modern-nav-link" id="manage-tab" data-bs-toggle="tab" data-bs-target="#manage"
                        type="button" role="tab" aria-controls="manage" aria-selected="false">
                  <i class="fas fa-cog me-2"></i>
                  ویرایش اطلاعات دوره
                </button>
              </li>
            </ul>

            <div class="tab-content course-tab-content" id="courseTabContent">
              <!-- Overview Tab -->
              <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                <div class="row">
                  <div class="col-lg-8">
                    <div class="modern-card course-info animate-slide-right">
                      <h5 class="modern-title">
                        <i class="fas fa-graduation-cap text-primary me-2"></i>
                        معرفی دوره
                      </h5>
                      <div class="course-description">
                        <p>{{ course.description || 'توضیحات دوره در دسترس نیست.' }}</p>
                      </div>
                    </div>

                    <!-- Course Teacher -->
                    <div class="modern-card course-teacher animate-slide-right" style="animation-delay: 0.1s;">
                      <h5 class="modern-title">
                        <i class="fas fa-chalkboard-teacher text-success me-2"></i>
                        استاد دوره
                      </h5>
                      <div class="teacher-info">
                        <div class="teacher-avatar">
                          <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="teacher-details">
                          <h6>{{ getTeacherName() }}</h6>
                          <p>{{ course.teacher?.description || 'اطلاعات بیشتری در دسترس نیست.' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-lg-4">
                    <!-- Course Stats -->
                    <div class="modern-card course-stats animate-slide-left">
                      <h5 class="modern-title">
                        <i class="fas fa-chart-bar text-info me-2"></i>
                        آمار دوره
                      </h5>
                      <div class="stats-grid">
                        <div class="stat-item">
                          <div class="stat-icon text-primary">
                            <i class="fas fa-book"></i>
                          </div>
                          <div class="stat-value">{{ course.lessons ? course.lessons.length : 0 }}</div>
                          <div class="stat-label">درس</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon text-success">
                            <i class="fas fa-users"></i>
                          </div>
                          <div class="stat-value">{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}</div>
                          <div class="stat-label">دانش‌آموز</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon text-warning">
                            <i class="fas fa-clock"></i>
                          </div>
                          <div class="stat-value">{{ getTotalDuration() }}</div>
                          <div class="stat-label">دقیقه</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon text-danger">
                            <i class="fas fa-calendar"></i>
                          </div>
                          <div class="stat-value">{{ formatDate(course.createdAt) || 'نامشخص' }}</div>
                          <div class="stat-label">تاریخ ایجاد</div>
                        </div>
                      </div>
                    </div>

                    <!-- Prerequisites -->
                    <div class="modern-card course-prerequisites animate-slide-left" style="animation-delay: 0.1s;">
                      <h5 class="modern-title">
                        <i class="fas fa-list-check text-warning me-2"></i>
                        پیش‌نیازها
                      </h5>
                      <div v-if="course.prerequisites && course.prerequisites.length > 0">
                        <ul class="prerequisites-list">
                          <li v-for="prerequisite in course.prerequisites" :key="prerequisite.id">
                            <i class="fas fa-check-circle text-success me-2"></i>
                            {{ prerequisite.title }}
                          </li>
                        </ul>
                      </div>
                      <div v-else class="no-prerequisites">
                        <i class="fas fa-info-circle text-muted me-2"></i>
                        این دوره پیش‌نیازی ندارد.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lessons Tab -->
              <div class="tab-pane fade" id="lessons" role="tabpanel" aria-labelledby="lessons-tab">
                <lesson-list
                    :lessons="course.lessons || []"
                    :is-teacher="isTeacher"
                    :is-teacher-of-course="isTeacherOfCourse"
                    :is-enrolled="isEnrolled"
                    :completed-lessons="progress.completedLessonIds || []"
                    @edit-lesson="editLesson"
                    @add-content="showAddContentModal"
                    @add-exam="showAddExamModal"
                    @add-exercise="showAddExerciseModal"
                    @toggle-lesson="toggleLesson"
                    @mark-complete="markLessonComplete"
                />

                <!-- Teacher Management Section -->
                <div v-if="isTeacher && isTeacherOfCourse" class="modern-card teacher-management animate-slide-up" style="animation-delay: 0.2s;">
                  <h5 class="modern-title">
                    <i class="fas fa-tools text-primary me-2"></i>
                    مدیریت درس‌ها
                  </h5>
                  <lesson-manager
                      :course-id="id"
                      :lessons="course.lessons"
                      @lesson-added="handleLessonAdded"
                      @lesson-updated="handleLessonUpdated"
                      @lesson-deleted="handleLessonDeleted"
                      @add-content="showAddContentModal"
                      @add-assignment="showAddAssignmentModal"
                      @show-questions-manager="showLessonQuestionsManager"
                  />

                  <!-- Questions Manager Section -->
                  <div v-if="showQuestionsManager && selectedLessonForQuestions" class="mt-4">
                    <lesson-questions-manager
                        :lesson-id="selectedLessonForQuestions.id"
                        :lesson-title="selectedLessonForQuestions.title"
                        @close="hideLessonQuestionsManager"
                    />
                  </div>
                </div>
              </div>

              <!-- Students Tab -->
              <div class="tab-pane fade" id="students" role="tabpanel" aria-labelledby="students-tab">
                <students-tab
                    :course="course"
                    @view-student-progress="viewStudentProgress"
                />
              </div>

              <!-- Manage Tab (Teacher Only) -->
              <div
                  v-if="isTeacher && isTeacherOfCourse"
                  class="tab-pane fade"
                  id="manage"
                  role="tabpanel"
                  aria-labelledby="manage-tab"
              >
                <div class="modern-card course-management animate-slide-up">
                  <h5 class="modern-title">
                    <i class="fas fa-edit text-primary me-2"></i>
                    ویرایش اطلاعات دوره
                  </h5>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="modern-form-group">
                        <label for="courseTitle" class="modern-form-label">عنوان دوره</label>
                        <input
                            type="text"
                            id="courseTitle"
                            class="modern-form-control"
                            v-model="editCourseForm.title"
                            placeholder="عنوان دوره"
                        >
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="modern-form-group">
                        <label for="courseStatus" class="modern-form-label">وضعیت دوره</label>
                        <select id="courseStatus" class="modern-form-control">
                          <option value="active">فعال</option>
                          <option value="inactive">غیرفعال</option>
                          <option value="archived">آرشیو شده</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="modern-form-group">
                    <label for="courseDescription" class="modern-form-label">توضیحات دوره</label>
                    <textarea
                        id="courseDescription"
                        class="modern-form-control"
                        v-model="editCourseForm.description"
                        rows="4"
                        placeholder="توضیحات دوره"
                    ></textarea>
                  </div>

                  <button
                      class="modern-btn modern-btn-success"
                      @click="updateCourseInfo"
                      :disabled="updatingCourse"
                  >
                    <span v-if="updatingCourse" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i v-else class="fas fa-save me-1"></i>
                    ذخیره تغییرات
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="modern-card text-center animate-slide-up">
          <div class="py-5">
            <div class="modern-logo large danger mb-4">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4 class="text-muted mb-3">دوره یافت نشد</h4>
            <p class="text-muted mb-4">
              متأسفانه دوره مورد نظر یافت نشد یا شما دسترسی به آن ندارید.
            </p>
            <router-link :to="{ name: 'Courses' }" class="modern-btn modern-btn-primary">
              <i class="fas fa-arrow-right me-1"></i>
              بازگشت به لیست دوره‌ها
            </router-link>
          </div>
        </div>
      </loading-spinner>
    </div>

    <!-- Modals -->
    <!-- Lesson Modal -->
    <div class="modal fade" id="lessonModal" tabindex="-1" aria-labelledby="lessonModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content modern-modal">
          <div class="modal-header">
            <h5 class="modal-title" id="lessonModalLabel">
              <i class="fas fa-book me-2"></i>
              {{ lessonForm.id ? 'ویرایش درس' : 'افزودن درس جدید' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveLesson">
              <div class="modern-form-group">
                <label for="lessonTitle" class="modern-form-label">عنوان درس</label>
                <input type="text" class="modern-form-control" id="lessonTitle" v-model="lessonForm.title" required>
              </div>
              <div class="modern-form-group">
                <label for="lessonDescription" class="modern-form-label">توضیحات درس</label>
                <textarea class="modern-form-control" id="lessonDescription" v-model="lessonForm.description" rows="3"></textarea>
              </div>
              <div class="modern-form-group">
                <label for="lessonOrder" class="modern-form-label">ترتیب نمایش</label>
                <input type="number" class="modern-form-control" id="lessonOrder" v-model="lessonForm.orderIndex" min="0">
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="modern-btn modern-btn-success" :disabled="savingLesson">
                  <span v-if="savingLesson" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <i v-else class="fas fa-save me-1"></i>
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Modal -->
    <content-modal
        :modal-id="'contentModal'"
        :lesson-id="selectedLesson.id || 0"
        ref="contentModal"
        @content-saved="handleContentSaved"
    />

    <!-- Other modals remain the same with modern styling applied -->
    <!-- Assignment Modal -->
    <div class="modal fade" id="assignmentModal" tabindex="-1" aria-labelledby="assignmentModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content modern-modal">
          <div class="modal-header">
            <h5 class="modal-title" id="assignmentModalLabel">
              <i class="fas fa-tasks me-2"></i>
              افزودن تکلیف به درس: {{ selectedLesson.title }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="modern-form-group">
                <label for="assignmentTitle" class="modern-form-label">عنوان تکلیف</label>
                <input type="text" class="modern-form-control" id="assignmentTitle" v-model="assignmentForm.title" required>
              </div>
              <div class="modern-form-group">
                <label for="assignmentDescription" class="modern-form-label">توضیحات تکلیف</label>
                <textarea class="modern-form-control" id="assignmentDescription" v-model="assignmentForm.description" rows="4" required></textarea>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="modern-form-group">
                    <label for="assignmentDueDate" class="modern-form-label">تاریخ تحویل</label>
                    <input type="date" class="modern-form-control" id="assignmentDueDate" v-model="assignmentForm.dueDate" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="modern-form-group">
                    <label for="assignmentDueTime" class="modern-form-label">ساعت تحویل</label>
                    <input type="time" class="modern-form-control" id="assignmentDueTime" v-model="assignmentForm.dueTime" required>
                  </div>
                </div>
              </div>

              <div class="modern-form-group">
                <label for="assignmentFile" class="modern-form-label">فایل پیوست (اختیاری)</label>
                <input type="file" class="modern-form-control" id="assignmentFile" @change="handleAssignmentFileSelect">
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="modern-btn modern-btn-success" :disabled="isAssignmentSubmitting">
                  <span v-if="isAssignmentSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i v-else class="fas fa-save me-1"></i>
                  ذخیره تکلیف
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Exercise Modal -->
    <div class="modal fade" id="exerciseModal" tabindex="-1" aria-labelledby="exerciseModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content modern-modal">
          <div class="modal-header">
            <h5 class="modal-title" id="exerciseModalLabel">
              <i class="fas fa-dumbbell me-2"></i>
              افزودن تمرین به درس: {{ selectedLesson.title }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveExercise">
              <div class="modern-card">
                <h6 class="modern-title">
                  <i class="fas fa-cog text-primary me-2"></i>
                  مشخصات تمرین
                </h6>
                <div class="row">
                  <div class="col-md-6 modern-form-group">
                    <label for="exerciseTitle" class="modern-form-label">عنوان تمرین</label>
                    <input type="text" class="modern-form-control" id="exerciseTitle" v-model="exerciseForm.title" required>
                  </div>
                  <div class="col-md-6 modern-form-group">
                    <label for="exerciseTimeLimit" class="modern-form-label">مدت زمان (دقیقه)</label>
                    <input type="number" class="modern-form-control" id="exerciseTimeLimit" v-model="exerciseForm.timeLimit" min="1" required>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 modern-form-group">
                    <label for="exercisePassingScore" class="modern-form-label">نمره قبولی</label>
                    <input type="number" class="modern-form-control" id="exercisePassingScore" v-model="exerciseForm.passingScore" min="0" max="100" required>
                  </div>
                  <div class="col-md-6 modern-form-group">
                    <div class="form-check mt-4">
                      <input class="form-check-input" type="checkbox" id="adaptiveDifficulty" v-model="exerciseForm.adaptiveDifficulty">
                      <label class="form-check-label" for="adaptiveDifficulty">
                        دشواری تطبیقی
                      </label>
                    </div>
                  </div>
                </div>
                <div class="modern-form-group">
                  <label for="exerciseDescription" class="modern-form-label">توضیحات تمرین</label>
                  <textarea class="modern-form-control" id="exerciseDescription" v-model="exerciseForm.description" rows="3"></textarea>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="modern-btn modern-btn-success" :disabled="isExerciseSubmitting">
                  <span v-if="isExerciseSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i v-else class="fas fa-plus me-1"></i>
                  ایجاد تمرین
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Exam Modal -->
    <div class="modal fade" id="examModal" tabindex="-1" aria-labelledby="examModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content modern-modal">
          <div class="modal-header">
            <h5 class="modal-title" id="examModalLabel">
              <i class="fas fa-clipboard-check me-2"></i>
              افزودن آزمون به درس: {{ selectedLesson.title }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveExam">
              <div class="modern-card">
                <h6 class="modern-title">
                  <i class="fas fa-cog text-primary me-2"></i>
                  مشخصات آزمون
                </h6>
                <div class="row">
                  <div class="col-md-6 modern-form-group">
                    <label for="examTitle" class="modern-form-label">عنوان آزمون</label>
                    <input type="text" class="modern-form-control" id="examTitle" v-model="examForm.title" required>
                  </div>
                  <div class="col-md-6 modern-form-group">
                    <label for="examDuration" class="modern-form-label">مدت زمان (دقیقه)</label>
                    <input type="number" class="modern-form-control" id="examDuration" v-model="examForm.duration" min="5" required>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 modern-form-group">
                    <label for="examPassingScore" class="modern-form-label">نمره قبولی</label>
                    <input type="number" class="modern-form-control" id="examPassingScore" v-model="examForm.passingScore" min="0" max="100" required>
                  </div>
                  <div class="col-md-6 modern-form-group">
                    <div class="form-check mt-4">
                      <input class="form-check-input" type="checkbox" id="shuffleQuestions" v-model="examForm.shuffleQuestions">
                      <label class="form-check-label" for="shuffleQuestions">
                        تغییر ترتیب تصادفی سوالات
                      </label>
                    </div>
                  </div>
                </div>
                <div class="modern-form-group">
                  <label for="examDescription" class="modern-form-label">توضیحات آزمون</label>
                  <textarea class="modern-form-control" id="examDescription" v-model="examForm.description" rows="3"></textarea>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="modern-btn modern-btn-success" :disabled="isExamSubmitting">
                  <span v-if="isExamSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i v-else class="fas fa-plus me-1"></i>
                  ایجاد آزمون
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <confirmation-dialog
        ref="confirmDialog"
        title="تأیید حذف"
        message="آیا از حذف این مورد اطمینان دارید؟ این عمل قابل بازگشت نیست."
        confirm-button-type="danger"
        icon="trash"
    />
  </div>
  <!-- Progress Modal -->
  <div class="modal fade" id="progressModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-chart-line me-2"></i>
            پیشرفت دوره
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="loadingProgress" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">در حال بارگذاری پیشرفت...</p>
          </div>
          <div v-else class="progress-stats">
            <!-- Overall Progress Circle -->
            <div class="text-center mb-4">
              <div class="progress-circle" :style="`--progress: ${overallProgress}%`">
                <span class="progress-text">{{ overallProgress }}%</span>
                <span class="progress-label">پیشرفت کلی</span>
              </div>
            </div>

            <!-- Progress Bars -->
            <div class="progress-categories">
              <div v-for="category in progressData" :key="category.name" class="category-item mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="mb-0">
                    <i :class="category.icon" class="me-2"></i>
                    {{ category.name }}
                  </h6>
                  <span class="text-muted">{{ category.completed }}/{{ category.total }}</span>
                </div>
                <div class="progress mb-2" style="height: 20px;">
                  <div class="progress-bar"
                       :class="category.colorClass"
                       :style="`width: ${category.percentage}%`"
                       role="progressbar">
                    {{ category.percentage }}%
                  </div>
                </div>
                <small class="text-muted">{{ category.description }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LessonQuestionsManager from '@/components/exams/LessonQuestionsManager.vue';
import { mapGetters } from 'vuex';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import ContentModal from '@/components/courses/ContentModal.vue';
import CourseHeader from '@/components/courses/CourseHeader.vue';
import LessonList from '@/components/courses/LessonList.vue';
import StudentsTab from '@/components/courses/StudentsTab.vue';
import LessonManager from '@/components/courses/LessonManager.vue';
import CourseChat from '@/components/courses/CourseChat.vue';

export default {
  name: 'CourseDetail',
  components: {
    LoadingSpinner,
    ConfirmationDialog,
    ContentModal,
    CourseHeader,
    LessonList,
    StudentsTab,
    LessonManager,
    LessonQuestionsManager
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup() {
    const {isStudent, isTeacher, getUserFullName} = useUser();
    const {formatDate, truncateText} = useFormatters();

    return {
      isStudent,
      isTeacher,
      getUserFullName,
      formatDate,
      truncateText
    };
  },
  data() {
    return {
      loading: true,
      enrolling: false,
      updatingCourse: false,
      savingLesson: false,
      course: null,
      isEnrolled: false,
      isTeacherOfCourse: true,
      selectedLessonForQuestions: null,
      showQuestionsManager: false,
      loadingProgress: false,
      progressData: [],
      overallProgress: 0,

      lessonForm: {
        id: null,
        title: '',
        description: '',
        orderIndex: 0
      },

      editCourseForm: {
        title: '',
        description: ''
      },

      assignmentForm: {
        title: '',
        description: '',
        dueDate: '',
        dueTime: '23:59',
        file: null
      },
      isAssignmentSubmitting: false,

      selectedLesson: {
        id: null,
        title: ''
      },

      exerciseForm: {
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 60,
        adaptiveDifficulty: true
      },
      isExerciseSubmitting: false,

      examForm: {
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        shuffleQuestions: false
      },
      isExamSubmitting: false,

      progress: {
        completedLessons: 0,
        totalTimeSpent: 0,
        examsPassed: 0,
        examsTotal: 0,
        exercisesCompleted: 0,
        exercisesTotal: 0,
        circleLength: 439.6,
        circleDashOffset: 439.6,
        completedLessonIds: [],
        timeline: []
      }
    };
  },
  computed: {
    ...mapGetters({
      currentCourse: 'courses/getCurrentCourse',
      currentUser: 'currentUser'
    })
  },
  async created() {
    try {
      await this.fetchCourseData();
      this.setupBootstrapTabs();
    } catch (error) {
      console.error('Error fetching course data:', error);
      this.$toast.error('خطا در دریافت اطلاعات دوره');
    } finally {
      this.loading = false;
    }
  },
  mounted() {
    this.setupBootstrapTabs();
  },
  methods: {
    setupBootstrapTabs() {
      const tabListEl = document.getElementById('courseTab');
      if (tabListEl) {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
          const tabToShow = document.querySelector(`#${tabParam}-tab`);
          if (tabToShow) {
            const tab = new bootstrap.Tab(tabToShow);
            tab.show();
          }
        }

        tabListEl.addEventListener('shown.bs.tab', function (event) {
          const tabId = event.target.id.replace('-tab', '');
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('tab', tabId);
          window.history.replaceState({}, '', newUrl);
        });
      }
    },
    viewStudentOwnProgress() {
      if (this.isStudent && this.isEnrolled) {
        this.showProgressModal();
      }
    },

    async showProgressModal() {
      this.loadingProgress = true;

      const modal = new bootstrap.Modal(document.getElementById('progressModal'));
      modal.show();

      try {
        await this.fetchProgressData();
      } catch (error) {
        console.error('Error fetching progress:', error);
        this.$toast.error('خطا در بارگذاری اطلاعات پیشرفت');
      } finally {
        this.loadingProgress = false;
      }
    },

    async fetchProgressData() {
      const response = await this.$http.get(`/progress/${this.id}`);
      const progressInfo = response.data;

      // Calculate progress categories
      const totalLessons = this.course.lessons?.length || 0;
      const completedLessons = this.progress.completedLessonIds?.length || 0;

      // Count assignments and exams
      let totalAssignments = 0;
      let completedAssignments = 0;
      let totalExams = 0;
      let completedExams = 0;
      let totalContent = 0;
      let viewedContent = 0;

      this.course.lessons?.forEach(lesson => {
        if (lesson.assignments?.length) totalAssignments += lesson.assignments.length;
        if (lesson.hasExam || lesson.exam) totalExams++;
        if (lesson.contents?.length) totalContent += lesson.contents.length;
      });

      // Mock completed data - replace with actual API data
      completedAssignments = Math.floor(totalAssignments * 0.6);
      completedExams = Math.floor(totalExams * 0.4);
      viewedContent = Math.floor(totalContent * 0.8);

      this.progressData = [
        {
          name: 'درس‌ها',
          icon: 'fas fa-book-open text-primary',
          completed: completedLessons,
          total: totalLessons,
          percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          colorClass: 'bg-primary',
          description: 'درس‌های تکمیل شده'
        },
        {
          name: 'محتواها',
          icon: 'fas fa-file-alt text-info',
          completed: viewedContent,
          total: totalContent,
          percentage: totalContent > 0 ? Math.round((viewedContent / totalContent) * 100) : 0,
          colorClass: 'bg-info',
          description: 'محتواهای مشاهده شده'
        },
        {
          name: 'تکالیف',
          icon: 'fas fa-tasks text-warning',
          completed: completedAssignments,
          total: totalAssignments,
          percentage: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
          colorClass: 'bg-warning',
          description: 'تکالیف ارسال شده'
        },
        {
          name: 'آزمون‌ها',
          icon: 'fas fa-clipboard-check text-danger',
          completed: completedExams,
          total: totalExams,
          percentage: totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0,
          colorClass: 'bg-danger',
          description: 'آزمون‌های شرکت کرده'
        }
      ];

      // Calculate overall progress
      const totalItems = totalLessons + totalContent + totalAssignments + totalExams;
      const completedItems = completedLessons + viewedContent + completedAssignments + completedExams;
      this.overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    },
    cleanupModal() {
      // Remove any remaining backdrop
      document.querySelector('.modal-backdrop')?.remove();

      // Reset body styles
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');

      // Remove modal-open class from html
      document.documentElement.classList.remove('modal-open');
    },
    showLessonQuestionsManager(lesson) {
      this.selectedLessonForQuestions = lesson;
      this.showQuestionsManager = true;
    },

    hideLessonQuestionsManager() {
      this.showQuestionsManager = false;
      this.selectedLessonForQuestions = null;
    },

    handleLessonAdded(newLesson) {
      if (!this.course.lessons) {
        this.course.lessons = [];
      }
      this.course.lessons.push(newLesson);
    },

    handleLessonUpdated(updatedLesson) {
      const index = this.course.lessons.findIndex(l => l.id === updatedLesson.id);
      if (index !== -1) {
        this.course.lessons[index] = updatedLesson;
      }
    },

    handleLessonDeleted(lessonId) {
      this.course.lessons = this.course.lessons.filter(l => l.id !== lessonId);
    },

    async fetchCourseData() {
      try {
        await this.$store.dispatch('courses/fetchCourseById', this.id);
        this.course = this.currentCourse.course;

        if (!this.course) {
          console.warn('No course data returned from API');
          return;
        }

        if (this.isTeacher) {
          this.isTeacherOfCourse = (this.currentUser.id === this.course.teacher.id);
        }

        if (this.isStudent && this.course.enrolledStudents) {
          this.isEnrolled = this.course.enrolledStudents.some(student => student.id === this.currentUser.id);
        }

        this.editCourseForm = {
          title: this.course.title,
          description: this.course.description
        };

        if (this.isStudent && this.isEnrolled) {
          await this.fetchProgressData();
        }

      } catch (error) {
        console.error('Error in fetchCourseData:', error);
        throw error;
      }
    },

    getTeacherName() {
      if (!this.course.teacher) return 'نامشخص';
      return this.getUserFullName(this.course.teacher);
    },

    getTotalDuration() {
      if (!this.course.lessons) return 0;

      let totalMinutes = 0;
      this.course.lessons.forEach(lesson => {
        if (lesson.duration) {
          totalMinutes += parseInt(lesson.duration);
        }
      });

      return totalMinutes;
    },

    async enrollInCourse() {
      if (this.enrolling || this.isEnrolled) return;

      this.enrolling = true;

      try {
        await this.$store.dispatch('courses/enrollCourse', this.id);
        this.isEnrolled = true;
        this.$toast.success('شما با موفقیت در این دوره ثبت‌نام کردید.');
      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.$toast.error('خطا در ثبت‌نام دوره');
      } finally {
        this.enrolling = false;
      }
    },

    showEditCourseModal() {
      this.editCourseForm = {
        title: this.course.title,
        description: this.course.description
      };
    },

    async updateCourseInfo() {
      if (this.updatingCourse) return;

      this.updatingCourse = true;

      try {
        await this.$store.dispatch('courses/updateCourse', {
          courseId: this.id,
          courseData: this.editCourseForm
        });

        this.$toast.success('اطلاعات دوره با موفقیت به‌روزرسانی شد.');
      } catch (error) {
        console.error('Error updating course:', error);
        this.$toast.error('خطا در به‌روزرسانی اطلاعات دوره');
      } finally {
        this.updatingCourse = false;
      }
    },

    showAddLessonModal() {
      this.lessonForm = {
        id: null,
        title: '',
        description: '',
        orderIndex: this.course.lessons ? this.course.lessons.length : 0
      };

      const modal = new bootstrap.Modal(document.getElementById('lessonModal'));
      modal.show();
    },

    editLesson(lesson) {
      this.lessonForm = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex || 0
      };

      const modal = new bootstrap.Modal(document.getElementById('lessonModal'));
      modal.show();
    },

    async saveLesson() {
      if (this.savingLesson) return;

      this.savingLesson = true;

      try {
        let response;

        if (this.lessonForm.id) {
          response = await this.$http.put(`/lessons/${this.lessonForm.id}`, this.lessonForm);
          const index = this.course.lessons.findIndex(l => l.id === this.lessonForm.id);
          if (index !== -1) {
            this.course.lessons[index] = response.data;
          }
          this.$toast.success('درس با موفقیت به‌روزرسانی شد.');
        } else {
          response = await this.$http.post(`/lessons/course/${this.id}`, this.lessonForm);
          if (!this.course.lessons) {
            this.course.lessons = [];
          }
          this.course.lessons.push(response.data);
          this.$toast.success('درس جدید با موفقیت افزوده شد.');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('lessonModal'));
        modal.hide();
      } catch (error) {
        console.error('Error saving lesson:', error);
        this.$toast.error('خطا در ذخیره درس');
      } finally {
        this.savingLesson = false;
      }
    },

    async deleteLesson(lesson) {
      const confirmed = await this.$refs.confirmDialog.show();

      if (!confirmed) return;

      try {
        await this.$http.delete(`/lessons/${lesson.id}`);
        this.course.lessons = this.course.lessons.filter(l => l.id !== lesson.id);
        this.$toast.success('درس با موفقیت حذف شد.');
      } catch (error) {
        console.error('Error deleting lesson:', error);
        this.$toast.error('خطا در حذف درس');
      }
    },

    toggleLesson(index) {
      if (!this.course.lessons[index].expanded) {
        this.course.lessons.forEach((lesson, i) => {
          if (i !== index) {
            lesson['expanded'] = false;
          }
        });
      }

      this.course.lessons[index]['expanded'] = !this.course.lessons[index].expanded;
    },

    async markLessonComplete(lessonId) {
      try {
        await this.$http.post(`/progress/lesson/${lessonId}/complete`);

        if (!this.progress.completedLessonIds) {
          this.progress.completedLessonIds = [];
        }

        this.progress.completedLessonIds.push(lessonId);
        this.progress.completedLessons++;

        const percentage = this.progress.completedLessons / this.progress.totalLessons;
        this.progress.circleDashOffset = this.progress.circleLength * (1 - percentage);

        this.$toast.success('درس به عنوان تکمیل شده علامت‌گذاری شد.');
      } catch (error) {
        console.error('Error marking lesson complete:', error);
        this.$toast.error('خطا در علامت‌گذاری درس');
      }
    },

    showAddContentModal(lesson) {
      this.selectedLesson = lesson;
      this.$nextTick(() => {
        this.$refs.contentModal.show();
      });
    },

    showAddAssignmentModal(lesson) {
      this.selectedLesson = lesson;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      this.assignmentForm = {
        title: '',
        description: '',
        dueDate: dueDate.toISOString().split('T')[0],
        dueTime: '23:59',
        file: null
      };

      const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
      modal.show();
    },

    showAddExerciseModal(lesson) {
      this.selectedLesson = lesson;

      this.exerciseForm = {
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 60,
        adaptiveDifficulty: true
      };

      const modal = new bootstrap.Modal(document.getElementById('exerciseModal'));
      modal.show();
    },

    handleAssignmentFileSelect(event) {
      if (event.target.files.length > 0) {
        this.assignmentForm.file = event.target.files[0];
      }
    },

    async saveAssignment() {
      if (this.isAssignmentSubmitting) return;

      this.isAssignmentSubmitting = true;

      try {
        let dueDateTime = this.assignmentForm.dueDate;
        if (this.assignmentForm.dueTime) {
          dueDateTime = `${this.assignmentForm.dueDate}T${this.assignmentForm.dueTime}:00`;
        } else {
          dueDateTime = `${this.assignmentForm.dueDate}T23:59:00`;
        }

        const formData = new FormData();
        formData.append('title', this.assignmentForm.title);
        formData.append('description', this.assignmentForm.description);
        formData.append('dueDate', dueDateTime);

        if (this.assignmentForm.file) {
          formData.append('file', this.assignmentForm.file);
        }

        const response = await this.$http.post(
            `/assignments/lesson/${this.selectedLesson.id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
        );

        const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
        if (lessonIndex !== -1) {
          this.course.lessons[lessonIndex].hasAssignment = true;
          if (!this.course.lessons[lessonIndex].assignments) {
            this.course.lessons[lessonIndex].assignments = [];
          }
          this.course.lessons[lessonIndex].assignments.push(response.data);
        }

        this.$toast.success('تکلیف با موفقیت ایجاد شد.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('assignmentModal'));
        modal.hide();
      } catch (error) {
        console.error('Error creating assignment:', error);

        let errorMessage = 'خطا در ایجاد تکلیف';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        this.$toast.error(errorMessage);
      } finally {
        this.isAssignmentSubmitting = false;
      }
    },

    async saveExercise() {
      if (this.isExerciseSubmitting) return;

      this.isExerciseSubmitting = true;

      try {
        const response = await this.$http.post(`/exercises/lesson/${this.selectedLesson.id}`, {
          title: this.exerciseForm.title,
          description: this.exerciseForm.description,
          timeLimit: this.exerciseForm.timeLimit,
          passingScore: this.exerciseForm.passingScore,
          adaptiveDifficulty: this.exerciseForm.adaptiveDifficulty
        });

        const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
        if (lessonIndex !== -1) {
          this.course.lessons[lessonIndex]['hasExercise'] = true;

          if (!this.course.lessons[lessonIndex].exercises) {
            this.course.lessons[lessonIndex].exercises = [];
          }
          this.course.lessons[lessonIndex].exercises.push(response.data);
        }

        this.$toast.success('تمرین با موفقیت ایجاد شد.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('exerciseModal'));
        modal.hide();

        this.$router.push(`/exercises/${response.data.id}`);
      } catch (error) {
        console.error('Error creating exercise:', error);
        this.$toast.error('خطا در ایجاد تمرین');
      } finally {
        this.isExerciseSubmitting = false;
      }
    },

    showAddExamModal(lesson) {
      this.selectedLesson = lesson;

      this.examForm = {
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        shuffleQuestions: false
      };

      const modal = new bootstrap.Modal(document.getElementById('examModal'));
      modal.show();
    },

    async saveExam() {
      if (this.isExamSubmitting) return;

      this.isExamSubmitting = true;

      try {
        const examData = {
          title: this.examForm.title,
          description: this.examForm.description,
          duration: this.examForm.duration,
          passingScore: this.examForm.passingScore,
          shuffleQuestions: this.examForm.shuffleQuestions
        };

        const response = await this.$http.post(
            `/exams/lesson/${this.selectedLesson.id}`,
            examData,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
        );

        const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
        if (lessonIndex !== -1) {
          this.course.lessons[lessonIndex].hasExam = true;
          this.course.lessons[lessonIndex].exam = response.data;
        }

        this.$toast.success('آزمون با موفقیت ایجاد شد.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('examModal'));
        modal.hide();

        this.$router.push({
          name: 'ExamCreator',
          params: { id: response.data.id }
        });
      } catch (error) {
        console.error('Error creating exam:', error);

        let errorMessage = 'خطا در ایجاد آزمون';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        this.$toast.error(errorMessage);
      } finally {
        this.isExamSubmitting = false;
      }
    },

    viewStudentProgress(student) {
      this.$router.push({
        name: 'StudentProgress',
        params: {courseId: this.id, studentId: student.id}
      });
    },

    async handleContentSaved(contentData) {
      try {
        await this.fetchCourseData();

        const updatedLessonResponse = await this.$http.get(`/lessons/${this.selectedLesson.id}`);
        const updatedLesson = updatedLessonResponse.data;

        const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
        if (lessonIndex !== -1) {
          this.course.lessons[lessonIndex] = updatedLesson;
        }

        this.$toast.success('محتوای درس با موفقیت اضافه شد.');
      } catch (error) {
        console.error('Error updating lesson data:', error);
        this.$toast.error('خطا در به‌روزرسانی اطلاعات درس.');
      }
    }
  }
}
</script>

<style scoped>
.course-detail-container {
  min-height: calc(100vh - 56px);
  padding: 2rem 1rem;
}

/* Modern Tabs */
.modern-nav-tabs {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px 12px 0 0;
  border: none;
  padding: 0.5rem;
}

.modern-nav-tabs .nav-link {
  border: none;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 0 0.25rem;
  transition: all 0.3s ease;
  color: #6c757d;
  font-weight: 500;
}

.modern-nav-tabs .nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.modern-nav-tabs .nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.course-tab-content {
  padding: 2rem;
  border-radius: 0 0 12px 12px;
  border-top: none;
}

/* Course Info Sections */
.course-info {
  margin-bottom: 2rem;
}

.course-description {
  line-height: 1.6;
  color: #495057;
  background: rgba(248, 249, 250, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}


.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#007bff 0deg, #007bff calc(var(--progress) * 3.6deg), #e9ecef calc(var(--progress) * 3.6deg));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
}

.progress-text {
  position: relative;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  z-index: 1;
}

.progress-label {
  position: relative;
  font-size: 0.8rem;
  color: #666;
  z-index: 1;
}

.category-item {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Teacher Info */
.course-teacher {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.05) 0%, rgba(46, 204, 113, 0.05) 100%);
  border: 1px solid rgba(40, 167, 69, 0.1);
}

.teacher-info {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.teacher-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-left: 1rem;
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

.teacher-details h6 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.teacher-details p {
  color: #6c757d;
  margin-bottom: 0;
  line-height: 1.5;
}

/* Prerequisites */
.prerequisites-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.prerequisites-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.prerequisites-list li:last-child {
  border-bottom: none;
}

.no-prerequisites {
  background: rgba(248, 249, 250, 0.8);
  padding: 1rem;
  border-radius: 8px;
  color: #6c757d;
  text-align: center;
}

/* Course Management */
.course-management,
.teacher-management {
  margin-top: 1rem;
}

/* Modern Modal */
.modern-modal {
  border-radius: 16px;
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modern-modal .modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  border-bottom: none;
  padding: 1.5rem;
}

.modern-modal .modal-title {
  font-weight: 600;
}

.modern-modal .btn-close {
  filter: invert(1);
}

.modern-modal .modal-body {
  padding: 2rem;
}

/* Form styling */
.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

/* Responsive */
@media (max-width: 768px) {
  .course-detail-container {
    padding: 1rem 0.5rem;
  }

  .teacher-info {
    flex-direction: column;
    text-align: center;
  }

  .teacher-avatar {
    margin-left: 0;
    margin-bottom: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modern-nav-tabs .nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .course-tab-content {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-item {
    padding: 1rem;
  }

  .modern-modal .modal-body {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modern-nav-tabs {
    background: rgba(45, 55, 72, 0.9);
  }

  .modern-nav-tabs .nav-link {
    color: #cbd5e0;
  }

  .modern-nav-tabs .nav-link:hover {
    background: rgba(102, 126, 234, 0.2);
    color: #90cdf4;
  }

  .course-description {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }

  .stat-item {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .stat-value {
    color: #e2e8f0;
  }

  .teacher-details h6 {
    color: #e2e8f0;
  }

  .teacher-details p {
    color: #cbd5e0;
  }

  .no-prerequisites {
    background: rgba(45, 55, 72, 0.8);
    color: #cbd5e0;
  }

  .modern-modal {
    background: #2d3748;
  }

  .modern-modal .modal-body {
    background: #2d3748;
    color: #e2e8f0;
  }
}
</style>