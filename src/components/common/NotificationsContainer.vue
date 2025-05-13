<template>
  <div class="notifications-container">
    <transition-group name="notification" tag="div">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="`notification notification-${notification.type}`"
          @click="removeNotification(notification.id)"
      >
        <div class="notification-content">
          <i v-if="notification.icon" :class="`fas fa-${notification.icon}`"></i>
          <span class="notification-message">{{ notification.message }}</span>
        </div>
        <button class="notification-close" @click.stop="removeNotification(notification.id)">
          <i class="fas fa-times"></i>
        </button>
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
    }
  }
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  width: 350px;
  direction: rtl;
}

.notification {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 15px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-content {
  display: flex;
  align-items: center;
}

.notification-content i {
  margin-left: 10px;
  font-size: 1.2rem;
}

.notification-message {
  font-size: 0.95rem;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #6c757d;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #343a40;
}

/* رنگ‌های مختلف برای انواع اعلان‌ها */
.notification-success {
  border-right: 4px solid #28a745;
}
.notification-success i {
  color: #28a745;
}

.notification-danger {
  border-right: 4px solid #dc3545;
}
.notification-danger i {
  color: #dc3545;
}

.notification-info {
  border-right: 4px solid #17a2b8;
}
.notification-info i {
  color: #17a2b8;
}

.notification-warning {
  border-right: 4px solid #ffc107;
}
.notification-warning i {
  color: #ffc107;
}

/* انیمیشن‌ها */
.notification-enter-active, .notification-leave-active {
  transition: all 0.5s;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>