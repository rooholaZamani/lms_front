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
              <div v-for="participant in sortedParticipants" :key="participant.id" class="participant-item">
                <div class="participant-avatar" :class="getParticipantAvatarClass(participant)">
                  {{ getInitials(participant.name) }}
                </div>
                <div class="participant-info">
                  <div class="participant-name">{{ participant.name || 'کاربر ناشناس' }}</div>
                  <div class="participant-role">{{ getRoleText(participant.role) }}</div>
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
            <p class="mb-2"><strong>عنوان:</strong> {{ course.title || 'نامشخص' }}</p>
            <p class="mb-2"><strong>استاد:</strong> {{ getTeacherName() }}</p>
            <p class="mb-0"><strong>دانش‌آموزان:</strong> {{ getStudentsCount() }}</p>
          </div>
          <div v-else class="text-center text-muted py-3">
            <i class="fas fa-info-circle fa-2x mb-2"></i>
            <p>در حال بارگذاری...</p>
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
                  <div :class="getMessageClasses(message)">
                    <div class="message-avatar" :class="getMessageAvatarClass(message)">
                      {{ getInitials(message.senderName) }}
                    </div>
                    <div class="message-content" :class="getMessageContentClass(message)">
                      <div class="message-header">
                        <span class="message-sender" :class="getSenderNameClass(message)">
                          {{ message.senderName || 'کاربر ناشناس' }}
                        </span>
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
                      @input="onTyping"
                      @focus="onStartTyping"
                      @blur="onStopTyping"
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
    const { currentUser } = useUser();
    const { formatDate } = useFormatters();

    return {
      currentUser,
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

      pollingInterval: null,

      // Activity tracking variables
      chatStartTime: null,
      typingStartTime: null,
      totalTypingTime: 0,
      isActive: true
    };
  },
  computed: {
    sortedParticipants() {
      return [...this.participants].sort((a, b) => {
        if (a.role === 'TEACHER' && b.role !== 'TEACHER') return -1;
        if (b.role === 'TEACHER' && a.role !== 'TEACHER') return 1;
        return (a.name || '').localeCompare(b.name || '', 'fa');
      });
    }
  },
  async created() {
    console.log('CourseChat created with courseId:', this.courseId);
    console.log('Current user:', this.currentUser);

    // Initialize activity tracking
    this.chatStartTime = Date.now();
    this.isActive = true;

    try {
      await this.fetchCourseData();
      await this.fetchParticipants();
      await this.fetchMessages();
      this.startPolling();
    } catch (error) {
      console.error('Error initializing CourseChat:', error);
      if (this.$toast) {
        this.$toast.error('خطا در بارگذاری اطلاعات چت');
      }
    }
  },
  mounted() {
    // Add visibility change listener for activity tracking
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },
  beforeUnmount() {
    this.stopPolling();

    // Send viewing time before leaving
    this.sendViewingTime();

    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  },
  methods: {
    // Activity tracking methods
    handleVisibilityChange() {
      if (document.hidden) {
        this.sendViewingTime();
        this.isActive = false;
      } else {
        this.chatStartTime = Date.now();
        this.isActive = true;
      }
    },

    onStartTyping() {
      if (!this.typingStartTime) {
        this.typingStartTime = Date.now();
      }
    },

    onStopTyping() {
      if (this.typingStartTime) {
        this.totalTypingTime += Date.now() - this.typingStartTime;
        this.typingStartTime = null;
      }
    },

    onTyping() {
      this.onStartTyping();
    },

    getViewingTime() {
      return this.isActive && this.chatStartTime ?
          Date.now() - this.chatStartTime : 0;
    },

    sendViewingTime() {
      const timeSpent = this.getViewingTime();
      if (timeSpent > 1000) { // Only send if more than 1 second
        this.fetchMessages(true); // Silent reload to send time
      }
    },

    async fetchCourseData() {
      try {
        const response = await this.$http.get(`/courses/${this.courseId}`);
        if (response.data && response.data.course) {
          this.course = response.data.course;
        } else if (response.data) {
          this.course = response.data;
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        if (this.$toast) {
          this.$toast.error('مشکلی در دریافت اطلاعات دوره رخ داد.');
        }
        throw error;
      }
    },

    async fetchParticipants() {
      try {
        this.loadingParticipants = true;
        const response = await this.$http.get(`/chat/course/${this.courseId}/participants`);

        if (response.data && Array.isArray(response.data)) {
          this.participants = response.data.map(participant => ({
            ...participant,
            name: participant.name || 'کاربر ناشناس',
            role: participant.role || 'STUDENT'
          }));
        } else {
          this.participants = [];
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        this.participants = [];
        if (this.$toast) {
          this.$toast.error('مشکلی در دریافت لیست شرکت‌کنندگان رخ داد.');
        }
      } finally {
        this.loadingParticipants = false;
      }
    },

    async fetchMessages(silent = false) {
      try {
        if (!silent) {
          this.loading = true;
        }

        // Calculate time spent viewing
        const timeSpent = this.getViewingTime();

        const response = await this.$http.get(`/chat/course/${this.courseId}/messages`, {
          params: {
            page: 0,
            size: this.pageSize,
            timeSpent: timeSpent
          }
        });

        let messages = [];

        if (response.data && Array.isArray(response.data)) {
          messages = response.data;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          messages = response.data.content;
          this.hasMoreMessages = !response.data.last;
        }

        this.messages = messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        this.currentPage = 0;
        this.markMessagesAsRead();

        // Reset chat timer after successful request
        this.chatStartTime = Date.now();
      } catch (error) {
        console.error('Error fetching messages:', error);
        this.messages = [];
        if (!silent && this.$toast) {
          this.$toast.error('مشکلی در دریافت پیام‌ها رخ داد.');
        }
      } finally {
        if (!silent) {
          this.loading = false;
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
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

        let olderMessages = [];

        if (response.data && Array.isArray(response.data)) {
          olderMessages = response.data;
          this.hasMoreMessages = response.data.length >= this.pageSize;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          olderMessages = response.data.content;
          this.hasMoreMessages = !response.data.last;
        }

        this.messages = [...olderMessages, ...this.messages];
        this.currentPage = nextPage;
      } catch (error) {
        console.error('Error loading more messages:', error);
        if (this.$toast) {
          this.$toast.error('مشکلی در بارگذاری پیام‌های بیشتر رخ داد.');
        }
      } finally {
        this.loadingMore = false;
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return;

      try {
        this.sending = true;

        // Capture final typing time
        this.onStopTyping();

        await this.$http.post(`/chat/course/${this.courseId}/send`, null, {
          params: {
            message: this.newMessage,
            timeSpent: this.totalTypingTime
          }
        });

        this.newMessage = '';
        this.totalTypingTime = 0;

        setTimeout(() => {
          this.fetchLatestMessages();
        }, 500);
      } catch (error) {
        console.error('Error sending message:', error);
        if (this.$toast) {
          this.$toast.error('مشکلی در ارسال پیام رخ داد.');
        }
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

        let latestMessages = [];

        if (response.data && Array.isArray(response.data)) {
          latestMessages = response.data;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          latestMessages = response.data.content;
        }

        for (const msg of latestMessages) {
          if (!this.messages.some(existing => existing.id === msg.id)) {
            this.messages.push(msg);
          }
        }

        this.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

        this.$nextTick(() => {
          this.scrollToBottom();
        });
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
        let unreadCount = 0;

        if (unreadResponse.data && typeof unreadResponse.data === 'object') {
          unreadCount = unreadResponse.data.unreadCount || unreadResponse.data.count || 0;
        }

        if (unreadCount > 0) {
          await this.fetchLatestMessages();
          await this.markMessagesAsRead();
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

    getTeacherName() {
      const teacher = this.participants.find(p => p.role === 'TEACHER');
      return teacher ? teacher.name : 'نامشخص';
    },

    getStudentsCount() {
      return this.participants.filter(p => p.role === 'STUDENT').length;
    },

    getRoleText(role) {
      switch (role) {
        case 'TEACHER': return 'استاد';
        case 'STUDENT': return 'دانش‌آموز';
        case 'ADMIN': return 'مدیر';
        default: return 'کاربر';
      }
    },

    getInitials(name) {
      if (!name) return 'کا';

      const parts = name.split(' ');
      let initials = '';

      for (let i = 0; i < Math.min(2, parts.length); i++) {
        if (parts[i]) {
          initials += parts[i].charAt(0);
        }
      }

      return initials.toUpperCase() || 'کا';
    },

    isMessageFromTeacher(message) {
      const sender = this.participants.find(p => p.id === message.senderId);
      return sender && sender.role === 'TEACHER';
    },

    isOwnMessage(message) {
      return message.senderId === this.currentUser.id;
    },

    getMessageClasses(message) {
      const classes = ['message-item'];

      if (this.isOwnMessage(message)) {
        classes.push('message-own');
      } else {
        classes.push('message-other');
      }

      if (this.isMessageFromTeacher(message)) {
        classes.push('message-teacher');
      }

      return classes;
    },

    getMessageAvatarClass(message) {
      const classes = [];

      if (this.isMessageFromTeacher(message)) {
        classes.push('teacher-avatar');
      }

      return classes.join(' ');
    },

    getMessageContentClass(message) {
      const classes = [];

      if (this.isMessageFromTeacher(message)) {
        classes.push('teacher-message');
      }

      return classes.join(' ');
    },

    getSenderNameClass(message) {
      const classes = ['message-sender'];

      if (this.isMessageFromTeacher(message)) {
        classes.push('teacher-name');
      }

      return classes.join(' ');
    },

    getParticipantAvatarClass(participant) {
      const classes = [];

      if (participant.role === 'TEACHER') {
        classes.push('teacher-avatar');
      }

      return classes.join(' ');
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
      if (!message || !message.sentAt) return false;
      if (!this.messages[index - 1] || !this.messages[index - 1].sentAt) return false;

      try {
        const currentDate = new Date(message.sentAt).toLocaleDateString('fa-IR');
        const previousDate = new Date(this.messages[index - 1].sentAt).toLocaleDateString('fa-IR');
        return currentDate !== previousDate;
      } catch (error) {
        return false;
      }
    }
  }
}
</script>

<style scoped>
.course-chat-container {
  padding: 1rem;
}

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
  transition: all 0.2s ease;
}

.participant-item:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateX(-2px);
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
  transition: all 0.2s ease;
}

.participant-avatar.teacher-avatar {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.participant-item:hover .participant-avatar {
  transform: scale(1.1);
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
  animation: fadeInMessage 0.3s ease-out;
}

@keyframes fadeInMessage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-other {
  align-self: flex-start;
  margin-left: 0;
  margin-right: auto;
}

.message-own {
  align-self: flex-end;
  flex-direction: row-reverse;
  margin-right: 0;
  margin-left: auto;
}

.message-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.message-avatar.teacher-avatar {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.message-own .message-avatar {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.message-content {
  background: rgba(248, 249, 250, 0.9);
  border-radius: 18px 18px 18px 4px;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  max-width: 300px;
  transition: all 0.2s ease;
}

.message-content:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.message-content.teacher-message {
  background: rgba(231, 76, 60, 0.15);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 18px 18px 18px 4px;
}

.message-own .message-content {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: 1px solid rgba(0, 123, 255, 0.3);
  border-radius: 18px 18px 4px 18px;
}

.message-own .message-content .message-sender,
.message-own .message-content .message-time {
  color: rgba(255, 255, 255, 0.9);
}

.message-own .message-content .message-text {
  color: white;
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

.message-sender.teacher-name {
  color: #c0392b;
  font-weight: 700;
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

.course-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.course-info p {
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.course-info strong {
  color: #333;
  font-weight: 600;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input-group .modern-form-control {
  flex: 1;
  border-radius: 25px;
  padding: 0.75rem 1.25rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.input-group .modern-form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  background: white;
}

.input-group .modern-btn {
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s ease;
}

.input-group .modern-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.input-group .modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .chat-main {
    height: 500px;
  }

  .message-item {
    max-width: 85%;
  }

  .message-content {
    max-width: 250px;
    font-size: 0.9rem;
  }

  .chat-messages {
    padding: 1rem;
  }

  .message-avatar {
    width: 30px;
    height: 30px;
    font-size: 0.7rem;
  }

  .participant-avatar {
    width: 30px;
    height: 30px;
    font-size: 0.7rem;
  }

  .participant-name {
    font-size: 0.85rem;
  }

  .participant-role {
    font-size: 0.7rem;
  }
}

@media (prefers-color-scheme: dark) {
  .participant-name,
  .message-sender {
    color: #e2e8f0;
  }

  .message-sender.teacher-name {
    color: #f56565;
  }

  .section-title {
    color: #e2e8f0;
    border-bottom-color: rgba(23, 162, 184, 0.3);
  }

  .course-info p {
    color: #cbd5e0;
  }

  .course-info strong {
    color: #e2e8f0;
  }

  .message-content {
    background: rgba(45, 55, 72, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }

  .message-content.teacher-message {
    background: rgba(231, 76, 60, 0.2);
    border-color: rgba(231, 76, 60, 0.4);
  }

  .message-own .message-content {
    background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  }

  .chat-messages {
    background: rgba(45, 55, 72, 0.3);
  }

  .chat-input {
    background: rgba(45, 55, 72, 0.3);
  }
}
</style>