// pages/search/search.js
const app = getApp()
Page({
  data: {
    searching: false,
    devicesList: [],
    distance: 1,
    token: "",
    latitude: 0,
    longitude: 0,
    user_info_lon: 0,
    user_info_lat: 0,
    dis_ble: 0,
    dis_gps: 0,
    uuid: "",
    services: {},
    disBleSea: true
  },
  getGps: function() {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        that.setData({
          latitude: res.latitude * 1000000000,
          longitude: res.longitude * 1000000000
        })
      }
    })
    if (that.data.user_info_lat == 0) {
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/get?access_token=' + that.data.token,
        method: 'POST',
        data: {
          user_id: "latitude",
          group_id: 'Database' //获取lat
        },
        header: {
          'Content-Type': 'application/json'
        },
        success(res3) {
          console.log(res3)
          if (res3.data.error_msg != "SUCCESS") {}
          that.setData({
            user_info_lat: parseInt(res3.data.result.user_list[0].user_info)
          })
          console.log("lat" + that.data.user_info_lat)
        }
      })
    }
    if (that.data.user_info_lon == 0) {
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/get?access_token=' + that.data.token,
        method: 'POST',
        data: {
          user_id: "longitude",
          group_id: 'Database' //自己建的用户组id
        },
        header: {
          'Content-Type': 'application/json' // 默认值
        },
        success(res2) {
          console.log(res2)
          if (res2.data.error_msg == "SUCCESS") {
            that.setData({
              user_info_lon: parseInt(res2.data.result.user_list[0].user_info),
              disBleSea: false
            })
            console.log("lon" + that.data.user_info_lon)
          }
        }
      })
    }

  },
  Search: function() {
    var that = this
    if (that.data.uuid == "") { // 获取教师的UUID
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/get?access_token=' + that.data.token,
        method: 'POST',
        data: {
          user_id: "serviceId",
          group_id: 'Database' //自己建的用户组id
        },
        header: {
          'Content-Type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res)
          if (res.data.error_msg == "SUCCESS") {
            that.setData({
              uuid: res.data.result.user_list[0].user_info
            })
            console.log(res.data.result.user_list[0].user_info)
          }
        }
      })
    }
    //计算gps的操作
    {
      var lat1 = that.data.latitude / 1000000000,
        lon1 = that.data.longitude / 1000000000,
        lat2 = lat1,
        lon2 = lon1;
      if (that.data.user_info_lat != 0) {
        lat2 = that.data.user_info_lat / 1000000000;
      }
      if (that.data.user_info_lon != 0) {
        lon2 = that.data.user_info_lon / 1000000000;
      }
      var a = 6378137,
        b = 6356752.314245,
        f = 1 / 298.257223563;
      var L = (lon2 - lon1) * Math.PI / 180;
      var U1 = Math.atan((1 - f) * Math.tan(lat1 * Math.PI / 180));
      var U2 = Math.atan((1 - f) * Math.tan(lat2 * Math.PI / 180));
      var sinU1 = Math.sin(U1),
        cosU1 = Math.cos(U1);
      var sinU2 = Math.sin(U2),
        cosU2 = Math.cos(U2);
      var lambda = L,
        lambdaP, iterLimit = 100;
      do {
        var sinLambda = Math.sin(lambda),
          cosLambda = Math.cos(lambda);
        var sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
        if (sinSigma == 0) return 0;

        var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
        var sigma = Math.atan2(sinSigma, cosSigma);
        var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
        var cosSqAlpha = 1 - sinAlpha * sinAlpha;
        var cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
        if (isNaN(cos2SigmaM)) cos2SigmaM = 0;
        var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        lambdaP = lambda;
        lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
      } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

      if (iterLimit == 0) return NaN

      var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
      var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
      var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
      var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
      var s = b * A * (sigma - deltaSigma);

      that.setData({
        dis_gps: s
      })
      console.log(lat1)
      console.log(lat2)
      console.log(lon1)
      console.log(lon2)
      console.log(that.data.dis_gps)
    }
    if (!that.data.searching) {
      wx.closeBluetoothAdapter({
        complete: function(res) {
          console.log(res)
          wx.openBluetoothAdapter({
            success: function(res) {
              console.log(res)
              wx.getBluetoothAdapterState({
                success: function(res) {
                  console.log(res)
                }
              })
              wx.startBluetoothDevicesDiscovery({
                // services: ['0000180A-0000-1000-8000-00805F9B34FB'],// services 参数可以设置，过滤不需要的设备，只接收老师的蓝牙服务的uuid
                allowDuplicatesKey: false,
                success: function(res) {
                  console.log(res)
                  that.setData({
                    searching: true,
                    devicesList: []
                  })
                }
              })
            },
            fail: function(res) {
              console.log(res)
              wx.showModal({
                title: '提示',
                content: '请检查手机蓝牙是否打开',
                showCancel: false,
                success: function(res) {
                  that.setData({
                    searching: false
                  })
                }
              })
            }
          })
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function(res) {
          console.log(res)
          that.setData({
            searching: false
          })
        }
      })
    }
  },

  Connect: function(e) {
    var that = this
    var advertisData, name
    console.log(e.currentTarget.id)
    console.log(e.currentTarget)
    var iRSSI, power, initDis
    for (var i = 0; i < that.data.devicesList.length; i++) {
      if (e.currentTarget.id == that.data.devicesList[i].deviceId) {
        /*
        计算公式：
          d = 10^((abs(RSSI) - A) / (10 * n))
          其中：
          d - 计算所得距离
          RSSI - 接收信号强度（负值）
          A - 发射端和接收端相隔1米时的信号强度
          n - 环境衰减因子
         */
        iRSSI = Math.abs(that.data.devicesList[i].RSSI)
        power = (iRSSI - 70) / (10 * 2.0)
        initDis = Math.pow(10, power)
        name = that.data.devicesList[i].name
        that.setData({
          dis_ble: initDis
        })
      }
    }
    wx.showLoading({
      title: 'dis_ble: ' + that.data.dis_ble,
      duration: 1000
    })
    wx.hideLoading()
    //这里设置唯一的设备ID和名称！！！
    //if (e.currentTarget.id == "C0:85:56:34:2E:A4" && name == "Mi Band 3") {
    if (name != "") {
      if (that.data.dis_ble < 5) {
        console.log("PASS")
        console.log("name" + name)
        wx.navigateTo({
          url: '../login/login',
        })
      } else {
        if (that.data.dis_gps < 10) {
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    }
    else{
      wx.showToast({
        title: '请重新选择',
        icon: 'loading',
        duration: 200
      })
    }
    console.log(that.data.dis_ble)
    console.log(that.data.dis_gps)
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        console.log(res)
        that.setData({
          searching: false
        })
      }
    })
  },
  onLoad: function(options) {
    var that = this
    var list_height = ((app.globalData.SystemInfo.windowWidth - 50) * (750 / app.globalData.SystemInfo.windowWidth)) - 60
    that.setData({
      list_height: list_height
    })
    wx.onBluetoothAdapterStateChange(function(res) {
      console.log(res)
      that.setData({
        searching: res.discovering
      })
      if (!res.available) {
        that.setData({
          searching: false
        })
      }
    })
    wx.onBluetoothDeviceFound(function(devices) {
      //剔除重复设备，兼容不同设备API的不同返回值
      var isnotexist = true
      if (devices.deviceId) {
        if (devices.advertisData) {
          devices.advertisData = app.buf2hex(devices.advertisData)
        } else {
          devices.advertisData = ''
        }
        console.log(devices)
        for (var i = 0; i < that.data.devicesList.length; i++) {
          if (devices.deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices)
        }
      } else if (devices.devices) {
        if (devices.devices[0].advertisData) {
          devices.devices[0].advertisData = app.buf2hex(devices.devices[0].advertisData)
        } else {
          devices.devices[0].advertisData = ''
        }
        console.log(devices.devices[0])
        for (var i = 0; i < that.data.devicesList.length; i++) {
          if (devices.devices[0].deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices.devices[0])
        }
      } else if (devices[0]) {
        if (devices[0].advertisData) {
          devices[0].advertisData = app.buf2hex(devices[0].advertisData)
        } else {
          devices[0].advertisData = ''
        }
        console.log(devices[0])
        for (var i = 0; i < devices_list.length; i++) {
          if (devices[0].deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices[0])
        }
      }
      that.setData({
        devicesList: that.data.devicesList
      })
    })

    //acess_token获取
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token', 
      data: {
        grant_type: 'client_credentials',
        client_id: '/', //应用的API Key
        client_secret: '/' //应用的Secret Key
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      success(res) {
        that.setData({
          token: res.data.access_token, //获取到token
        })
        console.log(that.data.token)
      }
    })
  },
  onReady: function() {

  },
  onShow: function() {

  },
  onHide: function() {
    var that = this
    that.setData({
      devicesList: []
    })
    if (this.data.searching) {
      wx.stopBluetoothDevicesDiscovery({
        success: function(res) {
          console.log(res)
          that.setData({
            searching: false
          })
        }
      })
    }
  }
})