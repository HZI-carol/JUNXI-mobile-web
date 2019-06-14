<template lang="pug">
.user-material.has-nav
  NavBar()

  van-tabs(@click="switchTab" sticky)
    van-tab(v-for="item in Object.values(tabs)" :key="item.name" :title="item.name")
    .content-box(:class='"tab-" + opts.typeid' v-if="opts.typeid !== 99 && opts.typeid !== 33")
      .ststus
        Upload(showType='slot' @onRead='onReadMat' :size='tabs[opts.typeid].size' :accept='tabs[opts.typeid].accept')
          van-button(type='primary' size='small' round) 上传素材
      div(:class='"material" + "-" + opts.typeid')
        .item(@click='selectMat(item)' v-for='(item, index) in material[opts.typeid].list[opts.page]' :key='item.id')
          img(:src='item.full_mat_pic' v-if="opts.typeid != 8")

          .title.omit {{item.title}}
          template(v-if="opts.typeid == 8")
            i.van-icon.van-icon-play(@click.stop='handlePlay(item.full_mat_file)' v-if='item.full_mat_file != audioSrc')
            i.van-icon.van-icon-pause(@click.stop='handlePlay("")' v-else)

          i.van-icon.van-icon-delete(v-if='!item.is_system' @click.stop='delMat(item)')
      .null.pac(v-if='!material[opts.typeid].count') 暂无数据

      .page
        van-pagination(:items-per-page="opts.pageSize" v-if="material[opts.typeid].count" v-model='opts.page'
          @change='handlePageChange' :total-items='material[opts.typeid].count' :show-page-size="3" force-ellipses)

    .content-box(:class='"tab-" + opts.typeid' v-if="opts.typeid === 99")
      .ststus
        van-button(@click='isShowLoadingAdd = true' type='primary' size='small' round) 添加素材
      div(:class='"material" + "-" + opts.typeid')
        .item(@click='selectMat(item)' v-for='(item, index) in loadingMaterial.list[opts.page]' :key='item.id' :style='{backgroundColor: item.background_color}')
          img(:src='item.full_load_img')
          .title 时长: {{item.showtime}}毫秒
          i.van-icon.van-icon-delete(v-if='!item.is_system' @click.stop='delMat(item)')
        .null.pac(v-if='!loadingMaterial.count') 暂无数据

      .page
        van-pagination(:items-per-page="opts.pageSize" v-if="loadingMaterial.count" v-model='opts.page'
          @change='handlePageChange' :total-items='loadingMaterial.count' :show-page-size="3" force-ellipses)

    .content-box(:class='"tab-" + opts.typeid' v-if="opts.typeid === 33")
      div(:class='"material" + "-" + opts.typeid')
        .item(@click='selectMat(item)' v-for='(item, index) in textToAudio' :key='item.id')
          .title.omit {{item.title}}
          i.van-icon.van-icon-play(@click.stop='handlePlay(item.full_mat_file)' v-if='item.full_mat_file != audioSrc')
          i.van-icon.van-icon-pause(@click.stop='handlePlay("")' v-else)

          i.van-icon.van-icon-delete(v-if='!item.is_system' @click.stop='delMat(item)')
      .null.pac(v-if='!textToAudio.length') 暂无数据

    audio(ref='audio' :src='audioSrc' autoplay)

    van-actionsheet.add-loading-form(v-model="isShowLoadingAdd" title="添加加载动画" :close-on-click-overlay='false')
      Upload.upload-share-cover(label='pc端图片' @onRead='onReadPC'
        placeholder="点击此处选择封面" icon='van-icon van-icon-plus')
        img(slot='avatar' :src='loadOpts.full_pc_load_img' v-if='loadOpts.full_pc_load_img')
      Upload.upload-share-cover(label='移动端图片' @onRead='onReadMobile'
        placeholder="点击此处选择封面" icon='van-icon van-icon-plus')
        img(slot='avatar' :src='loadOpts.full_load_img' v-if='loadOpts.full_load_img')
      van-field(label="分享标题" v-model="loadOpts.showtime" placeholder="请输显示时长" clearable )
        span(slot='right-icon') 毫秒
      .van-cell
        .van-cell__title 背景颜色
        input(type="color" v-model="loadOpts.background_color")
      .submit-addLoading.submit-form
        van-button(@click='submitLoading' type='primary' size='small' round) 保存
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'CutomerAsk',
  components: {
    Upload: () => import('@/components/Upload')
  },
  data () {
    return {
      tabs: {
        0: {name: '项目logo', accept: 'image/*'},
        8: {name: '音乐素材', accept: 'audio/*'},
        3: {name: '项目封面', accept: 'image/*'},
        10001: {name: '图片', accept: 'image/*'},
        33: {name: '文字转语音'},
        99: {name: '加载动画'}
      },
      audioSrc: '',
      prefix: window.$globalconfig.URLS.API,
      opts: {
        page: 1,
        pageSize: 10,
        typeid: 0, // 0项目logo 8音乐素材 3项目封面
        init: false
      },
      selectAll: true,
      isShowLoadingAdd: false,
      loadOpts: {
        load_img: '',
        full_load_img: '',
        pc_load_img: '',
        full_pc_load_img: '',
        background_color: '#409EFF',
        showtime: 3000
      }
    }
  },
  computed: {
    ...mapGetters(['material', 'textToAudio', 'loadingMaterial'])
  },
  created () {
    this.getMaterial()
  },
  methods: {
    switchTab (idx) {
      this.opts.page = 1
      this.audioSrc = ''
      this.opts.typeid = Number(Object.keys(this.tabs)[idx])
      if (this.opts.typeid !== 99 && this.opts.typeid !== 33) {
        if (this.material[this.opts.typeid].count === -1) {
          this.getMaterial()
        }
      }
      if (this.opts.typeid === 33 && this.textToAudio[0] === -1) {
        this.$store.dispatch('getTextToAudio')
      }
      if (this.opts.typeid === 99 && this.loadingMaterial.count === -1) {
        this.$store.dispatch('getLoadingList', this.opts)
      }
    },
    handlePageChange () {
      if (this.opts.typeid === 99) {
        this.$store.dispatch('getLoadingList', this.opts)
      } else {
        this.getMaterial()
      }
    },
    onReadMat (file) {
      console.log(file)
      let opts = { title: file.title, type_id: this.opts.typeid }
      let api = ''
      switch (this.opts.typeid) {
        case 0:
          api = 'uploadProjectLogo'
          break
        case 8:
          api = 'uploadAudio'
          break
        case 10001:
          api = 'uploadMaterial'
          break
        case 3:
          api = 'uploadProjectCover'
          break
      }
      console.log(api)
      this.$api[api](file).then(data => {
        opts.mat_pic = data[0].url
        opts.mat_file = data[0].url
        this.$api.addMaterial(opts).then(data => {
          this.$vgo.tip('操作成功!', 'success')
          this.getMaterial(true, 1)
        })
      })
    },
    getMaterial (init = false, page = this.opts.page) {
      this.opts.init = init
      this.opts.page = page
      this.$store.dispatch('getMaterial', this.opts)
    },
    selectMat (item) {
      // this.curTab = 0
      // if (this.compsInfo.type === 1) { // 项目logo
      //   this.projectInfo.full_logo_url = item.full_mat_pic
      //   this.projectInfo.logo_url = item.mat_pic
      // }
      // if (this.compsInfo.type === 2) { // 背景音乐
      //   this.panoInfo.bgmusicurl = item.title + '|' + item.mat_file
      // }
      // if (this.compsInfo.type === 3) { // share
      //   this.panoInfo.shareico = item.mat_pic
      // }
      // if (this.compsInfo.type === 4) { // loading
      //   this.panoInfo.fk_userpano_load_id = item.userpano_load_id
      //   this.panoInfo.loadinfo.background_color = item.background_color
      //   this.panoInfo.loadinfo.load_img = item.full_load_img
      //   this.panoInfo.loadinfo.pc_load_img = item.full_pc_load_img
      //   this.panoInfo.loadinfo.showtime = item.showtime
      // }
      // if (this.compsInfo.type === 5) { // 项目 封面
      //   this.projectInfo.full_image_url = item.full_mat_pic
      //   this.projectInfo.image_url = item.mat_pic
      // }
      console.log(item)
    },
    delMat (item) {
      console.log(item)
      this.$vgo.open(() => {
        if (this.opts.typeid === -1) {
          this.$api.delPanoLoading(item.userpano_load_id).then(res => {
            if (this.loadingMaterial.list[this.opts.page].length === 1 && this.opts.page > 1) {
              this.opts.page -= 1
            }
            this.$vgo.tip('操作成功', 'success')
            this.opts.init = true
            this.$store.dispatch('getLoadingList', this.opts)
          })
        } else {
          this.$api.delMaterial(item.mat_id).then(data => {
            if (this.material[this.opts.typeid].list[this.opts.page].length === 1 && this.opts.page > 1) {
              this.opts.page -= 1
            }
            this.getMaterial(true)
            this.$vgo.tip('操作成功!', 'success')
          })
        }
      })
    },
    onReadPC (file) {
      this.$api.uploadLoading(file).then(data => {
        this.$vgo.tip('上传成功!', 'success')
        this.loadOpts.full_pc_load_img = data[0].fullurl
        this.loadOpts.pc_load_img = data[0].url
      })
    },
    onReadMobile (file) {
      console.log(file)
      this.$api.uploadLoading(file).then(data => {
        this.$vgo.tip('上传成功!', 'success')
        this.loadOpts.full_load_img = data[0].fullurl
        this.loadOpts.load_img = data[0].url
      })
    },
    submitLoading () {
      this.$api.addPanoLoading(this.loadOpts).then(data => {
        this.$vgo.tip('操作成功!', 'success')
        this.opts.init = true
        this.$store.dispatch('getLoadingList', this.opts)
        this.isShowLoadingAdd = false
      })
    },
    handlePlay (src) {
      this.audioSrc = src
    }

  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.user-material
  .van-tabs
    height 100%
  .van-tabs__content
    height 100%
  .ststus
    display flex
    justify-content space-between
    align-items center
    height 50px
    padding 0 .2rem
    color #ddd
    border-bottom 1px solid $section
    .upload-custom
      display flex
      justify-content space-between
      align-items center
    .name
      font-size $small-font
  .content-box.tab-33
    height 100%
  .content-box
    font-size 14px
    height 100%
    .material-0, .material-10001, .material-3, .material-99
      padding .2rem
      -webkit-overflow-scrolling: touch
      overflow-y auto
      height calc(100% - 90px)
      .item
        width 49%
        display inline-block
        vertical-align top
        background-color $section
        margin-bottom .2rem
        height 80px
        position relative
        text-align center
        &:nth-child(2n-1)
          margin-right 0.14rem
        img
          max-width 100%
          max-height 100%
        i
          position absolute
          right 0
          top 0
          height 30px
          width 30px
          display flex
          justify-content center
          align-items center
          background-color rgba(#000, .5)
          color $theme
        .title
          height 30px
          line-height 30px
          padding 0 .1rem
          text-align center
          position absolute
          left 0
          bottom 0
          width 100%
          background-color rgba(#000, .5)
          color #fff
    .material-8
      height calc(100% - 90px)!important
    .material-8, .material-33
      width 100%
      height 100%
      -webkit-overflow-scrolling: touch
      overflow-y auto
      .item
        width 100%
        display flex
        line-height 40px
        padding 0 .2rem
        border-bottom 1px solid $section
        .title
          color #fff
          width calc(100% - 80px)
        i
          width 40px
          font-size 20px
          color #ddd
          text-align center
        i.van-icon-delete
          color $theme
  .page
    width 100%
    position absolute
    bottom 0
    z-index 10
    left 0
  .add-loading-form
    .submit-addLoading
      .van-button
        width 80%
</style>
