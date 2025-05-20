<template>
  <div class="course-detail-container">
    <div class="container-fluid p-4">
      <loading-spinner :loading="loading">
        <div v-if="course">
          <!-- Course Header (sin cambios) -->
          <div class="course-header">
            <!-- ... (código existente para el encabezado) ... -->
          </div>

          <!-- Tabs for different sections -->
          <div class="course-content-tabs">
            <ul class="nav nav-tabs" id="courseTab" role="tablist">
              <!-- ... (pestañas existentes) ... -->
            </ul>

            <div class="tab-content p-4 course-tab-content" id="courseTabContent">
              <!-- ... (otras pestañas existentes) ... -->

              <!-- Manage Tab (Teacher Only) - Updated -->
              <div
                  v-if="isTeacher"
                  class="tab-pane fade"
                  id="manage"
                  role="tabpanel"
                  aria-labelledby="manage-tab"
              >
                <div class="course-management">
                  <!-- Course Info Section -->
                  <div class="management-section">
                    <h4>ویرایش اطلاعات دوره</h4>
                    <div class="form-group mb-3">
                      <label for="courseTitle" class="form-label">عنوان دوره</label>
                      <input
                          type="text"
                          id="courseTitle"
                          class="form-control"
                          v-model="editCourseForm.title"
                          placeholder="عنوان دوره"
                      >
                    </div>

                    <div class="form-group mb-3">
                      <label for="courseDescription" class="form-label">توضیحات دوره</label>
                      <textarea
                          id="courseDescription"
                          class="form-control"
                          v-model="editCourseForm.description"
                          rows="4"
                          placeholder="توضیحات دوره"
                      ></textarea>
                    </div>

                    <button
                        class="btn btn-primary"
                        @click="updateCourseInfo"
                        :disabled="updatingCourse"
                    >
                      <span v-if="updatingCourse" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      ذخیره تغییرات
                    </button>
                  </div>

                  <hr class="my-4">

                  <!-- Lessons Management Section -->
                  <div class="management-section">
                    <h4>مدیریت دروس</h4>
                    <button class="btn btn-success mb-3" @click="showAddLessonModal">
                      <i class="fas fa-plus me-1"></i> افزودن درس جدید
                    </button>

                    <div v-if="course.lessons && course.lessons.length > 0" class="lesson-management-list">
                      <div v-for="(lesson, index) in course.lessons" :key="lesson.id" class="lesson-management-item">
                        <div class="lesson-number">{{ index + 1 }}</div>
                        <div class="lesson-info">
                          <div class="lesson-title">{{ lesson.title }}</div>
                          <div class="lesson-meta">
                            <span v-if="lesson.contents">{{ lesson.contents?.length || 0 }} محتوا</span>
                            <span v-if="lesson.hasExam">
                              <i class="fas fa-file-alt ms-2 me-1"></i> آزمون
                            </span>
                            <span v-if="lesson.hasExercise">
                              <i class="fas fa-tasks ms-2 me-1"></i> تمرین
                            </span>
                          </div>
                        </div>
                        <div class="lesson-actions">
                          <button class="btn btn-sm btn-outline-primary me-1" @click="showAddContentModal(lesson)">
                            <i class="fas fa-plus"></i> محتوا
                          </button>
                          <button class="btn btn-sm btn-outline-warning me-1" @click="showAddAssignmentModal(lesson)">
                            <i class="fas fa-tasks"></i> تکلیف
                          </button>
                          <button class="btn btn-sm btn-outline-info me-1" @click="showAddExamModal(lesson)">
                            <i class="fas fa-file-alt"></i> آزمون
                          </button>
                          <button class="btn btn-sm btn-outline-secondary me-1" @click="editLesson(lesson)">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" @click="deleteLesson(lesson)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <empty-state
                        v-else
                        title="هنوز درسی اضافه نشده است"
                        description="با استفاده از دکمه بالا، درس جدید اضافه کنید."
                        icon="book"
                        compact
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <empty-state
            v-else
            title="دوره یافت نشد"
            description="متأسفانه دوره مورد نظر یافت نشد یا شما دسترسی به آن ندارید."
            icon="graduation-cap"
        >
          <router-link :to="{ name: 'Courses' }" class="btn btn-primary">
            بازگشت به لیست دوره‌ها
          </router-link>
        </empty-state>
      </loading-spinner>
    </div>

    <!-- Modal for adding/editing lessons (existing modal) -->
    <div class="modal fade" id="lessonModal" tabindex="-1" aria-labelledby="lessonModalLabel" aria-hidden="true">
      <!-- ... (modal existing content) ... -->
    </div>

    <!-- Modal for adding content to a lesson -->
    <div class="modal fade" id="contentModal" tabindex="-1" aria-labelledby="contentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="contentModalLabel">افزودن محتوا به درس: {{ selectedLesson.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs mb-3" id="contentTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="text-tab" data-bs-toggle="tab" data-bs-target="#text"
                        type="button" role="tab" aria-controls="text" aria-selected="true">
                  متن
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="file-tab" data-bs-toggle="tab" data-bs-target="#file"
                        type="button" role="tab" aria-controls="file" aria-selected="false">
                  فایل
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="video-tab" data-bs-toggle="tab" data-bs-target="#video"
                        type="button" role="tab" aria-controls="video" aria-selected="false">
                  ویدیو
                </button>
              </li>
            </ul>
            <div class="tab-content" id="contentTabContent">
              <!-- Tab: متن -->
              <div class="tab-pane fade show active" id="text" role="tabpanel" aria-labelledby="text-tab">
                <form @submit.prevent="saveTextContent">
                  <div class="mb-3">
                    <label for="contentTitle" class="form-label">عنوان محتوا</label>
                    <input type="text" class="form-control" id="contentTitle" v-model="contentForm.title" required>
                  </div>
                  <div class="mb-3">
                    <label for="textContent" class="form-label">محتوای متنی</label>
                    <textarea class="form-control" id="textContent"
                              v-model="contentForm.text" rows="10" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="isContentSubmitting">
                    <span v-if="isContentSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ذخیره محتوای متنی
                  </button>
                </form>
              </div>

              <!-- Tab: فایل -->
              <div class="tab-pane fade" id="file" role="tabpanel" aria-labelledby="file-tab">
                <form @submit.prevent="uploadFile">
                  <div class="mb-3">
                    <label for="fileUpload" class="form-label">آپلود فایل</label>
                    <input type="file" class="form-control" id="fileUpload" @change="handleFileSelect">
                    <small class="form-text text-muted">فرمت‌های مجاز: PDF, DOCX, PPT, ZIP (حداکثر 10MB)</small>
                  </div>
                  <div class="mb-3">
                    <label for="fileName" class="form-label">نام نمایشی فایل</label>
                    <input type="text" class="form-control" id="fileName" v-model="contentForm.fileName" required>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="isContentSubmitting || !contentForm.file">
                    <span v-if="isContentSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    آپلود فایل
                  </button>
                </form>
              </div>

              <!-- Tab: ویدیو -->
              <div class="tab-pane fade" id="video" role="tabpanel" aria-labelledby="video-tab">
                <form @submit.prevent="uploadVideo">
                  <div class="mb-3">
                    <label for="videoUpload" class="form-label">آپلود ویدیو</label>
                    <input type="file" class="form-control" id="videoUpload" @change="handleVideoSelect" accept="video/mp4,video/webm">
                    <small class="form-text text-muted">فرمت‌های مجاز: MP4, WEBM (حداکثر 100MB)</small>
                  </div>
                  <div class="mb-3">
                    <label for="videoTitle" class="form-label">عنوان ویدیو</label>
                    <input type="text" class="form-control" id="videoTitle" v-model="contentForm.videoTitle" required>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="isContentSubmitting || !contentForm.video">
                    <span v-if="isContentSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    آپلود ویدیو
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for adding assignment -->
    <div class="modal fade" id="assignmentModal" tabindex="-1" aria-labelledby="assignmentModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="assignmentModalLabel">افزودن تکلیف به درس: {{ selectedLesson.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="mb-3">
                <label for="assignmentTitle" class="form-label">عنوان تکلیف</label>
                <input type="text" class="form-control" id="assignmentTitle" v-model="assignmentForm.title" required>
              </div>
              <div class="mb-3">
                <label for="assignmentDescription" class="form-label">توضیحات تکلیف</label>
                <textarea class="form-control" id="assignmentDescription" v-model="assignmentForm.description" rows="4" required></textarea>
              </div>
              <div class="mb-3">
                <label for="assignmentDueDate" class="form-label">تاریخ تحویل</label>
                <input type="date" class="form-control" id="assignmentDueDate" v-model="assignmentForm.dueDate" required>
              </div>
              <div class="mb-3">
                <label for="assignmentFile" class="form-label">فایل پیوست (اختیاری)</label>
                <input type="file" class="form-control" id="assignmentFile" @change="handleAssignmentFileSelect">
              </div>
              <button type="submit" class="btn btn-primary" :disabled="isAssignmentSubmitting">
                <span v-if="isAssignmentSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ذخیره تکلیف
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for adding exam -->
    <div class="modal fade" id="examModal" tabindex="-1" aria-labelledby="examModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="examModalLabel">افزودن آزمون به درس: {{ selectedLesson.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveExam">
              <!-- Exam Info Section -->
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h6 class="mb-0">مشخصات آزمون</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="examTitle" class="form-label">عنوان آزمون</label>
                      <input type="text" class="form-control" id="examTitle" v-model="examForm.title" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="examDuration" class="form-label">مدت زمان (دقیقه)</label>
                      <input type="number" class="form-control" id="examDuration" v-model="examForm.duration" min="5" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="examPassingScore" class="form-label">نمره قبولی</label>
                      <input type="number" class="form-control" id="examPassingScore" v-model="examForm.passingScore" min="0" max="100" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="form-check mt-4">
                        <input class="form-check-input" type="checkbox" id="shuffleQuestions" v-model="examForm.shuffleQuestions">
                        <label class="form-check-label" for="shuffleQuestions">
                          تغییر ترتیب تصادفی سوالات
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="examDescription" class="form-label">توضیحات آزمون</label>
                    <textarea class="form-control" id="examDescription" v-model="examForm.description" rows="3"></textarea>
                  </div>
                </div>
              </div>

              <!-- Questions Section (Preview) -->
              <div class="card mb-4">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">سوالات آزمون</h6>
                  <div>
                    <button type="button" class="btn btn-primary btn-sm" @click="createExamFirst">
                      افزودن سوال
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <p class="text-muted">برای افزودن سوالات به آزمون، ابتدا آزمون را ایجاد کنید.</p>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="isExamSubmitting">
                <span v-if="isExamSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ایجاد آزمون
              </button>
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
</template>

