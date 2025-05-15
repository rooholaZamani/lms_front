<template>
  <div class="chat-container">
    <div class="container-fluid p-4">
      <div class="row">
        <!-- Sidebar (participants) -->
        <div class="col-md-3 chat-sidebar">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">شرکت‌کنندگان</h5>
            </div>
            <div class="card-body p-0">
              <loading-spinner :loading="loadingParticipants">
                <ul class="participants-list">
                  <li v-for="participant in participants" :key="participant.id" class="participant-item">
                    <div class="participant-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="participant-info">
                      <div class="participant-name">{{ getUserFullName(participant) }}</div>
                      <div class="participant-role">{{ getUserRole(participant) }}</div>
                    </div>
                    <div class="participant-status" :class="{'online': participant.online}"></div>
                  </li>
                </ul>
              </loading-spinner>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">اطلاعات دوره</h5>
            </div>
            <div class="card-body">
              <h6>{{ course ? course.title : 'در حال بارگذاری...' }}</h6>
              <p class="mb-1">استاد: {{ course && course.teacher ? getUserFullName(course.teacher) : 'نامشخص' }}</p>
              <p class="mb-0">تعداد دانش‌آموزان: {{ course && course.enrolledStudents ? course.enrolledStudents.length : 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Main Chat Section -->
        <div class="col-md-9">
          <div class="card chat-main">
            <div class="card-header">
              <h5 class="mb-0">گفتگوی دوره</h5>
            </div>
            
            <!-- Messages -->
            <div class="chat-messages" ref="messagesContainer">
              <loading-spinner :loading="loading">
                <empty-state
                    v-if="messages.length === 0"
                    title="هنوز پیامی ارسال نشده است"
                    description="اولین نفری باشید که گفتگو را شروع می‌کند!"
                    icon="comments"
                    compact
                />

                <div v-else class="messages-list">
                  <div v-for="(message, index) in messages" :key="message.id" class="message-item">
                    <!-- Date separator -->
                    <div v-if="shouldShowDateSeparator(message, index)" class="date-separator">
                      {{ formatDateHeader(message.sentAt) }}
                    </div>
                    
                    <!-- Message -->
                    <div :class="['message', message.sender.id === currentUser.id ? 'message-own' : 'message-other']">
                      <div class="message-avatar">
                        <i class="fas fa-user"></i>
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

                  <!-- Loading indicator for older messages -->
                  <div v-if="hasMoreMessages" class="text-center py-3">
                    <button class="btn btn-sm btn-outline-primary" @click="loadMoreMessages" :disabled="loadingMore">
                      <span v-if="loadingMore" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      بارگذاری پیام‌های قدیمی‌تر
                    </button>
                  </div>
                </div>
              </loading-spinner>
            </div>
            
            <!-- Message Input -->
            <div class="card-footer chat-input">
              <form @submit.prevent="sendMessage">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="پیام خود را بنویسید..."
                    v-model="newMessage"
                    :disabled="sending"
                  >
                  <button type="submit" class="btn btn-primary" :disabled="!newMessage.trim() || sending">
                    <span v-if="sending" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else class="fas fa-paper-plane"></i>
                  </button>
                </div>
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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'CourseChat',
  components: {
    LoadingSpinner,
    EmptyState
  },
  props: {
    courseId: {
      type: String,
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
  computed: {
    // Determine if the user is scrolled to the bottom of the chat
    isScrolledToBottom() {
      if (!this.$refs.messagesContainer) return true;
      
      const container = this.$refs.messagesContainer;
      const scrollPosition = container.scrollTop + container.clientHeight;
      return scrollPosition >= container.scrollHeight - 50; // Within 50px of the bottom
    }
  },
  async created() {
    await this.fetchCourseData();
    await this.fetchParticipants();
    await this.fetchMessages();
    
    // Start polling for new messages
    this.startPolling();
  },
  beforeUnmount() {
    // Stop polling when component is destroyed
    this.stopPolling();
  },
  methods: {
    async fetchCourseData() {
      try {
        const response = await axios.get(`/courses/${this.courseId}`);
        this.course = response.data;
      } catch (error) {
        console.error('Error fetching course data:', error);
        this.$toast.error('مشکلی در دریافت اطلاعات دوره رخ داد.');
      }
    },
    
    async fetchParticipants() {
      try {
        this.loadingParticipants = true;
        const response = await axios.get(`/chat/course/${this.courseId}/participants`);
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
        const response = await axios.get(`/chat/course/${this.courseId}/messages`, {
          params: {
            page: 0, // Start with the first page (most recent messages)
            size: this.pageSize
          }
        });
        
        this.messages = response.data.content.reverse(); // Reverse to show oldest first
        this.hasMoreMessages = !response.data.first; // Check if there are older messages
        this.currentPage = 0;
        
        // Mark messages as read
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
        
        const response = await axios.get(`/chat/course/${this.courseId}/messages`, {
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
        await axios.post(`/chat/course/${this.courseId}/send`, {
          message: this.newMessage
        });
        
        // Add the message optimistically
        const tempMessage = {
          id: `temp-${Date.now()}`,
          sender: this.currentUser,
          content: this.newMessage,
          sentAt: new Date().toISOString(),
          readBy: [this.currentUser.id]
        };
        
        this.messages.push(tempMessage);
        this.newMessage = '';
        
        // Scroll to bottom
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        
        // Fetch latest messages to ensure we have the correct message with proper ID
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
        const response = await axios.get(`/chat/course/${this.courseId}/messages`, {
          params: {
            page: 0,
            size: 5 // Get just the most recent few messages
          }
        });
        
        const latestMessages = response.data.content.reverse();
        
        // Replace any temporary messages with real ones
        const tempIds = this.messages
          .filter(msg => typeof msg.id === 'string' && msg.id.startsWith('temp-'))
          .map(msg => msg.id);
        
        if (tempIds.length > 0) {
          // Remove temporary messages
          this.messages = this.messages.filter(msg => !tempIds.includes(msg.id));
          
          // Add latest messages
          for (const msg of latestMessages) {
            if (!this.messages.some(existing => existing.id === msg.id)) {
              this.messages.push(msg);
            }
          }
          
          // Sort by timestamp
          this.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        }
      } catch (error) {
        console.error('Error fetching latest messages:', error);
      }
    },
    
    async markMessagesAsRead() {
      try {
        await axios.post(`/chat/course/${this.courseId}/mark-read`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },
    
    startPolling() {
      // Poll for new messages every 10 seconds
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
        // Get unread count
        const unreadResponse = await axios.get(`/chat/course/${this.courseId}/unread`);
        const unreadCount = unreadResponse.data.unreadCount;
        
        if (unreadCount > 0) {
          // If there are unread messages, fetch latest messages
          await this.fetchLatestMessages();
          await this.markMessagesAsRead();
          
          // Scroll to bottom if user was already at bottom
          if (this.isScrolledToBottom) {
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          } else {
            // Show a notification that there are new messages
            this.$toast.info(`${unreadCount} پیام جدید دریافت شد.`);
          }
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
.chat-container {
  min-height: calc(100vh - 56px);
}

.chat-sidebar {
  margin-bottom: 20px;
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #dee2e6;
}

.participants-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #dee2e6;
}

.participant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-weight: 500;
}

.participant-role {
  font-size: 0.8rem;
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

.messages-list {
  display: flex;
  flex-direction: column;
}

.message-item {
  margin-bottom: 15px;
}

.message {
  display: flex;
  max-width: 80%;
}

.message-other {
  align-self: flex-start;
}

.message-own {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
}

.message-content {
  background-color: white;
  border-radius: 10px;
  padding: 10px 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-own .message-content {
  background-color: #cce5ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.message-sender {
  font-weight: 500;
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.8rem;
  color: #6c757d;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.date-separator {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.date-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  background-color: #dee2e6;
  z-index: 1;
}

.date-separator span {
  position: relative;
  background-color: #f5f7fa;
  padding: 0 15px;
  font-size: 0.8rem;
  color: #6c757d;
  z-index: 2;
}
</style>
