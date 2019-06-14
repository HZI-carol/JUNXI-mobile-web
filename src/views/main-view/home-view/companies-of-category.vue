<template lang="pug">
.companies-of-category.has-tab
  .top-bar(:class='isScroll ? "active" : ""')
    .switch-city
      i.iconfont.icondizhi-copy
      .city-name.omit {{$route.query.city}}
      //- i.iconfont.iconxiala
    .search
      input.search-input(v-model='opts.keyword' placeholder='请输入装企名称、作品名称')
      i.iconfont.iconsousuo(@click='search')
  section.banner
    swiper(:aspect-ratio="300/800" height='4.30rem' auto)
      swiper-item(v-for="(item, index) in homeBanner" :key="index")
        a(:href='item.linkurl || "javascript:;"')
          img(:src="item.full_imgurl")

  section.compony.pr
    .item.border-bottom(v-for='(item, index) in compony.list' :key='index')
      router-link.left.pr(:to='{name: "company-homepage", params: {id: item.user_id}}')
        img.pac(:src='item.full_logo')
      .right
        router-link.title.omit(:to='{name: "company-homepage", params: {id: item.user_id}}')
          i.iconfont.icongongsi2
          span {{item.company_name}}
        .address.omit
          i.iconfont.iconlocation
          span {{item.address}}
        .wechat.omit(@click='$vgo.imagePreview([item.full_qrcode_url])')
          i.iconfont.iconweixin
          span 查看微信号
        a.vr(:href='item.panoview_url')
          i.iconfont.icondianpu
          span 查看VR店铺

    .null.pac(v-if='!compony.count') 暂无数据
    .load-more(v-if='compony.count')
      van-button(@click='loadMoreList' type="primary" round
          size='mini') {{ compony.count <= opts.page*opts.pageSize ? '没有更多了' : '点击加载更多'}}

</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'CompaniesOfCategory',
  data () {
    return {
      compony: { list: [], count: 0 },
      isScroll: false,
      opts: {
        page: 1,
        pageSize: 10,
        typeId: -1,
        keyword: ''
      }
    }
  },
  created () {
    this.handleScroll()
    window.addEventListener('scroll', () => this.handleScroll(), true)
  },
  activated () {
    if (this.opts.typeId === this.$route.query.id) return
    this.compony.list = []
    this.compony.count = 0
    this.opts.page = 1
    this.opts.typeId = -1
    if ('id' in this.$route.query) {
      this.opts.typeId = this.$route.query.id
    } else if ('keyword' in this.$route.query) {
      this.opts.keyword = this.$route.query.keyword
    }
    this.getCompanyList()
  },
  computed: {
    ...mapGetters(['homeBanner'])
  },
  methods: {
    getCompanyList () {
      this.$api.getCompanyList(this.opts).then(data => {
        this.compony.list.push(...data.list)
        this.compony.count = data.count
      })
    },
    handleScroll () {
      let st = document.body.scrollTop || document.documentElement.scrollTop
      if (st > 60) {
        this.isScroll = true
      } else {
        this.isScroll = false
      }
    },
    loadMoreList () {
      if (this.compony.count > this.opts.page * this.opts.pageSize) {
        this.opts.page += 1
        this.getCompanyList()
      }
    },
    search () {
      if (this.opts.keyword) {
        this.$router.push({name: 'companies-of-category', query: {keyword: this.opts.keyword}})
      } else {
        this.$vgo.tip('请输入关键词!', 'fail')
      }
    }
  },
  components: {
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.companies-of-category
  background-color $bg
  .top-bar
    z-index 1
    width 100%
    position fixed
    top 0
    left 0
    display flex
    height 45px
    line-height 45px
    align-items center
    padding-right 50px
    transition all 0.38s
    &.active
      background linear-gradient(180deg, rgba(0,0,0, 0.9), rgba(0, 0, 0, 0))
      .switch-city
        color #fff
        text-shadow none
    .switch-city
      text-shadow 0 0 5px #fff
      color #333
      flex 0 0 75px
      height 100%
      display flex
      align-items center
      justify-content center
      transition all 0.38s
      i
        font-size 14px
      .city-name
        font-size 14px
        max-width 90px
    .search
      display flex
      flex 1
      background-color rgba(#ececec, .8)
      height 25px
      line-height 25px
      border-radius 12px
      color #666
      padding 0 0 0 10px
      .search-input
        width 100%
        outline none
        background transparent
        border none
        box-shadow none
        height 100%
      i.iconfont
        width 40px
        text-align center
        font-size 14px

  .compony
    min-height  120px
    .item
      width 100%
      height 95px
      position relative
      margin-bottom 1px
      padding .2rem
      display flex
      justify-content space-between
      .left
        display block
        height 100%
        width 170px
        text-align center
        img
          max-height 100%
          max-width 100%
      .right
        display block
        width calc(100% - 170px)
        padding-left 0.2rem
        &>div,.title,.vr
          display block
          color #ccc
          font-size $small-font
          margin-top 0.02rem
          i
            color #ccc
            font-size 14px
            margin-right .1rem
        .title
          margin-top 0
          color #fff
          font-size $big-font
</style>
