<template lang="pug">
van-actionsheet.pano-tag(v-model="show" title="请选择作品行业")
  .content
    .title 推荐标签

    .system
      van-tag(v-for='item in systemTag' plain type="danger" round
        @click='selectTag(item)' :key="item.id") {{item.text}}
    .title.add-row
      .label 自定义标签

      .add.search
        input.search-input(v-model="tagName" placeholder="请输入标签名称")
        van-button(size="mini" type="primary" @click="addTag" round plain) 添 加

    .custom.pr
      van-tag(v-for='(item,index) in customTag' plain type="success" round
        @click='selectTag(item)' :key="index")
        span {{item.tagname}}
        i.van-icon.van-icon-cross(@click.stop='delCustomTag(item, index)')
      .null.pac(v-if='!customTag.length') 暂无数据

    .title 当前已选 ({{tags.length}}/3)
    .custom
      van-tag(v-for='(item, index) in tags' plain type="success" round :key="index")
        span {{item}}
        i.van-icon.van-icon-cross(@click.stop='deltags(index)')
  .submit-add
    //- van-field(v-model="curRenameScene")
    van-button(@click='submit' size='small' round type='primary') 确定
</template>
<script>

export default {
  name: 'TagSelestor',
  props: {
    tags: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      show: false,
      systemTag: [],
      customTag: [],
      tagName: ''
    }
  },
  created () {
    this.getUserPanoTag()
  },
  methods: {
    getUserPanoTag () {
      this.$api.getUserPanoTag().then(data => {
        this.systemTag = data.systemtag
        this.customTag = data.customizetag
      })
    },
    selectTag (item) {
      if (this.tags.length >= 3) {
        this.$vgo.tip('已添加3个标签! 请删除后再添加', 'fail')
        return
      }
      let arr = this.tags.filter(i => (item.text || item.tagname) === i)
      if (arr.length) {
        this.$vgo.tip('已添加相同标签!', 'fail')
        return
      }
      this.tags.push(item.text || item.tagname)
    },
    addTag () {
      if (this.tagName === '') {
        this.$vgo.tip('请输入标签名称!', 'fail')
        return
      }
      let arr = this.customTag.filter(i => this.tagName === i.tagname)
      if (arr.length) {
        this.$vgo.tip('标签已存在!', 'fail')
        return
      }
      if (this.tagName.length > 10) {
        this.$vgo.tip('标签名称不超过10个字符!', 'fail')
        return
      }
      this.$api.addUserPanoTag(this.tagName).then(res => {
        this.$vgo.tip('操作成功!', 'success')
        this.customTag.push({tagname: this.tagName})
        this.tagName = ''
      })
    },
    delCustomTag (item, index) {
      this.$vgo.open(() => {
        this.$api.delUserPanoTag(item.tagid).then(res => {
          this.$vgo.tip('操作成功!', 'success')
          this.customTag.splice(index, 1)
          this.tags.map((i, index) => {
            if (i === item.tagname) {
              this.tags.splice(index, 1)
            }
          })
        })
      })
    },
    deltags (index) {
      this.tags.splice(index, 1)
    },
    submit () {
      this.$emit('update:tags', this.tags)
      this.show = false
    }
  }
}
</script>
<style lang="stylus">
@import '~@/assets/style/index'
.pano-tag
  .title
    height 36px
    line-height 36px
    border-top 1px solid #fff
    font-size 15px
    color #999
    padding 0 .2rem
    margin-bottom .2rem
  .add-row
    display flex
    justify-content space-between
    .add
      display flex
      align-items center
      height 100%
      flex 0
      background none
      input
        width 180px
        height 24px
        margin-right 0.2rem
        padding 0 5px
        border-radius 10px
        background-color #fff
  .custom,.system
    padding-left .2rem
    min-height 30px
    display flex
    flex-wrap wrap
    .van-tag
      font-size 14px
      line-height 26px
      padding 0 10px
      margin-right .2rem
      margin-bottom .2rem
      cursor pointer
      span
        margin-right .2rem
        margin-left .1rem
      i
        vertical-align -1px
  .selected
    font-size $small-font
    .label
      color #999
    .label,.el-tag
      margin-right 10px
  .submit-add
    width 100%
    height 40px
    background-color $section
    display flex
    justify-content center
    align-items center
    .van-button
      width 80%
  .van-tag
    font-size .2rem
    padding 0 8px
    border-radius 100px
    line-height 20px
</style>
