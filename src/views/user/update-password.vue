<template lang="pug">
.update-phone.has-nav
  NavBar()
  .form.out-display
    van-field(label='原密码' v-model='opts.oldpwd' type='password' placeholder='请输入原密码' clearable )
    van-field(label='新密码' v-model='opts.newpwd' type='password' placeholder='请输入新密码' clearable )
    van-field(label='新密码' v-model='opts.newpwdre' type='password' placeholder='请再次输入新密码' clearable )
  .submit
    van-button(@click='submit' type='primary' round  size='small') 确认提交

</template>
<script>
export default {
  name: 'UserSettting',
  data () {
    return {
      opts: {
        oldpwd: '',
        newpwd: '',
        newpwdre: ''
      }
    }
  },
  methods: {
    submit () {
      if (!this.opts.oldpwd) {
        this.$vgo.tip('请输入原密码!', 'fail')
        return
      }
      if (this.opts.newpwd.length < 6 || this.opts.newpwd.length > 18) {
        this.$vgo.tip('新密码必须6-18位数字或字母!', 'fail')
        return
      }
      if (this.opts.newpwd !== this.opts.newpwdre) {
        this.$vgo.tip('两次输入新密码不一致!', 'fail')
        return
      }
      this.$api.updatePassword(this.opts.oldpwd, this.opts.newpwd).then(data => {
        this.$vgo.tip('操作成功!', 'success')
        this.opts.oldpwd = ''
        this.opts.newpwd = ''
        this.opts.newpwdre = ''
        setTimeout(() => {
          this.$router.go(-1)
        }, 1000)
      })
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
