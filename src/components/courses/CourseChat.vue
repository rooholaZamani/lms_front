<template>
  <div class="course-chat-container">
    <div class="row">
      <!-- Sidebar (participants) -->
      <div class="col-md-3 mb-4">
        <div class="modern-card animate-slide-right">
          <h6 class="section-title">
            <i class="fas fa-users me-2"></i>
            شرکت‌کنندگان
          </h6>

          <loading-spinner :loading="loadingParticipants">
            <div v-if="participants.length > 0" class="participants-list">
              <div v-for="participant in participants" :key="participant.id" class="participant-item">
                <div class="participant-avatar">
                  {{ getInitials(participant.firstName, participant.lastName) }}
                </div>
                <div class="participant-info">
                  <div class="participant-name">{{ getUserFullName(participant) }}</div>
                  <div class="participant-role">{{ getUserRole(participant) }}</div>
                </div>
                <div class="participant-status" :class="{'online': participant.online}"></div>
              </div>
            </div>
            <div v-else class="text-center text-muted py-3">
              <i class="fas fa-users fa-2x mb-2"></i>
              <p>هیچ شرکت‌کننده‌ای یافت نشد</p>
            </div>
          </loading-spinner>
        </div>

        <div class="modern-card animate-slide-right" style="animation-delay: 0.1s;">
          <h6 class="section-title">
            <i class="fas fa-info-circle me-2"></i>
            اطلاعات دوره
          </h6>
          <div v-if="course" class="course-info">
            <p class="mb-2"><strong>استاد:</strong> {{ course.teacher ? getUserFullName(course.teacher) : 'نامشخص' }}</p>
            <p class="mb-0"><strong>دانش‌آموزان:</strong> {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Main Chat Section -->
      <div class="col-md-9">
        <div class="modern-card chat-main animate-slide-left">
          <!-- Messages -->
          <div class="chat-messages" ref="messagesContainer">
            <loading-spinner :loading="loading">
              <div v-if="messages.length === 0" class="empty-chat">
                <div class="modern-logo large secondary mb-3">
                  <i class="fas fa-comments"></i>
                </div>
                <h5>هنوز پیامی ارسال نشده است</h5>
                <p class="text-muted">اولین نفری باشید که گفتگو را شروع می‌کند!</p>
              </div>

              <div v-else class="messages-list">
                <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
                  <!-- Date separator -->
                  <div v-if="shouldShowDateSeparator(message, index)" class="date-separator">
                    <span>{{ formatDateHeader(message.sentAt) }}</span>
                  </div>

                  <!-- Message -->
                  <div :class="['message-item', message.sender.id === currentUser.id ? 'message-own' : 'message-other']">
                    <div class="message-avatar">
                      {{ getInitials(message.sender.firstName, message.sender.lastName) }}
                    </div>
                    <div class="message-content">
                      <div class="message-header">
                        <span class="message-sender">{{ getUserFullName(message.sender) }}</span>
                        <span class="message-time">{{ formatTime(message.sentAt) }}</span>
                      </div>
                      <div class="message-text">{{ message.content }}</div>
                    </div>
                  </div>
                </div>

                <!-- Load more messages -->
                <div v-if="hasMoreMessages" class="text-center py-3">
                  <button class="modern-btn modern-btn-secondary" @click="loadMoreMessages" :disabled="loadingMore">
                    <span v-if="loadingMore" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    بارگذاری پیام‌های قدیمی‌تر
                  </button>
                </div>
              </div>
            </loading-spinner>
          </div>

          <!-- Message Input -->
          <div class="chat-input">
            <form @submit.prevent="sendMessage" class="input-form">
              <div class="modern-form-group mb-0">
                <div class="input-group">
                  <input
                      type="text"
                      class="modern-form-control"
                      placeholder="پیام خود را بنویسید..."
                      v-model="newMessage"
                      :disabled="sending"
                  >
                  <button type="submit" class="modern-btn modern-btn-primary" :disabled="!newMessage.trim() || sending">
                    <span v-if="sending" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'CourseChat',
  components: {
    LoadingSpinner
  },
  props: {
    courseId: {
      type: [String, Number],
      required: true
    }
  },
  setup() {
    const { currentUser, getUserFullName } = useUser();
    const { formatDate } = useFormatters();

    return {
      currentUser,
      getUserFullName,
      formatDate
    };
  },
  data() {
    return {
      course: null,
      messages: [],
      participants: [],
      newMessage: '',

      loading: true,
      loadingParticipants: true,
      sending: false,
      loadingMore: false,

      currentPage: 0,
      pageSize: 20,
      hasMoreMessages: false,

      pollingInterval: null
    };
  },
  async created() {
    await this.fetchCourseData();
    await this.fetchParticipants();
    await this.fetchMessages();
    this.startPolling();
  },
  beforeUnmount() {
    this.stopPolling();
  },
  methods: {
    async fetchCourseData() {
      try {
        const response = await this.$http.get(`/courses/${this.courseId}`);
        this.course = response.data.course;
      } catch (error) {
        console.error('Error fetching course data:', error);
        this.$toast.error('مشکلی در دریافت اطلاعات دوره رخ داد.');
      }
    },

    async fetchParticipants() {
      try {
        this.loadingParticipants = true;
        const response = await this.$http.get(`/chat/course/${this.courseId}/participants`);
        this.participants = response.data;
      } catch (error) {
        console.error('Error fetching participants:', error);
        this.$toast.error('مشکلی در دریافت لیست شرکت‌کنندگان رخ داد.');
      } finally {
        this.loadingParticipants = false;
      }
    },

    async fetchMessages() {
      try {
        this.loading = true;
        const response = await this.$http.get(`/chat/course/${this.courseId}/messages`, {
          params: {
            page: 0,
            size: this.pageSize
          }
        });

        this.messages = response.data.content.reverse();
        this.hasMoreMessages = !response.data.first;
        this.currentPage = 0;

        this.markMessagesAsRead();
      } catch (error) {
        console.error('Error fetching messages:', error);
        this.$toast.error('مشکلی در دریافت پیام‌ها رخ داد.');
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    async loadMoreMessages() {
      if (this.loadingMore || !this.hasMoreMessages) return;

      try {
        this.loadingMore = true;
        const nextPage = this.currentPage + 1;

        const response = await this.$http.get(`/chat/course/${this.courseId}/messages`, {
          params: {
            page: nextPage,
            size: this.pageSize
          }
        });

        const olderMessages = response.data.content.reverse();
        this.messages = [...olderMessages, ...this.messages];
        this.hasMoreMessages = !response.data.first;
        this.currentPage = nextPage;
      } catch (error) {
        console.error('Error loading more messages:', error);
        this.$toast.error('مشکلی در بارگذاری پیام‌های بیشتر رخ داد.');
      } finally {
        this.loadingMore = false;
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return;

      try {
        this.sending = true;
        await this.$http.post(`/chat/course/${this.courseId}/send`, null, {
          params: { message: this.newMessage }
        });

        const tempMessage = {
          id: `temp-${Date.now()}`,
          sender: this.currentUser,
          content: this.newMessage,
          sentAt: new Date().toISOString()
        };

        this.messages.push(tempMessage);
        this.newMessage = '';

        this.$nextTick(() => {
          this.scrollToBottom();
        });

        setTimeout(() => {
          this.fetchLatestMessages();
        }, 500);
      } catch (error) {
        console.error('Error sending message:', error);
        this.$toast.error('مشکلی در ارسال پیام رخ داد.');
      } finally {
        this.sending = false;
      }
    },

    async fetchLatestMessages() {
      try {
        const response = await this.$http.get(`/chat/course/${this.courseId}/messages`, {
          params: {
            page: 0,
            size: 5
          }
        });

        const latestMessages = response.data.content.reverse();
        const tempIds = this.messages
            .filter(msg => typeof msg.id === 'string' && msg.id.startsWith('temp-'))
            .map(msg => msg.id);

        if (tempIds.length > 0) {
          this.messages = this.messages.filter(msg => !tempIds.includes(msg.id));

          for (const msg of latestMessages) {
            if (!this.messages.some(existing => existing.id === msg.id)) {
              this.messages.push(msg);
            }
          }

          this.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        }
      } catch (error) {
        console.error('Error fetching latest messages:', error);
      }
    },

    async markMessagesAsRead() {
      try {
        await this.$http.post(`/chat/course/${this.courseId}/mark-read`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },

    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.checkForNewMessages();
      }, 10000);
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    async checkForNewMessages() {
      try {
        const unreadResponse = await this.$http.get(`/chat/course/${this.courseId}/unread`);
        const unreadCount = unreadResponse.data.unreadCount;

        if (unreadCount > 0) {
          await this.fetchLatestMessages();
          await this.markMessagesAsRead();

          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      } catch (error) {
        console.error('Error checking for new messages:', error);
      }
    },

    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        const container = this.$refs.messagesContainer;
        container.scrollTop = container.scrollHeight;
      }
    },

    getUserRole(user) {
      if (!user || !user.roles) return 'کاربر';

      if (user.roles.some(role => role.name === 'ROLE_TEACHER')) {
        return 'استاد';
      } else if (user.roles.some(role => role.name === 'ROLE_STUDENT')) {
        return 'دانش‌آموز';
      }

      return 'کاربر';
    },

    getInitials(firstName, lastName) {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    },

    formatTime(timestamp) {
      if (!timestamp) return '';

      const date = new Date(timestamp);
      return date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDateHeader(timestamp) {
      if (!timestamp) return '';

      const date = new Date(timestamp);
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    shouldShowDateSeparator(message, index) {
      if (index === 0) return true;

      const currentDate = new Date(message.sentAt).toLocaleDateString('fa-IR');
      const previousDate = new Date(this.messages[index - 1].sentAt).toLocaleDateString('fa-IR');

      return currentDate !== previousDate;
    }
  }
}
</script>

<style scoped>
.course-chat-container {
  padding: 1rem;
}

/* Chat specific styles */
.chat-main {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.chat-input {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}

.participants-list {
  max-height: 300px;
  overflow-y: auto;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.participant-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.75rem;
  font-weight: 600;
  font-size: 0.8rem;
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.participant-role {
  font-size: 0.75rem;
  color: #6c757d;
}

.participant-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #adb5bd;
}

.participant-status.online {
  background-color: #28a745;
}

.empty-chat {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-wrapper {
  margin-bottom: 0.5rem;
}

.message-item {
  display: flex;
  max-width: 80%;
  gap: 0.75rem;
}

.message-other {
  align-self: flex-start;
}

.message-own {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.message-content {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-own .message-content {
  background: rgba(23, 162, 184, 0.2);
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.message-sender {
  font-weight: 600;
  font-size: 0.85rem;
  color: #495057;
}

.message-time {
  font-size: 0.75rem;
  color: #6c757d;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
}

.date-separator {
  text-align: center;
  margin: 1rem 0;
  position: relative;
}

.date-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.4);
  z-index: 1;
}

.date-separator span {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  padding: 0 1rem;
  font-size: 0.8rem;
  color: #6c757d;
  z-index: 2;
  border-radius: 12px;
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(23, 162, 184, 0.2);
}

.course-info p {
  margin-bottom: 0.5rem;
  color: #495057;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .modern-form-control {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-main {
    height: 500px;
  }

  .message-item {
    max-width: 90%;
  }

  .chat-messages {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .participant-name,
  .message-sender {
    color: #e2e8f0;
  }

  .section-title {
    color: #e2e8f0;
    border-bottom-color: rgba(23, 162, 184, 0.3);
  }

  .course-info p {
    color: #cbd5e0;
  }
}
</style>