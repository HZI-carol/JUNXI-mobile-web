/* eslint-disable no-undef */
export default {
  state: {
    userInfo: {},
    companyInfo: {},
    homeBanner: [-1],
    decorationStyles: [],
    panoPictureCate: [-1],
    tradeCate: [-1],
    companyPano: {},
    companyTypes: [-1]
  },
  getters: {
    userInfo: state => state.userInfo,
    homeBanner: state => {
      if (state.homeBanner[0] === -1) {
        VM.$store.dispatch('getBanner')
      }
      return state.homeBanner
    },
    companyInfo: state => state.companyInfo,
    companyPano: state => state.companyPano,
    decorationStyles: state => state.decorationStyles,
    panoPictureCate: state => state.panoPictureCate,
    tradeCate: state => state.tradeCate,
    companyTypes: state => state.companyTypes
  },
  actions: {
    getUserInfo ({state, commit}, init = false) {
      let api = () => VM.$api.getUserInfo().then(data => {
        commit('SAVE_USER_INFO', data)
        return data
      })
      if (!Object.keys(state.userInfo).length) api()
      else if (init) api()
    },
    getCompanyInfo ({state, commit}, init = false) {
      let api = () => VM.$api.getCompanyInfo().then(data => {
        let url = data.panoview_url
        data.panoid = Number(url.slice(url.lastIndexOf('/') + 1))
        commit('SAVE_COMPANY_INFO', data)
      })
      if (!Object.keys(state.companyInfo).length) api()
      else if (init) api()
    },
    getCompanyPano ({state, commit}, init = false) {
      let api = () => VM.$api.getCompanyVR().then(data => {
        commit('SAVE_COMPANY_VR', data)
      })
      if (!Object.keys(state.companyPano).length) api()
      else if (init) api()
    },
    getBanner ({ commit }) {
      VM.$api.getBanner(0).then(data => {
        commit('SAVE_BANNER', data)
      })
    },
    getDecorationStyles ({ commit }) {
      VM.$api.getDecorationStyles().then(data => {
        commit('SAVE_DECORATION_STYLES', data)
      })
    },
    getPanoPictureCate ({commit}) {
      VM.$api.getUserPanoCate().then(data => {
        commit('SAVE_PANO_PICTURE_CATE', data)
      })
    },
    getTradeCate ({commit}) {
      VM.$api.getUserPanoTradeCate(0).then(data => {
        data.map(item => { item.name = item.tagname })
        commit('SAVE_TRADE_CATE', data)
      })
    },
    getCompanyTypes ({commit}) {
      VM.$api.getCompanyTypes(0).then(data => {
        // data.map(item => { item.name = item.tagname })
        commit('SAVE_PROJECT_TYPES', data)
      })
    }
  },
  mutations: {
    SAVE_USER_INFO (state, data) {
      state.userInfo = data
    },
    SAVE_COMPANY_INFO (state, data) {
      state.companyInfo = data
    },
    SAVE_COMPANY_VR (state, data) {
      state.companyPano = data
    },
    SAVE_BANNER (state, data) {
      state.homeBanner = data.list
    },
    SAVE_DECORATION_STYLES (state, data) {
      state.decorationStyles = data
    },
    SAVE_PANO_PICTURE_CATE (state, data) {
      state.panoPictureCate = data
    },
    SAVE_TRADE_CATE (state, data) {
      state.tradeCate = data
    },
    SAVE_PROJECT_TYPES (state, data) {
      state.companyTypes = data
    }
  }
}
