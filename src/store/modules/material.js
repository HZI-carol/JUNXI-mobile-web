/* eslint-disable no-undef */
export default {
  state: {
    // 0项目logo 8音乐素材 3项目封面
    material: {
      0: {list: {}, count: -1},
      3: {list: {}, count: -1},
      10001: {list: {}, count: -1},
      8: {list: {}, count: -1}
    },
    loadingMaterial: {list: {}, count: -1},
    textToAudio: [-1]
  },
  getters: {
    material: state => state.material,
    loadingMaterial: state => state.loadingMaterial,
    textToAudio: state => state.textToAudio
  },
  actions: {
    async getMaterial ({commit, state}, opts) {
      if (opts.init) {
        opts.init = false
        await commit('INIT_MAT_LIST', opts.typeid)
      }
      if (!state.material[opts.typeid].list[opts.page]) {
        VM.$api.getMaterial(opts).then(data => {
          commit('SAVE_MATERIAL', {opts, data})
        })
      }
    },
    getTextToAudio ({commit, state}) {
      VM.$api.getTextToAudio().then(data => {
        data.list.map(i => {
          i.full_mat_file = i.full_voice_url
          i.mat_file = 'plugins/' + i.voice_url
        })
        commit('SAVE_TEXT_TO_AUDIO', data)
      }).catch(() => {
        commit('SAVE_TEXT_TO_AUDIO', {list: []})
      })
    },
    async getLoadingList ({commit, state}, opts) {
      if (opts.init) {
        opts.init = false
        await commit('INIT_LOADING_LIST', opts.typeid)
      }
      if (!state.loadingMaterial.list[opts.page]) {
        VM.$api.getLoadingList(opts).then(data => {
          commit('SAVE_LOADING_MATERIAL', {data, opts})
        })
      }
    }
  },
  mutations: {
    SAVE_MATERIAL (state, obj) {
      VM.$set(state.material[obj.opts.typeid].list, obj.opts.page, obj.data.list)
      state.material[obj.opts.typeid].count = obj.data.count
    },
    SAVE_TEXT_TO_AUDIO (state, data) {
      state.textToAudio = data.list
    },
    SAVE_LOADING_MATERIAL (state, obj) {
      VM.$set(state.loadingMaterial.list, obj.opts.page, obj.data.list)
      state.loadingMaterial.count = obj.data.count
    },
    INIT_MAT_LIST (state, id) {
      return new Promise((resolve, reject) => {
        state.material[id].list = {}
        resolve()
      })
    },
    INIT_LOADING_LIST (state, id) {
      return new Promise((resolve, reject) => {
        state.loadingMaterial.list = {}
        resolve()
      })
    }
  }
}
