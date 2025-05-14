<template>
  <div class="profile-container">
    <div class="container py-5">
      <div class="row">
        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-body text-center">
              <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <h5 class="my-3">{{ getUserFullName() }}</h5>
              <p class="text-muted mb-1">{{ userRoleText }}</p>
              <p class="text-muted mb-4">{{ user.email }}</p>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body">
              <div class="profile-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.totalCourses }}</div>
                  <div class="stat-label">دوره‌ها</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ stats.completedCourses }}</div>
                  <div class="stat-label">تکمیل شده</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ stats.averageProgress }}%</div>
                  <div class="stat-label">پیشرفت</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">اطلاعات شخصی</h5>
              <button class="btn btn-sm btn-primary" @click="editMode = !editMode">
                <i class="fas fa-edit me-1"></i> {{ editMode ? 'انصراف' : 'ویرایش' }}
              </button>
            </div>
            <div class="card-body">
              <form v-if="editMode" @submit.prevent="updateProfile">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">نام</label>
                    <input type="text" class="form-control" id="firstName" v-model="formData.firstName">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">نام خانوادگی</label>
                    <input type="text" class="form-control" id="lastName" v-model="formData.lastName">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">ایمیل</label>
                    <input type="email" class="form-control" id="email" v-model="formData.email">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="phoneNumber" class="form-label">شماره تلفن</label>
                    <input type="text" class="form-control" id="phoneNumber" v-model="formData.phoneNumber">
                  </div>
                </div>

                <div class="row" v-if="!isTeacher">
                  <div class="col-md-6 mb-3">
                    <label for="studentId" class="form-label">شماره دانش‌آموزی</label>
                    <input type="text" class="form-control" id="studentId" v-model="formData.studentId">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="age" class="form-label">سن</label>
                    <input type="number" class="form-control" id="age" v-model="formData.age">
                  </div>
                </div>

                <div class="d-flex justify-content-between mt-3">
                  <button type="button" class="btn btn-secondary" @click="editMode = false">انصراف</button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ذخیره تغییرات
                  </button>
                </div>
              </form>

              <div v-else class="profile-info">
                <div class="row mb-3">
                  <div class="col-sm-3">
                    <span class="info-label">نام و نام خانوادگی</span>
                  </div>
                  <div class="col-sm-9">
                    <span class="info-value">{{ getUserFullName() }}</span>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-sm-3">
                    <span class="info-label">ایمیل</span>
                  </div>
                  <div class="col-sm-9">
                    <span class="info-value">{{ user.email }}</span>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-sm-3">
                    <span class="info-label">نام کاربری</span>
                  </div>
                  <div class="col-sm-9">
                    <span class="info-value">{{ user.username }}</span>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-sm-3">
                    <span class="info-label">شماره تلفن</span>
                  </div>
                  <div class="col-sm-9">
                    <span class="info-value">{{ user.phoneNumber || '---' }}</span>
                  </div>
                </div>

                <div v-if="!isTeacher" class="row mb-3">
                  <div class="col-sm-3">
                    <span class="info-label">شماره دانش‌آموزی</span>
                  </div>
                  <div class="col-sm-9">
                    <span class="info-value">{{ user.studentId || '---' }}</span>
                  </div>
                </div>

                <div v-if="!isTeacher" class="row mb-3">
                  <div class="col-sm-3">
                    <span class="info-label">سن</span>
                  </div>
                  <div class="col-sm-9">
                    <span class="info-value">{{ user.age || '---' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">تغییر رمز عبور</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="changePassword">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">رمز عبور فعلی</label>
                  <input type="password" class="form-control" id="currentPassword" v-model="passwordData.currentPassword" required>
                </div>

                <div class="mb-3">
                  <label for="newPassword" class="form-label">رمز عبور جدید</label>
                  <input type="password" class="form-control" id="newPassword" v-model="passwordData.newPassword" required>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">تکرار رمز عبور جدید</label>
                  <input type="password" class="form-control" id="confirmPassword" v-model="passwordData.confirmPassword" required>
                </div>

                <button type="submit" class="btn btn-primary w-100" :disabled="isPasswordSubmitting">
                  <span v-if="isPasswordSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  تغییر رمز عبور
                </button>
              </form>
            </div>
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
        // دریافت اطلاعات کاربر فعلی
        this.user = this.$store.getters.currentUser;

        // پر کردن فرم با داده‌های کاربر
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
          // دریافت آمار کاربر (فقط برای دانش‌آموزان)
          const response = await axios.get('/progress/stats');
          this.stats = response.data;
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
      } else if (this.isTeacher) {
        try {
          // دریافت آمار استاد
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
        // ارسال اطلاعات به‌روز شده به سرور
        const response = await axios.put('/user/profile', this.formData);

        // به‌روزرسانی اطلاعات کاربر در استور
        const updatedUser = {
          ...this.user,
          ...this.formData
        };
        this.$store.commit('update_user', updatedUser);
        this.user = updatedUser;

        // خروج از حالت ویرایش
        this.editMode = false;

        this.finishSubmitting('پروفایل شما با موفقیت به‌روزرسانی شد.');
      } catch (error) {
        console.error('Error updating profile:', error);
        this.finishSubmitting(null, 'مشکلی در به‌روزرسانی پروفایل رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    async changePassword() {
      // بررسی تطابق رمز عبور جدید با تکرار آن
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.showErrorToast('رمز عبور جدید و تکرار آن مطابقت ندارند.');
        return;
      }

      this.isPasswordSubmitting = true;

      try {
        // ارسال درخواست تغییر رمز عبور
        await axios.put('/user/change-password', {
          currentPassword: this.passwordData.currentPassword,
          newPassword: this.passwordData.newPassword
        });

        // پاک کردن فرم
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
.profile-container {
  min-height: calc(100vh - 56px);
  background-color: #f8f9fa;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.profile-avatar i {
  font-size: 80px;
  color: #6c757d;
}

.profile-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.profile-info .info-label {
  color: #6c757d;
  font-weight: bold;
}

.profile-info .info-value {
  color: #212529;
}
</style>