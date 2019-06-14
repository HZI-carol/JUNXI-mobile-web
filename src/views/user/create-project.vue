<template lang="pug">
.user-create-project
  NavBar(:title='opts.id ? "修改项目信息" : "添加项目"')
  .form.custom-vant
    van-field(label="项目名称" v-model="opts.project_name" :max='100' placeholder="请输入项目名称" required clearable )

    VPicker(label='装修风格' :value.sync="opts.style_text" :id.sync='opts.decoration_style_id' :actions='decorationStyles' placeholder='请选择装修风格' required)

    van-field(label="建筑面积" v-model="opts.floorage" type='number' placeholder="请输入建筑面积"  clearable )
      span(slot='right-icon') 平

    .row.van-cell.van-cell--.van-field
      .van-cell__title.van-field__label 户型
      .content
        .item
          van-stepper(v-model="opts.room_count" :min='0')
          span.unit 室
        .item
          van-stepper(v-model="opts.hall_count" :min='0')
          span.unit 厅
        .item
          van-stepper(v-model="opts.bathroom_count" :min='0')
          span.unit 卫

    van-field(label="项目负责人" v-model="opts.contact_name" :max='25' placeholder="请输入负责人姓名"  clearable )

    van-field(label="负责人电话" v-model="opts.contact_phone" type='number' :max='25' placeholder="请输入负责人电话"  clearable )

    AreaSelector(:province.sync='opts.province' :city.sync='opts.city' :area.sync='opts.area'
      :provinceId.sync='opts.province_id' :cityId.sync='opts.city_id' :areaId.sync='opts.area_id')

    van-field(label="项目地址" v-model="opts.address" placeholder="请输入项目地址"  clearable )

    van-collapse(v-model='active')
      van-collapse-item(title="选填项目" :name="1")

        van-field(label="装修总价" v-model="opts.total_price" placeholder="请输入装修总价"  clearable )
          span(slot='right-icon') 万

        VPicker(label='作品分类' :value="cate_text" :id.sync='opts.cate_id' :actions='panoPictureCate' placeholder='请选择作品分类' )

        .row.van-cell.van-cell--.van-field
          .van-cell__title.van-field__label 是否公开
          van-radio-group(v-model="opts.ison")
            van-radio(:name="1") 公开
            van-radio(:name="2") 私密

        VPicker(label='作品行业' :value='opts.trade' :name.sync="opts.trade" :actions='tradeCate' placeholder='请选择作品行业' )

        VPicker(label='作品标签' :value="opts.tag_id.join('，')" :select='() => $refs.tagSelector.show = true' placeholder='请选择作品标签' )

  .submit
    van-button(@click='submit' type="primary" round  size="small") 保 存

  TagSelector(:tags.sync='opts.tag_id' ref='tagSelector')
</template>

