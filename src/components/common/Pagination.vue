<template>
  <div class="pagination-container">
    <nav aria-label="صفحه‌بندی">
      <ul class="modern-pagination">
        <!-- دکمه قبلی -->
        <li :class="['pagination-item', { disabled: currentPage === 1 }]">
          <button
              class="modern-btn modern-btn-outline pagination-btn"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              aria-label="صفحه قبلی"
          >
            <i class="fas fa-chevron-right me-1"></i>
            قبلی
          </button>
        </li>

        <!-- شماره صفحات -->
        <template v-for="(page, index) in displayedPages" :key="index">
          <li v-if="page === '...'" class="pagination-item">
            <span class="pagination-dots">...</span>
          </li>
          <li v-else class="pagination-item">
            <button
                :class="['modern-btn pagination-btn', page === currentPage ? 'modern-btn-primary' : 'modern-btn-outline']"
                @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </li>
        </template>

        <!-- دکمه بعدی -->
        <li :class="['pagination-item', { disabled: currentPage === totalPages }]">
          <button
              class="modern-btn modern-btn-outline pagination-btn"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              aria-label="صفحه بعدی"
          >
            بعدی
            <i class="fas fa-chevron-left ms-1"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- اطلاعات صفحه -->
    <div class="pagination-info">
      <span class="modern-badge modern-badge-secondary">
        صفحه {{ currentPage }} از {{ totalPages }}
      </span>
    </div>
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
      if (this.totalPages <= this.maxVisiblePages) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }

      let startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + this.maxVisiblePages - 1);

      if (endPage === this.totalPages) {
        startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
      }

      const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

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
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit('page-changed', page);
      }
    }
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.modern-pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination-item {
  display: flex;
  align-items: center;
}

.pagination-btn {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 0.5rem 1rem;
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-dots {
  padding: 0.5rem;
  color: #6c757d;
  font-weight: 600;
}

.pagination-info {
  text-align: center;
}

/* Responsive */
@media (max-width: 576px) {
  .modern-pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-btn {
    min-width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pagination-dots {
    color: #adb5bd;
  }
}
</style>