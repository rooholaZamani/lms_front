<template>
  <div class="advanced-question-form">
    <!-- Forms for FILL_IN_THE_BLANKS, MATCHING, CATEGORIZATION -->
    <div v-if="questionType === 'FILL_IN_THE_BLANKS'">
      <label>Template with {} placeholders:</label>
      <input v-model="questionData.template" />
      <!-- Blank answers management -->
    </div>

    <div v-if="questionType === 'MATCHING'">
      <!-- Matching pairs management -->
    </div>

    <div v-if="questionType === 'CATEGORIZATION'">
      <!-- Categories and items management -->
    </div>
  </div>
</template>