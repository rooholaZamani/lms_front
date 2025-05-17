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
                commit('auth_request');

                // افزودن console.log برای دیباگ
                console.log("Sending login request:", user.username);

                // ارسال درخواست لاگین
                const response = await axios.post('/auth/login', {
                    username: user.username,
                    password: user.password
                });

                // نمایش پاسخ API برای دیباگ
                console.log("Login API response:", response.data);

                // بررسی ساختار پاسخ و مقادیر مورد انتظار
                if (response.data.success) {

                    console.log("Login successful, retrieving user data");
                    const token = btoa(`${user.username}:${user.password}`);

                    localStorage.setItem('token', token);
                    axios.defaults.headers.common['Authorization'] = `Basic ${token}`;
                    try {
                        // دریافت اطلاعات کاربر
                        const userResponse = await axios.get('/user/current');
                        console.log("User data response:", userResponse.data);

                        const roleResponse = await axios.get('/user/role');
                        console.log("User role response:", roleResponse.data);


                        const userData = userResponse.data;
                        const userRole = roleResponse.data || { isTeacher: response.data.isTeacher, isStudent: !response.data.isTeacher };



                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.setItem('userRole', JSON.stringify(userRole));

                        // بررسی داده‌های ذخیره شده
                        console.log("Stored token:", localStorage.getItem('token'));
                        console.log("Stored user:", localStorage.getItem('user'));
                        console.log("Stored role:", localStorage.getItem('userRole'));

                        // آپدیت state در Vuex
                        commit('auth_success', { token, user: userData, userRole });

                        return { success: true };
                    } catch (err) {
                        console.error("Error fetching user details:", err);
                        commit('auth_error');
                        return { success: false, message: 'خطا در دریافت اطلاعات کاربر' };
                    }
                } else {
                    console.log("Login failed:", response.data.message);
                    return { success: false, message: response.data.message || 'نام کاربری یا رمز عبور اشتباه است' };
                }
            } catch (err) {
                console.error("Login request error:", err.response?.data || err.message);
                commit('auth_error');
                return { success: false, message: err.response?.data?.message || 'مشکلی در ارتباط با سرور رخ داد' };
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