<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-dark">
      <tr>
        <th>عنوان دوره</th>
        <th>تعداد درس‌ها</th>
        <th>تعداد دانش‌آموزان</th>
        <th>وضعیت</th>
        <th>عملیات</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="course in courses" :key="course.id">
        <td>{{ course.title }}</td>
        <td>{{ course.lessons ? course.lessons.length : 0 }}</td>
        <td>{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}</td>
        <td><span class="badge bg-success">فعال</span></td>
        <td>
          <div class="d-flex gap-1">
            <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="btn btn-sm btn-primary">
              <i class="fas fa-eye"></i>
            </router-link>
            <button class="btn btn-sm btn-success" @click="$emit('edit', course)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-info" @click="$emit('add-lesson', course)">
              <i class="fas fa-plus"></i> درس
            </button>
            <button class="btn btn-sm btn-warning" @click="$emit('add-exam', course)">
              <i class="fas fa-clipboard-check"></i> آزمون
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'CourseTable',
  props: {
    courses: {
      type: Array,
      required: true
    }
  }
}
</script>