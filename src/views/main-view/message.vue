<template lang='pug'>
.main-message
  NavBar(icon='')
  .form.out-display.has-nav.has-tab
    van-field(label='姓名' v-model='opts.name' :max='25' placeholder='请输入姓名' clearable )
    van-field(label='手机号' v-model='opts.phone' placeholder='请输入手机号' clearable )
    van-field(label='验证码' v-model='opts.imgCode' placeholder='请输入验证码' clearable )
      img(slot='right-icon' :src='`${imgCodeUrl}${sid}&t=${time}`' @click='time = Date.now()')
    van-field(label='短信码' class='weui-vcode' v-model='opts.vcode' :max='5' placeholder='请输入短信码' clearable )
      van-button(@click='getSMSCode' slot='button' type='primary'
        round  size='small' :disabled='!!phoneWait') {{phoneWait ? phoneWait + 's':'发送验证码'}}
    van-field(label='留言内容' :max='1000' placeholder='请输入留言内容' v-model='opts.content' type='textarea' rows='8' autosize clearable )
    .submit
      van-button(@click='submit' type='primary' round  size='small') 提交留言内容

</template>

<script>

export default {
  name: 'Message',
  data () {
    return {
      sid: this.$auth.getGuid(),
      imgCodeUrl: this.$api.getImgVerifyCode(),
      time: Date.now(),
      opts: {
        name: '',
        phone: '',
        vcode: '',
        imgCode: '',
        sid: '',
        userId: 0, // 0给平台留言 >0 给公司
        content: '',
        noToken: true
      },
      phoneWait: 0
    }
  },
  created () {
    if (this.$route.name === 'message') { // 首页 => 留言

    } else if (this.$route.name === 'leave-user-message') { // 公司列表 => 公司主页留言
      this.opts.userId = this.$route.query.id
      if (this.$auth.getToken()) this.opts.noToken = false
    } else if (this.$route.name === 'user-message') { // 登录后 个人中心的留言
      this.opts.noToken = false
    }
  },
  methods: {
    getSMSCode () {
      if (!this.$auth.verifyPhone(this.opts.phone)) return
      if (!this.opts.imgCode) {
        this.$vgo.tip('请填写验证码!', 'fail')
      }
      this.$auth.getVerifyCode(this, 'phoneWait', this.opts.phone, this.opts.imgCode, this.sid)
    },
    submit () {
      if (!this.$auth.verifyPhone(this.opts.phone)) return
      if (!this.opts.content) {
        this.$vgo.tip('请填写留言内容!', 'fail')
        return
      }
      if (!this.opts.vcode) {
        this.$vgo.tip('请填写短信码!', 'fail')
        return
      }
      if (!this.opts.name) {
        this.$vgo.tip('请填写姓名!', 'fail')
        return
      }
      this.opts.sid = this.sid
      this.$api.sendMessage(this.opts).then(res => {
        this.$vgo.tip('操作成功!', 'success')
        this.sid = this.$auth.getGuid()
        if (this.opts.userId) {
          setTimeout(() => {
            this.$router.go(-1)
          }, 1000)
        }
        this.opts = {
          name: '',
          phone: '',
          vcode: '',
          imgCode: '',
          sid: '',
          userId: 0,
          content: '',
          noToken: true
        }
        this.phoneWait = 0
      })
    }
  },
  components: {
  }
}
</script>

<style lang='stylus'>
@import '~@/assets/style/index'
.main-message
  height 100%
  .form
    .van-field
      .van-field__body
        .van-field__right-icon
          width 115px
  .submit
    display flex
    justify-content center
    align-items center
    height 60px
    .van-button
      width 86%
</style>
