<template lang="pug">
.customer-ask.has-nav
  NavBar()
  .top-bar
    .search
      input.search-input(v-model='message[opts.status].keyword' placeholder='请输入标题关键词')
      i.iconfont.iconsousuo(@click='search')
    .options
      van-checkbox(v-model="selectAll" @click='selectAllItem') 全选
      van-button(@click='delMessage(item)' size='mini' round type="primary") 删除
      van-button(v-if="!opts.status" @click='passMessage("")' size='mini' round type="info") 通过

  van-tabs(@click="switchTab" sticky)
    van-tab.unread.pr(:title="i.name" v-for="i in Object.values(message)" :key="i.name")
      .item(v-for="(item, index) in message[opts.status].list" :key="index")
        .checkbox
          van-checkbox(v-model="item.selected" @click='selectItem')
        .content
          .top
            .info
              .name.omit {{item.name}}
              .tag
                van-tag(plain type="danger" round) {{item.status_text}}
            .options
              i.van-icon.van-icon-delete(@click='delMessage(item)')
              i.van-icon.van-icon-success(v-if="!opts.status" @click='passMessage(item)')
          .tel.iconfont.icontablet {{item.phone}}
          .text(:class='!item.showAll ? "omit-2" : ""') 内容: {{item.content}}
            span.show-all(@click='$set(item, "showAll", !item.showAll)'
            v-if='item.content && item.content.length > 45') {{!item.showAll ? '...展开全部》' : '《收起内容'}}
          .time {{item.created | dateFormat('date')}}

      .null.pac(v-if="!message[opts.status].count") 暂无数据

      .load-more(v-if='message[opts.status].count')
        van-button(@click='loadMoreList' type="primary" round
          size='mini') {{ message[opts.status].count <= message[opts.status].page*opts.pageSize ? '没有更多了' : '点击加载更多'}}

</template>
<script>
export default {
  name: 'CutomerAsk',
  data () {
    return {
      message: {
        0: {name: '未处理', list: [], count: -1, page: 1, keyword: '', init: false},
        1: {name: '已处理', list: [], count: -1, page: 1, keyword: '', init: false}
      },
      selectAll: false,
      opts: {
        page: 1,
        pageSize: 10,
        keyword: '', // 关键字搜索 姓名或电话
        // day_type: '', // 选择天数类型 7天，14天，30天
        startdt: '', // 开始时间
        enddt: '', // 结束时间
        status: 0 // 状态 0 未处理 1 已处理（通过）
      }
    }
  },
  created () {
    this.getMessageList()
  },
  methods: {
    selectAllItem () {
      let listObj = this.message[this.opts.status]
      listObj.list.map(item => {
        item.selected = this.selectAll
      })
    },
    selectItem () {
      let listObj = this.message[this.opts.status]
      let selectItems = listObj.list.filter(i => i.selected)
      this.selectAll = selectItems.length === listObj.list.length
    },
    getMessageList () {
      let list = this.message[this.opts.status]
      if (list.init) {
        list.page = 1
        list.list = []
        list.init = false
        this.opts.page = 1
      }
      return this.$api.getMessageList(this.opts).then(data => {
        data.list.map(item => {
          item.showAll = false
          item.selected = false
        })
        this.message[this.opts.status].list.push(...data.list)
        this.message[this.opts.status].count = data.count
      })
    },
    loadMoreList () {
      let list = this.message[this.opts.status]
      if (list.count > list.page * this.opts.pageSize) {
        list.page += 1
        this.opts.page = list.page
        this.getMessageList()
      }
    },
    search () {
      this.message[this.opts.status].init = true
      this.opts.keyword = this.message[this.opts.status].keyword
      this.getMessageList()
    },
    passMessage (item) {
      let list = []
      if (item) {
        list.push(item.id)
      } else {
        this.message[this.opts.status].list.map(i => {
          if (i.selected) list.push(i.id)
        })
      }
      if (!list.length) {
        this.$vgo.tip('请选择消息!', 'fail')
        return
      }
      this.$vgo.open(() => {
        this.$api.passMessage(list).then(data => {
          this.$vgo.tip('操作成功!', 'success')
          this.message[0].init = true
          this.message[0].count = -1
          this.message[1].init = true
          this.message[1].count = -1
          this.getMessageList()
        })
      })
    },
    delMessage (item) {
      let list = []
      if (item) {
        list.push(item.id)
      } else {
        this.message[this.opts.status].list.map(i => {
          if (i.selected) list.push(i.id)
        })
      }
      if (!list.length) {
        this.$vgo.tip('请选择消息!', 'fail')
        return
      }
      this.$vgo.open(() => {
        this.$api.delMessage(list.join(',')).then(data => {
          this.$vgo.tip('操作成功!', 'success')
          this.message[0].init = true
          this.message[0].count = -1
          this.message[1].init = true
          this.message[1].count = -1
          this.getMessageList()
        })
      })
    },
    async switchTab (val) {
      this.opts.status = val
      let listObj = this.message[this.opts.status]
      this.opts.keyword = listObj.keyword
      this.opts.page = listObj.page
      if (listObj.count === -1) await this.getMessageList()
      let selectItems = listObj.list.filter(i => i.selected)
      this.selectAll = selectItems.length ? selectItems.length === listObj.list.length : false
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.customer-ask
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
  .van-tab__pane
    font-size 14px
    height calc(100vh - 145px)
    -webkit-overflow-scrolling: touch
    overflow-y auto
    .item
      display flex
      color #fff
      background-color $section
      margin-bottom 1px
      .checkbox
        width 35px
        text-align center
        padding-top 10px
        .van-checkbox
          font-size 12px
      .content
        width calc(100vw - 35px)
        .top
          display flex
          line-height 38px
          height 38px
          justify-content space-between
          .info
            display flex
            .name
              max-width 430px
              display inline-block
              font-size $big-font
            .tag
              .van-tag
                margin-left .15rem
                font-size 12px
          .options
            i
              font-size 20px
              margin-right 10px
            .van-icon-delete
              color #ddd
            .van-icon-success
              color $theme
        .tel
          font-size 14px
          color #bbb
        .text
          color #ddd
          margin-right 10px
          position relative
          &.omit-2
            .show-all
              position absolute
          .show-all
            right 0
            bottom 0
            background-color $section
            color $theme
        .time
          color #999
          line-height 30px

</style>
