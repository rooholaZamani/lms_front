Certainly! Here’s a more detailed distillation of your project, including relationships between components, files, and their roles in the architecture. This is structured for clarity and maintainability, and can be used as a comprehensive PROJECT_SUMMARY.md.

---

# PROJECT_SUMMARY.md

---

## Component Tree (Visual Hierarchy & Relationships)

```
App.vue
├── Layout (src/components/layout/)
│   ├── Navbar.vue
│   │   └── UserDropdown.vue (user menu, notifications)
│   ├── Sidebar.vue
│   └── SiteFooter.vue
├── NotificationsContainer.vue (global notifications)
├── MainContent (router-view)
│   ├── Dashboard (src/components/dashboard/)
│   │   ├── TeacherDashboard.vue
│   │   │   └── StudentActivityTable.vue
│   │   ├── StudentDashboard.vue
│   │   │   ├── StudentCourseCard.vue
│   │   │   └── StudentExamsTable.vue
│   ├── Courses (src/components/courses/)
│   │   ├── CourseList.vue
│   │   ├── CourseDetail.vue
│   │   │   ├── CourseHeader.vue
│   │   │   ├── LessonList.vue
│   │   │   ├── StudentsTab.vue
│   │   │   ├── LessonManager.vue
│   │   │   ├── LessonQuestionsManager.vue
│   │   │   ├── ContentModal.vue
│   │   │   └── ConfirmationDialog.vue
│   │   ├── TeachingCourses.vue
│   │   └── AvailableCourses.vue
│   ├── Exams (src/components/exams/)
│   │   ├── Exam.vue
│   │   │   ├── Exercise.vue
│   │   │   ├── ExamNavigation.vue
│   │   │   ├── ExamFinishConfirmation.vue
│   │   │   └── ExamResultsTable.vue
│   │   ├── ExamCreator.vue
│   │   │   ├── ExamInfoForm.vue
│   │   │   ├── QuestionForm.vue
│   │   │   └── QuestionList.vue
│   │   ├── TeacherExams.vue
│   │   └── SubmissionDetail.vue
│   ├── Assignments (src/components/assignments/)
│   │   ├── PendingAssignments.vue
│   │   ├── StudentAssignments.vue
│   │   └── AssignmentGradingTable.vue
│   ├── Analytics (src/components/analytics/)
│   │   ├── Analytics.vue
│   │   ├── StudentActivities.vue
│   │   └── PerformanceAnalysis.vue
│   ├── Charts (src/components/charts/)
│   │   ├── Charts.vue
│   │   ├── ScoresDistributionChart.vue
│   │   └── ActivityChart.vue
│   ├── Profile.vue
│   ├── Students.vue
│   ├── Reports.vue
│   ├── Home.vue
│   ├── Login.vue
│   ├── Register.vue
│   ├── NotFound.vue
│   └── Forbidden.vue
├── Common (src/components/common/)
│   ├── Pagination.vue
│   ├── LoadingSpinner.vue
│   ├── EmptyState.vue
│   ├── ToastContainer.vue
│   ├── ConfirmationDialog.vue
│   ├── AlertMessage.vue
│   ├── BaseModal.vue
│   ├── StatCard.vue
│   └── ContentModal.vue
├── Icons (src/components/icons/)
│   └── Icon*.vue (various SVG icon components)
```

---

## Component Signatures & Relationships

### Example: CourseDetail.vue
**Props:**
- id: String|Number

**State:**
- loading, enrolling, updatingCourse, course, isEnrolled, isTeacherOfCourse, selectedLessonForQuestions, showQuestionsManager, lessonForm, editCourseForm, assignmentForm, selectedLesson, exerciseForm, examForm, etc.

**Related Components:**
- CourseHeader.vue (header display)
- LessonList.vue (lists lessons)
- StudentsTab.vue (student management)
- LessonManager.vue (lesson CRUD)
- LessonQuestionsManager.vue (question management)
- ContentModal.vue (modal for content)
- ConfirmationDialog.vue (confirmation modals)
- Uses composables: useUser.js, useFormatters.js

---

### Example: Exam.vue
**Props:**
- id: String|Number

**State:**
- loading, exam, questions, answers, timer, etc.

