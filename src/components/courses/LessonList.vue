<template>
  <div class="lesson-list">
    <div v-for="(lesson, index) in lessonsWithExpanded" :key="lesson.id" class="lesson-item">
      <div class="lesson-header" @click="toggleLesson(index)">
        <div class="lesson-title">
          <span class="lesson-number">{{ index + 1 }}</span>
          <h4>{{ lesson.title }}</h4>
        </div>
        <div class="lesson-info">
          <span v-if="lesson.duration" class="lesson-duration">
            <i class="fas fa-clock"></i> {{ lesson.duration }}
          </span>
          <button class="btn btn-link" :class="{ 'collapsed': !lesson.expanded }">
            <i class="fas" :class="lesson.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </button>
        </div>
      </div>
      <div class="lesson-content" v-if="lesson.expanded">
        <p v-if="lesson.description">{{ lesson.description }}</p>

        <!-- نمایش محتوای درس -->
        <div v-if="isEnrolled || (isTeacher && isTeacherOfCourse)" class="lesson-materials mt-3">
          <div v-if="lesson.content" class="content-text mb-3">
            <div v-html="lesson.content"></div>
          </div>

          <!-- فایل‌های پیوست -->
          <lesson-attachments
              v-if="lesson.attachments && lesson.attachments.length > 0"
              :attachments="lesson.attachments" />

          <!-- ویدیو -->
          <lesson-video
              v-if="lesson.videoUrl"
              :video-url="lesson.videoUrl" />

          <!-- دکمه‌های مدیریت درس برای معلم -->
          <div v-if="isTeacher && isTeacherOfCourse" class="mt-3 d-flex gap-2">
            <button class="btn btn-sm btn-success" @click="$emit('edit-lesson', lesson)">
              <i class="fas fa-edit"></i> ویرایش درس
            </button>
            <button class="btn btn-sm btn-primary" @click="$emit('add-content', lesson)">
              <i class="fas fa-plus"></i> افزودن محتوا
            </button>
            <button class="btn btn-sm btn-warning" @click="$emit('add-exam', lesson)">
              <i class="fas fa-clipboard-check"></i> ایجاد آزمون
            </button>
          </div>

          <!-- دکمه تکمیل درس برای دانش‌آموز -->
          <div v-else-if="isEnrolled" class="mt-3">
            <button
                v-if="!isLessonCompleted(lesson.id)"
                class="btn btn-success"
                @click="$emit('mark-complete', lesson.id)">
              <i class="fas fa-check"></i> علامت‌گذاری به عنوان تکمیل شده
            </button>
            <button v-else class="btn btn-outline-success" disabled>
              <i class="fas fa-check-double"></i> تکمیل شده
            </button>
          </div>
        </div>

        <!-- پیام برای دانش‌آموزانی که ثبت‌نام نکرده‌اند -->
        <div v-else class="alert alert-warning mt-3">
          <i class="fas fa-lock me-2"></i>
          برای دسترسی به محتوای این درس، لطفاً در دوره ثبت‌نام کنید.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LessonAttachments from './LessonAttachments.vue';
import LessonVideo from './LessonVideo.vue';

export default {
  name: 'LessonList',
  components: {
    LessonAttachments,
    LessonVideo
  },
  props: {
    lessons: {
      type: Array,
      required: true
    },
    isTeacher: {
      type: Boolean,
      default: false
    },
    isTeacherOfCourse: {
      type: Boolean,
      default: false
    },
    isEnrolled: {
      type: Boolean,
      default: false
    },
    completedLessons: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // کپی داخلی از دروس با ویژگی expanded
      internalLessons: []
    }
  },
  computed: {
    // ایجاد آرایه‌ای از دروس که هرکدام ویژگی expanded را دارند
    lessonsWithExpanded() {
      return this.internalLessons;
    }
  },
  watch: {
    // هر زمان که prop lessons تغییر کند، کپی داخلی را بروزرسانی می‌کنیم
    lessons: {
      immediate: true,
      handler(newLessons) {
        if (newLessons && Array.isArray(newLessons)) {
          console.log("درس‌ها تغییر کردند، تعداد:", newLessons.length);
          this.initializeLessons(newLessons);
        } else {
          console.warn("درس‌های دریافتی معتبر نیستند:", newLessons);
          this.internalLessons = [];
        }
      }
    }
  },
  created() {
    // مقداردهی اولیه دروس
    this.initializeLessons(this.lessons);
  },
  methods: {
    // مقداردهی اولیه دروس با ویژگی expanded
    initializeLessons(lessons) {
      if (!lessons || !Array.isArray(lessons)) {
        console.warn("درس‌های ورودی معتبر نیستند:", lessons);
        this.internalLessons = [];
        return;
      }

      // ایجاد کپی عمیق از دروس و افزودن ویژگی expanded
      this.internalLessons = lessons.map(lesson => {
        const newLesson = { ...lesson };
        // اگر expanded وجود نداشت، آن را اضافه می‌کنیم
        if (newLesson.expanded === undefined) {
          newLesson.expanded = false;
        }
        return newLesson;
      });

      console.log("درس‌ها مقداردهی شدند:", this.internalLessons);
    },

    // تغییر وضعیت نمایش درس
    toggleLesson(index) {
      console.log("درخواست تغییر وضعیت درس با شاخص:", index);

      // بررسی معتبر بودن شاخص
      if (index < 0 || index >= this.internalLessons.length) {
        console.error("شاخص درس نامعتبر است:", index);
        return;
      }

      // بستن سایر دروس اگر درس فعلی قرار است باز شود
      if (!this.internalLessons[index].expanded) {
        this.internalLessons.forEach((lesson, i) => {
          if (i !== index) {
            // this.$set(this.internalLessons[i], 'expanded', false);
            this.internalLessons[i]['expanded']=false;
          }
        });
      }

      // تغییر وضعیت درس فعلی
      // this.$set(this.internalLessons[index], 'expanded', !this.internalLessons[index].expanded);

      this.internalLessons[index]['expanded'] = !this.internalLessons[index].expanded;

      // ارسال رویداد به والد
      this.$emit('toggle-lesson', index);
    },

    // بررسی تکمیل شدن درس
    isLessonCompleted(lessonId) {
      return this.completedLessons.includes(lessonId);
    }
  }
}
</script>

<style scoped>
.lesson-list {
  margin-top: 20px;
}

.lesson-item {
  border: 1px solid #dee2e6;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  cursor: pointer;
}

.lesson-header:hover {
  background-color: #e9ecef;
}

.lesson-title {
  display: flex;
  align-items: center;
}

.lesson-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  margin-left: 10px;
  font-weight: bold;
}

.lesson-title h4 {
  margin-bottom: 0;
  font-size: 1.1rem;
}

.lesson-duration {
  color: #6c757d;
  margin-left: 15px;
}

.lesson-duration i {
  margin-left: 5px;
}

.lesson-content {
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.content-text {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
}
</style>