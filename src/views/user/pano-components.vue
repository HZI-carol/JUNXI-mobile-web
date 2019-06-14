<template lang="pug">
.pano-components.has-nav
  NavBar(:title='compsInfo.title')

  van-tabs(v-model='curTab' sticky @click='switchTab' v-if="Object.keys(panoInfo).length || Object.keys(projectInfo).length")

    van-tab(:title="compsInfo.type === 3 || compsInfo.type === 6 ? '参数设置' : '本地上传'" :class='"tab-" + curTab')
      .ststus()
        .name 启用状态
        van-switch(v-model="projectInfo.islogo" v-if="compsInfo.type === 1")
        van-switch(v-model="projectInfo.isimage" v-if="compsInfo.type === 5")
        van-switch(v-model="panoInfo.showfx" v-if="compsInfo.type === 3" :active-value='1' :inactive-value='2')
        van-switch(v-model="panoInfo.isloading" v-if="compsInfo.type === 4" :active-value='1' :inactive-value='2')
        van-switch(v-model="panoInfo.ispass" v-if="compsInfo.type === 6" :active-value='1' :inactive-value='2')
        template(v-if="compsInfo.type === 2")
          .name pc
          van-switch(v-model="panoInfo.ispcmusic" :active-value='1' :inactive-value='2')
          .name 手机
          van-switch(v-model="panoInfo.ismobilemusic" :active-value='1' :inactive-value='2')
      //- project logo
      template(v-if="compsInfo.type === 1")
        Upload.upload(showType='section' @onRead='onRead' icon='iconfont iconziyuan' :size='uploadLimit[this.opts.typeid].size')
          p.tac(slot='header') 点击此处上传LOGO
          p.tac.red 建议logo尺寸: 260px*80px 或 200px*200px
        .upload-file
          img(:src='projectInfo.full_logo_url')
      //- project cover
      template(v-if="compsInfo.type === 5")
        Upload.upload(showType='section' @onRead='onRead' icon='iconfont iconziyuan' :size='uploadLimit[this.opts.typeid].size')
          p.tac(slot='header') 点击此处上传封面
          p.tac.red 建议封面尺寸: 200px*200px
        .upload-file
          img(:src='projectInfo.full_image_url')
      //- bgm
      template(v-if="compsInfo.type === 2")
        Upload.upload(showType='section' @onRead='onRead' icon='iconfont iconziyuan' :size='uploadLimit[this.opts.typeid].size' :accept='uploadLimit[this.opts.typeid].accept')
          p.tac(slot='header') 点击此处上传背景音乐
        .upload-file
          .title(v-if="panoInfo.bgmusicurl")
            span {{panoInfo.bgmusicurl.split("|")[0]}}
            i.van-icon.van-icon-play(@click='handlePlay(prefix + panoInfo.bgmusicurl.split("|")[1])' v-if='prefix + panoInfo.bgmusicurl.split("|")[1] != audioSrc')
            i.van-icon.van-icon-pause(@click='handlePlay("")' v-else)
      //- wx -share
      template(v-if="compsInfo.type === 3")
        .box(@click.prevent='curTab = 1')
          Upload.upload-share-cover(label='封面'
            placeholder="点击此处选择封面" icon='van-icon van-icon-plus')
            img(slot='avatar' :src='panoInfo.shareico.includes("http") ? panoInfo.shareico : prefix + panoInfo.shareico')
        van-field(label="分享标题" v-model="panoInfo.sharetitle"  placeholder="请输入分享标题" clearable )
        van-field(label="分享内容" :max="500" placeholder="请输入分享内容" v-model="panoInfo.sharecontent" type="textarea" rows="10" autosize clearable )
      //- loading
      template(v-if="compsInfo.type === 4")
        .loading-content
          .label 当前动画
          .box(@click.prevent='curTab = 1')
            .cur-loading(:style='{backgroundColor: panoInfo.loadinfo.background_color}')
              img(:src='panoInfo.loadinfo.load_img.includes("http") ? panoInfo.loadinfo.load_img : prefix + panoInfo.loadinfo.load_img')
              .time 时长: {{panoInfo.loadinfo.showtime}}毫秒

      //- works lock
      template(v-if="compsInfo.type === 6")
        van-field(label="密码设置" placeholder="请输入作品密码" v-model="panoInfo.passkey" clearable required )
      .submit
        van-button(@click='submit' type='primary' size='small' round) 保存

    van-tab.group-setting(title="素材库选取" v-if="compsInfo.type !== 6")
      template(v-if="compsInfo.type !== 4")
        .ststus
          Upload(showType='slot' @onRead='onReadMat' :size='uploadLimit[opts.typeid].size' :accept='uploadLimit[opts.typeid].accept')
            van-button(type='primary' size='small' round) 上传素材

        .material-list
          div.pr(:class='"material" + "-" + opts.typeid')
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
      //- 加载动画
      template(v-else)
        .ststus
          van-button(@click='isShowLoadingAdd = true' type='primary' size='small' round) 添加素材
        .material-list
          div.pr(:class='"material" + "-" + opts.typeid')
            .item(@click='selectMat(item)' v-for='(item, index) in loadingMaterial.list[opts.page]' :key='item.id' :style='{backgroundColor: item.background_color}')
              img(:src='item.full_load_img')
              .title.omit 时长: {{item.showtime}}毫秒
              i.van-icon.van-icon-delete(v-if='!item.is_system' @click.stop='delMat(item)')

            .null.pac(v-if='!loadingMaterial.count') 暂无数据

        .page
          van-pagination(:items-per-page="opts.pageSize" v-if="loadingMaterial.count" v-model='opts.page'
            @change='handlePageChange' :total-items='loadingMaterial.count' :show-page-size="3" force-ellipses)

    van-tab.group-setting(title="文字转语音素材" v-if="opts.typeid == 8")
      .material-list.material-8
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
  name: 'PanoComponents',
  components: {
    Upload: () => import('@/components/Upload')
  },
  data () {
    return {
      uploadLimit: {
        0: { size: 500 * 1024, accept: 'image/*' },
        3: { size: 204800, accept: 'image/*' },
        8: { size: 15728640, accept: 'audio/*' },
        10001: { size: 5242880, accept: 'image/*' }
      },
      curTab: 0,
      audioSrc: '',
      playList: {},
      prefix: window.$globalconfig.URLS.API,
      compsInfo: {},
      panoInfo: {},
      projectInfo: {},
      opts: {
        page: 1,
        pageSize: 10,
        typeid: -1, // 0项目logo 8音乐素材 3项目封面
        init: false
      },
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
  async created () {
    console.log(this.$route.query)
    let query = this.$route.query
    this.compsInfo = {type: Number(query.compsId), title: query.compsTitle}
    if (this.compsInfo.type === 1 || this.compsInfo.type === 5) {
      this.projectInfo = await this.$api.getProjectInfo(query.projectId)
      this.projectInfo.type = this.compsInfo.type
    } else {
      this.panoInfo = await this.$api.getPanoInfo(query.panoId)
      this.panoInfo.project_id = query.projectId
      this.panoInfo.ismobilemusic = Number(this.panoInfo.ismobilemusic)
      this.panoInfo.ispcmusic = Number(this.panoInfo.ispcmusic)
      this.panoInfo.showfx = Number(this.panoInfo.showfx)
    }
    switch (this.compsInfo.type) {
      case 1:
        this.opts.typeid = 0
        break
      case 2:
        this.opts.typeid = 8
        break
      case 3:
        this.opts.typeid = 10001
        break
      case 5:
        this.opts.typeid = 3
        break
    }
  },
  computed: {
    ...mapGetters(['material', 'textToAudio', 'loadingMaterial'])
  },
  methods: {
    switchTab (idx) {
      this.audioSrc = ''
      if (this.opts.typeid !== -1) {
        if (idx === 1 && this.material[this.opts.typeid].count === -1) {
          this.getMaterial()
        }
        if (idx === 2 && this.textToAudio[0] === -1) {
          this.$store.dispatch('getTextToAudio')
        }
      } else if (idx === 1) {
        console.log(this.loadingMaterial)
        if (this.loadingMaterial.count === -1) {
          this.$store.dispatch('getLoadingList', this.opts)
        }
      }
    },
    handlePageChange () {
      if (this.opts.typeid === -1) {
        this.$store.dispatch('getLoadingList', this.opts)
      } else {
        this.getMaterial()
      }
    },
    onRead (file) {
      if (this.compsInfo.type === 1) {
        this.$api.uploadProjectLogo(file).then(data => {
          this.$vgo.tip('上传成功!', 'success')
          this.projectInfo.full_logo_url = data[0].fullurl
          this.projectInfo.logo_url = data[0].url
        })
      }
      if (this.compsInfo.type === 5) {
        this.$api.uploadProjectCover(file).then(data => {
          this.$vgo.tip('上传成功!', 'success')
          this.projectInfo.full_image_url = data[0].fullurl
          this.projectInfo.image_url = data[0].url
        })
      }
      if (this.compsInfo.type === 2) {
        this.$api.uploadAudio(file).then(data => {
          this.$vgo.tip('上传成功!', 'success')
          this.panoInfo.bgmusicurl = file.title + '|' + data[0].url
        })
      }
      if (this.compsInfo.type === 3) {
        this.$api.uploadMaterial(file).then(data => {
          this.$vgo.tip('上传成功!', 'success')
          this.panoInfo.shareico = data[0].url
        })
      }
      console.log(file)
    },
    onReadMat (file) {
      console.log(file)
      let opts = { title: file.title, type_id: this.opts.typeid }
      let api = ''
      switch (this.compsInfo.type) {
        case 1:
          api = 'uploadProjectLogo'
          break
        case 2:
          api = 'uploadAudio'
          break
        case 3:
          api = 'uploadMaterial'
          break
        case 5:
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
      this.curTab = 0
      if (this.compsInfo.type === 1) { // 项目logo
        this.projectInfo.full_logo_url = item.full_mat_pic
        this.projectInfo.logo_url = item.mat_pic
      }
      if (this.compsInfo.type === 2) { // 背景音乐
        this.panoInfo.bgmusicurl = item.title + '|' + item.mat_file
      }
      if (this.compsInfo.type === 3) { // share
        this.panoInfo.shareico = item.mat_pic
      }
      if (this.compsInfo.type === 4) { // loading
        this.panoInfo.fk_userpano_load_id = item.userpano_load_id
        this.panoInfo.loadinfo.background_color = item.background_color
        this.panoInfo.loadinfo.load_img = item.full_load_img
        this.panoInfo.loadinfo.pc_load_img = item.full_pc_load_img
        this.panoInfo.loadinfo.showtime = item.showtime
      }
      if (this.compsInfo.type === 5) { // 项目 封面
        this.projectInfo.full_image_url = item.full_mat_pic
        this.projectInfo.image_url = item.mat_pic
      }
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
    },
    submit () {
      if (this.compsInfo.type === 1 || this.compsInfo.type === 5) {
        this.$api.updateProjectLogoOrCover(this.projectInfo).then(data => {
          this.$router.go(-1)
          this.$vgo.tip('操作成功!', 'success')
        })
      } else {
        this.panoInfo.type = this.compsInfo.type
        this.$api.updatePano(this.panoInfo).then(data => {
          this.$router.go(-1)
          this.$vgo.tip('操作成功!', 'success')
        })
      }
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.pano-components
  .ststus
    display flex
    justify-content space-between
    align-items center
    height 50px
    padding 0 .2rem
    color #ddd
    border-bottom 1px solid $section
    .name
      font-size $small-font
  .van-tabs
    height 100%
  .van-tabs__wrap
    margin-top 1px
  .van-tabs__content
    // $h = 50px + 46px + $navbar
    // height 'calc(100vh - %s)' %$h
    height 100%
    .tab-0
      overflow-y auto
      -webkit-overflow-scrolling: touch
      padding-bottom 60px
    .van-tab__pane
      height 100%
      font-size 14px
      .upload-share-cover
        .upload--box
          width 120px
          height 120px
      .upload-file
        border-top 1px solid $section
        padding-top .3rem
        width 100%
        text-align center
        .title
          font-size $big-font
          color #ddd
          line-height 30px
          display flex
          align-items center
          padding 0 .3rem
          padding-bottom .3rem
          justify-content space-between
          border-bottom 1px solid $section
          i
            font-size 20px
        img
          max-width 100%
      .loading-content
        display flex
        padding .2rem
        color #ddd
        $w = 80px
        .label
          width 80px
        .box
          width calc(100% - 80px)
          .cur-loading
            width 100%
            height 100px
            position relative
            text-align center
            img
              max-width 100%
              max-height 100%
            .time
              position absolute
              bottom 0
              left 0
              width 100%
              height 30px
              line-height 30px
              background-color rgba(#000, .5)
              color #fff
      .material-list
        height calc(100% - 90px)
        overflow-y auto
        -webkit-overflow-scrolling: touch
        .material-0, .material-10001, .material--1, .material-3
          min-height 100px
          padding .2rem
          display flex
          flex-wrap wrap
          justify-content space-between
          .item
            width 49%
            background-color $section
            margin-bottom .2rem
            height 80px
            position relative
            text-align center
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
        width 100%
        height 100%
        min-height 100px
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
  .submit
    width 100%
    height 50px
    justify-content center
    display flex
    align-items center
    position fixed
    bottom 0
    left 0
    background-color $section
    .van-button
      width 86%
  .page
    width 100%
    position absolute
    bottom 0
    left 0
  .add-loading-form
    .submit-addLoading
      .van-button
        width 80%
</style>
