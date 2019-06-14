<template lang="pug">
.user-pano.has-nav
  NavBar()

  van-tabs(@click='switchTab' v-model="tabIndex")

    van-tab.pano-setting(title="全景设置")
      .options
        VPicker(:value='curGroup.name' :select='() => isShowOpts = true')
        van-button(:url='curGroup.panoview_url' size='small' round type='primary') 预览
        Upload.top(@onRead='onRead' accept='image/jpg, image/jpeg' showType='slot'
          icon='van-icon van-icon-plus' multiple  :maxRatio='2.002' :miniRatio='1.998' :size='100*1024*1024')
          van-button(size='small' round type='primary') 上传
        van-button(@click='submitSceneSort' size='small' round type='info') 保存排序

      transition-group.scene(name='fade-transition')
        .item(v-for="(item, index) in curGroup.scenelist" :key="item.scene_id" )
          .top
            img(:src='item.full_thumburl' @click='$set(item, "selected", !item.selected)')
            i.select-scene.pac.van-icon.van-icon-passed(v-if='item.selected' @click='item.selected = !item.selected')
            .left-opts.opts
              .opt-item.van-icon.van-icon-arrow-left(v-if='index' @click='sortScene(item, index, -1)')
              .opt-item.van-icon.van-icon-arrow(v-if='(index + 1) < curGroup.scenelist.length' @click='sortScene(item, index, 1)')
            .right-opts.opts
              a.opt-item.van-icon.van-icon-edit(@click="openRename(item, index)")
              .opt-item.van-icon.van-icon-delete(@click='delPanoScene(item, index)')
          .title.omit {{item.title}}

        .null.pac(v-if="curGroup.scenelist && !curGroup.scenelist.length" :key='-2') 暂无数据
        .bottom-opts(:key='-3' )
          van-button(v-if='getSelectedScene.length' @click='submitSceneMove' size='small' round type='info') 移动场景
          van-button(:url='M_EDITOR + curGroup.pano_id' size='small' round type='info') 编辑全景

    van-tab.pano-components(title="全景组件")
      template(v-for="(item, index) in compsList")
        .router-item(:key="index" v-if='item.id'  @click='goCompsPage(item)')
          .name {{item.name}}
          .van-icon.van-icon-arrow
        .switch-item(:key="index" v-else)
          .name {{item.name}}
          van-switch(v-model="item.value" :active-value='1' :inactive-value='2')
      .pano-info-submit-button
        van-button(@click='submitPanoInfo' size='small' round type='primary') 保存

    van-tab.group-setting(title="分组设置")
      .options
        van-button(@click='isShowAddGroup = true' size='small' round type='primary') 添加分组
        van-button(@click='submitSceneGroupSort' size='small' round type='info') 保存排序
      transition-group.group(name='fade-transition')
        .group-item(v-for='(item, index) in sceneList' :key='item.groupid')
          .name
            .text.omit {{ item.name }}
          .options(v-if="index")
            i.up.van-icon.van-icon-upgrade(v-if='index > 1' @click='sortGroup(item, index, -1)')
            i.down.van-icon.van-icon-upgrade(v-if='(index + 1) < sceneList.length' @click='sortGroup(item, index, 1)')

            i.blue.van-icon.van-icon-edit(@click='openRenameGroup(item, index)')

            i.red.van-icon.van-icon-delete(v-if='sceneList.length > 1' @click='delGroup(item, index)')
            //- van-switch(:value="item.isdefault" @input="changeDefault(item)")

  van-actionsheet(v-model="isShowOpts" :actions="sceneList" @select="onSelect" cancel-text="取消")

  van-actionsheet.rename-dialog(v-model="isShowRename" title="名场景重命名")
    .placeholder
      van-button.item(v-for="item in renamePlaceholder" @click='curRenameScene.title = item'
        :key="item" size='small' round plain type="primary") {{item}}
    .form
      van-field(v-model="curRenameScene.title" placeholder="请输入场景名称" clearable required )
      van-button(@click='submitSceneReName' size='small' round type='primary') 保存

  van-actionsheet.add-group-dialog(v-model="isShowAddGroup" :title="'groupid' in curRenameGroup ? '重命名分组' : '添加分组'")
    .placeholder
      van-button.item(v-for="item in addGroupPlaceholder" @click='curRenameGroup.name = item'
        :key="item" size='small' round plain type="primary") {{item}}
    .form
      van-field(v-model="curRenameGroup.name" placeholder="请输入分组名称" clearable required )
      van-button(@click='submitAddOrRenameGroup' size='small' round type='primary') 保存

