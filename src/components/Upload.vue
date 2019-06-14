<template lang="pug">
.upload-custom.upload
  template(v-if="showType === 'label'")
    .van-cell.van-field(:class='required ? "van-cell--required" : "van-cell"')
      .van-cell__title.van-field__label {{label}}
      .v--uploader
        input.upload--input(type="file" ref='fileInput' :accept="accept"  @change="readFile" v-bind="$attrs")
        .upload--box.pr
          i.pac(:class='icon')
          .text {{placeholder}}
          .cover.pac
            slot(name='avatar')
  template(v-if="showType === 'section'")
    .v--uploader.upload-type--2
      input.upload--input(type="file" ref='fileInput' :accept="accept"  @change="readFile" v-bind="$attrs")
      slot(name='header')
      .upload--box.pr
        i.pac(:class='icon')
      .buttom
        slot
  template(v-if="showType === 'slot'")
    .v--uploader.upload-type--3
      input.upload--input(type="file" ref='fileInput' :accept="accept"  @change="readFile" v-bind="$attrs")
      slot
</template>

<script>
export default {
  name: 'Upload',
  props: {
    showType: {
      type: String,
      default: 'label'
    },
    onRead: {
      type: Function,
      default: () => { }
    },
    placeholder: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'iconfont iconplus-add'
    },
    label: {
      type: String,
      default: ''
    },
    accept: {
      type: String,
      default: 'image/*'
    },
    required: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 0
    },
    isThumb: '',
    maxRatio: {
      type: Number,
      default: 0
    },
    miniRatio: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
    }
  },
  methods: {
    vread (f) {
      console.log(f)
    },
    readFile (e) {
      let fileArr = this.$refs.fileInput.files
      console.log(fileArr)
      for (let i = 0; i < fileArr.length; i++) {
        this.$vgo.openLoading()
        const item = fileArr[i]
        if (this.size && this.size < item.size) {
          this.$vgo.tip('文件过大!', 'fail')
          continue
        }
        if (!this.typeFilter(item.type)) continue
        let fileObj = {
          file: item,
          title: item.name.slice(0, item.name.lastIndexOf('.'))
        }
        let reader = new FileReader()
        reader.readAsDataURL(item)

        reader.onload = (res) => {
          let content = res.target.result // 图片的src

          fileObj.base64 = content

          if (this.isThumb || this.maxRatio || this.minRatio) {
            let img = new Image()
            img.src = content
            img.onload = () => {
              let ratio = img.width / img.height
              if ((this.maxRatio && this.maxRatio < ratio) || (this.miniRatio && this.miniRatio > ratio)) {
                this.$vgo.tip('请按规定比例上传图片!', 'fail')
                this.$vgo.closeLoading()
                return
              }
              if (this.isThumb) {
                this.toThumb(img, fileObj.file.type).then(res => {
                  fileObj.thumbUrl = res
                  this.$emit('onRead', fileObj)
                  this.$vgo.closeLoading()
                  this.$refs.fileInput.value = ''
                })
              } else {
                this.$vgo.closeLoading()
                this.$emit('onRead', fileObj)
              }
            }
          } else {
            this.$emit('onRead', fileObj)
            this.$vgo.closeLoading()
            this.$refs.fileInput.value = ''
          }
        }
      }
    },
    typeFilter (type) {
      let pre = type.split('/')
      if (this.accept.includes('*') && this.accept.includes(pre[0])) return true
      if (!this.accept.includes(pre[0])) {
        this.$vgo.closeLoading()
        this.$vgo.tip('请选择正确的类型!', 'fail')
        return false
      } else if (!this.accept.includes(pre[1])) {
        this.$vgo.tip('请选择正确的类型!', 'fail')
        this.$vgo.closeLoading()
        return false
      }
      return true
    },
    toBlobUrl (dataurl) {
      let arr = dataurl.split(',')

      let type = arr[0].match(/:(.*?);/)[1]
      let bytes = window.atob(arr[1])
      let ab = new ArrayBuffer(bytes.length)
      let ia = new Uint8Array(ab)
      for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }
      let blob = new Blob([ab], { type })
      return URL.createObjectURL(blob)
    },
    toThumb (img, type) {
      return new Promise((resolve, reject) => {
        // canvas对图片进行缩放
        let originWidth = img.width
        let originHeight = img.height
        // 最大尺寸限制
        let maxWidth = 300
        let maxHeight = 300
        // 目标尺寸
        let targetWidth = originWidth
        let targetHeight = originHeight
        // 图片尺寸超过400x400的限制
        if (originWidth > maxWidth || originHeight > maxHeight) {
          if (originWidth / originHeight > maxWidth / maxHeight) {
            // 更宽，按照宽度限定尺寸
            targetWidth = maxWidth
            targetHeight = Math.round(maxWidth * (originHeight / originWidth))
          } else {
            targetHeight = maxHeight
            targetWidth = Math.round(maxHeight * (originWidth / originHeight))
          }
        }
        let canvas = document.createElement('canvas')
        let context = canvas.getContext('2d')
        canvas.width = targetWidth
        canvas.height = targetHeight
        // 清除画布
        context.clearRect(0, 0, targetWidth, targetHeight)
        // 图片压缩
        context.drawImage(img, 0, 0, targetWidth, targetHeight)
        // canvas转为blob并上传

        canvas.toBlob(blob => {
          resolve(URL.createObjectURL(blob))
        }, type)
      })
    }
  }
}
</script>
<style lang="stylus">
@import '~@/assets/style/index';
.v--uploader
  position relative
  display inline-block
  z-index 0
  font-size $small-font
  color #fff
  .upload--input
    position absolute
    top 0
    right 0
    bottom 0
    left 0
    z-index 1
    width 100%
    height 100%
    opacity 0
    cursor pointer
.upload-custom
  .upload--box
    text-align center
    color #fff
    width 100px
    height 100px
    border 1px dashed #eee
    border-radius 12px
    line-height 30px
    position relative
    text-shadow 0 0 3px #000
    i
      margin-bottom 10px
      font-size 30px
    .text
      font-size 12px
      position absolute
      width 100%
      text-align center
      bottom 0
    .cover
      width 100%
      height 100%
      z-index -1
      img
        width 100%
        height 100%
  .upload-type--2
    width 100%
    padding .2rem 0
    color #fff
    .upload--box
      width 100%
      height 100px
      border none
      i
        font-size 50px
</style>
