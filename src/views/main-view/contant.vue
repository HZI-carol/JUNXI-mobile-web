<template lang="pug">
.main-contant
  NavBar(icon='')
  .logo
    img(:src="getCompanyInfo.full_logo")
  h3.title {{getCompanyInfo.company_name}}
  .text
    //- template(v-if="$route.name === 'contant'")
    span.text3 总部地址： {{getCompanyInfo.province + getCompanyInfo.city + getCompanyInfo.area + getCompanyInfo.address}}
    br
    span.text4 全国服务热线:{{getCompanyInfo.contact_phone}}
    br
    span.text1 {{getCompanyInfo.copyright}}
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'contant',
  data () {
    return {
      company: {
        company_name: window.$globalconfig.PLATFORM_NAME,
        copyright: window.$globalconfig.COPYRIGHT,
        province: '广东省',
        city: '佛山市',
        area: '南海丹灶镇',
        address: '石涌市场旁俊熙工业园',
        contact_phone: window.$globalconfig.SERVICE_HOTLINE,
        full_logo: 'static/images/logo.png'
      }
    }
  },
  created () {
  },
  computed: {
    ...mapGetters(['companyInfo']),
    getCompanyInfo () {
      // if (this.$route.name === 'user-contant') {
      //   return this.companyInfo
      // } else {
      return this.company
      // }
    }
  },
  mounted () {
  },
  methods: {},
  components: {
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
$bg = #2b2e35
$section = #393c43
.main-contant
  width 100%
  padding 25px 0
  .logo
    max-width 160px
    max-height 160px
    margin 60px auto 30px
    img
      width 100%
      height 100%
  .title
    text-align center
    color #d81519
    font-size 22px
  .text
      width 90%
      margin 40px auto
      font-size 14px
      color #fff
      text-align center
      line-height 30px
    .text1
      font-size 15px
      color #d81519
      vertical-align middle
    .text2
      .t1
        vertical-align middle
        font-size 11px
      .t2
        vertical-align middle
</style>
