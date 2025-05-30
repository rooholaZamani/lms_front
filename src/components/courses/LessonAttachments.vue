<template>
  <div class="modern-card attachments-container animate-slide-up">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h6 class="modern-title mb-0">
        <i class="fas fa-paperclip text-primary me-2"></i>
        فایل‌های پیوست
      </h6>
      <span class="modern-badge modern-badge-info">
        {{ attachments.length }} فایل
      </span>
    </div>

    <div v-if="attachments.length === 0" class="text-center py-4">
      <div class="modern-logo large secondary mb-3">
        <i class="fas fa-folder-open"></i>
      </div>
      <h6 class="mb-2">فایل پیوستی وجود ندارد</h6>
      <p class="text-muted mb-0">
        هیچ فایل پیوستی برای این درس اضافه نشده است
      </p>
    </div>

    <div v-else class="attachments-grid">
      <div
          v-for="(attachment, index) in attachments"
          :key="attachment.id"
          class="attachment-item animate-slide-up"
          :style="`animation-delay: ${index * 0.1}s`"
      >
        <div class="attachment-icon">
          <i :class="getFileIcon(attachment.type)"></i>
        </div>

        <div class="attachment-details">
          <h6 class="attachment-name">{{ attachment.name }}</h6>
          <div class="attachment-meta">
            <span class="file-type">{{ getFileTypeText(attachment.type) }}</span>
            <span class="file-size">{{ formatFileSize(attachment.size) }}</span>
          </div>
          <div class="attachment-description" v-if="attachment.description">
            {{ attachment.description }}
          </div>
        </div>

        <div class="attachment-actions">
          <a
              :href="attachment.url"
              target="_blank"
              class="modern-btn modern-btn-primary btn-sm me-2"
              :title="`مشاهده ${attachment.name}`">
            <i class="fas fa-eye me-1"></i>
            مشاهده
          </a>

          <button
              class="modern-btn modern-btn-success btn-sm"
              @click="downloadFile(attachment)"
              :title="`دانلود ${attachment.name}`">
            <i class="fas fa-download me-1"></i>
            دانلود
          </button>
        </div>
      </div>
    </div>

    <!-- File Statistics -->
    <div v-if="attachments.length > 0" class="attachments-stats mt-4">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-file"></i>
          </div>
          <div class="stat-details">
            <div class="stat-value">{{ attachments.length }}</div>
            <div class="stat-label">فایل</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-hdd"></i>
          </div>
          <div class="stat-details">
            <div class="stat-value">{{ getTotalSize() }}</div>
            <div class="stat-label">حجم کل</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-tags"></i>
          </div>
          <div class="stat-details">
            <div class="stat-value">{{ getFileTypesCount() }}</div>
            <div class="stat-label">نوع فایل</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFileHelpers } from '@/composables/useFileHelpers.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'LessonAttachments',
  props: {
    attachments: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { getFileIcon } = useFileHelpers();
    const { formatFileSize } = useFormatters();

    return {
      getFileIcon,
      formatFileSize
    };
  },
  methods: {
    getFileTypeText(type) {
      if (!type) return 'نامشخص';

      const typeMap = {
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'xls': 'Excel',
        'xlsx': 'Excel',
        'ppt': 'PowerPoint',
        'pptx': 'PowerPoint',
        'zip': 'ZIP',
        'rar': 'RAR',
        'jpg': 'تصویر',
        'jpeg': 'تصویر',
        'png': 'تصویر',
        'gif': 'تصویر',
        'mp4': 'ویدیو',
        'webm': 'ویدیو',
        'avi': 'ویدیو',
        'mp3': 'صوت',
        'wav': 'صوت',
        'txt': 'متن'
      };

      return typeMap[type.toLowerCase()] || type.toUpperCase();
    },

    downloadFile(attachment) {
      try {
        // ایجاد لینک دانلود
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        link.target = '_blank';

        // اضافه کردن به DOM و کلیک
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // نمایش پیام موفقیت
        if (this.$toast) {
          this.$toast.success(`دانلود ${attachment.name} آغاز شد`);
        }
      } catch (error) {
        console.error('Download error:', error);
        if (this.$toast) {
          this.$toast.error('خطا در دانلود فایل');
        }
      }
    },

    getTotalSize() {
      const totalBytes = this.attachments.reduce((sum, file) => sum + (file.size || 0), 0);
      return this.formatFileSize(totalBytes);
    },

    getFileTypesCount() {
      const uniqueTypes = new Set(this.attachments.map(file => file.type?.toLowerCase()));
      return uniqueTypes.size;
    }
  }
}
</script>

<style scoped>
.attachments-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.attachments-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
}

.attachment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.attachment-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  margin-left: 1rem;
  flex-shrink: 0;
  font-size: 1.5rem;
  color: #667eea;
}

.attachment-details {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  word-break: break-word;
}

.attachment-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.file-type,
.file-size {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.attachment-description {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
}

.attachment-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Statistics Section */
.attachments-stats {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.stat-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  margin-left: 0.75rem;
  color: #667eea;
  font-size: 1rem;
}

.stat-details {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
}

/* File type specific icons */
.fa-file-pdf { color: #dc3545; }
.fa-file-word { color: #007bff; }
.fa-file-excel { color: #28a745; }
.fa-file-powerpoint { color: #fd7e14; }
.fa-file-archive { color: #6c757d; }
.fa-file-image { color: #e83e8c; }
.fa-file-video { color: #6f42c1; }
.fa-file-audio { color: #20c997; }
.fa-file { color: #6c757d; }

/* Responsive Design */
@media (max-width: 768px) {
  .attachment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    text-align: center;
  }

  .attachment-icon {
    margin-left: 0;
    align-self: center;
  }

  .attachment-details {
    width: 100%;
    text-align: center;
  }

  .attachment-meta {
    justify-content: center;
  }

  .attachment-actions {
    width: 100%;
    justify-content: center;
  }

  .btn-sm {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .attachment-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .attachment-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .attachment-item {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .attachment-name {
    color: #e2e8f0;
  }

  .attachment-description {
    color: #cbd5e0;
  }

  .stat-value {
    color: #e2e8f0;
  }

  .stat-label {
    color: #cbd5e0;
  }

  .stat-item {
    background: rgba(255, 255, 255, 0.05);
  }

  .stat-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>