<template>
  <div class="attachments mb-3">
    <h5>فایل‌های پیوست</h5>
    <ul class="list-group">
      <li v-for="attachment in attachments" :key="attachment.id" class="list-group-item">
        <i :class="getFileIcon(attachment.type)"></i>
        <a :href="attachment.url" target="_blank" class="ms-2">{{ attachment.name }}</a>
        <span class="badge bg-secondary float-end">{{ formatFileSize(attachment.size) }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
// استفاده از composable
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
  }
}
</script>