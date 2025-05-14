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
    meta: { title: 'صفحه اصلی', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'ورود', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: 'ثبت‌نام', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../components/dashboard/Dashboard.vue'),
    meta: { title: 'داشبورد', requiresAuth: true }
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import(/* webpackChunkName: "courses" */ '../components/courses/CourseList.vue'),
    meta: { title: 'دوره‌ها', requiresAuth: true }
  },
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: () => import(/* webpackChunkName: "course-detail" */ '../components/views/CourseDetail.vue'),
    props: true,
    meta: { title: 'جزئیات دوره', requiresAuth: true }
  },
  {
    path: '/courses/teaching',
    name: 'TeachingCourses',
    component: () => import(/* webpackChunkName: "teaching-courses" */ '../views/courses/TeachingCourses.vue'),
    meta: { title: 'دوره‌های تدریس', requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/courses/available',
    name: 'AvailableCourses',
    component: () => import(/* webpackChunkName: "available-courses" */ '../views/courses/AvailableCourses.vue'),
    meta: { title: 'دوره‌های موجود', requiresAuth: true }
  },
  {
    path: '/exams/:id',
    name: 'Exam',
    component: () => import(/* webpackChunkName: "exam" */ '../views/exams/Exam.vue'),
    props: true,
    meta: { title: 'آزمون', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "profile" */ '../views/Profile.vue'),
    meta: { title: 'پروفایل', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'صفحه یافت نشد' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// محافظت از مسیرهایی که نیاز به احراز هویت دارند
router.beforeEach(async (to, from, next) => {
  // تنظیم عنوان صفحه
  document.title = to.meta.title ? `${to.meta.title} - سامانه مدیریت یادگیری` : 'سامانه مدیریت یادگیری'
  
  // بررسی نیاز به احراز هویت
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // بررسی وضعیت لاگین کاربر
    if (!store.getters.isLoggedIn) {
      // کاربر وارد نشده است، به صفحه ورود منتقل می‌شود
      next({ 
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // بررسی نقش در صورت نیاز
      if (to.matched.some(record => record.meta.requiresTeacher)) {
        if (store.getters.userRole.isTeacher) {
          next()
        } else {
          // کاربر مجوز دسترسی ندارد
          next({ name: 'Dashboard' })
        }
      } else {
        next()
      }
    }
  } else {
    // صفحاتی که نیازی به احراز هویت ندارند
    if (store.getters.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
      // کاربر قبلاً وارد شده و می‌خواهد به صفحه ورود برود
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
})

export default router
