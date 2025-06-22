// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// لود صفحات اصلی
import Home from '../components/views/Home.vue'
import Login from '../components/views/Login.vue'
import Register from '../components/views/Register.vue'
import NotFound from '../components/views/NotFound.vue'

// تعریف مسیرها
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'صفحه اصلی',
      requiresAuth: false,
      hideSidebar: true  // صفحه اصلی sidebar نداشته باشد
    }
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import(/* webpackChunkName: "students" */ '../components/views/Students.vue'),
    meta: {
      title: 'دانش‌آموزان',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },

  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'ورود',
      requiresAuth: false,
      hideSidebar: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'ثبت‌نام',
      requiresAuth: false,
      hideSidebar: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../components/dashboard/Dashboard.vue'),
    meta: {
      title: 'داشبورد',
      requiresAuth: true,
      showSidebar: true
    }
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import(/* webpackChunkName: "courses" */ '../components/courses/CourseList.vue'),
    meta: {
      title: 'دوره‌ها',
      requiresAuth: true,
      showSidebar: true
    }
  },
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: () => import(/* webpackChunkName: "course-detail" */ '../components/courses/CourseDetail.vue'),
    props: true,
    meta: {
      title: 'جزئیات دوره',
      requiresAuth: true,
      showSidebar: true
    }
  },
  {
    path: '/courses/teaching',
    name: 'TeachingCourses',
    component: () => import(/* webpackChunkName: "teaching-courses" */ '../components/courses/TeachingCourses.vue'),
    meta: {
      title: 'دوره‌های در حال تدریس',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/courses/available',
    name: 'AvailableCourses',
    component: () => import(/* webpackChunkName: "available-courses" */ '../components/courses/AvailableCourses.vue'),
    meta: {
      title: 'دوره‌های موجود',
      requiresAuth: true,
      showSidebar: true
    }
  },
  {
    path: '/exams/:id',
    name: 'Exam',
    component: () => import(/* webpackChunkName: "exam" */ '../components/exams/Exam.vue'),
    props: true,
    meta: {
      title: 'آزمون',
      requiresAuth: true,
      hideSidebar: true  // در حین آزمون sidebar مزاحم است
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "profile" */ '../components/views/Profile.vue'),
    meta: {
      title: 'پروفایل',
      requiresAuth: true,
      showSidebar: true
    }
  },
  // Teacher routes
  {
    path: '/teacher/exams',
    name: 'TeacherExams',
    component: () => import(/* webpackChunkName: "teacher-exams" */ '../components/exams/TeacherExams.vue'),
    meta: {
      title: 'آزمون‌های من',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/teacher/assignments/pending',
    name: 'PendingAssignments',
    component: () => import(/* webpackChunkName: "pending-assignments" */ '../components/assignments/PendingAssignments.vue'),
    meta: {
      title: 'تکالیف در حال بررسی',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/teacher/assignments',
    name: 'AssignmentManager',
    component: () => import(/* webpackChunkName: "assignment-manager" */ '../components/assignments/AssignmentManager.vue'),
    meta: {
      title: 'مدیریت تکالیف',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/teacher/grading',
    name: 'AssignmentGrading',
    component: () => import(/* webpackChunkName: "assignment-grading" */ '../components/assignments/AssignmentGradingTable.vue'),
    meta: {
      title: 'نمره‌گذاری تکالیف',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/teacher/student-activities',
    name: 'StudentActivities',
    component: () => import(/* webpackChunkName: "student-activities" */ '../components/analytics/StudentActivities.vue'),
    meta: {
      title: 'فعالیت دانش‌آموزان',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/teacher/performance-analysis',
    name: 'PerformanceAnalysis',
    component: () => import(/* webpackChunkName: "performance-analysis" */ '../components/analytics/PerformanceAnalysis.vue'),
    meta: {
      title: 'تحلیل عملکرد',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/exams/create',
    name: 'ExamCreator',
    component: () => import(/* webpackChunkName: "exam-creator" */ '../components/exams/ExamCreator.vue'),
    meta: {
      title: 'ایجاد آزمون جدید',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/exams/:id/edit',
    name: 'ExamEditor',
    component: () => import(/* webpackChunkName: "exam-creator" */ '../components/exams/ExamCreator.vue'),
    props: true,
    meta: {
      title: 'ویرایش آزمون',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/exams/:id/results',
    name: 'ExamResults',
    component: () => import(/* webpackChunkName: "exam-results" */ '../components/exams/ExamResultsTable.vue'),
    props: true,
    meta: {
      title: 'نتایج آزمون',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/question-bank',
    name: 'QuestionBank',
    component: () => import(/* webpackChunkName: "question-bank" */ '../components/exams/QuestionBank.vue'),
    meta: {
      title: 'بانک سوالات',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/question-bank',
    name: 'QuestionBank',
    component: () => import(/* webpackChunkName: "question-bank" */ '../components/exams/QuestionBank.vue'),
    meta: {
      title: 'بانک سوالات',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/content/:contentId/view',
    name: 'ContentViewer',
    component: () => import(/* webpackChunkName: "content-viewer" */ '../components/courses/ContentViewer.vue'),
    props: true,
    meta: {
      title: 'مشاهده محتوا',
      requiresAuth: true,
      hideSidebar: true // Hide sidebar for full-page content viewing
    }
  },
  // Student routes
  {
    path: '/student/assignments',
    name: 'StudentAssignments',
    component: () => import(/* webpackChunkName: "student-assignments" */ '../components/assignments/StudentAssignments.vue'),
    meta: {
      title: 'تکالیف',
      requiresAuth: true,
      requiresStudent: true,
      showSidebar: true
    }
  },
  // Error pages
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: () => import(/* webpackChunkName: "error-pages" */ '../components/views/Forbidden.vue'),
    meta: {
      title: 'دسترسی مجاز نیست',
      hideSidebar: true
    }
  },
  {
    path: '/student/exams',
    name: 'StudentExams',
    component: () => import(/* webpackChunkName: "exam-list" */ '../components/exams/ExamList.vue'),
    meta: {
      title: 'آزمون‌های من',
      requiresAuth: true,
      requiresStudent: true,
      showSidebar: true
    }
  },
  {
    path: '/teacher/student-activities',
    name: 'StudentActivities',
    component: () => import('../components/analytics/StudentActivities.vue'),
    meta: {
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/student/exam-results',
    name: 'StudentExamResults',
    component: () => import(/* webpackChunkName: "student-exams-table" */ '../components/exams/StudentExamResults.vue'),
    meta: {
      title: 'نتایج آزمون‌ها',
      requiresAuth: true,
      requiresStudent: true,
      showSidebar: true
    }
  },
  {
    path: '/question-bank',
    name: 'QuestionBank',
    component: () => import(/* webpackChunkName: "question-bank" */ '../components/exams/QuestionBank.vue'),
    meta: {
      title: 'بانک سوالات',
      requiresAuth: true,
      requiresTeacher: true,
      showSidebar: true
    }
  },
  {
    path: '/exercises/:id',
    name: 'Exercise',
    component: () => import(/* webpackChunkName: "exercise" */ '../components/exercises/Exercise.vue'),
    props: true,
    meta: {
      title: 'تمرین',
      requiresAuth: true,
      hideSidebar: true
    }
  },

  {
    path: '/chat/:courseId',
    name: 'CourseChat',
    component: () => import(/* webpackChunkName: "chat" */ '../components/courses/CourseChat.vue'),
    props: true,
    meta: {
      title: 'گفتگوی درس',
      requiresAuth: true,
      hideSidebar: true  // برای تمرکز بیشتر روی چت
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'صفحه یافت نشد',
      hideSidebar: true
    }
  }
]

const router = createRouter({
  history: createWebHistory("/"),
  routes
})

router.beforeEach(async (to, from, next) => {
  // تنظیم عنوان صفحه
  document.title = to.meta.title ? `${to.meta.title} - سامانه آموزش آنلاین` : 'سامانه آموزش آنلاین'

  // بررسی نیاز به احراز هویت
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // بررسی وضعیت لاگین کاربر
    if (!store.getters.isLoggedIn) {
      console.log("کاربر لاگین نیست:", localStorage.getItem('token'), store.state.auth);

      // یک راه میانبر برای حالت تست: اگر localStorage دارای token است، ولی store هنوز مقدار ندارد
      if (localStorage.getItem('token') && process.env.NODE_ENV === 'development') {
        console.log("بازیابی داده‌های تست از localStorage");
        try {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          const userRole = JSON.parse(localStorage.getItem('userRole') || 'null');

          if (user && userRole) {
            // تنظیم مجدد state در Vuex
            store.commit('auth/auth_success', {
              token: localStorage.getItem('token'),
              user: user,
              userRole: userRole
            });
            return next(); // ادامه مسیر
          }
        } catch (e) {
          console.error("خطا در بازیابی داده‌ها:", e);
        }
      }

      // کاربر وارد نشده است، به صفحه ورود منتقل می‌شود
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      // بررسی نقش در صورت نیاز
      if (to.matched.some(record => record.meta.requiresTeacher)) {
        if (store.getters.userRole.isTeacher) {
          next();
        } else {
          // کاربر مجوز دسترسی ندارد
          next({ name: 'Forbidden' });
        }
      } else if (to.matched.some(record => record.meta.requiresStudent)) {
        if (store.getters.userRole.isStudent) {
          next();
        } else {
          // کاربر مجوز دسترسی ندارد
          next({ name: 'Forbidden' });
        }
      } else {
        next();
      }
    }
  } else {
    // صفحاتی که نیازی به احراز هویت ندارند
    if (store.getters.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
      // کاربر قبلاً وارد شده و می‌خواهد به صفحه ورود برود
      next({ name: 'Dashboard' });
    } else {
      next();
    }
  }
});

export default router