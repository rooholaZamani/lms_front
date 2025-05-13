<template>
  <div class="pagination-container">
    <nav aria-label="صفحه‌بندی">
      <ul class="pagination justify-content-center">
        <!-- دکمه قبلی -->
        <li :class="['page-item', { disabled: currentPage === 1 }]">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
            <span aria-hidden="true">&laquo;</span>
            <span class="visually-hidden">قبلی</span>
          </a>
        </li>

        <!-- شماره صفحات -->
        <template v-for="(page, index) in displayedPages" :key="index">
          <li v-if="page === '...'" class="page-item disabled">
            <span class="page-link">...</span>
          </li>
          <li v-else :class="['page-item', { active: page === currentPage }]">
            <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
          </li>
        </template>

        <!-- دکمه بعدی -->
        <li :class="['page-item', { disabled: currentPage === totalPages }]">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
            <span aria-hidden="true">&raquo;</span>
            <span class="visually-hidden">بعدی</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    maxVisiblePages: {
      type: Number,
      default: 5
    }
  },
  computed: {
    displayedPages() {
      // اگر تعداد کل صفحات کمتر از حداکثر صفحات قابل نمایش باشد
      if (this.totalPages <= this.maxVisiblePages) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }

      // تعیین محدوده صفحات قابل نمایش
      let startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + this.maxVisiblePages - 1);

      // تنظیم مجدد startPage اگر به انتهای محدوده نزدیک هستیم
      if (endPage === this.totalPages) {
        startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
      }

      // ایجاد آرایه صفحات
      const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

      // اضافه کردن نقطه‌چین و صفحه اول و آخر در صورت نیاز
      if (startPage > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }

      if (endPage < this.totalPages) {
        pages.push('...');
        pages.push(this.totalPages);
      }

      return pages;
    }
  },
  methods: {
    goToPage(page) {
      // اطمینان از اینکه صفحه در محدوده معتبر است
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit('page-changed', page);
      }
    }
  }
}
</script>

<style scoped>
.pagination-container {
  margin: 20px 0;
}

.pagination {
  margin-bottom: 0;
}
</style>