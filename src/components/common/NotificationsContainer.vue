<template>
  <div class="modern-notifications-container">
    <transition-group name="notification" tag="div" class="notifications-wrapper">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="`modern-notification modern-notification-${notification.type}`"
          @click="handleNotificationClick(notification)"
      >
        <div class="notification-icon">
          <i v-if="notification.icon" :class="`fas fa-${notification.icon}`"></i>
          <i v-else :class="getDefaultIcon(notification.type)"></i>
        </div>

        <div class="notification-content">
          <div v-if="notification.title" class="notification-title">
            {{ notification.title }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <div v-if="notification.timestamp" class="notification-time">
            {{ formatTime(notification.timestamp) }}
          </div>
        </div>

        <div class="notification-actions">
          <button
              v-if="notification.action"
              class="notification-action-btn"
              @click.stop="handleAction(notification)"
          >
            {{ notification.action.text }}
          </button>

          <button
              class="notification-close"
              @click.stop="removeNotification(notification.id)"
              :title="'بستن'"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="notification.progress !== undefined" class="notification-progress">
          <div class="progress-bar">
            <div
                class="progress-fill"
                :style="{ width: `${notification.progress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'NotificationsContainer',
  computed: {
    ...mapGetters({
      notifications: 'notification/getAllNotifications'
    })
  },
  methods: {
    ...mapActions({
      remove: 'notification/remove'
    }),

    removeNotification(id) {
      this.remove(id);
    },

    handleNotificationClick(notification) {
      if (notification.clickable && notification.onClick) {
        notification.onClick();
      }
    },

    handleAction(notification) {
      if (notification.action && notification.action.handler) {
        notification.action.handler();
      }
    },

    getDefaultIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        danger: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        primary: 'fas fa-bell'
      };
      return icons[type] || 'fas fa-bell';
    },

    formatTime(timestamp) {
      if (!timestamp) return '';
      const now = new Date();
      const time = new Date(timestamp);
      const diff = now - time;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'همین الان';
      if (minutes < 60) return `${minutes} دقیقه قبل`;
      if (hours < 24) return `${hours} ساعت قبل`;
      if (days < 7) return `${days} روز قبل`;

      return time.toLocaleDateString('fa-IR');
    }
  }
}
</script>

<style scoped>
.modern-notifications-container {
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: 9999;
  width: 400px;
  max-width: calc(100vw - 40px);
  direction: rtl;
  pointer-events: none;
}

.notifications-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modern-notification {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.modern-notification::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  pointer-events: none;
}

.modern-notification:hover {
  transform: translateX(-5px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.modern-notification-success {
  border-right: 4px solid #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-notification-danger {
  border-right: 4px solid #e74c3c;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-notification-warning {
  border-right: 4px solid #f39c12;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-notification-info {
  border-right: 4px solid #3498db;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-notification-primary {
  border-right: 4px solid #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(255, 255, 255, 0.95));
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.modern-notification-success .notification-icon {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.05));
  color: #27ae60;
}

.modern-notification-danger .notification-icon {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.05));
  color: #e74c3c;
}

.modern-notification-warning .notification-icon {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(230, 126, 34, 0.05));
  color: #f39c12;
}

.modern-notification-info .notification-icon {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(154, 207, 234, 0.05));
  color: #3498db;
}

.modern-notification-primary .notification-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
  color: #667eea;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.notification-message {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.notification-time {
  color: #999;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.notification-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.notification-close {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  transform: scale(1.1);
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
}

.progress-bar {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

/* Transitions */
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(-100px) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-notifications-container {
    top: 70px;
    left: 10px;
    right: 10px;
    width: auto;
    max-width: none;
  }

  .modern-notification {
    padding: 1rem;
    gap: 0.75rem;
  }

  .notification-icon {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .notification-title {
    font-size: 0.9rem;
  }

  .notification-message {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .modern-notification {
    padding: 0.875rem;
    border-radius: 12px;
  }

  .notification-actions {
    flex-direction: row;
    align-items: center;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modern-notification {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .notification-title {
    color: #e2e8f0;
  }

  .notification-message {
    color: #cbd5e0;
  }

  .notification-time {
    color: #a0aec0;
  }

  .notification-close {
    background: rgba(255, 255, 255, 0.1);
    color: #cbd5e0;
  }

  .notification-close:hover {
    background: rgba(231, 76, 60, 0.2);
    color: #fc8181;
  }
}
</style>