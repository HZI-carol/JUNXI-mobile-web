import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'
import NProgress from 'nprogress'
import util from '@/plugins/util'
import 'nprogress/nprogress.css'
// import { Toast } from 'vant'

// Vue.use(Toast)
NProgress.configure({ showSpinner: false })
Vue.use(Router)

export const router = new Router({
  routes: routes
})
router.beforeEach((to, from, next) => {
  NProgress.start()
  // 不是未登录可见的页需检查token
  if (!to.meta.notLoginView && !util.auth.getToken()) {
    window.location.href = window.$globalconfig.URLS.LOGIN
    next()
  }
  // if (to.name === 'user-login' && util.auth.getToken()) {
  //   next({name: 'user-home'})
  // }
  util.title(to.meta.title)
  next()
})
router.afterEach((to) => {
  NProgress.done()
})
