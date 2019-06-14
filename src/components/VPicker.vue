<template lang="pug">
.v-picker
  .van-cell.van-field(:class='required ? "van-cell--required": ""')
    .van-cell__title.van-field__label(v-if="label") {{label}}
    .van-cell__value(@click='show')
      .van-field__body
        .van-field__control(:class='value || name ? "has-val" : ""') {{value || name || placeholder}}
        .van-field__right-icon
          i(:class='icon')

  template(v-if="actions.length")
    van-actionsheet(v-model="isShow" get-container='body' :actions="actions" @select="onSelect" cancel-text="取消")

</template>

<script>

export default {
  name: 'VPicker',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入'
    },
    actions: {
      type: Array,
      default: () => []
    },
    icon: {
      type: String,
      default: 'van-icon van-icon-arrow-down'
    },
    required: '',
    select: {
      type: Function,
      default: () => {}
    }
  },
  data () {
    return {
      isShow: false,
      name: ''
    }
  },
  methods: {
    show () {
      if (this.actions.length) {
        this.isShow = !this.disabled
      } else {
        this.select()
      }
    },
    onSelect (item) {
      this.name = item.name
      for (const key in item) {
        this.$emit('update:' + key, item[key])
      }
      this.$emit('update:value', item.name)
      this.isShow = false
    }
  }
}
</script>
<style lang="stylus">
@import '~@/assets/style/index';
.v-picker
  .van-field__control
    color #bbb
    text-align left
    &.has-val
      color #333
</style>
