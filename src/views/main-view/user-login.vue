<template lang="pug">
.main-user-login.has-nav
  NavBar(icon='')
  .logo
    img(src='static/images/logo.png')
  .form.out-display
    van-field(v-model='opts.username' placeholder='请输入用户账号' clearable)
      i(slot='left-icon' class='iconfont iconusercenter')
    van-field(v-model="opts.password" type='password' placeholder='请输入密码' left-icon='iconmima' clearable)
      i(slot='left-icon' class='iconfont iconmima')
    van-field(v-model="opts.vcode" placeholder='请输入验证码' left-icon='iconyanzhengma' clearable)
      img(@click='time = Date.now()' slot='right-icon' :src='vcodeUrl + time')
      i(slot='left-icon' class='iconfont iconyanzhengma')
    .selected
      van-checkbox(v-model='checked' checked-color='#d71619')
      span 同意遵守
      span.red(@click='$router.push({name: "agreement"})') 《{{PLATFORM_NAME}}协议》
    van-button(@click='submit' placeholder='请登录' round type='primary' :disabled='!checked') 登录
    p(@click='$router.push({name: "user-signup"})') 没有账号，
      span.red 先注册
</template>
<script>
export default {
  name: 'UserLogin',
  data () {
    return {
      PLATFORM_NAME: window.$globalconfig.PLATFORM_NAME,
      vcodeUrl: window.$globalconfig.URLS.API + '/common/vcode?_t=',
      time: Date.now(),
      checked: true,
      opts: {
        username: '',
        password: '',
        vcode: ''
      }
    }
  },
  methods: {
    submit () {
      if (!this.opts.username) {
        this.$vgo.tip('请输入用户名!', 'fail')
        return
      }
      if (!this.opts.password) {
        this.$vgo.tip('请输入密码!', 'fail')
        return
      }
      if (!this.opts.vcode) {
        this.$vgo.tip('请输入密码!', 'fail')
        return
      }
      this.$api.login(this.opts).then(data => {
        this.$auth.setToken(data)
        this.$router.push({name: 'user-home'})
      })
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.main-user-login
  text-align center
  .logo
    margin-bottom 30px
    img
      width 160px
  .form
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
      top 10px
      left 38px
      color #000
      z-index 8
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
      width 80%
      margin .2rem 0 .2rem 35px
      vertical-align top

    p
      font-size 15px
      color #fff
</style>
