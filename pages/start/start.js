// pages/start/start.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    token: "",
    error_msg: "",
    disableSKq: true,
    disableEkq: true,
    gotToken: false,
    textLog: "",
    studentsNum: 0,
    userInfo: {},
    hasUserInfo: false,
    bDeviceId: "",
    image: "https://ww4.sinaimg.cn/mw690/be98e7fdgw1f87av0ilrsj21kw0w0qrf.jpg",
    latitude: "",
    longitude: "",
    allStudents: [],
    kaoqinStudents: [],
    totalNum: 0,
    notPresentList: "",
    realNotPresentNum: 0,
    notGetStuList: true,
    lessonToken: "",
    disableCheckToken: true,
    tokenNotResist: true,
    notPresentArray: [],
    qingJiaList: [], // 请假学生名单
    qingJiaNum: 0,
    queQinArray: [],
    notGetTotalNum: true,
    notStart: true,
    startKaoqin:false,
  },

  getToken: function(e) {
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        that.setData({
          latitude: res.latitude * 1000000000,
          longitude: res.longitude * 1000000000
        })
      }
    })
    //acess_token获取
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token', //真实的接口地址
      data: {
        grant_type: 'client_credentials',
        client_id: '/', //应用的API Key
        client_secret: '/' //Secret Key
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      success(res) {
        that.setData({
          token: res.data.access_token, //获取到token
        })
        if (that.data.lessonToken != "") {
          that.setData({
            disableCheckToken: false
          })
        }
      }
    })
  },

  checkToken: function() {
    var that = this
    if (that.data.lessonToken == "") {
      wx.showModal({
        title: '请检查口令',
        content: '口令不能为空',
      })
    }
    if (that.data.lessonToken != "") {
      // 检查人脸库存在与否
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/add?access_token=' + that.data.token,
        method: 'POST',
        data: {
          group_id: that.data.lessonToken //自己建的用户组id
        },
        header: {
          'Content-Type': 'application/json' // 默认值
        },
        success(res) {
          console.log("Checktoken" + res)
          if (res.data.error_msg == "group is already exist") {
            wx.showModal({
              title: '开启考勤失败',
              content: '考勤口令已存在，请更换口令或查看已考勤记录',
            })
            that.setData({
              tokenNotResist: false,
              notStart: false,
              disableEkq:false
            });
          }
          if (res.data.error_msg == "SUCCESS") {
            that.setData({
              gotToken: true,
              disableSKq: false,
              disableEkq: true
            })
            wx.showToast({
              title: '口令可用',
            })
          }
        }
      })
      // 传入UUid
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + that.data.token,
        method: 'POST',
        data: {
          image: that.data.image,
          image_type: 'URL',
          group_id: 'Database', //自己建的用户组id
          user_id: 'serviceId', //0000180A-0000-1000-8000-00805F9B34FB
          user_info: that.data.bDeviceId
        },
        header: {
          'Content-Type': 'application/json' // 默认值
        },
        success(res) {
          console.log("uuid input" + res)
          that.setData({
            error_msg: res.data.error_msg,
          })
          if (res.data.error_msg == "SUCCESS") {
            wx.showToast({
              title: 'uuid input',
            })
          }
        }
      })
    }
  },

  startKq: function() {
    var that = this
    that.setData({
      notStart: false,
      startKaoqin:true
    })
    wx.closeBluetoothAdapter({
      complete: function(res) {
        console.log(res)
        wx.openBluetoothAdapter({
          success: function(res) {
            console.log(res)
            wx.getBluetoothAdapterState({
              success: function(res) {
                console.log(res)
                wx.showToast({
                  title: '开启考勤成功',
                })
              }
            })
          },
          fail: function(res) {
            console.log(res)
            wx.showModal({
              title: '提示',
              content: '请检查手机蓝牙是否打开',
              showCancel: false
            })
          }
        })
      }
    })
    // 传输自己GPS到Database
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + that.data.token,
      method: 'POST',
      data: {
        image: that.data.image,
        image_type: 'URL',
        group_id: 'Database', //自己建的用户组id
        user_id: 'longitude',
        user_info: that.data.longitude
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      success(res) {
        console.log("long" + res)
        that.setData({
          error_msg: res.data.error_msg,
        })
        if (res.data.error_msg == "SUCCESS") {
          wx.showToast({
            title: 'longitude input',
          })
        }
      }
    })
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + that.data.token,
      method: 'POST',
      data: {
        image: that.data.image,
        image_type: 'URL',
        group_id: 'Database', //自己建的用户组id
        user_id: 'latitude',
        user_info: that.data.latitude
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      success(res) {
        console.log("lati" + res)
        that.setData({
          error_msg: res.data.error_msg,
        })
        if (res.data.error_msg == "SUCCESS") {
          wx.showToast({
            title: 'latitude input',
          })
        }
      }
    })
  },

  endKq: function() {
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        console.log(res)
        that.setData({
          searching: false,
        })
      }
    })
    wx.closeBluetoothAdapter({
      success(res) {
        console.log(res)
      }
    })
    var that = this
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/delete?access_token=' + that.data.token,
      method: 'POST',
      data: {
        group_id: that.data.lessonToken //自己建的用户组id
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        that.setData({
          error_msg: res.data.error_msg,
          disableSkq: false,
          disableEkq: true,
          getToken: false,
          startKaoqin:false
        })
        if (res.data.error_msg == "SUCCESS") {
          wx.showToast({
            title: '关闭考勤成功',
          })
        }
      }
    })
  },

  //获取学生名单
  refreshList: function() {
    var that = this
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/getusers?access_token=' + that.data.token,
      method: 'POST',
      data: {
        group_id: that.data.lessonToken //自己建的用户组id
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        that.setData({
          kaoqinStudents: res.data.result.user_id_list,
          textLog: res.data.result.user_id_list,
          studentsNum: res.data.result.user_id_list.length,
          notGetStuList: false,
          startKaoqin:true
        })
        if (res.data.error_msg == "SUCCESS") {
          wx.showToast({
            title: '刷新列表成功',
          })
        }
      }
    })
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/getusers?access_token=' + that.data.token,
      method: 'POST',
      data: {
        group_id: "Students" // 用户组ID
      },
      header: {
        'Content-Type': 'application/json' //默认值
      },
      success(res) {
        console.log(res)
        that.setData({
          allStudents: res.data.result.user_id_list,
          totalNum: res.data.result.user_id_list.length
        })
      }
    })
  },

  getUnpresentList: function() {
    var that = this;
    that.setData({
      notPresentList: "",
      notGetTotalNum: false
    })
    var notPresentNum = 0;
    for (var i = 0; i < that.data.totalNum; i++) {
      var studentPresent = false;
      for (var j = 0; j < that.data.studentsNum; j++) {
        if (that.data.allStudents[i] == that.data.kaoqinStudents[j]) {
          studentPresent = true;
        }
      }
      /*if (!studentPresent) { 
        var log = that.data.notPresentList + that.data.allStudents[i] + "\n";
        that.setData({
          notPresentList: log
        })
      }*/
      if (!studentPresent) {
        notPresentNum++;
        var upStudent = that.data.allStudents[i];
        var isNotExist = true;
        for (var j = 0; j < that.data.notPresentArray.length; j++) {
          if (upStudent == that.data.notPresentArray[j]) {
            isNotExist = false
          }
        }
        if (isNotExist) {
          console.log(typeof(upStudent))
          that.data.notPresentArray.push(upStudent)
          that.setData({
            notPresentArray: that.data.notPresentArray
          })
        }
      }
    }
    that.setData({
      realNotPresentNum: that.data.totalNum - that.data.studentsNum
    })
  },

  checkboxChange: function(e) {
    var that = this
    console.log(e.detail)
    console.log(e.detail.value)
    that.setData({
      qingJiaList: e.detail.value,
      qingJiaNum: e.detail.value.length
    })
  },

  checkHistory: function() {
    var that = this
    that.refreshList()
    that.getUnpresentList()
  },

  goToNewWin: function() {
    var that = this
    wx.navigateTo({
      url: '../checkKq/checkKq?lessonToken=' + that.data.lessonToken
    })
  },

  //清空log日志
  startClear: function() {
    var that = this;
    that.setData({
      textLog: "",
      notPresentList: "",
      startKaoqin:false
    });
  },

  //获取教师设备id
  getDeviceId: function(e) {
    var that = this;
    that.setData({
      bDeviceId: e.detail.value
    })
  },

  getLessonToken: function(e) {
    var that = this;
    that.setData({
      lessonToken: e.detail.value
    })
  },

  getUnpresent: function() {
    var that = this
    that.setData({
      queQinArray: []
    })
    for (var i = 0; i < that.data.notPresentArray.length; i++) {
      var qingJia = false;
      for (var j = 0; j < that.data.qingJiaNum; j++) {
        if (that.data.notPresentArray[i] == that.data.qingJiaList[j]) {
          qingJia = true;
        }
      }
      if (!qingJia) {
        var isNotE = true;
        for (var j = 0; j < that.data.queQinArray.length; j++) {
          if (that.data.queQinArray[j] == that.data.notPresentArray[i]) {
            isNotE = false;
          }
        }
        if (isNotE) {
          that.data.queQinArray.push(that.data.notPresentArray[i])
          that.setData({
            queQinArray: that.data.queQinArray
          })
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})