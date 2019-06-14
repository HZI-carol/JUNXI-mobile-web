<template lang="pug">
.create-pano-project-publish.has-nav
  NavBar()
  .upload-section
    Upload.upload(@onRead='onRead' showType='section' accept='image/jpg, image/jpeg'
      placeholder="" icon='iconfont iconziyuan' :maxRatio='2.002' :miniRatio='1.998' multiple isThumb)
      .tip(slot='header') 点击此处选择全景图
      p.red 请上传2:1全景图仅支持JPG、JPEG格式 大小不超100MB
      //- p.red 建议logo尺寸: 260px*80px 或 200px*200px

  //- transition-group.upload-img(:duration="300", enter-active-class="animated fadeInUp", leave-active-class="animated fadeOutDown")
  transition-group.upload-img(name='fade-transition')
    .item(v-for='(item, index) in panoCache' :key='item.thumbUrl || item.id')
      .item-wrap
        i.del.van-icon.van-icon-delete(@click='delCache(item, index)')
        .name.omit {{item.title}}
        img(:src='item.full_thumb_image_url || item.thumbUrl')

    .item(v-for='(item, index) in flieList' :key='item.thumbUrl')
      .item-wrap
        van-tag(round type='danger' size='medium') 未上传
        i.del.van-icon.van-icon-delete(@click='delCache(item, index)')
        .name.omit {{item.title}}
        img(:src='item.thumbUrl')
        //- van-progress.pac(v-if="item.uid && (item.uid in uploadProgress)" :percentage="50")

  .footer
    //- van-button(@click='submitUpload' type='primary' size='small' round) 上传到服务器
    van-button(@click='submitUpload' type='info' size='small' round) 发布

</template>

<script>

export default {
  name: 'PanoPublish',
  components: {
    Upload: () => import('@/components/Upload')
  },
  data () {
    return {
      panoCache: [],
      flieList: [],
      defaultGroup: ['毛坯', '效果图', '水电', '木工', '泥工', '实景'],
      projectInfo: {},
      percentage: 1
      // toPage: {name: 'user-project', query: {status: -1}} // status 项目状态
    }
  },
  created () {
    this.getPanoCache()
    this.projectInfo = this.$route.query
    // if ('page' in this.projectInfo) this.toPage.query.status = this.projectInfo.page
  },
  mounted () {
  },
  methods: {
    onRead (obj) {
      this.flieList.push(obj)
    },
    delCache (item, index) {
      this.$vgo.open(() => {
        if ('id' in item) {
          this.$api.delPanoCache(item.id).then(data => {
            this.$vgo.tip('操作成功!', 'success')
            this.panoCache.splice(index, 1)
          })
        } else {
          this.$vgo.tip('操作成功!', 'success')
          this.flieList.splice(index, 1)
        }
      })
    },
    submitUpload () {
      if (this.flieList.length) {
        const uploadLimit = 10
        let list = this.flieList.slice(0, uploadLimit)
        this.$api.uploadPano(list).then(data => {
          let opts = data
          opts.map((i, index) => {
            i.thumb_image_url = i.thumburl
            i.pic_url = i.url
            i.title = list[index].title
          })
          this.$api.savePanoToServer(opts).then(data => {
            this.$vgo.tip(`上传成功${list.length}张!`, 'success', { position: 'bottom' })
            data.map((i, index) => {
              list[index].id = i.id
            })
            this.panoCache.push(...list)
            this.flieList.splice(0, uploadLimit)
            if (this.flieList.length) this.submitUpload()
            else this.submitPublish()
          })
        })
      } else if (this.panoCache.length) {
        this.submitPublish()
      } else {
        this.$vgo.tip('请选择文件!', 'fail')
      }
    },
    submitPublish () {
      if (!this.panoCache.length) {
        this.$vgo.tip('请上传全景!', 'fail')
        return
      }
      this.$api.publishPanorama(this.projectInfo).then(data => {
        this.panoCache = []
        let panoId = data
        this.getStatus(panoId)
      })
    },
    getPanoCache () {
      this.$api.getPanoUpdateCache().then(data => {
        this.panoCache = data
      })
    },
    getStatus (panoId, type = 'panos') {
      this.$vgo.openLoading(`全景云端处理中, 请耐心等待: ${this.percentage}%`)
      let nextProgress, serverProgress, cur, total
      this.timer = setInterval(() => {
        this.$api.checkPublishStatus(type, panoId).then(data => {
          cur = data.created_count
          total = data.total_count
          serverProgress = Number((cur / total).toFixed(2)) * 100
          if (serverProgress < 100) {
            nextProgress = Number(((cur + 1) / total).toFixed(2)) * 100
          }
          if (this.percentage < (nextProgress - 3)) {
            this.percentage += 1
          }
          if (this.percentage < serverProgress) {
            this.percentage = serverProgress
          }
          this.$vgo.toast2.message = `全景云端处理中, 请耐心等待: ${this.percentage}%`
          if (serverProgress === 100) {
            this.$api.projectConnectPano(this.projectInfo.id, panoId).then(data => { })
            // 给客户默认生成6个分组
            this.defaultGroup.map(item => {
              this.$api.addPanoSceneGroup(panoId, item).then(data => { })
            })
            setTimeout(() => {
              this.isShow = false
              this.percentage = 0
              clearInterval(this.timer)
              this.timer = null
              window.location.href = window.$globalconfig.URLS.M_EDITOR + panoId
            }, 500)
          }
        })
      }, 3000)
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.create-pano-project-publish
  .upload-section
    text-align center
    background-color $section
    color #ccc
    .tip
      color #fff
      font-size 16px
  .upload-img
    display block
    padding .2rem .1rem
    $h = $navbar + 158px + 55px
    height 'calc(100vh - %s)' % $h
    -webkit-overflow-scrolling: touch
    overflow-y auto
    .item
      transition all 0.7s
      display inline-block
      width 50%
      padding 0 .1rem
      margin-bottom .2rem
      .item-wrap
        position relative
        border-radius 5px
        overflow hidden
        height 100px
        .van-tag
          position absolute
          top 5px
          left 5px
        .del
          position absolute
          top 0
          right 0
          width 30px
          height 30px
          font-size 18px
          line-height 30px
          text-align center
          background-color rgba(#000, 0.5)
          color red
        .name
          position absolute
          bottom  0
          left 0
          color #fff
          padding 10px 5px 0
          line-height 20px
          height 30px
          width 100%
          font-size 12px
          background-image: linear-gradient( 0deg, rgba(#000, 0.5) 0%, rgba(#000, 0) 100%)
        img
          width 100%
          height 100%
        .el-progress
          position absolute!important
          .el-progress__text
            color #fff
            text-shadow 0 0 3px #000
  .footer
    position fixed
    bottom 0
    left 0
    display flex
    justify-content space-around
    align-items center
    height 50px
    background-color $section
    width 100%
    .van-button
      width 40%

.fade-transition-enter,.fade-transition-leave-to
  opacity: 0
  transform: translateY(30px)

.fade-transition-leave-active
  position: absolute
</style>
