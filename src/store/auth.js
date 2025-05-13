// src/store/modules/auth.js
import axios from 'axios'

export default {
    namespaced: true,
    state: {
        status: '',
        token: localStorage.getItem('token') || '',
        user: JSON.parse(localStorage.getItem('user')) || null,
        userRole: JSON.parse(localStorage.getItem('userRole')) || { isTeacher: false, isStudent: false }
    },
    getters: {
        isLoggedIn: state => !!state.token,
        authStatus: state => state.status,
        currentUser: state => state.user,
        userRole: state => state.userRole
    },
    mutations: {
        auth_request(state) {
            state.status = 'loading'
        },
        auth_success(state, { token, user, userRole }) {
            state.status = 'success'
            state.token = token
            state.user = user
            state.userRole = userRole
        },
        auth_error(state) {
            state.status = 'error'
        },
        logout(state) {
            state.status = ''
            state.token = ''
            state.user = null
            state.userRole = { isTeacher: false, isStudent: false }
        },
        update_user(state, user) {
            state.user = user
        }
    },
    actions: {
        async login({ commit }, user) {
            try {
                commit('auth_request')

                // با استفاده از فرم ورود اسپرینگ سکیوریتی
                const formData = new FormData()
                formData.append('username', user.username)
                formData.append('password', user.password)

                const response = await axios.post('/auth/login', formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })

                if (response.data.success) {
                    // دریافت اطلاعات کاربر
                    const userResponse = await axios.get('/user/current')
                    const roleResponse = await axios.get('/user/role')

                    const token = 'dummy-token' // در یک پروژه واقعی از توکن JWT استفاده می‌شود
                    const userData = userResponse.data
                    const userRole = roleResponse.data

                    localStorage.setItem('token', token)
                    localStorage.setItem('user', JSON.stringify(userData))
                    localStorage.setItem('userRole', JSON.stringify(userRole))

                    commit('auth_success', { token, user: userData, userRole })
                    return { success: true }
                }
            } catch (err) {
                commit('auth_error')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('userRole')
                return { success: false, message: err.response?.data?.message || 'مشکلی در ورود به سیستم رخ داد!' }
            }
        },

        async register({ commit }, user) {
            try {
                commit('auth_request')

                // تعیین مسیر API بر اساس نوع کاربر
                const endpoint = user.isTeacher ? '/auth/register/teacher' : '/auth/register/student'

                const response = await axios.post(endpoint, user)

                if (response.data.success) {
                    return { success: true, message: response.data.message }
                }
            } catch (err) {
                commit('auth_error')
                return { success: false, message: err.response?.data?.message || 'مشکلی در ثبت‌نام رخ داد!' }
            }
        },

        async checkAuth({ commit, state }) {
            if (!state.token) {
                commit('logout')
                return { success: false }
            }

            try {
                // بررسی اعتبار توکن با درخواست اطلاعات کاربر
                const userResponse = await axios.get('/user/current')
                const roleResponse = await axios.get('/user/role')

                const userData = userResponse.data
                const userRole = roleResponse.data

                localStorage.setItem('user', JSON.stringify(userData))
                localStorage.setItem('userRole', JSON.stringify(userRole))

                commit('auth_success', {
                    token: state.token,
                    user: userData,
                    userRole
                })

                return { success: true }
            } catch (err) {
                commit('logout')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('userRole')
                return { success: false }
            }
        },

        logout({ commit }) {
            return new Promise((resolve) => {
                axios.post('/auth/logout')
                    .then(() => {
                        commit('logout')
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        localStorage.removeItem('userRole')
                        resolve()
                    })
                    .catch(() => {
                        commit('logout')
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        localStorage.removeItem('userRole')
                        resolve()
                    })
            })
        }
    }
}