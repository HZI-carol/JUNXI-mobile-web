<template lang="pug">
.aera-selector
  VPicker(label="所属区域" :select='() => show = !disabled' :value="province + city + area" v-if="showInput" placeholder="请选择地区" :required='!!required' :disabled='disabled')
  //- van-field(label="所属区域" :value="province + city + area" v-if="showInput" right-icon='arrow-down'
  //-   @click='' placeholder="请选择地区" required :disabled='show')
  van-popup(v-model="show" position="bottom" get-container='body')
    van-area(:area-list="areaList" @confirm='submit'
      @cancel='show = false' :columns-num='column')
</template>
<script>
import {
  Area,
  Popup
} from 'vant'
import areaList from '@/plugins/area.js'

export default {
  name: 'AreaSelector',
  components: {
    'van-popup': Popup,
    'van-area': Area
  },
  props: {
    column: {
      type: Number,
      default: 3
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showInput: {
      type: Boolean,
      default: true
    },
    province: {
      type: String,
      default: ''
    },
    provinceId: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    cityId: {
      type: String,
      default: ''
    },
    area: {
      type: String,
      default: ''
    },
    areaId: {
      type: String,
      default: ''
    },
    required: ''
  },
  data () {
    return {
      areaList,
      show: false
    }
  },
  methods: {
    submit (e) {
      this.$emit('update:province', e[0].name)
      this.$emit('update:provinceId', e[0].code)

      if (this.column >= 2) {
        this.$emit('update:city', e[1].name)
        this.$emit('update:cityId', e[1].code)
      }
      if (this.column >= 3) {
        this.$emit('update:area', e[2].name)
        this.$emit('update:areaId', e[2].code)
      }
      this.$emit('change', e)
      this.show = false
    }
  }
}
</script>
<style lang="stylus">
@import '~@/assets/style/index'

</style>