<script>
import { mapGetters } from 'vuex'
import areaList from '@/plugins/area.js'
import CookieJs from 'js-cookie'
export default {
  name: 'CompanyInfo',
  components: {
    AreaSelector: () => import('@/components/AreaSelector'),
    TagSelector: () => import('@/components/TagSelector'),
    Upload: () => import('@/components/Upload')
  },
  data () {
    return {
      active: ['1'],
      showStyleOpts: false,
      showCateOpts: false,
      showTradeOpts: false,
      opts: {
        id: '',
        project_name: '',
        contact_name: '',
        contact_phone: '',
        cate_id: 0,
        ison: 1,
        tag_id: [],
        trade: '',
        logo_url: '',
        province: '',
        province_id: '',
        city: '',
        city_id: '',
        area: '',
        area_id: '',
        address: '',
        room_count: 1,
        hall_count: 1,
        bathroom_count: 1,
        floorage: '',
        total_price: '',
        style_text: '',
        decoration_style_id: ''
      },
      cate_text: '默认分类',
      areaList
    }
  },
  async created () {
    this.$store.dispatch('getDecorationStyles')
    this.$store.dispatch('getPanoPictureCate')
    this.$store.dispatch('getTradeCate')
  },
  activated () {
    this.opts = {
      id: '',
      project_name: '',
      contact_name: '',
      contact_phone: '',
      cate_id: 0,
      ison: 1,
      tag_id: [],
      trade: '',
      logo_url: '',
      province: '',
      province_id: '',
      city: '',
      city_id: '',
      area: '',
      area_id: '',
      address: '',
      room_count: 1,
      hall_count: 1,
      bathroom_count: 1,
      floorage: '',
      total_price: '',
      style_text: '',
      decoration_style_id: ''
    }
    let obj = this.$route.query
    if ('id' in obj) {
      obj.tag_id = obj.tag_id.split(',')
      obj.ison = Number(obj.ison)
      this.opts = obj
    } else {
      this.getAddr()
      this.opts.style_text = ''
      this.$watch('decorationStyles', {
        handler (newV, oldV) {
          if (newV.length) {
            this.opts.decoration_style_id = newV[0].id
            this.opts.style_text = newV[0].name
          }
        },
        immediate: true
      })
    }
  },
  computed: {
    ...mapGetters(['decorationStyles', 'panoPictureCate', 'tradeCate'])
  },
  methods: {
    async getAddr () {
      let addr = CookieJs.getJSON('address')
      if (!addr) {
        let addrInfo = await this.$vgo.getAddress()
        if (addrInfo) this.setAddrCookie(addrInfo.addressComponent)
        addr = CookieJs.getJSON('address')
      }
      this.opts.area = addr.area
      this.opts.area_id = addr.areaId
      this.opts.city = addr.city
      this.opts.city_id = addr.cityId
      this.opts.province = addr.province
      this.opts.province_id = addr.provinceId
    },
    setAddrCookie (AMapAddr) {
      if (!AMapAddr) return
      let address = {
        province: AMapAddr.province,
        city: AMapAddr.city || AMapAddr.province,
        area: AMapAddr.district,
        provinceId: AMapAddr.adcode.slice(0, 2) + '0000',
        cityId: AMapAddr.adcode.slice(0, 4) + '00',
        areaId: AMapAddr.adcode
      }
      CookieJs.set('address', address)
    },
    onSelect (item) {
      if (this.showStyleOpts) {
        this.opts.decoration_style_id = item.id
        this.opts.style_text = item.name
        this.showStyleOpts = false
      } else if (this.showCateOpts) {
        this.opts.cate_id = item.cate_id
        this.cate_text = item.name
        this.showCateOpts = false
      } else if (this.showTradeOpts) {
        this.opts.trade = item.name
        this.showTradeOpts = false
      }
    },
    submit () {
      if (!this.opts.project_name) {
        this.$vgo.tip('请填写项目名称!', 'fail')
        return
      }
      if (!this.opts.area_id) {
        this.$vgo.tip('请选择地址!', 'fail')
        return
      }
      let opts = JSON.parse(JSON.stringify(this.opts))
      opts.tag_id = opts.tag_id.join(',') || '热门标签,室内,高清'
      let api = opts.id ? 'updateProject' : 'createProject'
      this.$api[api](opts).then(data => {
        this.$vgo.tip('操作成功!', 'success')
        opts.id = data
        api === 'updateProject' ? this.$router.go(-1) : this.$router.push({ name: 'pano-publish', query: opts })
      })
    }
  }
}
</script>
<style lang="stylus">
@import '~@/assets/style/index'
$bottom = 50px
.user-create-project
  overflow-y auto
  height 100%
  padding-top 40px
  padding-bottom 50px
  .form
    -webkit-overflow-scrolling: touch
    height 100%
    overflow-y auto
  .row
    .content
      width calc(100% - 90px)
      display flex
      flex-wrap wrap
      .item
        width 50%
        display flex
        justify-content space-around
        &:last-child
          margin-top .2rem
        .unit
          color #ddd
    .van-radio-group
      display flex
      .van-radio
        margin-right .2rem
        .van-radio__label
          color #ddd
  .submit
    position absolute
    bottom 0
    left 0
    width 100%
    height $bottom
    display flex
    justify-content center
    align-items center
    background $section
    .van-button
      width 80%

</style>
