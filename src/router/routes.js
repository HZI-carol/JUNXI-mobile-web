/**
* meta: { keepAlive: 是否缓存页面 , notLoginView: 未登录可见页 }
*/
import main from '@/views/main'
import user from '@/views/user'
export default [
  {
    path: '/agreement',
    name: 'agreement',
    meta: { title: window.$globalconfig.PLATFORM_NAME + '协议', keepAlive: true },
    component: () => import('@/views/main/agreement')
  },
  {
    path: '/',
    component: main,
    children: [
      {
        path: '',
        name: 'home',
        meta: { title: '主页', notLoginView: true, keepAlive: true },
        component: () => import('@/views/main-view/home')
      },
      {
        path: '/category',
        name: 'companies-of-category',
        meta: { title: '分类', notLoginView: true, keepAlive: true },
        component: () => import('@/views/main-view/home-view/companies-of-category')
      },
      {
        path: '/company-homepage/:id',
        name: 'company-homepage',
        meta: { title: '公司主页', notLoginView: true },
        component: () => import('@/views/main-view/home-view/company-homepage')
      },
      {
        path: 'message',
        name: 'message',
        meta: { title: '留言咨询', notLoginView: true },
        component: () => import('@/views/main-view/message')
      },
      {
        path: 'contant',
        name: 'contant',
        meta: { title: '联系我们', notLoginView: true, keepAlive: true },
        component: () => import('@/views/main-view/contant')
      },
      {
        path: 'user-login',
        name: 'user-login',
        meta: { title: '个人中心-登录', notLoginView: true },
        component: () => import('@/views/main-view/user-login')
      },
      {
        path: 'user-signup',
        name: 'user-signup',
        meta: { title: '个人中心-注册', notLoginView: true },
        component: () => import('@/views/main-view/user-signup')
      }
    ]
  },
  {
    path: '/leave-user-message',
    name: 'leave-user-message',
    meta: { title: '留言咨询', notLoginView: true },
    component: () => import('@/views/main-view/message')
  },
  {
    path: '/user',
    component: user,
    children: [
      {
        path: '/user',
        name: 'user-home',
        meta: { title: '主页' },
        component: () => import('@/views/user-view/home')
      },
      {
        path: 'message',
        name: 'user-message',
        meta: { title: '留言咨询' },
        component: () => import('@/views/main-view/message')
      },
      {
        path: 'contant',
        name: 'user-contant',
        meta: { title: '联系我们', keepAlive: true },
        component: () => import('@/views/main-view/contant')
      }
    ]
  },
  {
    path: '/project-map',
    name: 'project-map',
    meta: { title: '地图' },
    component: () => import('@/views/main/map')
  },
  {
    path: '/create-project',
    name: 'create-project',
    meta: { title: '添加项目', keepAlive: true },
    component: () => import('@/views/user/create-project')
  },
  {
    path: '/user-customer-ask',
    name: 'user-customer-ask',
    meta: { title: '客户咨询' },
    component: () => import('@/views/user/user-customer-ask')
  },
  {
    path: '/user-project',
    name: 'user-project',
    meta: { title: '项目' },
    component: () => import('@/views/user/user-project')
  },
  {
    path: '/user-center',
    name: 'user-center',
    meta: { title: '个人中心' },
    component: () => import('@/views/user/user-center')
  },
  {
    path: '/user-material',
    name: 'user-material',
    meta: { title: '素材库' },
    component: () => import('@/views/user/user-material')
  },
  {
    path: '/user-pano',
    name: 'user-pano',
    meta: { title: '全景管理', keepAlive: true },
    component: () => import('@/views/user/user-pano')
  },
  {
    path: '/pano-publish',
    name: 'pano-publish',
    meta: { title: '添加全景' },
    component: () => import('@/views/user/pano-publish')
  },
  {
    path: '/pano-components',
    name: 'pano-components',
    meta: { title: '全景组件' },
    component: () => import('@/views/user/pano-components')
  },
  {
    path: '/user-setting',
    name: 'user-setting',
    meta: { title: '设置' },
    component: () => import('@/views/user/user-setting')
  },
  {
    path: '/company-info',
    name: 'company-info',
    meta: { title: '公司信息' },
    component: () => import('@/views/user/company-info')
  },
  // {
  //   path: '/update-phone-number',
  //   name: 'update-phone',
  //   meta: { title: '换手机号' },
  //   component: () => import('@/views/user/update-phone')
  // },
  {
    path: '/update-password',
    name: 'update-password',
    meta: { title: '修改密码' },
    component: () => import('@/views/user/update-password')
  },
  {
    path: '*',
    name: 'error-404',
    meta: { title: '404-页面不存在', notLoginView: true },
    component: () => import('@/views/error/404')
  }
]
