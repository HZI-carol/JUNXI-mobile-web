window.$globalconfig.AMAP_KEY = '74f03d0dfdac3925b83e85d25133a1bd'
window.$globalconfig.URLS.M_EDITOR = 'http://h5.' + window.$globalconfig.DOMAIN + '/m-editor/?panoid='
window.$globalconfig.URLS.LOGIN = window.$globalconfig.URLS.API + 'user/login?redirect_uri=' + encodeURIComponent('http://zg.' + window.$globalconfig.DOMAIN + '#/user')
document.write('<script src=https://webapi.amap.com/maps?v=1.4.8&amp;key=' + window.$globalconfig.AMAP_KEY + '></script>')
var qmapkey = window.$globalconfig.QMAP_KEY || 'R7PBZ-O5NRD-45Z4K-HU4DJ-V4PW3-E5FKW'
document.write('<script src=https://map.qq.com/api/js?v=2.exp&key=' + qmapkey + '></script>')
