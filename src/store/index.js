// در src/store/index.js
import { createStore } from 'vuex'
import auth from './auth'
import courses from './courses'
import progress from './progress'

export default createStore({
    modules: {
        auth,
        courses,
        progress
    },
    // اضافه کردن getters عمومی برای دسترسی آسان‌تر به auth
    getters: {
        isLoggedIn: state => state.auth.token && state.auth.token !== '',
        currentUser: state => state.auth.user,
        userRole: state => state.auth.userRole,
        authStatus: state => state.auth.status
    }
})