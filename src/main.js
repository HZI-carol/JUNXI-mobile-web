import Vue from 'vue'
import App from './App.vue'
import { router } from './router/index'
import store from './store/index'
import api from '@/api'
import bus from '@/plugins/bus'
import util from '@/plugins/util'
// vux
import {
  Swiper,
  SwiperItem,
  Tabbar,
  TabbarItem
} from 'vux'

// vant
import {
  Field,
  Switch,
  Checkbox,
  Tab,
  Tabs,
  Tag,
  Actionsheet,
  RadioGroup,
  Radio,
  Stepper,
  Progress,
  Pagination,
  Button,
  Collapse,
  CollapseItem
} from 'vant'

// custom
import NavBar from '@/components/NavBar'
import VPicker from '@/components/VPicker'

// vux

Vue.component(Swiper.name, Swiper)
Vue.component(SwiperItem.name, SwiperItem)
Vue.component(Tabbar.name, Tabbar)
Vue.component(TabbarItem.name, TabbarItem)

// vant
Vue.use(Field)
  .use(Switch)
  .use(Checkbox)
  .use(Button)
  .use(Tab)
  .use(Tabs)
  .use(Actionsheet)
  .use(RadioGroup)
  .use(Radio)
  .use(Progress)
  .use(Stepper)
  .use(Tag)
  .use(Pagination)
  .use(Collapse)
  .use(CollapseItem)

// custom
Vue.component('NavBar', NavBar)
Vue.component('VPicker', VPicker)

Vue.config.productionTip = false

Vue.prototype.$api = api

Vue.prototype.$vgo = bus

Vue.prototype.$util = util
Vue.prototype.$auth = util.auth

Vue.filter('dateFormat', (val, type) => {
  if (!val) return ''
  if (type === 'date') {
    return val.substr(0, 10)
  } else if (type === 'minute') {
    return val.replace(/t/ig, ' ').substr(0, 16)
  } else {
    return val.replace(/t/ig, ' ').split('.')[0]
  }
})

Vue.filter('amountFormat', val => {
  if (val >= 1000) {
    return (val / 10000).toFixed(1) + 'w'
  }
  return val
})

window.VM = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

if (/Android/gi.test(navigator.userAgent)) {
  const innerHeight = window.innerHeight
  window.addEventListener('resize', () => {
    const newInnerHeight = window.innerHeight
    if (innerHeight > newInnerHeight) {
      // 键盘弹出事件处理
    } else {
      // 键盘收起事件处理
      checkWxScroll()
    }
  })
} else {
  window.addEventListener('focusin', () => {
    // 键盘弹出事件处理
  })
  window.addEventListener('focusout', () => {
    // 键盘收起事件处理
    checkWxScroll()
  })
}
function checkWxScroll () {
  let currentPosition, timer
  let speed = 1 // 页面滚动距离
  timer = setInterval(function () {
    currentPosition = document.documentElement.scrollTop || document.body.scrollTop
    currentPosition -= speed
    window.scrollTo(0, currentPosition)// 页面向上滚动
    currentPosition += speed // speed变量
    window.scrollTo(0, currentPosition)// 页面向下滚动
    clearInterval(timer)
  }, 1)
}
