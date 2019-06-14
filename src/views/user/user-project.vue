<template lang='pug'>
.user-project.has-nav
  NavBar(:title='title[opts.status]')
  .top-bar
    .search
      input.search-input(v-model="opts.keyword" placeholder='请输入标题关键词')
      i.iconfont.iconsousuo(@click='search')
    .options
      van-checkbox(:value='selectAll' @click='selectAllProject') 全选
      van-button(@click='delProject("multiple")' size='mini' round type='primary') 删除

  section.project.pr
    .item(v-for='(item, index) in project.list' :key='index')
      a.top(:href='item.fk_pano_id ? item.panoview_url : "javascrit:;"')
        .left
          img(v-if='item.full_image_url' :src='item.full_image_url')
          span(v-else) 未设置全景
          .checkbox
            van-checkbox(:value='item.selected' @click.prevent='item.selected = !item.selected')
        .right
          .row
            .title.omit {{item.project_name}}
            .price {{item.total_price ? `${item.total_price}万` : '面议'}}
          .row
            i.iconfont.iconlocation
            .text.omit {{item.province + item.city + item.area + item.address}}
          .row
            i.iconfont.iconfangjian
            span {{item.room_count}}室{{item.hall_count}}厅{{item.bathroom_count}}卫{{item.floorage ? `${item.floorage}平` : ''}}
          .row
            i.iconfont.iconzhuangxiu1
            span {{item.style_text}}
      .options
        van-button(@click='$router.push({name: "create-project", query: item})'
          plain round size='mini' type='primary')
          i.iconfont.iconxinxi 信息
        van-button(@click='$router.push({name: item.fk_pano_id ? "user-pano" : "pano-publish", query: {...item, page: opts.status}})'
          plain round size='mini' type='primary')
          i.iconfont.iconquanjingtu_ 编辑
        van-button(@click='openMoveOpts(item)' plain round size='mini' type='primary')
          i.iconfont.iconyidong 移动
        van-button(@click='delProject(item.id)' plain round size='mini' type='primary')
          i.iconfont.iconshanchu 删除

    .null.pac(v-if='!project.count') 暂无项目

    .load-more(v-if='project.count')
      van-button(@click='loadMoreList' type='primary' round
        size='mini') {{ project.count <= opts.page*opts.pageSize ? '没有更多了' : '点击加载更多'}}

  van-actionsheet(v-model="showMove" :actions="statusActions" @select="onSelect" cancel-text="取消")

</template>
<script>
export default {
  name: 'UserProject',
  data () {
    return {
      showMove: false,
      project: {list: [], count: -1},
      selectAll: false,
      opts: {
        page: 1,
        pageSize: 10,
        keyword: '',
        status: 0 // 项目状态0 在建项目 1 竣工项目 2 完工项目 3 停工项目 4 暂停 5 未开工项目（暂时只用到0 2 如有项目为 -1）
      },
      title: {'0': '在装项目', '2': '完工项目', '-1': '所有项目'},
      statusActions: [{name: '在装项目', id: 0, disabled: false}, {name: '完工项目', id: 2, disabled: false}]
    }
  },
  created () {
    this.opts.status = this.$route.query.status
    this.getList()
  },
  methods: {
    search () {
      this.opts.page = 1
      this.project.list = []
      this.getList()
    },
    getList () {
      this.$api.getUserProjiectList(this.opts).then(data => {
        data.list.map(item => { item.selected = false })
        this.project.list.push(...data.list)
        this.project.count = data.count
      })
    },
    loadMoreList () {
      if (this.project.count > this.opts.page * this.opts.pageSize) {
        this.opts.page += 1
        this.getList()
      }
    },
    selectAllProject () {
      if (this.selectAll === true) {
        this.project.list.map(item => {
          item.selected = false
        })
      } else {
        this.project.list.map(item => {
          item.selected = true
        })
      }
      this.selectAll = !this.selectAll
    },
    openMoveOpts (item) {
      this.curProject = item
      console.log(item)
      this.statusActions.map(i => { i.disabled = i.id === item.status })
      this.showMove = true
    },
    onSelect (item) {
      console.log(item)
      this.$api.updateProjectStatus(this.curProject.id, item.id).then(data => {
        this.showMove = false
        this.$vgo.tip('操作成功!', 'success')
        this.project.list = []
        this.opts.page = 1
        this.getList()
      })
    },

    delProject (id) {
      let idStr = id
      if (id === 'multiple') {
        let arr = []
        this.project.list.map(item => {
          if (item.selected) arr.push(item.id)
        })
        if (!arr.length) {
          this.$vgo.tip('未选择项目!', 'fail')
          return
        }
        idStr = arr.join(',')
      }
      this.$vgo.open(() => {
        this.$api.delProject(idStr).then(data => {
          this.project.list = []
          this.opts.page = 1
          this.getList()
          this.$vgo.tip('操作成功!', 'success')
        })
      })
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.user-project
  .top-bar
    display flex
    height 55px
    align-items center
    padding 0 .2rem
    background-color $section
    margin-bottom .2rem
    border-top 1px solid $bg
    .options
      font-size 14px
      display flex
      .van-checkbox
        margin 0 10px
        span
          color #fff
  .project
    height calc(100% - 65px)
    -webkit-overflow-scrolling: touch
    overflow-y auto
    .item
      background-color $section
      padding .2rem
      margin-bottom 1px
      .top
        display flex
        font-size $small-font
        justify-content space-between
        .left
          width 112px
          height 112px
          position relative
          display flex
          justify-content center
          align-items center
          color #999
          img
            height 100%
            width 100%
          .checkbox
            position absolute
            left 5px
            top 5px
            .van-checkbox
              border-radius 50%
              background-color rgba(#000, .2)
        .right
          width calc(100% - 112px)
          padding-left .2rem
          .row
            display flex
            line-height 30px
            &:first-child
              justify-content space-between
            .title.omit
              width 150px
              color #fff
              font-size $big-font
            .price
              color $theme
              font-size $big-font
              font-weight 700
            i
              color #bbb
              margin-right 8px
            span,.text
              color #ccc
      .options
        height 30px
        line-height 30px
        .van-button
          vertical-align middle
          i
            font-size 12px

</style>
