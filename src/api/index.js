import axios from 'axios'
import qs from 'qs'
import util from '@/plugins/util'

import uploadConfig from './uploadConfig'
const IMAGE_PREFIX = window.$globalconfig.UPLOAD.IMAGE_PREFIX.split('?')[0]
const FILE_PREFIX = window.$globalconfig.UPLOAD.FILE_PREFIX.split('?')[0]

const getToken = () => util.auth.getToken()

axios.defaults.baseURL = window.$globalconfig.URLS.API
axios.defaults.retry = 5
axios.defaults.timeout = 0
axios.defaults.retryDelay = 5000

axios.interceptors.request.use(config => {
  // 在发送请求之前做些什么
  if (!config.noToken) {
    if (getToken()) {
      config.params = Object.assign(config.params || {}, { token: getToken(), t: Date.now() })
    } else {
      // window.VM.$vgo.tip('登录过期!', 'fail')
      window.location.href = window.$globalconfig.URLS.LOGIN
      return new Promise(() => { })
    }
  }
  if (config.method === 'post' && config.isForm) {
    config.data = qs.stringify(config.data)
  }
  window.VM.$vgo.openLoading()
  return config
}, error => {
  // 对请求错误做些什么
  return Promise.reject(error)
})

axios.interceptors.response.use((res) => {
  // 对响应数据做点什么
  let resData = res.data.data
  // 非检查全景生成
  if (!res.config.url.includes('checkstatus')) window.VM.$vgo.closeLoading()
  else if (resData.created_count === resData.total_count) window.VM.$vgo.closeLoading()
  if (res.data.code === 100 || res.data.code === 200) {
    return Promise.resolve(resData)
  } else if (Array.isArray(res.data)) {
    return Promise.resolve(res.data)
  } else {
    window.VM.$vgo.tip(res.data.msg, 'fail')
    return Promise.reject(res.data)
  }
}, err => {
  // 对响应错误做点什么
  window.VM.$vgo.closeLoading()
  if (err.response.status === 401) {
    util.auth.setToken({ expires_in: 0 })
    // window.VM.$vgo.tip('登录过期!', 'fail')
    window.location.href = window.$globalconfig.URLS.LOGIN
    return new Promise(() => { })
  } else if (err.response.status === 500) {
    window.VM.$vgo.tip('服务器未响应!', 'fail')
    return new Promise(() => { })
  } else {
    for (const key in err) console.log(err[key])
  }
  return Promise.reject(err)
})

if (process.env.NODE_ENV === 'production') {
  window.addEventListener('unhandledrejection', event => {
    let msg = event.reason.data || event.reason.msg || event.reason.message || event.reason
    window.VM.$vgo.tip(msg, 'fail')
    console.log(msg || event)
    event.preventDefault()
  })
}
const onUploadProgress = e => { window.VM.$vgo.toast2.message = `已上传: ${Math.min((e.loaded / e.total * 100).toFixed(0), 99)}%` }

const uploadApi = (fileList, action, url = IMAGE_PREFIX) => {
  let formData = new FormData()
  formData.append('action', action)
  if (Array.isArray(fileList)) {
    fileList.map(i => { formData.append('file', i.file) })
  } else {
    formData.append('file', fileList.file)
  }
  return axios({
    method: 'post',
    'Content-Type': 'multipart/form-data',
    url,
    timeout: 0,
    onUploadProgress,
    data: formData
  })
}

