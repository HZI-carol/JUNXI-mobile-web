<template lang="pug">
van-nav-bar#van-nav-bar(:title="title" :right-text="rightText" @click-left="onClickLeft" :left-arrow='leftArrow'
  @click-right="onClickRight")
    i.right-icon(slot="right" :class='icon' v-if="!rightText")
</template>

<script>
import {
  NavBar
} from 'vant'

export default {
  name: 'NavBar',
  components: {
    'van-nav-bar': NavBar
  },
  props: {
    onClickRight: {
      type: Function,
      default: () => window.VM.$router.push({name: 'home'})
    },
    onClickLeft: {
      type: Function,
      default: () => window.VM.$router.go(-1)
    },
    rightText: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'van-icon van-icon-wap-home'
    },
    title: {
      type: String,
      default: () => window.VM.$route.meta.title || window.VM.$route.params.title
    },
    leftArrow: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
    }
  }
}
</script>
<style lang="stylus">
@import '~@/assets/style/index';
.van-nav-bar#van-nav-bar
  position absolute
  background-color $section
  top 0
  left 0
  height $navbar - 1px
  line-height $navbar - 1px
  width 100%
  &::after
    border none!important
  *
    color #fff!important
    border none
  .right-icon
    font-size 18px
  .van-nav-bar__title
    font-size 16px
  .van-nav-bar__left>i
    font-size 18px
  .van-nav-bar__text:active
    background-color rgba(50, 54, 64, 0.8)
</style>
