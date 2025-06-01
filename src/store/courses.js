// src/store/modules/courses.js
import axios from 'axios'

export default {
    namespaced: true,
    state: {
        courses: [],
        teachingCourses: [],
        enrolledCourses: [],
        currentCourse: null,
        loading: false,
        error: null
    },
    getters: {
        getAllCourses: state => state.courses,
        getTeachingCourses: state => state.teachingCourses,
        getEnrolledCourses: state => state.enrolledCourses,
        getCurrentCourse: state => state.currentCourse,
        isLoading: state => state.loading,
        hasError: state => !!state.error,
        getError: state => state.error
    },
    mutations: {
        setCourses(state, courses) {
            state.courses = courses
        },
        setTeachingCourses(state, courses) {
            state.teachingCourses = courses
        },
        setEnrolledCourses(state, courses) {
            state.enrolledCourses = courses
        },
        setCurrentCourse(state, course) {
            state.currentCourse = course
        },
        addCourse(state, course) {
            state.courses.push(course)
            state.teachingCourses.push(course)
        },
        updateCourse(state, updatedCourse) {
            // به‌روزرسانی در لیست همه دوره‌ها
            const index = state.courses.findIndex(c => c.id === updatedCourse.id)
            if (index !== -1) {
                state.courses.splice(index, 1, updatedCourse)
            }

            // به‌روزرسانی در لیست دوره‌های در حال تدریس
            const teachingIndex = state.teachingCourses.findIndex(c => c.id === updatedCourse.id)
            if (teachingIndex !== -1) {
                state.teachingCourses.splice(teachingIndex, 1, updatedCourse)
            }

            // به‌روزرسانی در لیست دوره‌های ثبت‌نام شده
            const enrolledIndex = state.enrolledCourses.findIndex(c => c.id === updatedCourse.id)
            if (enrolledIndex !== -1) {
                state.enrolledCourses.splice(enrolledIndex, 1, updatedCourse)
            }

            // به‌روزرسانی دوره فعلی اگر مطابقت داشته باشد
            if (state.currentCourse && state.currentCourse.id === updatedCourse.id) {
                state.currentCourse = updatedCourse
            }
        },
        setLoading(state, status) {
            state.loading = status
        },
        setError(state, error) {
            state.error = error
        },
        clearError(state) {
            state.error = null
        }
    },
    actions: {
        async fetchCourses({ commit }) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.get('/courses')

                // بررسی اعتبارسنجی پاسخ
                if (!response.data || !Array.isArray(response.data)) {
                    console.error('خطا: پاسخ دریافتی از API معتبر نیست:', response.data)
                    commit('setError', 'داده های دریافتی از سرور معتبر نیستند')
                    commit('setLoading', false)
                    throw new Error('خطا در فرمت داده‌های دریافتی')
                }

                console.log('دوره‌های دریافت شده:', response.data.length, response.data)
                commit('setCourses', response.data)
                commit('setLoading', false)
                return response.data
            } catch (error) {
                console.error('خطا در دریافت دوره‌ها:', error)
                commit('setError', error.response?.data?.message || 'خطا در دریافت دوره‌ها')
                commit('setLoading', false)
                throw error
            }
        },

        async fetchTeachingCourses({ commit }) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.get('/courses/teaching')
                commit('setTeachingCourses', response.data)
                commit('setLoading', false)
                console.log("fetchTeachingCourses: "+response.data)
                return response.data
            } catch (error) {
                commit('setError', error.response?.data?.message || 'خطا در دریافت دوره‌های در حال تدریس')
                commit('setLoading', false)
                throw error
            }
        },

        async fetchEnrolledCourses({ commit }) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.get('/courses/enrolled')
                commit('setEnrolledCourses', response.data)
                commit('setLoading', false)
                console.log("fetchEnrolledCourses: "+response.data)
                return response.data
            } catch (error) {
                commit('setError', error.response?.data?.message || 'خطا در دریافت دوره‌های ثبت‌نام شده')
                commit('setLoading', false)
                throw error
            }
        },

        async fetchCourseById({ commit }, courseId) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.get(`/courses/${courseId}`)
                commit('setCurrentCourse', response.data)
                commit('setLoading', false)

                // console.log('Course response in fetchCourseById:', {
                //     data: response.data,
                //     status: response.status,
                //     statusText: response.statusText,
                //     headers: response.headers,
                //
                //     teacher: response.data.course.teacher
                // })

                return response.data
            } catch (error) {
                commit('setError', error.response?.data?.message || 'خطا در دریافت اطلاعات دوره')
                commit('setLoading', false)
                console.log("fetchCourseById error:"+error)
                throw error
            }
        },

        async createCourse({ commit }, courseData) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.post('/courses', courseData)
                commit('addCourse', response.data)
                commit('setLoading', false)
                return response.data
            } catch (error) {
                commit('setError', error.response?.data?.message || 'خطا در ایجاد دوره')
                commit('setLoading', false)
                throw error
            }
        },

        async updateCourse({ commit }, { courseId, courseData }) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.put(`/courses/${courseId}`, courseData)
                commit('updateCourse', response.data)
                commit('setLoading', false)
                console.log(response.data)
                return response.data
            } catch (error) {
                commit('setError', error.response?.data?.message || 'خطا در به‌روزرسانی دوره')
                commit('setLoading', false)
                throw error
            }
        },

        async enrollCourse({ commit, dispatch }, courseId) {
            commit('setLoading', true)
            commit('clearError')

            try {
                await axios.post(`/courses/${courseId}/enroll`)

                // بازیابی مجدد اطلاعات دوره و دوره‌های ثبت‌نام شده
                await dispatch('fetchCourseById', courseId)
                await dispatch('fetchEnrolledCourses')

                commit('setLoading', false)
                return { success: true }
            } catch (error) {
                commit('setError', error.response?.data?.message || 'خطا در ثبت‌نام در دوره')
                commit('setLoading', false)
                throw error
            }
        }
    }
}