**Related Components:**
- Exercise.vue (exercise logic)
- ExamNavigation.vue (navigation between questions)
- ExamFinishConfirmation.vue (finish modal)
- ExamResultsTable.vue (results display)
- Uses composables: useUser.js, useFormatters.js

---

### Example: TeacherDashboard.vue
**Props:**
- user: Object

**State:**
- loadingCourses, loadingStudentActivities, isSubmitting, showCreateCourse, courses, studentActivities, stats, newCourse

**Related Components:**
- StudentActivityTable.vue (table of student activities)
- Uses composables: useFormatters.js

---

### Example: StudentDashboard.vue
**Props:**
- user: Object

**State:**
- activeTab, loading, loadingExams, loadingProgress, courses, progressList, progressMap, exams, stats

**Related Components:**
- StudentCourseCard.vue (course cards)
- StudentExamsTable.vue (exams table)
- Uses composables: useFormatters.js

---

### Example: Common Components
- **Pagination.vue**: Used in lists/tables for pagination.
- **LoadingSpinner.vue**: Used globally for loading states.
- **EmptyState.vue**: Used for empty data displays.
- **ToastContainer.vue**: Used for global notifications.
- **ConfirmationDialog.vue**: Used for confirming destructive actions.
- **AlertMessage.vue**: Used for inline alerts.
- **BaseModal.vue**: Used as a modal base for other modals.
- **StatCard.vue**: Used in dashboards for stats.
- **ContentModal.vue**: Used for displaying content in modals.

---

## Routes Summary

| Path                                 | Component (File)                                 | Related Features/Components                |
|---------------------------------------|--------------------------------------------------|--------------------------------------------|
| /                                    | Home.vue                                         | HeroSection, FeaturesSection, AboutSection |
| /students                            | Students.vue                                     | UserList, Pagination                       |
| /reports                             | Reports.vue                                      | Analytics, Charts                          |
| /login                               | Login.vue                                        | Auth, AlertMessage                         |
| /register                            | Register.vue                                     | Auth, AlertMessage                         |
| /dashboard                           | Dashboard.vue                                    | TeacherDashboard, StudentDashboard         |
| /courses                             | CourseList.vue                                   | Pagination, CourseCard                     |
| /courses/:id                         | CourseDetail.vue                                 | LessonList, StudentsTab, LessonManager     |
| /courses/teaching                    | TeachingCourses.vue                              | Course management                          |
| /courses/available                   | AvailableCourses.vue                             | Enrollment                                 |
| /exams/:id                           | Exam.vue                                         | Exercise, ExamNavigation                   |
| /profile                             | Profile.vue                                      | User info, forms, AlertMessage             |
| /teacher/exams                       | TeacherExams.vue                                 | Exam management                            |
| /teacher/assignments/pending         | PendingAssignments.vue                           | AssignmentGradingTable                     |
| /teacher/student-activities          | StudentActivities.vue                            | Analytics, Charts                          |
| /teacher/performance-analysis        | PerformanceAnalysis.vue                          | Analytics, Charts                          |
| /exams/create                        | ExamCreator.vue                                  | ExamInfoForm, QuestionForm, QuestionList   |
| /exams/:id/edit                      | ExamCreator.vue                                  | ExamInfoForm, QuestionForm, QuestionList   |
| * (fallback)                         | NotFound.vue, Forbidden.vue                      | Error handling                             |

---

## Design System Summary

- **Styling Approach:**
  - Custom CSS (src/assets/styles/)
  - Bootstrap (utility classes, grid, modals)
  - CSS variables for design tokens (variables.css)
  - RTL support

- **Design Tokens:**
  - Colors: --primary-color, --secondary-color, --success-color, --danger-color, --warning-color, --info-color, --white, --gray-100...--gray-900, --black
  - Font: --font-family: 'Vazirmatn', Tahoma, Arial, sans-serif
  - Spacing: --spacing-1...--spacing-5
  - Shadows: --shadow-sm, --shadow, --shadow-lg
  - Border radius: --border-radius, --border-radius-sm, --border-radius-lg, --border-radius-circle
  - Transitions: --transition-slow, --transition-normal, --transition-fast

