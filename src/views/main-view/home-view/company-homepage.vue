<template lang="pug">
.companies-homepage.has-nav.has-tab
  NavBar(:title='compony.company_name')

  section.compony
    .info
      .left
        img(:src='compony.full_logo')
      .right
        .address.omit
          i.iconfont.iconlocation
          span {{compony.address}}
        .tel.omit
          i.iconfont.iconlianxiwomen1
          span {{compony.contact_phone}}
        .wechat.omit(@click='$vgo.imagePreview([compony.full_qrcode_url])')
          i.iconfont.iconweixin
          span 查看微信号
    .options
      a.opt-item(:href='compony.panoview_url' :style='{"background-image": "url(static/images/bg1.png)"}')
        i.iconfont.iconvr
        span 查看VR店铺
      .opt-item(@click='$router.push({name: "leave-user-message", query: {id: compony.user_id}})' :style='{"background-image": "url(static/images/bg2.png)"}')
        i.iconfont.iconliuyan1()
        span 留言
      a.opt-item(:href='"tel:" + compony.contact_phone' :style='{"background-image": "url(static/images/bg3.png)"}')
        i.iconfont.iconlianxiwomen1
        span 联系我

  section.production.pr
    a.item.border-bottom(v-for='item in listObj.list' :key='item.id' :href='item.panoview_url')
      .left.pr
        img.pac(:src='item.full_logo_url')
      .right
        .title.omit {{item.project_name}}
        .price
          .label 价格：
          .text {{item.total_price ? `${item.total_price}万` : '面议'}}
        .size.icon-text
          i.label.iconfont.iconfangjian
          .text {{item.room_count}}室{{item.hall_count}}厅{{item.bathroom_count}}卫{{item.floorage}}平
        .style.icon-text
          i.label.iconfont.iconzhuangxiu1
          .text {{item.style_text}}
    .null.pac(v-if='!listObj.count') 暂无数据
    .load-more(v-if='listObj.count')
      van-button(@click='loadMoreList' type="primary" round
        size='mini') {{ listObj.count <= opts.page*opts.pageSize ? '没有更多了' : '点击加载更多'}}

</template>

<script>

export default {
  name: 'CompaniesHomepage',
  data () {
    return {
      platform: window.$globalconfig.PLATFORM_NAME,
      compony: {},
      isScroll: false,
      listObj: {list: [], count: 0},
      opts: {
        page: 1,
        pageSize: 10,
        userId: ''
      }
    }
  },
  created () {
    this.opts.userId = this.$route.params.id
    this.getList()
  },
  mounted () {
    console.log(this.$route)
  },
  methods: {
    getList () {
      this.$api.getCompanyProjectList(this.opts).then(data => {
        if (!('user_id' in this.compony)) {
          this.compony = data
        }
        this.listObj.list.push(...data.project_list)
        this.listObj.count = data.total
      })
    },
    loadMoreList () {
      if (this.listObj.count > this.opts.page * this.opts.pageSize) {
        this.opts.page += 1
        this.getList()
      }
    }
  },
  components: {
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.companies-homepage
  background-color $bg
  .compony
    background-color $section
    padding 10px
    .info
      width 100%
      height 80px
      position relative
      margin-bottom 1px
      background-color $section
      display flex
      justify-content space-between
      .left
        height 100%
        text-align center
        width 170px
        img
          background-color #fff
          max-height 100%
          max-width 100%
      .right
        width calc(100% - 180px)
        &>div
          color #ccc
          font-size $small-font
          margin-top 0.16rem
          i
            color #ccc
            font-size 14px
            margin-right .1rem
    .options
      display flex
      justify-content space-between
      margin-top 10px
      .opt-item
        font-size 12px
        color #fff
        height 40px
        width 108px
        display flex
        align-items center
        justify-content center
        background-size cover
        i
          margin-right 5px
  .production
    $h = $navbar + $tabbar + 151px
    height 'calc(100vh - %s)' % $h
    overflow-y auto
    .item
      padding .2rem
      display flex
      .left
        width 112.5px
        height 112.5px
        margin-right .2rem
        img
          max-width 100%
          max-height 100%
      .right
        width calc(100% - 122.5px)
        font-size $small-font
        .title
          color #fff
          font-weight 700
          font-size $big-font
        .price
          display flex
          line-height 34px
          .label
            color #ddd
          .text
            font-size $big-font
            font-weight 700
            color $theme
        .icon-text
          display flex
          line-height 30px
          color #ddd
          i
            font-size 16px
            margin-right 5px
          .text
            font-size $small-font
</style>
