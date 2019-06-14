import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import material from './modules/material'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
  },
  actions: {
  },
  mutations: {
  },
  modules: {
    app,
    material
  }
})