<script>
import { mapGetters } from 'vuex';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
// import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default {
  name: 'CourseDetail',
  components: {
    LoadingSpinner,
    EmptyState,
    ConfirmationDialog
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup() {
    const { isStudent, isTeacher, getUserFullName } = useUser();
    const { formatDate, truncateText } = useFormatters();

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

      // Para el modal de lecciones existente
      lessonForm: {
        id: null,
        title: '',
        description: '',
        orderIndex: 0
      },

      // Para el modal de contenido
      selectedLesson: {},
      contentForm: {
        title: '',
        text: '',
        file: null,
        fileName: '',
        video: null,
        videoTitle: ''
      },
      isContentSubmitting: false,

      // Para el modal de tareas
      assignmentForm: {
        title: '',
        description: '',
        dueDate: '',
        file: null
      },
      isAssignmentSubmitting: false,

      // Para el modal de exámenes
      examForm: {
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        shuffleQuestions: false
      },
      isExamSubmitting: false,

      // Datos del progreso
      progress: {
        completedLessons: 0,
        totalTimeSpent: 0,
        examsPassed: 0,
        examsTotal: 0,
        exercisesCompleted: 0,
        exercisesTotal: 0,
        circleLength: 439.6, // 2 * PI * 70 (radio del círculo)
        circleDashOffset: 439.6, // Desplazamiento inicial (0% de progreso)
        completedLessonIds: [],
        timeline: []
      }
    };
  },
  computed: {
    // ... (computed properties del componente original)
  },
  async created() {
    // ... (método created del componente original)
  },
  methods: {
    // ... (mantener todos los métodos originales)

    // Métodos para gestionar el contenido
    showAddContentModal(lesson) {
      this.selectedLesson = lesson;
      this.contentForm = {
        title: '',
        text: '',
        file: null,
        fileName: '',
        video: null,
        videoTitle: ''
      };

      const modal = new bootstrap.Modal(document.getElementById('contentModal'));
      modal.show();
    },

    saveTextContent() {
      if (this.isContentSubmitting) return;
      this.isContentSubmitting = true;

      try {
        // En un entorno real, esto enviaría una solicitud a la API
        console.log('Saving text content:', {
          lessonId: this.selectedLesson.id,
          title: this.contentForm.title,
          content: this.contentForm.text
        });

        // Simulamos una respuesta exitosa
        setTimeout(() => {
          // Agregamos el nuevo contenido a la lección
          if (!this.selectedLesson.contents) {
            this.selectedLesson.contents = [];
          }

          const newContent = {
            id: Date.now(),
            title: this.contentForm.title,
            type: 'TEXT',
            textContent: this.contentForm.text,
            orderIndex: this.selectedLesson.contents.length
          };

          this.selectedLesson.contents.push(newContent);

          this.$toast.success('محتوای متنی با موفقیت اضافه شد');

          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
          modal.hide();

          this.isContentSubmitting = false;
        }, 800);
      } catch (error) {
        console.error('Error saving text content:', error);
        this.$toast.error('خطا در ذخیره محتوای متنی');
        this.isContentSubmitting = false;
      }
    },

    handleFileSelect(event) {
      if (event.target.files.length > 0) {
        this.contentForm.file = event.target.files[0];
        if (!this.contentForm.fileName) {
          this.contentForm.fileName = this.contentForm.file.name;
        }
      }
    },

    uploadFile() {
      if (this.isContentSubmitting || !this.contentForm.file) return;
      this.isContentSubmitting = true;

      try {
        // En un entorno real, esto enviaría una solicitud a la API
        console.log('Uploading file:', {
          lessonId: this.selectedLesson.id,
          fileName: this.contentForm.fileName,
          file: this.contentForm.file
        });

        // Simulamos una respuesta exitosa
        setTimeout(() => {
          // Agregamos el nuevo contenido a la lección
          if (!this.selectedLesson.contents) {
            this.selectedLesson.contents = [];
          }

          const fileType = this.contentForm.file.name.split('.').pop().toLowerCase();

          const newContent = {
            id: Date.now(),
            title: this.contentForm.fileName,
            type: fileType === 'pdf' ? 'PDF' : 'FILE',
            file: {
              id: Date.now(),
              originalFilename: this.contentForm.file.name,
              contentType: this.contentForm.file.type,
              filePath: `/courses/${this.courseId}/lessons/${this.selectedLesson.id}/files/${Date.now()}_${this.contentForm.file.name}`,
              fileSize: this.contentForm.file.size
            },
            orderIndex: this.selectedLesson.contents.length
          };

          this.selectedLesson.contents.push(newContent);

          this.$toast.success('فایل با موفقیت آپلود شد');

          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
          modal.hide();

          this.isContentSubmitting = false;
        }, 1000);
      } catch (error) {
        console.error('Error uploading file:', error);
        this.$toast.error('خطا در آپلود فایل');
        this.isContentSubmitting = false;
      }
    },

    handleVideoSelect(event) {
      if (event.target.files.length > 0) {
        this.contentForm.video = event.target.files[0];
        if (!this.contentForm.videoTitle) {
          this.contentForm.videoTitle = this.contentForm.video.name.split('.')[0];
        }
      }
    },

    uploadVideo() {
      if (this.isContentSubmitting || !this.contentForm.video) return;
      this.isContentSubmitting = true;

      try {
        // En un entorno real, esto enviaría una solicitud a la API
        console.log('Uploading video:', {
          lessonId: this.selectedLesson.id,
          videoTitle: this.contentForm.videoTitle,
          video: this.contentForm.video
        });

        // Simulamos una respuesta exitosa
        setTimeout(() => {
          // Agregamos el nuevo contenido a la lección
          if (!this.selectedLesson.contents) {
            this.selectedLesson.contents = [];
          }

          const newContent = {
            id: Date.now(),
            title: this.contentForm.videoTitle,
            type: 'VIDEO',
            file: {
              id: Date.now(),
              originalFilename: this.contentForm.video.name,
              contentType: this.contentForm.video.type,
              filePath: `/courses/${this.courseId}/lessons/${this.selectedLesson.id}/videos/${Date.now()}_${this.contentForm.video.name}`,
              fileSize: this.contentForm.video.size
            },
            orderIndex: this.selectedLesson.contents.length
          };

          this.selectedLesson.contents.push(newContent);

          this.$toast.success('ویدیو با موفقیت آپلود شد');

          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
          modal.hide();

          this.isContentSubmitting = false;
        }, 1200);
      } catch (error) {
        console.error('Error uploading video:', error);
        this.$toast.error('خطا در آپلود ویدیو');
        this.isContentSubmitting = false;
      }
    },

    // Métodos para gestionar las tareas (assignments)
    showAddAssignmentModal(lesson) {
      this.selectedLesson = lesson;
      // Establecer la fecha de entrega a 7 días a partir de hoy
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      this.assignmentForm = {
        title: '',
        description: '',
        dueDate: dueDate.toISOString().split('T')[0],
        file: null
      };

      const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
      modal.show();
    },

    handleAssignmentFileSelect(event) {
      if (event.target.files.length > 0) {
        this.assignmentForm.file = event.target.files[0];
      }
    },

    saveAssignment() {
      if (this.isAssignmentSubmitting) return;
      this.isAssignmentSubmitting = true;

      try {
        // En un entorno real, esto enviaría una solicitud a la API
        console.log('Creating assignment:', {
          lessonId: this.selectedLesson.id,
          title: this.assignmentForm.title,
          description: this.assignmentForm.description,
          dueDate: this.assignmentForm.dueDate,
          file: this.assignmentForm.file
        });

        // Simulamos una respuesta exitosa
        setTimeout(() => {
          // Actualizar la lección para indicar que tiene una tarea
          const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
          if (lessonIndex !== -1) {
            this.course.lessons[lessonIndex].hasAssignment = true;
          }

          this.$toast.success('تکلیف با موفقیت ایجاد شد');

          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('assignmentModal'));
          modal.hide();

          this.isAssignmentSubmitting = false;
        }, 800);
      } catch (error) {
        console.error('Error creating assignment:', error);
        this.$toast.error('خطا در ایجاد تکلیف');
        this.isAssignmentSubmitting = false;
      }
    },

    // Métodos para gestionar los exámenes
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

    createExamFirst() {
      this.$toast.info('لطفاً ابتدا آزمون را ایجاد کنید، سپس می‌توانید سوالات را اضافه کنید.');
    },

    saveExam() {
      if (this.isExamSubmitting) return;
      this.isExamSubmitting = true;

      try {
        // En un entorno real, esto enviaría una solicitud a la API
        console.log('Creating exam:', {
          lessonId: this.selectedLesson.id,
          title: this.examForm.title,
          description: this.examForm.description,
          duration: this.examForm.duration,
          passingScore: this.examForm.passingScore,
          shuffleQuestions: this.examForm.shuffleQuestions
        });

        // Simulamos una respuesta exitosa
        setTimeout(() => {
          // Actualizar la lección para indicar que tiene un examen
          const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
          if (lessonIndex !== -1) {
            this.course.lessons[lessonIndex].hasExam = true;
          }

          this.$toast.success('آزمون با موفقیت ایجاد شد');

          // Mostrar mensaje sobre cómo añadir preguntas
          this.$toast.info('برای افزودن سوالات به آزمون، به صفحه مدیریت آزمون‌ها مراجعه کنید.');

          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('examModal'));
          modal.hide();

          // Redirigir a la página de creación de exámenes
          this.$router.push(`/exams/create?lessonId=${this.selectedLesson.id}`);

          this.isExamSubmitting = false;
        }, 1000);
      } catch (error) {
        console.error('Error creating exam:', error);
        this.$toast.error('خطا در ایجاد آزمون');
        this.isExamSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
/* Mantener los estilos existentes */

/* Estilos adicionales para la gestión de contenido */
.content-list {
  max-height: 300px;
  overflow-y: auto;
}

.content-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.content-type-icon {
  margin-left: 10px;
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.content-info {
  flex-grow: 1;
}

.content-title {
  font-weight: 600;
}

.content-actions {
  margin-right: 10px;
}

/* Estilos adicionales para la gestión de tareas y exámenes */
.lesson-management-item {
  position: relative;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.lesson-management-item .lesson-number {
  background-color: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.lesson-management-item .lesson-info {
  flex-grow: 1;
}

.lesson-management-item .lesson-actions {
  display: flex;
  gap: 5px;
}

/* Si los botones necesitan ajustes para pantallas más pequeñas */
@media (max-width: 768px) {
  .lesson-management-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .lesson-management-item .lesson-actions {
    margin-top: 10px;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>