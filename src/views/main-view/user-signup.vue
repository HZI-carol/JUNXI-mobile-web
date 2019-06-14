<template lang="pug">
.main-user-signup.has-nav
  NavBar(icon='')
  .logo
    img(src='static/images/logo.png')
  .form.out-display
    van-field( placeholder="请输入手机号" clearable)
      i(slot="left-icon" class="iconfont icontablet")
    van-field( placeholder="请输入装企名称" clearable)
      i(slot="left-icon" class="iconfont icongongsi3")
    van-field( type="password" placeholder="请输入密码" clearable)
      i(slot="left-icon" class="iconfont iconmima")
    van-field( type="password" placeholder="请再次输入密码" clearable)
      i(slot="left-icon" class="iconfont iconmima")
    van-field( placeholder="请输入验证码"  clearable)
      img( slot="right-icon" src="https://ws1.sinaimg.cn/large/663d3650gy1fq684go3glj203m01hmwy.jpg")
      i(slot="left-icon" class="iconfont iconlianxiwomen")
    van-field(placeholder="请输入短信码"  clearable)
      i(slot="left-icon" class="iconfont iconliuyanfill")
      van-button(slot="button" type="primary" round ) 发送短信码
    van-field(  placeholder="请选择分类" )
      i(slot="left-icon" class="iconfont iconfeilei")
    .selected
      van-checkbox(v-model="checked" checked-color="#d71619")
      span 同意遵守
      span.red 《俊熙全景协议》
    van-button(  placeholder="请登录" round type="primary") 登录
    p(@click='$router.push({name: "user-login"})') 已有账号，
      span.red 点击登录
</template>

<script>
export default {
  name: 'UserSignup',
  data () {
    return {
      logoList: [
      ],
      checked: true
    }
  },
  created () {
  },
  mounted () {

  },
  methods: {
  },
  components: {
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.main-user-signup
  text-align center
  padding 50px 0
  .logo
    margin-bottom 10px
    img
      width 160px
  .form
    padding-right 15px
    .van-field
      .van-field__body
        .van-field__control
          height 45px
          border-radius 25px
          padding 0 40px
        .van-button
          width 100px
          padding 0
          margin 0
    .iconfont
      position relative
      top 13px
      left 38px
      color #000
      z-index 2
    .send
      width 120px
    .selected
      margin-top 5px
      color #fff
      font-size 15px
      .van-checkbox
        display inline-block
        vertical-align middle
      span
        vertical-align middle
        margin-left 5px
    .van-button
      display block
      width 86%
      margin .2rem 0 .2rem 35px
    p
      font-size 15px
      color #fff
</style>
