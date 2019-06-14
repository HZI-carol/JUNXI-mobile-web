<template lang="pug">
.pano-map.has-nav
  NavBar()
  #map-container(style="width: 100%; height: 100%")
</template>
<script>
let PROVINCES = [
  { name: '福建省', position: { lng: 119.297, lat: 26.074199 } },
  { name: '安徽省', position: { lng: 117.291172, lat: 31.862506 } },
  { name: '甘肃省', position: { lng: 103.820831, lat: 36.063672 } },
  { name: '广东省', position: { lng: 113.280637, lat: 23.125178 } },
  { name: '贵州省', position: { lng: 106.702359, lat: 26.556565 } },
  { name: '海南省', position: { lng: 110.336946, lat: 20.023381 } },
  { name: '河北省', position: { lng: 114.649226, lat: 37.880523 } },
  { name: '河南省', position: { lng: 113.476782, lat: 34.914916 } },
  { name: '黑龙江省', position: { lng: 126.642464, lat: 45.756967 } },
  { name: '湖北省', position: { lng: 114.269294, lat: 30.555099 } },
  { name: '湖南省', position: { lng: 112.982279, lat: 28.19409 } },
  { name: '吉林省', position: { lng: 125.417144, lat: 43.850735 } },
  { name: '江苏省', position: { lng: 118.767413, lat: 32.041544 } },
  { name: '江西省', position: { lng: 115.990816, lat: 28.759043 } },
  { name: '辽宁省', position: { lng: 123.422661, lat: 41.764 } },
  { name: '青海省', position: { lng: 101.848066, lat: 36.500386 } },
  { name: '山东省', position: { lng: 117.000923, lat: 36.675807 } },
  { name: '山西省', position: { lng: 112.549248, lat: 37.857014 } },
  { name: '陕西省', position: { lng: 108.859359, lat: 34.376681 } },
  { name: '四川省', position: { lng: 104.065735, lat: 30.659462 } },
  { name: '台湾省', position: { lng: 121.517057, lat: 25.048074 } },
  { name: '云南省', position: { lng: 102.712251, lat: 25.040609 } },
  { name: '浙江省', position: { lng: 120.153305, lat: 30.179947 } },
  { name: '广西壮族自治区', position: { lng: 108.337841, lat: 22.797398 } },
  { name: '宁夏回族自治区', position: { lng: 106.274487, lat: 38.466449 } },
  { name: '西藏自治区', position: { lng: 91.193344, lat: 29.455533 } },
  { name: '新疆维吾尔自治区', position: { lng: 87.414047, lat: 43.57773 } },
  { name: '内蒙古自治区', position: { lng: 111.974907, lat: 40.723179 } },
  { name: '北京市', position: { lng: 116.397703, lat: 39.9091 } },
  { name: '天津市', position: { lng: 116.945297, lat: 39.093112 } },
  { name: '上海市', position: { lng: 121.473661, lat: 31.230378 } },
  { name: '重庆市', position: { lng: 106.490987, lat: 29.546003 } },
  { name: '香港特别行政区', position: { lng: 114.165460, lat: 22.275340 } },
  { name: '澳门特别行政区', position: { lng: 113.549130, lat: 22.198750 } }
]
let qq = window.qq
export default {
  name: 'ProjectMap',
  data () {
    return {
      tag: '',
      list: [],
      map: null,
      markers: [],
      labels: []
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    getPanoList () {
      this.$api.getPanoMapList(this.tag).then((data) => {
        this.list = data
        if (this.map.getZoom() > 5) {
          this.setMarkers()
        } else {
          this.setProvinceLabel()
        }
      })
    },
    // 地图初始化
    initMap () {
      this.map = new qq.maps.Map(document.getElementById('map-container'), {
        center: new qq.maps.LatLng(39.916527, 116.397128),
        zoom: 5,
        zoomControlOptions: {
          position: qq.maps.ControlPosition.LEFT_CENTER
        },
        panControlOptions: {
          position: qq.maps.ControlPosition.LEFT_CENTER
        }
      })
      qq.maps.event.addListener(this.map, 'zoom_changed', (e) => {
        this.clearLabels()
        this.clearMarkers()
        if (e.target.zoom > 5) {
          this.setMarkers()
        } else {
          this.setProvinceLabel()
        }
      })
      // 获取作品数据
      this.getPanoList()
    },
    initInfoWindow (marker) {
      if (marker.imageDialog) {
        marker.imageDialog.open()
      } else {
        var infoWin = new qq.maps.InfoWindow({
          map: this.map
        })
        infoWin.open()
        infoWin.setPosition(marker)
        infoWin.setContent('<div style="width: 180px; height: 180px;"><img style="width:180px; padding: 10px;" src="' + marker.pano.panoicon_src + '"/></div>')
        marker.imageDialog = infoWin
      }
    },
    initMarker (data) {
      var icon = new qq.maps.MarkerImage('static/images/marker.png')
      if (data.tag === '旅游景区') {
        icon = new qq.maps.MarkerImage('static/images/marker1.png')
      } else if (data.tag === '宾馆酒店') {
        icon = new qq.maps.MarkerImage('static/images/marker2.png')
      }
      var marker = new qq.maps.Marker({
        position: new qq.maps.LatLng(data.location_lat, data.location_lng),
        clickable: true,
        title: data.title,
        map: this.map,
        icon: icon,
        pano: data
      })
      qq.maps.event.addListener(marker, 'click', () => {
        window.open(data.panoview_url)
      })
      qq.maps.event.addListener(marker, 'mouseover', () => {
        this.initInfoWindow(marker)
      })
      qq.maps.event.addListener(marker, 'mouseout', () => {
        if (marker.imageDialog) {
          marker.imageDialog.close()
        }
      })
      this.markers.push(marker)
    },
    clearMarkers () {
      this.markers.forEach((marker) => {
        marker.setMap(null)
      })
      this.markers = []
    },
    setMarkers () {
      if (this.list && this.list.length > 0) {
        this.list.forEach((data) => {
          this.initMarker(data)
        })
      }
    },
    initLabel (province) {
      var contentDiv = '<div style="color: #fff; background-color: #0698e7; padding: 2px 10px; cursor: pointer; ">' + province.count + '</div>'
      var label = new qq.maps.Label({
        position: new qq.maps.LatLng(province.position.lat, province.position.lng),
        title: province.name + '有' + province.count + '处',
        offset: new qq.maps.Size(-10, 5),
        content: contentDiv,
        map: this.map
      })
      qq.maps.event.addListener(label, 'click', () => {
        this.map.setCenter(new qq.maps.LatLng(province.position.lat, province.position.lng))
        this.map.setZoom(7)
      })
      this.labels.push(label)
    },
    clearLabels () {
      this.labels.forEach((label) => {
        label.setMap(null)
      })
      this.labels = []
    },
    setProvinceLabel () {
      PROVINCES.forEach((province) => {
        province.count = 0
        province.data = []
        this.list.forEach((data) => {
          // 有些不匹配，比如黑龙江，我们数据里是黑龙江省，多了个省字
          if (data.province.indexOf(province.name) !== -1) {
            province.count++
            province.data.push(data)
          }
        })
        this.initLabel(province)
      })
    }
  }
}
</script>

<style lang="stylus">
@import '~@/assets/style/index'
.pano-map
  overflow hidden
  background-color #ddd
</style>
