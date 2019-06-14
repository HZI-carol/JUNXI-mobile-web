<template lang="pug">
.main-home.has-tab
  .top-bar(:class='isScroll ? "active" : ""')
    .switch-city(@click='$refs.areaSelector.show = true')
      i.iconfont.icondizhi-copy
      .city-name.omit {{city}}
      i.iconfont.iconxiala
    .search
      input.search-input(ref='searchIpt' placeholder='请输入公司名称或关键词')
      i.iconfont.iconsousuo(@click='search')

  section.banner
    swiper(:aspect-ratio="300/800" height='4.30rem' auto)
      swiper-item(v-for="(item, index) in homeBanner" :key="index")
        a(:href='item.linkurl || "javascript:;"')
          img(:src="item.full_imgurl")

  section.navbar
    .navbar-warp
      .item-wrap(v-for='(item, index) in navList' :key='index')
        .item(@click='openNav(item)')
          .left
            img.icon(:src='item.full_icon_url' v-if='item.full_icon_url')
            i.iconfont(:class='item.icon' :style='{color: item.color}' v-else)
          .right
            .title {{item.name}}
            .text
              span {{item.english_name}}
              .triangle

  //- section.notice
  //-   .join
  //-     van-button(type="primary" round)
  //-       i.iconfont.iconyonghuzhongxin
  //-       span 我要入驻
  //-   .msg
  //-     .icon
  //-       i.iconfont.iconlaba
  //-     .content
  //-       swiper.text-scroll(direction="vertical" height='55px' :interval='2000' :show-dots="false" auto)
  //-         swiper-item(v-for="(item, index) in getMsgGroup(msg)" :key="index")
  //-           p.omit(v-for='i in item' ) 恭喜
  //-             span.red 【 {{i.text}} 】
  //-             span.oimt 入驻{{ platform }}

  section.recommend
    .section-title 精选项目
    .scroll-wrap.pr
      a.item-wrap(v-for='(item, index) in project' :key='index' :href='item.panoview_url')
        .item()
          .top
            img(:src='item.full_image_url')
          .title.omit {{item.project_name}}
      .null.pac(v-if='!project.length') 暂无数据

  section.compony.pr
    .section-title 装饰公司
    .item-wrap(v-for='(item, index) in compony.list' :key='index')
      .item(@click='$router.push({name: "company-homepage", params: {id: item.user_id}})')
        .top.pr
          img.pac(:src='item.full_logo')
        .title.omit {{item.company_name}}
    .null.pac(v-if='!compony.count') 暂无数据
    .load-more(v-if='compony.count')
      van-button(@click='loadMoreList' type="primary" round
        size='mini') {{ compony.count <= componyOpts.page*componyOpts.pageSize ? '没有更多了' : '点击加载更多'}}

  AreaSelector(:city.sync='city' @change='switchCity' :column='2' :showInput='false' ref='areaSelector')

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  components: {
    AreaSelector: () => import('@/components/AreaSelector')
  },
  data () {
    return {
      city: '北京市',
      platform: window.$globalconfig.PLATFORM_NAME,
      navList: [
        // { name: '套房', text: 'SUITE', icon: 'iconzhuzhai', color: '#fdb200' },
        // { name: '别墅', text: 'VILLA', icon: 'icongongyuzhuzhaix', color: '#2aadfd' },
        // { name: '展厅', text: 'EXHIBITION', icon: 'iconkanzhanting', color: '#d680fd' },
        // { name: '酒店', text: 'HOTEL', icon: 'icongongsi1', color: '#ff5a47' },
        // { name: '娱乐会所', text: 'CLUBS', icon: 'iconyule', color: '#08dddb' },
        { name: '地图', english_name: 'MAP', icon: 'iconmsnui-map-locate', color: '#f84b9d' }
      ],
      msg: [
        { text: '长象装饰' },
        { text: '无敌装饰桂林分公司' },
        { text: '星星装饰' },
        { text: '星x星装饰' },
        { text: '星x星x装饰' }
      ],
      project: [],
      projectOpts: {
        page: 1,
        pageSize: 10,
        keyword: ''
      },
      componyOpts: {
        page: 1,
        pageSize: 10,
        typeId: -1,
        city: ''
      },
      compony: { list: [], count: 0 },
      isScroll: false
    }
  },
  async created () {
    this.handleScroll()
    window.addEventListener('scroll', () => this.handleScroll(), true)
    this.$api.getCategoryType().then(data => {
      this.navList.unshift(...data)
    })
    let addrInfo = await this.$vgo.getAddress()
    this.city = addrInfo ? addrInfo.addressComponent.city || addrInfo.addressComponent.province : '北京市'
    this.init()
  },
  mounted () {

  },
  computed: {
    ...mapGetters(['homeBanner'])
  },
  methods: {
    switchCity (data) {
      this.project = []
      this.componyOpts = { page: 1, pageSize: 10, city: '' }
      this.compony = { list: [], count: 0 }
      this.init()
    },
    init () {
      this.projectOpts.keyword = this.city
      this.getProjectList()
      this.componyOpts.city = this.city
      this.getCompanyList()
    },
    handleScroll () {
      let st = document.body.scrollTop || document.documentElement.scrollTop
      if (st > 60) {
        this.isScroll = true
      } else {
        this.isScroll = false
      }
    },
    getMsgGroup (msgList) {
      let arr = []
      for (let i = 0; i < Math.ceil(msgList.length / 2); i++) {
        arr.push(msgList.slice(i * 2, i * 2 + 2))
      }
      return arr
    },
    getProjectList () {
      this.$api.getProjectList(this.projectOpts).then(data => {
        this.project = data.list
      })
    },
    getCompanyList () {
      this.$api.getCompanyList(this.componyOpts).then(data => {
        this.compony.list.push(...data.list)
        this.compony.count = data.count
      })
    },
    loadMoreList () {
      if (this.compony.count > this.componyOpts.page * this.componyOpts.pageSize) {
        this.componyOpts.page += 1
        this.getCompanyList()
      }
    },
    openNav (item) {
      if ('id' in item) {
        this.$router.push({ name: 'companies-of-category', query: { id: item.id, city: this.city } })
      } else {
        this.$router.push({ name: 'project-map', query: { city: this.city } })
      }
    },
    search () {
      if (this.$refs.searchIpt.value) {
        this.$router.push({ name: 'companies-of-category', query: { keyword: this.$refs.searchIpt.value, city: this.city } })
      } else {
        this.$vgo.tip('请输入关键词!', 'fail')
      }
    }
  }

}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.main-home
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
        max-width 60px

  .navbar
    width 100%
    padding 13px 5px
    .navbar-warp
      width 100%
      display flex
      flex-wrap wrap
      .item-wrap
        padding .065rem .075rem
        flex 0 0 33.3333%
        box-sizing border-box
        .item
          box-shadow 0 0 30px rgba(#fff, .2) inset
          width 100%
          border 1px solid rgba(#fff, .2)
          display flex
          height 60px
          .left
            width 36%
            display flex
            align-items center
            justify-content center
            .icon
              width 32px
              height 32px
            i.iconfont
              font-size 28px
          .right
            width 64%
            display flex
            flex-direction column
            justify-content space-around
            padding 5px 0
            color #fff
            .title
              font-size 16px
            .text
              font-size .18rem
  .notice
    height 65px
    background-color $section
    display flex
    margin-bottom 15px
    .join
      width 120px
      height 100%
      display flex
      justify-content center
      align-items center
      &>button
        height 35px
        line-height 35px
        i
          margin-right .1rem
    .msg
      display flex
      flex 1
      padding-left 10px
      .icon
        color $theme
        display flex
        justify-content center
        align-items center
        i
          font-size 26px
      .content
        flex 1
        font-size 12px
        .text-scroll
          width 100%
          height 100%
          display flex
          align-items center
          padding-left 10px
          .vux-swiper
            width 100%
            color #fff
            font-size 12px
            p
              line-height 24px
  .recommend
    background-color $section
    padding-bottom 15px
    margin-bottom 15px
    .scroll-wrap
      height 137px
      overflow-y hidden
      -webkit-overflow-scrolling: touch
      overflow-x auto
      display flex
      .item-wrap
        height 100%
        padding 0 .1rem
        .item
          width 112px
          height 100%
          position relative
          .top
            height 112px
            width 100%
            img
              height 100%
              width 100%
          .title
            width 100%
            position absolute
            padding 0 3px
            bottom 0
            left 0
            color #333
            height 25px
            font-size 14px
            line-height 25px
            text-align center
            background-color #d7d8da
  .compony
    background-color $section
    min-height 150px

    .item-wrap
      height 100%
      width 50%
      padding 0 .1rem 0 .2rem
      display inline-block
      &:nth-child(2n - 1)
        padding 0 .2rem 0 .1rem
      .item
        width 100%
        height 78px
        position relative
        background-color #fff
        .top
          height 53px
          width 100%
          img
            max-height 100%
            max-width 100%
        .title
          width 100%
          position absolute
          padding 0 3px
          bottom 0
          left 0
          color #333
          height 25px
          font-size 14px
          line-height 25px
          text-align center
          background-color #d7d8da
  .triangle
    width 0
    height 0
    margin-left .1rem
    display inline-block
    border-top .1rem solid transparent
    border-left .18rem solid #fff
    border-bottom .1rem solid transparent
</style>