</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'UserPano',
  components: {
    Upload: () => import('@/components/Upload')
  },
  data () {
    return {
      M_EDITOR: window.$globalconfig.URLS.M_EDITOR,
      tabIndex: 0,
      sceneList: [],
      // tab-1
      isShowOpts: false,
      isShowRename: false,
      isShowAddGroup: false,
      isMoveScene: false,
      groupName: '',
      curRenameScene: {},
      renamePlaceholder: [],
      addGroupPlaceholder: ['毛坯', '效果图', '水电', '木工', '泥工', '实景'],
      curGroup: {},
      actions: [
        { id: 1, name: '全部' },
        { id: 2, name: '别墅' },
        { id: 3, name: '效果图' },
        { id: 4, name: '效果图' }
      ],
      panoAddlist: [],
      // tab-2
      panoInfo: {},
      compsList: [
        { name: '项目LOGO', id: 1 },
        { name: '背景音乐', id: 2 },
        { name: '微信分享', id: 3 },
        { name: '加载动画', id: 4 },
        { name: '项目封面', id: 5 },
        { name: '作品密码', id: 6 },

        { name: '陀螺仪', field: 'isongyro', value: 2 },
        { name: '是否陀螺仪显示', field: 'showgyro', value: 2 },
        { name: 'VR模式', field: 'showvr', value: 2 },
        { name: '作者', field: 'hideuser', value: 2 },
        { name: '点赞', field: 'isonpraise', value: 2 },
        { name: '天气', field: 'isweather', value: 2 },
        { name: '自动旋转', field: 'isonautoturn', value: 2 },
        { name: '打赏', field: 'isds', value: 2 },
        { name: 'PC端自动切换', field: 'isonpcautoswitch', value: 2 },
        { name: '手机端自动切换', field: 'isonmobileturn', value: 2 },
        { name: '是否发布', field: 'ison', value: 2 }
      ],
      // tab-3
      selectAll: true,
      curRenameGroup: {name: ''}
    }
  },

  created () {
    this.$api.getSceneNameTags().then(data => {
      this.renamePlaceholder = []
      data.list.map(item => {
        this.renamePlaceholder.push(item.scene_name)
      })
    })
  },
  mounted () {
  },
  activated () {
    if (!('id' in this.$route.query)) this.$router.go(-1)

    this.projectInfo = this.$route.query
    this.curGroup = {}
    this.panoInfo = {}
    if (this.tabIndex === 0) {
      this.getPanoScene()
    } else if (this.tabIndex === 1) {
      this.getPanoInfo()
    } else if (this.tabIndex === 2) {
      // this.getPanoInfo()
    }
  },
  computed: {
    ...mapGetters(['companyInfo']),
    getSelectedScene () {
      let ids = []
      if (this.curGroup.scenelist) {
        this.curGroup.scenelist.map(i => {
          if (i.selected) ids.push(i.scene_id)
        })
      }
      return ids
    }

  },
  methods: {
    switchTab (index) {
      if (index === 0 && !Object.keys(this.curGroup).length) {
        this.getPanoScene()
      } else if (index === 1 && !Object.keys(this.panoInfo).length) {
        this.getPanoInfo()
      } else if (index === 2) {
        // this.getPanoInfo()
      }
    },
    // pano manage tab1
    onSelect (item) {
      if (this.isMoveScene) {
        this.isMoveScene = false
        this.$api.movePanoScene(item.groupid, this.getSelectedScene).then(data => {
          this.$vgo.tip('操作成功!', 'success')
          this.getPanoScene(this.sceneList.indexOf(this.curGroup))
        })
      } else {
        this.curGroup = item
      }
      this.isShowOpts = false
    },
    getPanoScene (curGroup = 0) {
      this.$api.getPanoScene(this.projectInfo.fk_pano_id).then(data => {
        data.map(i => { i.name = i.album })
        this.sceneList = data
        this.curGroup = this.sceneList[curGroup]
      })
    },
    delPanoScene (item, index) {
      this.$vgo.open(() => {
        this.$api.delPanoScene(item.scene_id).then(data => {
          this.curGroup.scenelist.splice(index, 1)
          this.$vgo.tip('操作成功!', 'success')
        })
      })
    },
    openRename (item, index) {
      this.isShowRename = true
      this.curRenameScene = JSON.parse(JSON.stringify(item))
      this.curRenameScene.index = index
    },
    submitSceneReName () {
      if (!this.curRenameScene.title) {
        this.$vgo.tip('请填写场景名称!', 'fail')
        return
      }
      this.$api.updatePanoSceneName(this.curRenameScene).then(data => {
        this.curGroup.scenelist[this.curRenameScene.index].title = this.curRenameScene.title
        this.$vgo.tip('操作成功!', 'success')
        this.isShowRename = false
      })
    },
    onRead (file) {
      this.$api.uploadScene(file, this.curGroup.pano_id).then(data => {
        this.panoAddlist.push(data[0].scene_id)
        this.$vgo.openLoading('全景云端处理中, 请耐心等待')
        if (this.timer) return
        this.timer = setInterval(() => {
          this.$vgo.toast2.message = '全景云端处理中, 请耐心等待'
          this.$api.checkPublishStatus('panos', this.projectInfo.fk_pano_id).then(data => {
            let cur = data.created_count
            let total = data.total_count
            if (cur === total) {
              // 添加到分组
              this.$api.addPanoScene(this.curGroup.groupid, this.panoAddlist).then(() => {
                this.panoAddlist = []
                this.$vgo.tip('处理完成!', 'success')
                this.getPanoScene(this.sceneList.indexOf(this.curGroup))
                clearInterval(this.timer)
                this.timer = null
              })
            }
          })
        }, 3000)
      })
    },
    sortScene (item, index, state) {
      this.curGroup.scenelist.splice(index, 1)
      this.curGroup.scenelist.splice(index + state, 0, item)
    },
    submitSceneSort () {
      let ids = []
      this.curGroup.scenelist.map(i => { ids.push(i.scene_id) })
      this.$api.sortPanoScene(this.curGroup.pano_id, ids).then(data => {
        this.$vgo.tip('操作成功!', 'success')
      })
    },
    submitSceneMove () {
      this.isShowOpts = true
      this.isMoveScene = true
    },
    // pano-components settiong tab2
    getPanoInfo () {
      this.$api.getPanoInfo(this.projectInfo.fk_pano_id).then(data => {
        this.panoInfo = data
        this.compsList.map(item => {
          if (item.field) {
            item.value = this.panoInfo[item.field]
          }
        })
      })
    },

    submitPanoInfo () {
      let opts = { type: 7, pano_id: this.projectInfo.fk_pano_id, project_id: this.projectInfo.id }
      this.compsList.map(item => {
        if (item.field) {
          opts[item.field] = item.value
        }
      })
      this.$api.updatePano(opts).then(data => {
        this.$vgo.tip('操作成功!', 'success')
      })
    },
    goCompsPage (item) {
      this.$router.push({
        name: 'pano-components',
        query: {
          panoId: this.projectInfo.fk_pano_id,
          projectId: this.projectInfo.id,
          compsId: item.id,
          compsTitle: item.name
        }
      })
    },

    // group setting tab3
    submitAddOrRenameGroup () {
      if (!this.curRenameGroup.name) {
        this.$vgo.tip('请输入分组名称!', 'fail')
        return
      }
      if ('groupid' in this.curRenameGroup) {
        this.saveGroupName(this.curRenameGroup)
      } else {
        this.addGroup(this.curRenameGroup.name)
      }
    },
    addGroup (name) {
      this.$api.addPanoSceneGroup(this.projectInfo.fk_pano_id, name).then(data => {
        this.$set(this.sceneList, this.sceneList.length, {
          album: name,
          name: name,
          groupid: data.groupid,
          pano_id: this.projectInfo.fk_pano_id,
          panoview_url: window.$globalconfig.URLS.PANO_VIEW_PREFIX + this.projectInfo.fk_pano_id,
          scenelist: []
        })
        this.$vgo.tip('操作成功!', 'success')
        this.isShowAddGroup = false
        this.curRenameGroup = {name: ''}
      })
    },
    saveGroupName (item) {
      this.$api.reNamePanoSceneGroup(item.pano_id, item.groupid, item.name).then(data => {
        this.sceneList[item.index].name = item.name
        this.$vgo.tip('操作成功!', 'success')
        this.isShowAddGroup = false
        this.curRenameGroup = {name: ''}
      })
    },
    delGroup (item, index) {
      this.$vgo.open(() => {
        this.$api.delPanoSceneGroup(item.pano_id, item.groupid).then(data => {
          this.$vgo.tip('操作成功!', 'success')
          this.sceneList.splice(index, 1)
        })
      })
    },
    openRenameGroup (item, index) {
      this.curRenameGroup = JSON.parse(JSON.stringify(item))
      this.curRenameGroup.index = index
      this.isShowAddGroup = true
    },
    sortGroup (item, index, state) {
      this.sceneList.splice(index, 1)
      this.sceneList.splice(index + state, 0, item)
    },
    submitSceneGroupSort () {
      let ids = []
      this.sceneList.map(i => {
        if (i.groupid > 0) ids.push(i.groupid)
      })
      this.$api.sortPanoSceneGroup(this.projectInfo.fk_pano_id, ids).then(data => {
        this.$vgo.tip('操作成功!', 'success')
      })
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index';
.user-pano
  .van-tabs
    height 100%
  .van-tabs__wrap
    margin-top 1px
  .van-tabs__content
    height 100%
  .van-tab__pane
    font-size 14px
    height 100%
    overflow-y auto
    -webkit-overflow-scrolling: touch
    &>.options
      background-color $section
      padding 0 20px
      height 55px
      align-items center
      display flex
      .van-field
        padding 0
        width 110px
      a,.van-button:not(:first-child)
        margin-left 10px
  .pano-setting
    .scene
      padding .2rem 0 .8rem
      height calc(100% - 55px)
      -webkit-overflow-scrolling: touch
      overflow-y auto
      display block
      .bottom-opts
        position fixed
        bottom .2rem
        right 0rem
        .van-button
          margin-right 10px
      .item
        vertical-align top
        transition all 0.3s
        display inline-block
        margin-bottom .2rem
        margin-left .2333rem
        width 170px
        .top
          height 150px
          width 100%
          position relative
          background-color #eee
          font-size 30px
          display flex
          justify-content center
          align-items center
          .select-scene
            color $success
            background-color rgba(#fff, .8)
            border-radius 50%
          .van-icon.van-icon-plus
            text-shadow none
            font-size 40px
            font-weight normal
            color #aaa
          img
            height 100%
            width 100%
          .is-first
            position absolute
            top 0px
            left 5px
            // .van-tag
          .opts
            color #fff
            background-color rgba(#000, .5)
            position absolute
            top 0
            right 0
            width 25px
            height 100%
            display flex
            flex-direction column
            justify-content space-around
            &.left-opts
              left 0
              right auto
            .opt-item
              font-size 16px
              display flex
              color #fff
              align-items center
              justify-content center
              width 100%
        .title
          line-height 30px
          color #ddd
          width 100%
          text-align center

  .pano-components
    padding-bottom 50px
    .router-item,.switch-item
      display flex
      justify-content space-between
      align-items center
      height 50px
      padding 0 .2rem
      color #ddd
      border-bottom 1px solid $section
      .name
        font-size $small-font
      // .van-icon.van-icon-arrow
    .pano-info-submit-button
      position fixed
      bottom 0
      left 0
      height 50px
      line-height 50px
      text-align center
      z-index 1
      background-color $section
      width 100%
      .van-button
        width 80%
  .group-setting
    .group
      display block
      height calc(100% - 55px)
      overflow-y auto
      -webkit-overflow-scrolling: touch
      .group-item
        border-bottom 1px solid $border
        line-height 50px
        height 50px
        display flex
        align-items center
        justify-content space-between
        color #fff
        padding 0 .2rem
        transition all 0.5s
        .name
          width 205px
          .van-cell
            padding 0
          .text
            width 100%
            font-size $big-font
        .options
          width 145px
          display flex
          align-items center
          justify-content flex-end
          i
            margin-right 0.2rem
            font-size 23px
          .down
            transform rotateZ(180deg)

  .rename-dialog,.add-group-dialog
    .placeholder
      display flex
      flex-wrap wrap
      padding 10px 0 10px 10px
      .item
        margin 10px 10px 0 0
    .set-default
      text-align center
      height 50px
      padding-top 10px
      .van-button
        vertical-align top
        width 70%
    .form
      display flex
      align-items center
      padding 0 10px 20px
      .van-field
        padding 0
        margin-right 20px
        .van-field__body
          background-color #ddd

.fade-transition-enter,.fade-transition-leave-to
  opacity: 0
  transform: translateY(30px)

.fade-transition-leave-active
  position: absolute
</style>
