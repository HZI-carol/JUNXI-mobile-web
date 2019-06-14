/* eslint-disable no-undef */
import Vue from 'vue'
import { Toast, Dialog, ImagePreview } from 'vant'

Toast.allowMultiple()
Vue.use(Toast)
  .use(Dialog)
  .use(ImagePreview)

export default new Vue({
  data () {
    return {
      AMap: {
        map: null,
        geolocation: null,
        geocoder: null
      }
    }
  },
  methods: {
    start_initMap () {
      console.time('start_initMap')
      return new Promise((resolve, reject) => {
        if (window.AMap) {
          if (!this.AMap.map) {
            this.new_map().then(() => {
              resolve()
              console.timeEnd('start_initMap')
            })
          } else {
            console.timeEnd('start_initMap')
            resolve()
          }
        } else {
          this.mapTimer = setInterval(() => {
            if (window.AMap) {
              this.new_map().then(() => {
                console.timeEnd('start_initMap')
                resolve()
              })
            }
          }, 200)
        }
      })
    },
    new_map () {
      console.time('new_map')
      return new Promise((resolve, reject) => {
        this.AMap.map = new window.AMap.Map('iCenter')
        this.AMap.map.plugin(['AMap.Geolocation', 'AMap.Geocoder'], () => {
          this.AMap.geocoder = new window.AMap.Geocoder()
          this.AMap.geolocation = new window.AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位，默认:true
            timeout: 10000 // 超过10秒后停止定位，默认：无穷大
          })
          clearInterval(this.mapTimer)
          this.mapTimer = null
          console.timeEnd('new_map')
          resolve()
        })
      })
    },
    getCurrentPosition () {
      this.openLoading()
      return new Promise((resolve, reject) => {
        this.start_initMap().then(() => {
          console.time('getCurrentPosition')

          this.AMap.geolocation.getCurrentPosition((status, res) => {
            if (status === 'complete') {
              resolve({ lat: res.position.lat, lng: res.position.lng })
            } else {
              this.tip('获取定位失败, 请选择城市!', 'fail')
              console.log('获取定位失败:', res)
              resolve()
            }
            console.timeEnd('getCurrentPosition')

            this.closeLoading()
          })
        })
      })
    },
    async getAddress (lng, lat) {
      // 地址转换
      this.openLoading()

      if (!lng) {
        let lnglat = await this.getCurrentPosition()
        if (lnglat) {
          lng = lnglat.lng
          lat = lnglat.lat
        }
      }
      if (!lng) return
      return new Promise((resolve, reject) => {
        this.start_initMap().then(() => {
          console.time('getAddress')

          this.AMap.geocoder.getAddress([lng, lat], (status, res) => {
            if (status === 'complete') {
              console.log(res)
              resolve(res.regeocode)
            } else {
              console.log('地址转换失败:', res)
              resolve()
            }
            console.timeEnd('getAddress')

            this.closeLoading()
          })
        })
      })
    },
    imagePreview (urls = []) {
      ImagePreview(urls)
    },
    emit (event, ...args) {
      this.$emit(event, ...args)
    },
    on (event, cb) {
      this.$on(event, cb)
    },
    off (event) {
      this.$off(event)
    },
    tip (message = '操作成功！', type = 'success', opts = {}) {
      this.toast1 = Toast.loading({
        type, // fail success text
        message,
        duration: opts.duration || 2000, // 持续展示 toast
        forbidClick: opts.forbidClick || false, // 禁用背景点击
        position: opts.position || 'middle'
      })
    },
    delay (cb, time) {
      setTimeout(cb, time || 1000)
    },
    throttle (cb, time) {
      if (this.timer) return
      this.timer = setTimeout(() => {
        cb()
        clearTimeout(this.timer)
        this.timer = null
      }, time)
    },
    open (cb) {
      Dialog.confirm({
        title: '提示',
        message: '是否确认当前操作?'
      }).then(() => cb()).catch(() => { })
    },
    openLoading (message = 'Loading...') {
      if (this.loading) return
      this.loading = true
      this.toast2 = Toast.loading({
        duration: 0,
        forbidClick: true,
        message
      })
    },
    closeLoading () {
      this.loading = false
      this.toast2.clear()
    }
  }
})
