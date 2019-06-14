<template lang='pug'>
  .basic-not-found
    .basic-container
      .exception-content
        img.imgException(src="https://img.alicdn.com/tfs/TB1txw7bNrI8KJjy0FpXXb5hVXa-260-260.png")
      .exception-content
        .title 抱歉，你访问的页面不存在
        div
          router-link(to="/")
            p.description 您要找的页面没有找到，请返回
              span.a 首页
              span 继续浏览
</template>

<script>

export default {
  data () {
    return {
    }
  }
}

</script>

<style lang="stylus" scoped>
.basic-not-found
  width 100vw
  height 100vh
  display flex
  justify-content center
  align-items center
.exception-content
  display: flex
  flex-direction column
  align-items: center
  justify-content: center
  .title
    color: #fff

  .description
    color: #ddd

.exception-content
  margin-top 30px
  .imgException
    width 100px
    height 100px
  .title
    font-size: 20px
  .description
    font-size: 14px
  .a
    color #9c0
    text-decoration underline
</style>
