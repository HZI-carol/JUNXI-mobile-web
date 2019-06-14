<template lang="pug">
.user-setting.has-nav
  NavBar()
  .options
    router-link.row(:to='{name: "company-info"}')
      .title
        i.iconfont.iconhome
        span 公司信息
      i.van-icon.van-icon-arrow
    //- router-link.row(:to='{name: "update-phone"}')
    //-   .title
    //-     i.iconfont.iconshouji
    //-     span 换手机号
    //-   i.van-icon.van-icon-arrow
    //- router-link.row(:to='{name: "company-info"}')
    //-   .title
    //-     i.iconfont.iconleixing
    //-     span 类型管理
    //-   i.van-icon.van-icon-arrow
    router-link.row(:to='{name: "update-password"}')
      .title
        i.iconfont.iconmima
        span 重置密码
      i.van-icon.van-icon-arrow

</template>
<script>
export default {
  name: 'UserSettting',
  data () {
    return {
    }
  },
  methods: {
    switchTab () {

    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.user-setting
  .options
    border-top 1px solid $bg
    .row
      display flex
      justify-content space-between
      padding 0 .2rem
      align-items center
      height 50px
      background-color $section
      font-size $small-font
      margin-bottom 1px
      .title
        i
          color #bbb
          margin-right 10px
          font-size $small-font
          vertical-align top
        span
          color #ddd
      .van-icon.van-icon-arrow
          color #bbb

</style>
