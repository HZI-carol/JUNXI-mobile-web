<template lang="pug">
.agreement.has-nav
  NavBar()
  iframe(:src='userAgreementUrl')

</template>
<script>
export default {
  name: 'Agreement',
  data () {
    return {
      userAgreementUrl: window.$globalconfig.URLS.API + 'agreement/user?token=' + this.$auth.getToken()
    }
  },
  methods: {
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.agreement
  height 100vh
  overflow hidden
  background-color #ddd
  iframe
    width 100%
    border none
    height 'calc(100vh - %s)' %$navbar
</style>
