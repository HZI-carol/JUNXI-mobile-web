/* eslint-disable no-undef */
import CookieJs from 'js-cookie'
export default {
  title (title) {
    let iTitle = $globalconfig.PLATFORM_NAME
    if (title) {
      iTitle += ' - ' + title
    }
    window.document.title = iTitle
  },
  copyText (text) {
    let tempInput = document.createElement('input')
    tempInput.value = text
    document.body.appendChild(tempInput)
    tempInput.select() // 选择对象
    document.execCommand('Copy') // 执行浏览器复制命令
    document.body.removeChild(tempInput)
    VM.$vgo.tip('复制成功!', 'success')
  },
  auth: {
    setToken (userInfo) {
      CookieJs.set('UserAccount', userInfo, { expires: 1 })
    },
    getToken () {
      let token
      if (process.env.NODE_ENV !== 'production' && window.location.href.includes('access_token')) {
        let userInfo = window.location.href.slice(window.location.href.indexOf('access_token'))
        let arr = userInfo.split('&')
        let expires = arr[1].split('=')[1]
        expires = expires / 60 / 60 / 24
        CookieJs.set('UserAccount', userInfo, { expires })
        token = CookieJs.getJSON('UserAccount')
      } else if (document.cookie.includes('access_token')) {
        token = document.cookie.slice(document.cookie.indexOf('access_token'))
      }
      if (token) {
        token = token.split('&')[0].split('=')[1]
        return token
      }
      return false
    },
    getDeviceType () {
      let result = 'pc'
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { // 判断iPhone|iPad|iPod|iOS
        result = 'ios'
      } else if (/(Android)/i.test(navigator.userAgent)) { // 判断Android
        result = 'android'
      }
      return result
    },
    getUserInfo () {
      if (document.cookie.includes('access_token')) {
        let userInfo = {}
        let arr = document.cookie.split('&')
        arr.map(i => {
          let keyVal = i.split('=')
          userInfo[keyVal[0]] = keyVal[1]
        })
        return userInfo
      }
      return false
    },
    verifyPhone (phone) {
      let re = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
      if (!re.test(phone)) {
        VM.$vgo.tip('请输入正确的手机号!', 'fail')
        return false
      }
      return true
    },
    getGuid () {
      function S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }
      return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    },
    /**
     *
     * @param {String} waitTime 'phoneWait' || 'emailWait' 用于按钮60秒后解禁
     * @param {String || Number} account  phone || email
     * @param {String} vcode 图片验证码
     * @param {String} guid guid
     * @param {String} VUE instance
     * el-button(@click='getVerifyCode' size="mini" type="primary" :disabled='!!phoneWait') 获取验证码{{phoneWait || ''}}
     */
    getVerifyCode (that, waitTime, account, vcode, guid) {
      let api
      if (waitTime === 'phoneWait') {
        if (!this.verifyPhone(account)) return
        api = 'getPhoneVerifyCode'
      }
      if (waitTime === 'emailWait') {
        if (!this.verifyEmail(account)) return
        api = 'getEmailVerifyCode'
      }
      that[waitTime] = 60
      let timer = setInterval(() => {
        if (that[waitTime] > 0) {
          that[waitTime] -= 1
        } else {
          clearInterval(timer)
          timer = null
        }
      }, 1000)
      that.$api[api](account, vcode, guid).then(res => {
        that.$vgo.tip('发送成功!', 'success')
      }).catch(() => { that[waitTime] = 0 })
    },
    verifyBank (cardId) {
      if (cardId.length < 16 || cardId.length > 19) {
        VM.$vgo.tip('银行卡号长度必须在16到19之间!', 'warning')
        return false
      }
      let num = /^\d*$/ // 全数字
      if (!num.test(cardId)) {
        VM.$vgo.tip('银行卡号必须全为数字!', 'warning')
        return false
      }
      let strBin = '10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99'
      if (strBin.indexOf(cardId.substring(0, 2)) === -1) {
        VM.$vgo.tip('银行卡号开头6位不符合规范!', 'warning')
        return false
      }
      if (!this._luhm(cardId)) {
        VM.$vgo.tip('银行卡号开头6位不符合规范!', 'warning')
        return false
      }
      return true
    },
    _luhm (bankno) {
      let lastNum = bankno.substr(bankno.length - 1, 1)
      let first15Num = bankno.substr(0, bankno.length - 1) // 前15或18位
      let newArr = []
      for (let i = first15Num.length - 1; i > -1; i--) { // 前15或18位倒序存进数组
        newArr.push(first15Num.substr(i, 1))
      }
      let arrJiShu = [] // 奇数位*2的积 <9
      let arrJiShu2 = [] // 奇数位*2的积 >9
      let arrOuShu = [] // 偶数位数组
      for (let j = 0; j < newArr.length; j++) {
        if ((j + 1) % 2 === 1) { // 奇数位
          if (parseInt(newArr[j]) * 2 < 9) { arrJiShu.push(parseInt(newArr[j]) * 2) } else { arrJiShu2.push(parseInt(newArr[j]) * 2) }
        } else {
          // 偶数位
          arrOuShu.push(newArr[j])
        }
      }
      let oddNum1 = [] // 奇数位*2 >9 的分割之后的数组个位数
      let oddNum2 = [] // 奇数位*2 >9 的分割之后的数组十位数
      for (let h = 0; h < arrJiShu2.length; h++) {
        oddNum1.push(parseInt(arrJiShu2[h]) % 10)
        oddNum2.push(parseInt(arrJiShu2[h]) / 10)
      }
      let sumJiShu = 0 // 奇数位*2 < 9 的数组之和
      let sumOuShu = 0 // 偶数位数组之和
      let sumJiShuChild1 = 0 // 奇数位*2 >9 的分割之后的数组个位数之和
      let sumJiShuChild2 = 0 // 奇数位*2 >9 的分割之后的数组十位数之和
      let sumTotal = 0
      for (let m = 0; m < arrJiShu.length; m++) {
        sumJiShu = sumJiShu + parseInt(arrJiShu[m])
      }
      for (let n = 0; n < arrOuShu.length; n++) {
        sumOuShu = sumOuShu + parseInt(arrOuShu[n])
      }
      for (let p = 0; p < oddNum1.length; p++) {
        sumJiShuChild1 = sumJiShuChild1 + parseInt(oddNum1[p])
        sumJiShuChild2 = sumJiShuChild2 + parseInt(oddNum2[p])
      }
      // 计算总和
      sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2)
      // 计算Luhm值
      let k = parseInt(sumTotal) % 10 === 0 ? 10 : parseInt(sumTotal) % 10
      let luhm = 10 - k
      console.log(luhm, lastNum)

      if (lastNum === luhm) {
        return true
      } else {
        return false
      }
    }
  }
}
