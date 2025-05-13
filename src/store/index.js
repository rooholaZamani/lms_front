// src/store/index.js
import { createStore } from 'vuex'
import auth from './modules/auth'
import courses from './modules/courses'

export default createStore({
    modules: {
        auth,
        courses
    }
})