export default {
  // login
  login (opts) {
    return axios.post(`api/userlogin/login`, {
      username: opts.username,
      password: opts.password,
      vcode: opts.vcode
    }, { noToken: true, isForm: true })
  },
  register (username, password) {
    return axios.post(`api/userlogin/register`, {
      username: username,
      password: password,
      signature: 'signature',
      timestamp: 'timestamp',
      nonce: 'nonce'
    }, { noToken: true, isForm: true })
  },
  // 用户改密码
  updatePassword (oldpassword, password) {
    return axios.put(`api/user/password?oldpassword=${oldpassword}&password=${password}`, {
    })
  },
  // 获取公司VR
  getCompanyVR () {
    return axios.get(`api/zaigou/user/projectvrs`)
  },
  // 获取项目分类
  getCompanyTypes () {
    return axios.get(`api/zaigou/types`)
  },
  getImgVerifyCode () {
    return `${window.$globalconfig.URLS.API}api/zaigou/front/vcode?sid=`
  },
  // 更新账户绑定信息（1=手机 2=邮箱,4提现帐号）
  upateUserBind (opts) {
    return axios.put(`api/user/account/bind`, {
      type: opts.type,
      vcode: opts.vcode || '',
      email: opts.email || '',
      phone: opts.phone || '',
      bindcardname: opts.bindcardname || '',
      bindcard: opts.bindcard || ''
    })
  },
  // 获取用户信息
  getUserInfo () {
    return axios.get(`api/user/session`)
  },
  // 添加留言
  sendMessage (opts) {
    return axios.post(`api/zaigou/front/comments`, {
      name: opts.name, // 姓名 姓名长度不能超过25个字符
      phone: opts.phone, // 手机号码 接收短信
      content: opts.content, // 留言内容 留言内容长度不能超过1000个字符
      sid: opts.sid, // 标识唯一
      user_id: opts.userId || 0, // 0给平台 > 0给公司
      vcode: opts.vcode// 手机收到的短信码
    }, { noToken: opts.noToken })
  },
  // 获取banner type_id => Banner类型 -1 为全部 0 为用户首页Banner 1 为前端首页广告位
  getBanner (typeId = -1) {
    return axios.get(`api/zaigou/banners/1/5?type_id=${typeId}`, { noToken: true })
  },
  // 获取所有装修风格类型信息
  getDecorationStyles () {
    return axios.get(`api/zaigou/decorationstyles`, { noToken: true })
  },
  // 获取用户全景分类
  getUserPanoCate () {
    return axios.get(`api/user/panocates`)
  },
  // 获取素材 0项目logo 8音乐素材 3项目封面
  getMaterial (opts) {
    return axios.get(`api/user/mats/${opts.page}/${opts.pageSize}?typeid=${opts.typeid}`)
  },
  // 获取文字语言
  getTextToAudio () {
    return axios.get(`plugins/api/ttss/1/100`)
  },
  // 添加素材  注意：当type_id = 6、7时候内容必填 上传type_id>=0 && type_id<=5 的时候 ，，mat_pic是缩略图  、mat_file是原图
  addMaterial (opts) {
    return axios.post(`api/user/mats`, {
      type_id: opts.type_id, // ": 0,
      mat_file: opts.mat_file, // ": "string",
      mat_pic: opts.mat_pic, // ": "string",
      title: opts.title, // ": "string",
      contents: opts.contents, // ": "string",
      straddtime: opts.straddtime, // ": "string",
      type_text: opts.type_text // ": "string"
    })
  },
  // 删除素材
  delMaterial (id) {
    return axios.delete(`api/user/mats/${id}`)
  },
  // 获取全景可选行业分类  全部 传type = -1  全景发布type = 0  视频发布type = 1
  getUserPanoTradeCate (type) {
    return axios.get(`api/user/hottags/${type}`)
  },
  // 获取用户全景标签
  getUserPanoTag () {
    return axios.get(`api/user/tags`, {
      params: {
      }
    })
  },
  // 添加用户全景标签
  addUserPanoTag (tagname) {
    return axios.post(`api/user/tags`, {
      tagname: tagname
    }, { isForm: true })
  },
  // 删除用户全景标签
  delUserPanoTag (tagid) {
    return axios.delete(`api/user/definedtags/${tagid}`, {
    })
  },
  // 获取所有分类类型信息(主页导航)
  getCategoryType () {
    return axios.get(`api/zaigou/types`, { noToken: true })
  },
  // 获取前端精选项目列表
  getProjectList (opts) {
    return axios.get(`api/zaigou/front/projects/${opts.page}/${opts.pageSize}`, {
      params: {
        isrecommond: opts.isrecommond || 1,
        keyword: opts.keyword || ''
      },
      noToken: true
    })
  },
  // 发送手机短信验证码 (用于：用户注册、登录、提交留言) sid必须大于32位GUID，用于第二点验证，code为图形验证码
  getPhoneVerifyCode (phone, code, sid) {
    return axios.post(`api/zaigou/front/send/${phone}?sid=${sid}&code=${code}`, {}, { noToken: true })
  },
  // 获取前端首页(装饰公司)、类型对应公司的列表 首页关键字搜索（企业名称、城市名称、区/县级名称）或文本输入城市名、区/县级名称
  getCompanyList (opts) {
    return axios.get(`api/zaigou/front/frontcompanys/${opts.page}/${opts.pageSize}`, {
      params: {
        keyword: opts.keyword || '',
        city: opts.city,
        type_id: opts.typeId,
        user_id: opts.userId || ''
      },
      noToken: true
    })
  },
  // 根据指定公司信息
  getCompanyInfo () {
    return axios.get(`api/zaigou/user/companys`)
  },
  // 添加公司信息
  addCompanyInfo (opts) {
    return axios.post(`api/zaigou/user/companys`, {
      company_name: opts.company_name, /// 公司或企业名称 长度不能超过100个字符
      type_id: opts.type_id, // 公司类型
      contact_name: opts.contact_name, /// 姓名 长度不能超过25个字符
      contact_phone: opts.contact_phone, /// 联系电话 长度不能超过25个字符
      province: opts.province, /// 省份 长度不能超过25个字符
      province_id: opts.province_id, /// 省份id 长度不能超过25个字符
      city: opts.city, /// 城市名称 长度不能超过25个字符
      city_id: opts.city_id, /// 城市id 长度不能超过25个字符
      area: opts.area, /// 区/县级名称 长度不能超过25个字符
      area_id: opts.area_id, /// 区/县级名称id 长度不能超过25个字符
      address: opts.address, /// 公司详细地址长度不能超过150个字符
      site_url: opts.site_url, /// 网站url
      logo: opts.logo, /// 公司logo
      qrcode_url: opts.qrcode_url, /// 公司公众号二维码url
      license_image_url: opts.license_image_url, /// 营业执照url
      description: opts.description // 公司简介 长度不能超过1000个字符
    })
  },
  // 修改指定公司信息
  updateCompanyInfo (opts) {
    return axios.put(`api/zaigou/user/companys`, {
      company_name: opts.company_name, /// 公司或企业名称 长度不能超过100个字符
      type_id: opts.type_id, // 公司类型
      contact_name: opts.contact_name, /// 姓名 长度不能超过25个字符
      contact_phone: opts.contact_phone, /// 联系电话 长度不能超过25个字符
      province: opts.province, /// 省份 长度不能超过25个字符
      province_id: opts.province_id, /// 省份id 长度不能超过25个字符
      city: opts.city, /// 城市名称 长度不能超过25个字符
      city_id: opts.city_id, /// 城市id 长度不能超过25个字符
      area: opts.area, /// 区/县级名称 长度不能超过25个字符
      area_id: opts.area_id, /// 区/县级名称id 长度不能超过25个字符
      address: opts.address, /// 公司详细地址长度不能超过150个字符
      site_url: opts.site_url, /// 网站url
      logo: opts.logo, /// 公司logo
      qrcode_url: opts.qrcode_url, /// 公司公众号二维码url
      license_image_url: opts.license_image_url, /// 营业执照url
      description: opts.description // 公司简介 长度不能超过1000个字符
    })
  },

  // 公司信息 上传LOGO图
  uploadCompanyLogo (fileList) {
    return uploadApi(fileList, uploadConfig.actions.companyLogo)
  },
  // 公司信息 上传微信二维码
  uploadCompanyQrcode (fileList) {
    return uploadApi(fileList, uploadConfig.actions.companyQrcode)
  },
  // 公司信息 上传营业执照
  uploadCompanyBusinessLicense (fileList) {
    return uploadApi(fileList, uploadConfig.actions.companyBusinessLicense)
  },
  // 根据指定公司对应的项目列表
  getCompanyProjectList (opts) {
    return axios.get(`api/zaigou/front/companys/${opts.page}/${opts.pageSize}?user_id=${opts.userId}`, { noToken: true })
  },
  // 根据指定公司获取公司对应的项目列表
  getUserProjiectList (opts) {
    return axios.get(`api/zaigou/user/projects/${opts.page}/${opts.pageSize}`, {
      params: {
        user_id: opts.userId,
        keyword: opts.keyword,
        day_type: opts.dayType,
        startdt: opts.startdt,
        enddt: opts.enddt,
        status: opts.status // 项目状态0 在建项目 1 竣工项目 2 完工项目 3 停工项目 4 暂停 5 未开工项目（暂时只用到0 2 如有项目为 -1）
      }
    })
  },

  // 创建项目
  createProject (opts) {
    return axios.post(`api/zaigou/user/projects`, {
      project_name: opts.project_name, // '', // 项目名称  长度不能超过100个字符
      contact_name: opts.contact_name, // '', // 联系人 长度不能超过25个字符
      contact_phone: opts.contact_phone, // '', // 联系人电话 长度不能超过25个字符
      cate_id: opts.cate_id, // 0, // 作品分类id
      ison: opts.ison, // 1, // 是否公开 1 公开  2 私密
      tag_id: opts.tag_id, // '旅游，室内，酒店1', // 作品分类id 作品标签 长度不能超过25个字符,最多只能选3个
      trade: opts.trade, // '食', // 作品行业 长度不能超过25个字符
      logo_url: opts.logo_url, // '', // 项目logo(也就是平台logo)
      province: opts.province, // '', // 省份名称 长度不能超过25个字符
      province_id: opts.province_id, // '', // 省份编号id长度不能超过25个字符
      city: opts.city, // '', // 市名称 长度不能超过25个字符
      city_id: opts.city_id, // '', // 市编号id 长度不能超过25个字符
      area: opts.area, // '', // 区/县级名称 长度不能超过25个字符
      area_id: opts.area_id, // '', // 区/县级编号id 长度不能超过25个字符
      address: opts.address, // '', // 详细地址 长度不能超过150个字符
      room_count: opts.room_count, // 3, // 房间数量（也就是几室）
      hall_count: opts.hall_count, // 1, // 几厅
      bathroom_count: opts.bathroom_count, // 1, // 几卫
      floorage: opts.floorage, // 90, // 建筑面积 单位（m2）
      total_price: opts.total_price, // 200, // 总价格
      decoration_style_id: opts.decoration_style_id // 9 // 装修风格id
    })
  },
  // 更新项目
  updateProject (opts) {
    return axios.put(`api/zaigou/user/projects/${opts.id}`, {
      project_name: opts.project_name, // '', // 项目名称  长度不能超过100个字符
      contact_name: opts.contact_name, // '', // 联系人 长度不能超过25个字符
      contact_phone: opts.contact_phone, // '', // 联系人电话 长度不能超过25个字符
      cate_id: opts.cate_id, // 0, // 作品分类id
      ison: opts.ison, // 1, // 是否公开 1 公开  2 私密
      tag_id: opts.tag_id, // '旅游，室内，酒店1', // 作品分类id 作品标签 长度不能超过25个字符,最多只能选3个
      trade: opts.trade, // '食', // 作品行业 长度不能超过25个字符
      logo_url: opts.logo_url, // '', // 项目logo(也就是平台logo)
      province: opts.province, // '', // 省份名称 长度不能超过25个字符
      province_id: opts.province_id, // '', // 省份编号id长度不能超过25个字符
      city: opts.city, // '', // 市名称 长度不能超过25个字符
      city_id: opts.city_id, // '', // 市编号id 长度不能超过25个字符
      area: opts.area, // '', // 区/县级名称 长度不能超过25个字符
      area_id: opts.area_id, // '', // 区/县级编号id 长度不能超过25个字符
      address: opts.address, // '', // 详细地址 长度不能超过150个字符
      room_count: opts.room_count, // 3, // 房间数量（也就是几室）
      hall_count: opts.hall_count, // 1, // 几厅
      bathroom_count: opts.bathroom_count, // 1, // 几卫
      floorage: opts.floorage, // 90, // 建筑面积 单位（m2）
      total_price: opts.total_price, // 200, // 总价格
      decoration_style_id: opts.decoration_style_id // 9 // 装修风格id
    })
  },
  // 更新项目状态 项目状态 0 在建项目 1 竣工项目 2 完工项目 3 停工项目 4 暂停 5 未开工项目
  updateProjectStatus (id, status) {
    return axios.put(`api/zaigou/user/projects/status/${id}?status=${status}`)
  },
  // 删除项目 项目id 字符串 1,2,3,4,5
  delProject (idstr) {
    return axios.delete(`api/zaigou/user/projects?idstr=${idstr}`)
  },

  // 全景上传 上传全景图
  uploadPano (fileList) {
    return uploadApi(fileList, uploadConfig.actions.pano)
  },
  // 上传场景
  // pano_id: 51205
  // type_id: 10000
  // file: 7c82b05a170ce150f340d33b34afbecf - 副本 - 副本.jpg
  // token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIsImlhdCI6MTU1NzQ3NDE4M30.8SYOc7SzpeRlrxeWSx72BkqEVX4w3btu3XmSQ_rX6y4
  // file: (binary)
  uploadScene (fileObj, panoId) {
    let formData = new FormData()
    formData.append('pano_id', panoId)
    formData.append('type_id', 1000)
    formData.append('file', fileObj.title)
    formData.append('file', fileObj.file)
    formData.append('token', getToken())
    return axios({
      method: 'post',
      'Content-Type': 'multipart/form-data',
      url: 'controllers/editor/api_uploadscene.ashx',
      timeout: 0,
      onUploadProgress,
      data: formData
    })
  },
  // 全景上传 全景图保存到服务器[{"pic_url":"","thumb_image_url":"","title":""},{}]
  savePanoToServer (opts) {
    return axios.post(`api/user/batchuploadpanotemps`, opts)
  },
  // 全景上传 删除全景缓存
  delPanoCache (id) {
    return axios.delete(`api/user/uploadpanotemps/${id}`)
  },
  // 全景上传 获取全景上传缓存
  getPanoUpdateCache () {
    return axios.get(`api/user/uploadpanotemps`)
  },

  // 全景上传 全景图片发布
  publishPanorama (opts) {
    return axios.post(`api/user/panos`, {
      pano_name: opts.pano_name || opts.project_name,
      ison: opts.ison,
      cate_id: opts.cate_id,
      tag_id: opts.tag_id,
      icon_src: opts.icon_src,
      trade: opts.trade,
      pro: opts.pro || opts.province,
      city: opts.city,
      area: opts.area
    })
  },

  // 检查发布状态 type videos or panos
  checkPublishStatus (type, id) {
    return axios.get(`api/user/${type}/${id}/checkstatus`, {}, { noCloseLoad: true })
  },
  // 项目对接全景
  projectConnectPano (id, panoId) {
    return axios.put(`api/zaigou/user/projects/panoramic/${id}`, { fk_pano_id: panoId })
  },
  // 获取全景基础数据
  getPanoInfo (panoId) {
    return axios.get(`api/editor/panos/${panoId}`)
  },
  // 获取全景基础数据
  getProjectInfo (id) {
    return axios.get(`api/zaigou/user/projects/${id}`)
  },
  // 获取全景场景
  getPanoScene (panoId) {
    return axios.get(`api/editor/scenegroups/${panoId}`)
  },
  // 加载动画 获取自定义加载动画列表
  getLoadingList (opts) {
    return axios.get(`api/user/panoloads/${opts.page}/${opts.pageSize}`)
  },
  // 加载动画 获取系统加载动画列表
  getSystemLoadingList (pageIndex, pageSize) {
    return axios.get(`api/user/panoloads/editor/${pageIndex}/${pageSize}`)
  },
  // 加载动画 删除加载动画
  delPanoLoading (id) {
    return axios.delete(`api/user/panoloads/${id}`)
  },
  // 加载动画 添加加载动画
  addPanoLoading (opts) {
    return axios.post(`api/user/panoloads`, {
      load_img: opts.load_img,
      pc_load_img: opts.pc_load_img,
      background_color: opts.background_color,
      showtime: opts.showtime
    })
  },
  // 更新全景
  updatePano (opts) {
    return axios.put(`api/zaigou/user/projects/panoramicsettingcommon/${opts.project_id}`, {
      pano_id: opts.pano_id || opts.fk_pano_id,
      type: opts.type, // 标识类型 2、背景音乐 3、微信分享 4、加载动画 6、作品加密 7、常用设置是否开启

      ispcmusic: opts.ispcmusic, // 是否启动PC背景音乐 pc端背景音乐：1=是;2=否 type = 2
      ismobilemusic: opts.ismobilemusic, // 是否启动手机端背景音乐 手机端背景音乐：1=是;2=否  type = 2
      bgmusicurl: opts.bgmusicurl, // JingleBells|krpano/data/-1000/8/5015JingleBells.mp3', // 背景音乐地址 type = 2

      showfx: opts.showfx, // 是否启动微信分享 是否显示分享1是,2否 type = 3
      shareico: opts.shareico, // 测试1', // 微信分享地址 微信分享地址不能为空 type = 3
      sharetitle: opts.sharetitle, // 测试2', // 微信分享标题 微信分享标题长度不能超过250个字符 type = 3
      sharecontent: opts.sharecontent, // 测试3', // 微信分享内容 微信分享内容长度不能超过500个字符 type = 3

      isloading: opts.isloading, // 是否开启加载动画 是否显示作品开场加载条默认1=是;2=否 type = 4
      fk_userpano_load_id: opts.fk_userpano_load_id, // 加载动画id 默认为 0 type = 4

      ispass: opts.ispass, // 是否开启作品加密 是否需要密码访问：1=是;2=否 type = 6
      passkey: opts.passkey, // 123456', // 访问需要密码时的密码 type = 6

      isongyro: opts.isongyro, // 陀螺仪默认打开：1=是;2=否  type = 7
      showgyro: opts.showgyro, // 是否显陀螺仪示1是,2否 type = 7
      showvr: opts.showvr, // 是否显示VR模式1是,2否 type = 7
      hideuser: opts.hideuser, // 是否隐藏作者：1=是;2=否 type = 7
      isonpraise: opts.isonpraise, // 是否显示人气和点赞1=是;2=否 type = 7
      isweather: opts.isweather, // 是否开启天气预报 1=是;2=否type = 7
      isonautoturn: opts.isonautoturn, // 打开场景自动旋转效果：1=是;2=否 type = 7
      isds: opts.isds, // 是否显示打赏：1=是;2=否 type = 7
      isonpcautoswitch: opts.isonpcautoswitch, // 电脑版场景自动切换：1=是;2=否 type = 7
      isonmobileturn: opts.isonmobileturn, // 手机版场景自动切换：1=是;2=否 type = 7
      ison: opts.ison // 是否发布:1=是;2=否 type = 7
    })
  },
  // 上传加载动画图片
  uploadLoading (fileList) {
    return uploadApi(fileList, uploadConfig.actions.loading)
  },
  // 上传素材图片
  uploadMaterial (fileList) {
    return uploadApi(fileList, uploadConfig.actions.material)
  },
  // 上传项目logo
  uploadProjectLogo (fileList) {
    return uploadApi(fileList, uploadConfig.actions.projectLogo)
  },
  // 上传项目封面
  uploadProjectCover (fileList) {
    return uploadApi(fileList, uploadConfig.actions.projectCover)
  },
  // 上传音频
  uploadAudio (fileList) {
    return uploadApi(fileList, uploadConfig.actions.audio, FILE_PREFIX)
  },
  // 上传分享封面
  uploadShareCover (fileList) {
    return uploadApi(fileList, uploadConfig.actions.audio, FILE_PREFIX)
  },
  // 更新项目logo 或 封面
  updateProjectLogoOrCover (opts) {
    return axios.put(`api/zaigou/user/projects/panoramicsetting/${opts.id}`, {
      type: opts.type, // 5, // 标识类型 1、项目logo 5、项目封面
      islogo: opts.islogo, // true, // 是否启动项目logo  type = 1
      logo_url: opts.logo_url, // '', // 项目logo地址 type = 1
      isimage: opts.isimage, // true, // 是否启动项目封面 type = 5
      image_url: opts.image_url // '' // 项目封面地址 type = 5
    })
  },
  // 删除全景场景
  delPanoScene (sceneId) {
    return axios.delete(`api/editor/scenes/${sceneId}`)
  },
  // 排序全景场景
  sortPanoScene (panoId, ids) {
    return axios.put(`api/editor/scenes/sort/${panoId}`, ids)
  },
  // 移动场景
  movePanoScene (groupid, ids) {
    return axios.post(`api/editor/scenegrouplists/${groupid}?ismove=${true}`, ids)
  },
  // 添加场景
  addPanoScene (groupid, ids) {
    return axios.post(`api/editor/scenegrouplists/${groupid}?ismove=${false}`, ids)
  },
  // 修改场景名称
  updatePanoSceneName (opts) {
    return axios.put(`api/zaigou/user/scenes/${opts.scene_id}`, {
      pano_id: opts.pano_id, // 51173, // 作品id
      scene_name: opts.title // 客厅 // 场景名称 长度不能超过50个字符
    })
  },
  // 添加场景分组
  addPanoSceneGroup (panoId, name) {
    return axios.post(`api/editor/scenegroups/${panoId}`, {
      album: name
    })
  },
  // 删除场景分组
  delPanoSceneGroup (panoId, groupid) {
    return axios.delete(`api/editor/scenegroups/${panoId}?groupid=${groupid}`)
  },
  // 场景分组排序 groupids [1,2,3]
  sortPanoSceneGroup (panoId, groupids) {
    return axios.post(`api/editor/scenegroups/sort/${panoId}`, groupids)
  },
  // 重命名场景分组
  reNamePanoSceneGroup (panoId, groupid, name) {
    return axios.put(`api/editor/scenegroups/name/${groupid}`, {
      album: name
    })
  },

  // 充值/购买 套餐等  paytype 3 账户余额 1 支付宝 2 微信
  // 创建支付订单 适用场景如下：
  // 若为：套餐购买，则：ordertype、paytype、productid(即：套餐ID) 必传
  // 若为：用户充值，则：ordertype、paytype、totalfee 必传
  // 若为：商品购买，则：ordertype、paytype、productid(即：商品订单ID) 必传
  // 若为：发送红包，则：ordertype、paytype、productid(即：红包ID) 必传
  // 若为：场景付费，则：ordertype、paytype、totalfee 必传
  createPayOrder (opts) {
    return axios.post(`api/payorder/create`, qs.stringify({
      productid: opts.productid,
      ordertype: opts.ordertype,
      paytype: opts.paytype,
      return_url: encodeURIComponent(opts.return_url),
      totalfee: opts.totalfee
    }))
  },
  // 财务 结算提现
  applyBalanceWithDraw (money) {
    return axios.post(`api/user/clears/apply?money=${money}`, qs.stringify({
    }))
  },
  // 获取留言列表
  getMessageList (opts) {
    return axios.get(`api/zaigou/user/comments/${opts.page}/${opts.pageSize}`, {
      params: {
        keyword: opts.keyword, // 关键字搜索 姓名或电话
        // day_type: opts.day_type, // 选择天数类型 7天，14天，30天
        startdt: opts.startdt, // 开始时间
        enddt: opts.enddt, // 结束时间
        orderBy: opts.orderBy, // 排序默认自增id,created_DESC
        status: opts.status // 状态 0 未处理 1 已处理（通过）
      }
    })
  },
  // 处理通过留言
  passMessage (ids) { // [1,2,3]
    return axios.put(`api/zaigou/user/comments`, ids)
  },
  // 删除留言
  delMessage (str) { // 1,2,3
    return axios.delete(`api/zaigou/user/comments/${str}`)
  },
  // 公司信息登记状态
  getIsRegisterCompany () {
    return axios.get(`api/zaigou/user/companys/islogin`)
  },
  getPanoMapList (tag) {
    return axios.get(`api/frontsite/panomaps?tag=${tag}`)
  },
  getSceneNameTags (tag) {
    return axios.get(`api/zaigou/user/scenenametags/${1}/${100}`)
  }

}
