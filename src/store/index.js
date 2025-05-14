// src/store/index.js
import { createStore } from 'vuex'
import auth from './auth'
import courses from './courses'

export default createStore({
    modules: {
        auth,
        courses
    }
})