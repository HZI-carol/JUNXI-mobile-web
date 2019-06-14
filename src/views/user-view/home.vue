<template lang="pug">
.user-home.has-tab
  router-link.top-bar(to='/')
    i.van-icon.van-icon-wap-home
    span 公司微官网
  router-link.user-center(:to='{ name: "user-center" }')
    img(v-if="userInfo.avatar" :src='userInfo.avatar')
    i.iconfont.iconusertie(v-else)
  section.banner
    swiper(:aspect-ratio="215/375" height='4.30rem' auto)
      swiper-item(v-for="(item, index) in homeBanner" :key="index")
        a(:href='item.linkurl || "javascript:;"')
          img(:src="item.full_imgurl")

  section.navbar
    .navbar-warp
      .item-wrap(v-for='(item, index) in navList' :key='index')
        .item(@click='handleNavClick(item)')
          .top(:style='{backgroundColor: item.color}')
            i.iconfont(:class='item.icon')
          .bottom
            .title {{item.title}}

  section.project
    van-tabs(@click="switchTab" sticky ref='tabs')
      van-tab(title="新建项目" key='-22')
        a.item(v-for="(item, index) in project['-1'].list.slice(0, 5)" :key="index" :href='item.panoview_url')
          .left.pr
            img.pac(:src='item.full_image_url')
          .right
            .title.omit {{item.project_name}}
            .style {{item.style_text}}
            .time {{item.created | dateFormat}}

        .null.pac(v-if='!project["-1"].count') 暂无项目

      van-tab(v-for="i in Object.keys(project)" :key="i" :title="project[i].title")
        a.item(v-for="(item, index) in project[i].list" :key="index" :href='item.panoview_url')
          .left.pr
            img.pac(:src='item.full_image_url')
          .right
            .title.omit {{item.project_name}}
            .style {{item.style_text}}
            .time {{item.created | dateFormat}}

        .null.pac(v-if='!project[i].count') 暂无项目

        .load-more(v-if='project[i].count')
          van-button(@click='loadMoreList' type="primary" round
            size='mini') {{ project[i].count <= project[i].page*opts.pageSize ? '没有更多了' : '点击加载更多'}}

      //- van-tab(title="在装项目")
      //-   .item(v-for="(item, index) in project[]" :key="index")
      //-     .left
      //-       img(:src='item.img')
      //-     .right
      //-       .title {{item.title}}
      //-       .style {{item.style}}
      //-       .time 2018-12-12
      //- van-tab(title="完工项目")
      //- van-tab(title="所有项目")

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserHome',
  data () {
    return {
      navList: [
        { title: '在装项目', icon: 'icondiaodeng2', route: { name: 'user-project', query: { status: 0 } }, color: '#fdb200' },
        { title: '完工项目', icon: 'iconwangongjiesuan', route: { name: 'user-project', query: { status: 2 } }, color: '#2aadfd' },
        { title: '所有项目', icon: 'iconfangzi_zhuye', route: { name: 'user-project', query: { status: -1 } }, color: '#d680fd' },
        { title: '个人中心', icon: 'iconusertie', route: { name: 'user-center' }, color: '#ff8a09' },
        { title: '素材库', icon: 'iconsucaiku', route: { name: 'user-material' }, color: '#ff5152' },
        { title: '公司VR', icon: 'iconicon-test', route: { name: 'create-project' }, color: '#ff8a09' },
        { title: '设置', icon: 'iconshezhi', route: { name: 'user-setting' }, color: '#08dddb' },
        { title: '客户咨询', icon: 'iconzixun2', route: { name: 'user-customer-ask' }, color: '#f84b9d' }
      ],
      project: {
        // '-1': {list: [], count: -1, title: '新建项目', page: 1},
        '0': { list: [], count: -1, title: '在装项目', page: 1 },
        '2': { list: [], count: -1, title: '完工项目', page: 1 },
        '-1': { list: [], count: -1, title: '所有项目', page: 1 }
      },
      opts: {
        page: 1,
        pageSize: 5,
        status: -1 // 项目状态0 在建项目 1 竣工项目 2 完工项目 3 停工项目 4 暂停 5 未开工项目（暂时只用到0 2 如有项目为 -1）
      }
    }
  },
  created () {
    this.$api.getIsRegisterCompany().then(async data => {
      if (data.id < 0) {
        // this.$vgo.tip('请完善公司信息!', 'fail')
        // this.$router.replace({name: 'company-info'})
        // 设置默认公司信息
        let opts = {
          company_name: window.$globalconfig.PLATFORM_NAME,
          contact_name: '',
          contact_phone: '',
          address: '',
          logo: window.$globalconfig.LOGO,
          qrcode_url: '',
          license_image_url: '',
          description: '',
          site_url: ''
        }
        let addrInfo = await this.$vgo.getAddress()
        if (addrInfo) {
          addrInfo = addrInfo.addressComponent
          Object.assign(opts, {
            area: addrInfo.area,
            area_id: addrInfo.adcode,
            city: addrInfo.city || addrInfo.province,
            city_id: addrInfo.adcode.slice(0, 4) + '00',
            province_id: addrInfo.adcode.slice(0, 2) + '0000',
            province: addrInfo.province
          })
        }
        this.$api.addCompanyInfo(opts).then(data => {
          this.$store.dispatch('getCompanyInfo')
          this.$store.dispatch('getCompanyPano')
          this.$store.dispatch('getUserInfo')
          this.getList()
        })
      } else {
        this.$store.dispatch('getCompanyInfo')
        this.$store.dispatch('getCompanyPano')
        this.$store.dispatch('getUserInfo')
        this.getList()
      }
    })
  },
  computed: {
    ...mapGetters(['homeBanner', 'companyPano', 'userInfo'])
  },
  methods: {
    switchTab (active) {
      switch (active) {
        case 0:
          this.opts.status = -1
          break
        case 1:
          this.opts.status = 0
          break
        case 2:
          this.opts.status = 2
          break
        case 3:
          this.opts.status = -1
          break
      }
      if (this.project[this.opts.status].count === -1) {
        this.getList()
      }
    },
    getList () {
      this.$api.getUserProjiectList(this.opts).then(data => {
        this.project[this.opts.status].list.push(...data.list)
        this.project[this.opts.status].count = data.count
      })
    },
    handleNavClick (item) {
      if (item.title === '公司VR') {
        if (this.companyPano.fk_pano_id > 0) {
          this.$router.push({ name: 'user-pano', query: this.companyPano })
        } else if ('id' in this.companyPano) {
          this.$router.push({ name: 'pano-publish', query: this.companyPano })
        } else {
          this.$router.push({ name: 'create-project' })
        }
      } else {
        this.$router.push(item.route)
      }
    },
    loadMoreList () {
      let list = this.project[this.opts.status]
      if (list.count > list.page * this.opts.pageSize) {
        list.page += 1
        this.opts.page = list.page
        this.getList()
      }
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.user-home
  .top-bar
    z-index 1
    position fixed
    top 10px
    left 10px
    display flex
    height 25px
    border-radius 20px
    padding 0 10px
    background-color #fff
    align-items center
    font-size 14px
    color #999
  .user-center
    position fixed
    top 8px
    right 10px
    z-index 1
    border-radius 50%
    height 34px
    width 34px
    display flex
    justify-content center
    align-items center
    color #fff
    border 1px solid #ddd
    overflow hidden
    img
      width 100%
      height 100%
  .navbar
    width 100%
    background-color $section
    .navbar-warp
      width 100%
      height 100%
      display flex
      flex-wrap wrap
      padding-top 16px
      .item-wrap
        flex 0 0 25%
        .item
          text-align center
          width 100%
          display block
          .top
            height 50px
            width 50px
            margin 0 auto
            display flex
            align-items center
            justify-content center
            border-radius 50%
            i.iconfont
              font-size 28px
              color #fff
          .bottom
            .title
              text-align center
              line-height 30px
              color #fff
              font-size 12px

  .project
    margin-top .2rem
    background-color $section
    color #fff
    .van-tabs .van-tab__pane
      position relative
      min-height 60px
    .item
      padding .2rem
      display flex
      color #ddd
      border-bottom 1px solid $bg
      .left
        // flex 0 0 110px
        width 110px
        height 110px
        margin-right 15px
        img
          max-width 100%
          max-height 100%
      .right
        width calc(100% - 125px)
        .title
          line-height 30px
          font-weight 700
          font-size $big-font
          color #fff
        .style
          font-size $small-font
          line-height 30px
        .time
          font-size $small-font

</style>
