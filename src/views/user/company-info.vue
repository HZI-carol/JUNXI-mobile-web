<template lang="pug">
.company-info.has-nav.has-tab
  NavBar()
  .form.custom-vant
    van-field(label="公司名称" v-model="opts.company_name" placeholder="请输入公司名称" required clearable  :disabled='disabled')
    van-field(label="联系人" v-model="opts.contact_name" placeholder="请输入联系人姓名"  clearable :disabled='disabled')
    van-field(label="联系电话" v-model="opts.contact_phone" placeholder="请输入联系电话"  clearable :disabled='disabled')
    AreaSelector(:province.sync='opts.province' :city.sync='opts.city' :area.sync='opts.area' required
      :provinceId.sync='opts.province_id' :cityId.sync='opts.city_id' :areaId.sync='opts.area_id' :disabled='disabled')
    van-field(label="详细地址" v-model="opts.address" placeholder="请输入详细地址"  clearable :disabled='disabled')
    van-field(label="官网链接" v-model="opts.site_url" placeholder="请输入官网链接" clearable :disabled='disabled')
    VPicker(label='公司类型' :name.sync='typeName' :id.sync='opts.type_id' :actions='companyTypes' placeholder='请选择公司类型' required :disabled='disabled')

    Upload.upload-logo(label='公司LOGO' @onRead='onReadLogo' placeholder='上传LOGO' :disabled='disabled')
      img(slot='avatar' v-if="opts.full_logo" :src='opts.full_logo' :disabled='disabled')

    Upload(label='微信二维码' @onRead='onReadQrcode' placeholder='上传微信二维码' :disabled='disabled')
      img(slot='avatar' v-if="opts.full_qrcode_url" :src='opts.full_qrcode_url')

    Upload.upload-qualification(label='公司资质' @onRead='onReadLicense' placeholder='上传一张执照副本图片' :disabled='disabled')
      img(slot='avatar' v-if="opts.full_license_image_url" :src='opts.full_license_image_url')

    van-field(label="公司简介" :max="20" placeholder="请输入公司简介" v-model="opts.description" type="textarea" rows="10" autosize clearable :disabled='disabled')

  .submit
    van-button(@click='$router.go(-1)' round  size="small") {{disabled ? '返回' : '取消'}}
    van-button(@click='submit' type="primary" round  size="small" v-if="!disabled") 保存信息

</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'CompanyInfo',
  components: {
    AreaSelector: () => import('@/components/AreaSelector'),
    Upload: () => import('@/components/Upload')
  },
  data () {
    return {
      disabled: true,
      opts: {
        company_name: '',
        type_id: '',
        contact_name: '',
        contact_phone: '',
        area: '',
        area_id: '',
        city: '',
        city_id: '',
        address: '',
        province_id: '',
        province: '',
        logo: '',
        full_logo: '',
        qrcode_url: '',
        full_qrcode_url: '',
        license_image_url: '',
        full_license_image_url: '',
        description: '',
        site_url: ''
      },
      typeName: ''
    }
  },
  created () {
    this.$store.dispatch('getCompanyTypes')
    this.$store.dispatch('getCompanyInfo')
  },
  computed: {
    ...mapGetters(['companyInfo', 'companyTypes']),
    getData () {
      if (this.companyTypes[0] !== -1 && typeof this.opts.type_id === 'number') {
        return 1
      }
      return 0
    }
  },
  methods: {
    onReadLogo (file) {
      this.$api.uploadCompanyLogo(file).then(data => {
        this.opts.logo = data[0].url
        this.opts.full_logo = data[0].fullurl
        this.$vgo.tip('上传成功!', 'success')
      })
    },
    onReadQrcode (file) {
      this.$api.uploadCompanyQrcode(file).then(data => {
        this.opts.qrcode_url = data[0].url
        this.opts.full_qrcode_url = data[0].fullurl
        this.$vgo.tip('上传成功!', 'success')
      })
    },
    onReadLicense (file) {
      this.$api.uploadCompanyBusinessLicense(file).then(data => {
        this.opts.license_image_url = data[0].url
        this.opts.full_license_image_url = data[0].fullurl
        this.$vgo.tip('上传成功!', 'success')
      })
    },
    submit () {
      if (!this.opts.company_name) {
        this.$vgo.tip('请填写公司名称!', 'fail')
        return
      }
      if (this.opts.type_id === '') {
        this.$vgo.tip('请选择公司类型!', 'fail')
        return
      }
      if (!this.opts.area_id) {
        this.$vgo.tip('请选择地址!', 'fail')
        return
      }
      let api = 'user_id' in this.opts ? 'updateCompanyInfo' : 'addCompanyInfo'
      this.$api[api](this.opts).then(data => {
        this.$vgo.tip('操作成功!', 'success')
        this.$store.dispatch('getCompanyInfo', true)
        setTimeout(() => {
          api === 'updateCompanyInfo' ? this.$router.go(-1) : this.$router.replace({name: 'user-home'})
        }, 1000)
      })
    }
  },
  watch: {
    getData: {
      handler (newValue, oldValue) {
        if (newValue) {
          this.companyTypes.map(i => {
            if (i.id === Number(this.opts.type_id)) this.typeName = i.name
          })
        }
      },
      immediate: true
    },
    companyInfo: {
      handler (newValue, oldValue) {
        if ('user_id' in newValue) {
          this.opts = JSON.parse(JSON.stringify(newValue))
        }
      },
      immediate: true
    }
  }
}
</script>
<style lang="stylus">
@import '~@/assets/style/index';
.company-info
  .form
    height 100%
    -webkit-overflow-scrolling: touch
    overflow-y scroll
  .submit
    position absolute
    bottom 0
    left 0
    width 100%
    height $tabbar
    display flex
    justify-content center
    align-items center
    background $section
    .van-button
      width 30%
      &:first-child
        margin-right 10px
  .upload-logo
    .upload--box
      width 263px
  .upload-qualification
    .upload--box
      width 160px
      height 200px

</style>
