<template lang="pug">
.layout
  .personal-view
    transition(name="fade-transform" mode="out-in")
      keep-alive
        router-view
  .tab-bar
    tabbar
      tabbar-item(:link='{name: "user-home"}' :selected='$route.name == "user-home"')
        i.iconfont.iconhome1(slot='icon')
        span(slot='label') 首页
      tabbar-item(@on-item-click='goPage')
        i.iconfont.iconvr5(slot='icon')
        span(slot='label') 公司VR
      tabbar-item.create-project.pr(:link='{name: "create-project"}')
        i.plus.pac.van-icon.van-icon-plus(slot='icon')
      tabbar-item(:link='{name: "user-message"}' :selected='$route.name == "user-message"')
        i.iconfont.iconliuyan1(slot='icon')
        span(slot='label') 留言
      tabbar-item(:link='{name: "user-contant"}' :selected='$route.name == "user-contant"')
        i.iconfont.iconlianxiwomen1(slot='icon')
        span(slot='label') 联系我

</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Personal',
  data () {
    return {
      nav: false
    }
  },
  computed: {
    ...mapGetters(['companyPano']) // companyPano 就是一项目, 项目信息
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
    goPage () {
      //  :link='companyPano.fk_pano_id > 0 ? companyPano.panoview_url : '
      if (this.companyPano.fk_pano_id > 0) {
        window.location.href = this.companyPano.panoview_url
      } else if ('id' in this.companyPano) {
        this.$router.push({name: 'pano-publish', query: this.companyPano})
      } else {
        this.$router.push({name: 'create-project'})
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
  .personal-view
    height 100%
    width 100vw
  .tab-bar
    .create-project
      .weui-tabbar__icon
        position static
        &>i.plus
          height 36px
          width 50px
          border-radius 30px
          display flex
          align-items center
          justify-content center
          color $section
          font-size 26px
          font-weight 700
          background linear-gradient(0, $theme, #ff5a5c)
    .weui-tabbar
      position absolute
      background-color #393c43
      color #666666
      &:before
        border none
      .weui-tabbar__icon
        line-height .54rem
        &>i
          font-size .50rem
      .weui-tabbar__item.weui-bar__item_on .weui-tabbar__icon > i,
      .weui-tabbar__item.weui-bar__item_on .weui-tabbar__label
        color $theme
</style>
