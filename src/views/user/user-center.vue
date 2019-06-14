<template lang="pug">
.user-center.has-nav
  NavBar()
  .logo.pr(:style='{"background-image": "url(static/images/user-center-bg.png)"}')
    .content.pac
      img(:src='companyInfo.full_logo')
      h2.title {{companyInfo.company_name}}
  .info
    .row
      .label 账号
      .text {{userInfo.phone}}
    .row
      .label 会员
      .options
        span.text.red {{userInfo.packagename}}
        van-button(@click='$vgo.tip("请联系客服", "fail")' size='mini' round type="primary") 续费
        van-button(@click='$vgo.tip("请联系客服", "fail")' size='mini' round type="warning") 升级
    .row
      .label 过期时间
      .text {{userInfo.overtdt | dateFormat('date')}}
    .row
      .label 我的余额
      .options
        span.text.red ¥ {{userInfo.bank}}
        van-button(@click='isShowPayAction = true' size='mini' round type="primary") 充值
        van-button(@click='isShowWithdrawAction = true' size='mini' round type="info") 提现

  .submit-form
    van-button(@click='exit' size='small' round type='primary') 退出登录

  van-actionsheet(v-model="isShowPayAction" title="余额充值")
    van-field(label='充值金额' v-model="shargeOpts.totalfee" type='number' placeholder="请输入充值金额" clearable required )
    van-radio-group(v-model="shargeOpts.paytype")
      .van-cell.van-cell--required
        .van-cell__title 支付方式:
        van-radio(:name="1") 支付宝
        van-radio(:name="2") 微信
    .submit-form
      van-button(@click='submitCharge' size='small' round type='primary') 确认充值

  van-actionsheet.withdraw(v-model="isShowWithdrawAction" title="提现")
    .van-cell
      .van-cell__title 结算规则:
      span 1.申请结算之后，我司将在1~3个工作日处理 <br/> 2.申请结算后，如有问题可直接与我司联系
    .van-cell.van-cell--required
      .van-cell__title 可结算金额:
      span.red.money ¥ {{userInfo.bank}} (元)
    van-field(label='结算金额' v-model="withdrawNum" type='number' placeholder="请输入结算金额" clearable required )

    .submit-form
      van-button(@click='submitWithdraw' size='small' round type='primary') 确认提现
</template>
<script>
import { mapGetters } from 'vuex'
import CookieJs from 'js-cookie'
export default {
  name: 'UserCenter',
  data () {
    return {
      isShowPayAction: false,
      isShowWithdrawAction: false,
      shargeOpts: {
        totalfee: '',
        paytype: 1,
        ordertype: 2,
        return_url: window.location.href + '?reload=true'
      },
      withdrawNum: ''
    }
  },
  created () {
    this.$store.dispatch('getCompanyInfo')
    this.$store.dispatch('getUserInfo')
  },
  computed: {
    ...mapGetters(['companyInfo', 'userInfo'])
  },
  methods: {
    submitCharge () {
      let val = this.shargeOpts.totalfee
      if (isNaN(val) || val <= 0) {
        this.shargeOpts.totalfee = ''
        this.$vgo.tip('请输入正确的金额!', 'fail')
        return
      }
      this.shargeOpts.totalfee = Number(Number(this.shargeOpts.totalfee).toFixed(2))
      this.shargeOpts.totalfee *= 100
      this.$api.createPayOrder(this.shargeOpts).then(data => {
        this.$vgo.tip('操作成功!', 'success')
        window.location.href = data
      })
      this.shargeOpts.totalfee = 0
    },
    submitWithdraw () {
      if (isNaN(this.withdrawNum) || this.withdrawNum <= 0) {
        this.$vgo.tip('请输入正确的金额!', 'fail')
        return
      }
      if (this.withdrawNum > this.userInfo.bank) {
        this.$vgo.tip('输入金额大于可提现金额!', 'fail')
        return
      }
      this.$api.applyBalanceWithDraw(this.withdrawNum).then(res => {
        this.$vgo.tip('操作成功!', 'success')
        this.$store.dispatch('getUserInfo')
        this.isShowWithdrawAction = false
      })
    },
    exit () {
      CookieJs.set('UserAccount', null, { expires: -1, domain: window.$globalconfig.DOMAIN })
      CookieJs.set('UserAccount', null, { expires: -1 })
      CookieJs.set('userinfo', null, { expires: -1, domain: window.$globalconfig.DOMAIN })
      CookieJs.set('userinfo', null, { expires: -1 })
      CookieJs.set('access_token', null, { expires: -1, domain: window.$globalconfig.DOMAIN })
      CookieJs.set('access_token', null, { expires: -1 })
      this.$router.push('/')
    }
  }

}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.user-center
  .logo
    height 175px
    .content
      text-align center
      img
        max-width 75px
        max-height 75px
      h2.title
        font-size $big-font
        color #fff
  .info
    .row
      padding 0 .2rem
      height 50px
      background-color $section
      margin-bottom 1px
      font-size $small-font
      display flex
      justify-content space-between
      align-items center
      .label
        color #ddd
      .text
        color #ccc
        margin-right 10px
      // .options
      //   van-button
  .van-radio-group
    .van-radio__label
      color #ddd
      margin-right 0.2rem
  .submit-form
    .van-button
      width 80%
  .withdraw
    font-size 14px
    span
      color #ddd
    .money
      line-height 30px
      margin-left 0.2rem
    .van-field
      margin-bottom 30px
</style>
