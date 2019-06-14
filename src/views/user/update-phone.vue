<template lang="pug">
.update-phone.has-nav
  NavBar()
  .form.out-display
    van-field(label='姓名' v-model='opts.name' :max='25' placeholder='请输入姓名' clearable )
    van-field(label='原手机号' v-model='opts.phone' placeholder='请输入手机号' clearable )
    van-field(label='验证码' v-model='opts.imgCode' placeholder='请输入验证码' clearable )
      img(slot='right-icon' :src='`${imgCodeUrl}${sid}&t=${time}`' @click='time = Date.now()')
    van-field(label='短信码' class='weui-vcode' v-model='opts.vcode' placeholder='请输入短信码' clearable )
      van-button(@click='getSMSCode' slot='button' type='primary'
        round  size='small' :disabled='!!phoneWait') {{phoneWait ? phoneWait + 's':'发送验证码'}}
    van-field(label='留言内容' :max='1000' placeholder='请输入留言内容' v-model='opts.content' type='textarea' rows='10' autosize clearable )
  .submit
    van-button(@click='submit' type='primary' round  size='small') 提交留言内容

</template>
<script>
export default {
  name: 'UserSettting',
  data () {
    return {
      sid: this.$auth.getGuid(),
      imgCodeUrl: this.$api.getImgVerifyCode(),
      time: Date.now(),
      opts: {

      },
      phoneWait: 0

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

    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.update-phone
  .form
    padding 0
    .van-field
      .van-field__body
        .van-field__right-icon
          width 115px
  .submit
    text-align center
    .van-button
      width 86%
</style>
