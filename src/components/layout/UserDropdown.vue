<template>
  <div class="dropdown">
    <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
      <i class="fas fa-user"></i> {{ displayName }}
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li>
        <router-link class="dropdown-item" :to="{ name: 'Profile' }">
          <i class="fas fa-user-cog"></i> پروفایل
        </router-link>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item" href="#" @click.prevent="$emit('logout')">
          <i class="fas fa-sign-out-alt"></i> خروج
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'UserDropdown',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    displayName() {
      return this.user.firstName && this.user.lastName
          ? `${this.user.firstName} ${this.user.lastName}`
          : this.user.username;
    }
  }
}
</script>