- **Patterns:**
  - Modal pattern (BaseModal, ConfirmationDialog)
  - Notification pattern (ToastContainer, AlertMessage)
  - Loading/empty state pattern (LoadingSpinner, EmptyState)
  - Chart pattern (Charts, ScoresDistributionChart, ActivityChart)
  - User guide/stepper (UserGuideStep)
  - Pagination (Pagination)
  - Form handling (various forms in CourseDetail, ExamCreator, Profile, etc.)

---

## Key Dependencies

| Package                        | Purpose                        | Used In/With                |
|--------------------------------|--------------------------------|-----------------------------|
| vue                            | UI framework                   | All components              |
| vue-router                     | Routing                        | src/router/index.js         |
| vuex                           | State management               | src/store/                  |
| bootstrap                      | Styling, modals, grid          | Layout, modals, forms       |
| d3                             | Charts/visualizations          | Analytics, Charts           |
| axios                          | API requests                   | All data fetching           |
| @fortawesome/fontawesome-free   | Icons                          | Navbar, Sidebar, Cards      |
| vue-toastification, vue3-toastify | Notifications                | ToastContainer, AlertMessage|

---

## Data Flow Patterns

- **State Management:**
  - Vuex (src/store/)
    - Modules: auth.js (authentication), courses.js (courses), notification.js (notifications)
    - Global getters: isLoggedIn, currentUser, userRole, authStatus

- **Key Data Models:**
  - User: { id, username, firstName, lastName, email, role, ... }
  - Course: { id, title, description, teacher, lessons, ... }
  - Exam: { id, title, description, duration, questions, ... }
  - Assignment: { id, title, description, dueDate, ... }

- **API Endpoints:**
  - /courses, /courses/teaching, /courses/enrolled
  - /exams, /exams/:id, /exams/submissions/student
  - /progress, /progress/stats
  - /user/profile

- **Composables (src/composables/):**
  - useUser.js: user role, permissions, helpers
  - useFileHelpers.js: file upload/download helpers
  - useFormatters.js: date/number formatting

---

## Reusable Patterns

- **Modal Pattern:**
  - BaseModal.vue, ConfirmationDialog.vue, ContentModal.vue
- **Notification Pattern:**
  - ToastContainer.vue, AlertMessage.vue
- **Loading/Empty State:**
  - LoadingSpinner.vue, EmptyState.vue
- **Chart Pattern:**
  - Charts.vue, ScoresDistributionChart.vue, ActivityChart.vue
- **User Guide/Stepper:**
  - UserGuideStep.vue
- **Pagination:**
  - Pagination.vue
- **Form Handling:**
  - Used in CourseDetail, ExamCreator, Profile, etc.
- **Utility Functions:**
  - useFormatters.js (formatDate, formatTime, truncateText)
  - useFileHelpers.js (file upload/download)
  - useUser.js (role checks, user info)

---

## Feature-Component Matrix

| Feature         | Components Used                                                                                 |
|-----------------|-----------------------------------------------------------------------------------------------|
| User List       | Students.vue, Pagination.vue, UserCard.vue, EmptyState.vue                                    |
| User Edit       | Profile.vue, Form fields, AlertMessage.vue                                                    |
| Dashboard       | TeacherDashboard.vue, StudentDashboard.vue, StatCard.vue, Charts.vue, StudentCourseCard.vue   |
| Course Detail   | CourseDetail.vue, LessonList.vue, StudentsTab.vue, LessonManager.vue, ContentModal.vue        |
| Exams           | Exam.vue, ExamCreator.vue, QuestionList.vue, QuestionForm.vue, ExamNavigation.vue             |
| Assignments     | PendingAssignments.vue, AssignmentGradingTable.vue, StudentAssignments.vue                    |
| Analytics       | Analytics.vue, StudentActivities.vue, PerformanceAnalysis.vue, Charts.vue                     |
| Notifications   | ToastContainer.vue, AlertMessage.vue                                                          |
| Home Page       | Home.vue, FeaturesSection.vue, AboutSection.vue, HeroSection.vue                              |

---

**Notes:**
- All components are grouped by feature and show their relationships.
- Related composables, utility files, and state modules are referenced for each major component.
- Comments, console logs, and dead code are omitted.
- Similar components are grouped by pattern.
- Focus is on structure, not implementation.
- Naming is consistent with the codebase.

---

If you need a full markdown file or want to expand on a specific feature/component (with more props, state, or handler details), let me know!
