<template>
  <div class="modern-page-bg" style="min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-lg-4 mb-4">
          <!-- Profile Card -->
          <div class="modern-card animate-slide-right">
            <div class="text-center">
              <div class="modern-logo large success mb-3">
                <i class="fas fa-user-circle"></i>
              </div>
              <h5 class="modern-title">{{ getUserFullName() }}</h5>
              <p class="modern-subtitle">{{ userRoleText }}</p>
              <p class="text-muted">{{ user.email }}</p>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="modern-card animate-slide-right" style="animation-delay: 0.1s;">
            <h6 class="text-center mb-3">
              <i class="fas fa-chart-bar text-primary me-2"></i>
              آمار کلی
            </h6>
            <div class="row text-center">
              <div class="col-4">
                <div class="modern-stat-value text-primary">{{ stats.totalCourses }}</div>
                <div class="modern-stat-label">دوره‌ها</div>
              </div>
              <div class="col-4">
                <div class="modern-stat-value text-success">{{ stats.completedCourses }}</div>
                <div class="modern-stat-label">تکمیل شده</div>
              </div>
              <div class="col-4">
                <div class="modern-stat-value text-warning">{{ stats.averageProgress }}%</div>
                <div class="modern-stat-label">پیشرفت</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <!-- Personal Information Card -->
          <div class="modern-card animate-slide-up">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="modern-title mb-0">
                <i class="fas fa-user-edit text-primary me-2"></i>
                اطلاعات شخصی
              </h5>
              <button class="modern-btn modern-btn-primary" @click="editMode = !editMode">
                <i class="fas fa-edit me-1"></i>
                {{ editMode ? 'انصراف' : 'ویرایش' }}
              </button>
            </div>

            <!-- Edit Form -->
            <form v-if="editMode" @submit.prevent="updateProfile">
              <div class="row">
                <div class="col-md-6 modern-form-group">
                  <label for="firstName" class="modern-form-label">نام</label>
                  <input type="text" class="modern-form-control" id="firstName" v-model="formData.firstName">
                </div>
                <div class="col-md-6 modern-form-group">
                  <label for="lastName" class="modern-form-label">نام خانوادگی</label>
                  <input type="text" class="modern-form-control" id="lastName" v-model="formData.lastName">
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 modern-form-group">
                  <label for="email" class="modern-form-label">ایمیل</label>
                  <input type="email" class="modern-form-control" id="email" v-model="formData.email">
                </div>
                <div class="col-md-6 modern-form-group">
                  <label for="phoneNumber" class="modern-form-label">شماره تلفن</label>
                  <input type="text" class="modern-form-control" id="phoneNumber" v-model="formData.phoneNumber">
                </div>
              </div>

              <div class="row" v-if="!isTeacher">
                <div class="col-md-6 modern-form-group">
                  <label for="studentId" class="modern-form-label">شماره دانش‌آموزی</label>
                  <input type="text" class="modern-form-control" id="studentId" v-model="formData.studentId">
                </div>
                <div class="col-md-6 modern-form-group">
                  <label for="age" class="modern-form-label">سن</label>
                  <input type="number" class="modern-form-control" id="age" v-model="formData.age">
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <button type="button" class="modern-btn modern-btn-secondary" @click="editMode = false">
                  انصراف
                </button>
                <button type="submit" class="modern-btn modern-btn-success" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ذخیره تغییرات
                </button>
              </div>
            </form>

            <!-- View Mode -->
            <div v-else class="profile-info">
              <div class="row mb-3">
                <div class="col-sm-4">
                  <span class="modern-form-label">نام و نام خانوادگی</span>
                </div>
                <div class="col-sm-8">
                  <span class="info-value">{{ getUserFullName() }}</span>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-4">
                  <span class="modern-form-label">ایمیل</span>
                </div>
                <div class="col-sm-8">
                  <span class="info-value">{{ user.email }}</span>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-4">
                  <span class="modern-form-label">نام کاربری</span>
                </div>
                <div class="col-sm-8">
                  <span class="info-value">{{ user.username }}</span>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-4">
                  <span class="modern-form-label">شماره تلفن</span>
                </div>
                <div class="col-sm-8">
                  <span class="info-value">{{ user.phoneNumber || '---' }}</span>
                </div>
              </div>

              <div v-if="!isTeacher" class="row mb-3">
                <div class="col-sm-4">
                  <span class="modern-form-label">شماره دانش‌آموزی</span>
                </div>
                <div class="col-sm-8">
                  <span class="info-value">{{ user.studentId || '---' }}</span>
                </div>
              </div>

              <div v-if="!isTeacher" class="row mb-3">
                <div class="col-sm-4">
                  <span class="modern-form-label">سن</span>
                </div>
                <div class="col-sm-8">
                  <span class="info-value">{{ user.age || '---' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Change Password Card -->
          <div class="modern-card animate-slide-up" style="animation-delay: 0.2s;">
            <h5 class="modern-title mb-4">
              <i class="fas fa-key text-warning me-2"></i>
              تغییر رمز عبور
            </h5>

            <form @submit.prevent="changePassword">
              <div class="modern-form-group">
                <label for="currentPassword" class="modern-form-label">رمز عبور فعلی</label>
                <input type="password" class="modern-form-control" id="currentPassword" v-model="passwordData.currentPassword" required>
              </div>

              <div class="modern-form-group">
                <label for="newPassword" class="modern-form-label">رمز عبور جدید</label>
                <input type="password" class="modern-form-control" id="newPassword" v-model="passwordData.newPassword" required>
              </div>

              <div class="modern-form-group">
                <label for="confirmPassword" class="modern-form-label">تکرار رمز عبور جدید</label>
                <input type="password" class="modern-form-control" id="confirmPassword" v-model="passwordData.confirmPassword" required>
              </div>

              <button type="submit" class="modern-btn modern-btn-warning w-100" :disabled="isPasswordSubmitting">
                <span v-if="isPasswordSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                تغییر رمز عبور
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import formMixin from '@/mixins/formMixin.js';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'Profile',
  mixins: [formMixin],
  setup() {
    const { isTeacher, isStudent } = useUser();

    return {
      isTeacher,
      isStudent
    };
  },
  data() {
    return {
      user: {},
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0
      },
      editMode: false,
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        studentId: '',
        age: null
      },
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      isPasswordSubmitting: false
    };
  },
  computed: {
    userRoleText() {
      if (this.isTeacher) {
        return 'استاد';
      } else if (this.isStudent) {
        return 'دانش‌آموز';
      }
      return 'کاربر';
    }
  },
  created() {
    this.fetchUserData();
    this.fetchUserStats();
  },
  methods: {
    async fetchUserData() {
      try {
        this.user = this.$store.getters.currentUser;
        this.formData = {
          firstName: this.user.firstName || '',
          lastName: this.user.lastName || '',
          email: this.user.email || '',
          phoneNumber: this.user.phoneNumber || '',
          studentId: this.user.studentId || '',
          age: this.user.age || null
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.showErrorToast('مشکلی در دریافت اطلاعات کاربر رخ داد.');
      }
    },

    async fetchUserStats() {
      if (this.isStudent) {
        try {
          const response = await axios.get('/progress/stats');
          this.stats = response.data;
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
      } else if (this.isTeacher) {
        try {
          const coursesResponse = await axios.get('/courses/teaching');
          this.stats = {
            totalCourses: coursesResponse.data.length,
            completedCourses: 0,
            averageProgress: 0
          };
        } catch (error) {
          console.error('Error fetching teacher stats:', error);
        }
      }
    },

    getUserFullName() {
      if (this.user.firstName && this.user.lastName) {
        return `${this.user.firstName} ${this.user.lastName}`;
      }
      return this.user.username || 'کاربر';
    },

    async updateProfile() {
      this.startSubmitting();

      try {
        const response = await axios.put('/user/profile', this.formData);
        const updatedUser = {
          ...this.user,
          ...this.formData
        };
        this.$store.commit('update_user', updatedUser);
        this.user = updatedUser;
        this.editMode = false;
        this.finishSubmitting('پروفایل شما با موفقیت به‌روزرسانی شد.');
      } catch (error) {
        console.error('Error updating profile:', error);
        this.finishSubmitting(null, 'مشکلی در به‌روزرسانی پروفایل رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    async changePassword() {
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.showErrorToast('رمز عبور جدید و تکرار آن مطابقت ندارند.');
        return;
      }

      this.isPasswordSubmitting = true;

      try {
        await axios.put('/user/change-password', {
          currentPassword: this.passwordData.currentPassword,
          newPassword: this.passwordData.newPassword
        });

        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        this.showSuccessToast('رمز عبور شما با موفقیت تغییر یافت.');
      } catch (error) {
        console.error('Error changing password:', error);
        this.showErrorToast('مشکلی در تغییر رمز عبور رخ داد. لطفاً اطمینان حاصل کنید که رمز عبور فعلی صحیح است.');
      } finally {
        this.isPasswordSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
/* Component specific styles */
.info-value {
  color: #2c3e50;
  font-weight: 500;
}

.profile-info .row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.75rem 0;
}

.profile-info .row:last-child {
  border-bottom: none;
}

/* Animation delays */
.animate-slide-right {
  animation: slideInRight 0.6s ease forwards;
}

.animate-slide-up {
  animation: slideInUp 0.6s ease forwards;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modern-page-bg {
    padding: 1rem 0.5rem;
  }

  .col-lg-4 {
    margin-bottom: 2rem;
  }

  .modern-stat-value {
    font-size: 1.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .info-value {
    color: #e2e8f0;
  }

  .profile-info .row {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}
</style>