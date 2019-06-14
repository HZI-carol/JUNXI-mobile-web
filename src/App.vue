<template>
  <div id="app">
    <keep-alive>
      <router-view v-if='$route.meta.keepAlive'/>
    </keep-alive>
    <router-view v-if='!$route.meta.keepAlive' :key='key'/>
  </div>
</template>
<script>

export default {
  created () {
    if (process.env.NODE_ENV !== 'production') {
      this.$auth.setToken('access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDIsImlhdCI6MTU2MDMyNDk4OX0.HKe6ERKJQt-onuoh5paRWwPU3kqQA7nI7X6cx72mXKc&expires_in=86400&nickname=&avatar=http%3a%2f%2feditor.vgoyun.cn%2fupload%2fzaigou%2fcompany%2flogo%2f20190610%2f7c371ded78ef4576acef4f3de05502a8.jpg&id=10002&isads=2&isadz=2&istour=2&packageid=108&overtdt=2038-03-20&packagename=%e5%95%86%e4%b8%9a%e9%ab%98%e7%ba%a7%e4%bc%9a%e5%91%98')
    }
  },
  computed: {
    key () {
      return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/global'
#app
  height 100%
  width 100%
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale

</style>
