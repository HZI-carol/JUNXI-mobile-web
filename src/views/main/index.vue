<template lang="pug">
.layout
  transition(name="fade-transform" mode="out-in")
    keep-alive
      router-view
  .tab-bar
    tabbar
      tabbar-item(:link='{name: "home"}' :selected='$route.name == "home"')
        i.iconfont.iconzhuye(slot='icon')
        span(slot='label') 主页
      tabbar-item(:link='{name: "message"}' :selected='$route.name == "message"')
        i.iconfont.iconliuyan1(slot='icon')
        span(slot='label') 留言
      tabbar-item(:link='{name: "contant"}' :selected='$route.name == "contant"')
        i.iconfont.iconlianxiwomen1(slot='icon')
        span(slot='label') 联系我
      tabbar-item(@on-item-click='goUser')
        i.iconfont.iconusercenter(slot='icon')
        span(slot='label') 用户中心

</template>
<script>
export default {
  name: 'v-main',
  data () {
    return {
      nav: false
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (document.getElementById('van-nav-bar')) {
        this.nav = true
      } else {
        this.nav = false
      }
    })
  },
  methods: {
    goUser () {
      if (this.$auth.getToken()) {
        this.$router.push({name: 'user-home'})
      } else {
        window.location.href = window.$globalconfig.URLS.LOGIN
      }
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.layout
  width 100vw
  height 100%
  .main-view
    width 100vw
  .tab-bar
    .weui-tabbar
      position absolute
      background-color #393c43
      color #666666
      &:before
        border none
      .weui-tabbar__icon
        line-height .54rem
        &>i
          font-size .42rem
      .weui-tabbar__item.weui-bar__item_on .weui-tabbar__icon > i,
      .weui-tabbar__item.weui-bar__item_on .weui-tabbar__label
        color $theme
</style>
