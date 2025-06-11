import axios from 'axios'

export default {
    namespaced: true,
    state: {
        progressList: [],
        progressStats: {},
        courseProgress: {},
        loading: false,
        error: null
    },

    getters: {
        getProgressList: state => state.progressList,
        getProgressStats: state => state.progressStats,
        getCourseProgress: state => courseId => state.courseProgress[courseId],
        isLoading: state => state.loading,
        getError: state => state.error
    },

    mutations: {
        setLoading(state, loading) {
            state.loading = loading
        },

        setError(state, error) {
            state.error = error
        },

        clearError(state) {
            state.error = null
        },

        setProgressList(state, progressList) {
            state.progressList = progressList
        },

        setProgressStats(state, stats) {
            state.progressStats = stats
        },

        setCourseProgress(state, { courseId, progress }) {
            state.courseProgress = {
                ...state.courseProgress,
                [courseId]: progress
            }
        },

        updateCourseProgress(state, { courseId, progressData }) {
            const existingProgress = state.courseProgress[courseId]
            if (existingProgress) {
                state.courseProgress[courseId] = {
                    ...existingProgress,
                    ...progressData
                }
            }

            // Update progress in progressList as well
            const progressIndex = state.progressList.findIndex(p => p.courseId === courseId)
            if (progressIndex !== -1) {
                state.progressList[progressIndex] = {
                    ...state.progressList[progressIndex],
                    ...progressData
                }
            }
        }
    },

    actions: {
        async fetchStudentProgress({ commit }) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.get('/progress')
                commit('setProgressList', response.data)
                commit('setLoading', false)
                console.log("fetchStudentProgress:", response.data)
                return response.data
            } catch (error) {
                console.error('Error fetching student progress:', error)
                commit('setError', error.response?.data?.message || 'خطا در دریافت اطلاعات پیشرفت')
                commit('setLoading', false)
                throw error
            }
        },

        async fetchProgressStats({ commit }) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.get('/progress/stats')
                commit('setProgressStats', response.data)
                commit('setLoading', false)
                console.log("fetchProgressStats:", response.data)
                return response.data
            } catch (error) {
                console.error('Error fetching progress stats:', error)
                commit('setError', error.response?.data?.message || 'خطا در دریافت آمار پیشرفت')
                commit('setLoading', false)
                throw error
            }
        },

        async fetchCourseProgress({ commit }, courseId) {
            commit('setLoading', true)
            commit('clearError')

            try {
                const response = await axios.get(`/progress/${courseId}`)
                commit('setCourseProgress', { courseId, progress: response.data })
                commit('setLoading', false)
                console.log("fetchCourseProgress:", response.data)
                return response.data
            } catch (error) {
                console.error('Error fetching course progress:', error)
                commit('setError', error.response?.data?.message || 'خطا در دریافت پیشرفت دوره')
                commit('setLoading', false)
                throw error
            }
        },

        async markLessonComplete({ commit }, { lessonId, timeSpent = 0 }) {
            try {
                const response = await axios.post(`/progress/lesson/${lessonId}/complete?timeSpent=${timeSpent}`)
                console.log("markLessonComplete:", response.data)
                return response.data
            } catch (error) {
                console.error('Error marking lesson complete:', error)
                throw error
            }
        },

        async markContentViewed({ commit }, { contentId, timeSpent = 0 }) {
            try {
                const response = await axios.post(`/progress/content/${contentId}/view?timeSpent=${timeSpent}`)
                console.log("markContentViewed:", response.data)
                return response.data
            } catch (error) {
                console.error('Error marking content viewed:', error)
                throw error
            }
        },

        async markContentComplete({ commit }, { contentId, timeSpent = 0 }) {
            try {
                const response = await axios.post(`/progress/content/${contentId}/complete?timeSpent=${timeSpent}`)
                console.log("markContentComplete:", response.data)
                return response.data
            } catch (error) {
                console.error('Error marking content complete:', error)
                throw error
            }
        },

        // Combined action to fetch both courses and progress
        async fetchCoursesWithProgress({ commit, dispatch }) {
            commit('setLoading', true)
            commit('clearError')

            try {
                // Fetch both courses and progress simultaneously
                const [coursesData, progressData] = await Promise.all([
                    dispatch('courses/fetchEnrolledCourses', null, { root: true }),
                    dispatch('fetchStudentProgress')
                ])

                // Merge courses with progress data
                const coursesWithProgress = coursesData.map(course => {
                    const progress = progressData.find(p => p.courseId === course.id)
                    return {
                        ...course,
                        completionPercentage: progress ? progress.completionPercentage : 0,
                        completedLessons: progress ? progress.completedLessonCount : 0,
                        totalLessons: progress ? progress.totalLessons : 0,
                        lastAccessed: progress ? progress.lastAccessed : null,
                        viewedContent: progress ? progress.viewedContent : [],
                        completedContent: progress ? progress.completedContent : []
                    }
                })

                commit('setLoading', false)
                return coursesWithProgress
            } catch (error) {
                console.error('Error fetching courses with progress:', error)
                commit('setError', 'خطا در بارگذاری اطلاعات دوره‌ها و پیشرفت')
                commit('setLoading', false)
                throw error
            }
        },

        async refreshCourseProgress({ commit, dispatch }, courseId) {
            try {
                const progressData = await dispatch('fetchCourseProgress', courseId)

                // Update the course progress in the store
                commit('updateCourseProgress', {
                    courseId,
                    progressData: {
                        completionPercentage: progressData.completionPercentage,
                        completedLessons: progressData.completedLessonCount,
                        totalLessons: progressData.totalLessons,
                        lastAccessed: progressData.lastAccessed
                    }
                })

                return progressData
            } catch (error) {
                console.error('Error refreshing course progress:', error)
                throw error
            }
        }
    }
}