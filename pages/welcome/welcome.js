// pages/welcome/welcome.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    nickName: "",
    userArray: [],
    userID: "",
    userNum: 0,
    user_info: "",
    hiddenPass: true,
    password: "",
    token: "",
    error_code: 1,
    userInList: false,
    userGroup: "",
    allowRegT: false
  },

  setGroupS: function() {
    this.setData({
      userGroup: "Students"
    })
  },

  setGroupT: function() {
    this.setData({
      userGroup: "Teachers"
    })
  },

  setAllowRegT: function() {
    this.setData({
      allowRegT: true
    })
    console.log("已进入管理员模式")
  },

  //获取用户信息
  bindGetUserInfo: function(e) {
    var that = this;
    that.setData({
      nickName: e.detail.userInfo.nickName
    })
    if (that.data.nickName == "") {
      wx.showToast({
        title: '请重试',
        icon: "none"
      })
    }
    if (that.data.nickName != "") {
      wx.showToast({
        title: '授权成功',
        icon: 'success',
        duration: 1000
      })
      that.setData({
        userInList: false
      })
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/getusers?access_token=' + that.data.token,
        method: 'POST',
        data: {
          group_id: that.data.userGroup // 用户组ID
        },
        header: {
          'Content-Type': 'application/json'
        },
        success(res) {
          that.setData({
            error_code: res.data.error_code
          })
          if (that.data.error_code == 0) {
            that.setData({
              userNum: res.data.result.user_id_list.length
            })
            for (var i = 0; i < that.data.userNum; i++) {
              that.setData({
                userID: res.data.result.user_id_list[i]
              })
              if (that.data.userID == that.data.nickName) { //用户已注册
                that.setData({
                  userInList: true
                })
                break;
              }
            }
            if (that.data.userInList) {
              that.setData({
                hiddenPass: false
              })
              wx.request({
                url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/get?access_token=' + that.data.token,
                method: 'POST',
                data: {
                  user_id: that.data.nickName,
                  group_id: that.data.userGroup // 用户组ID
                },
                header: {
                  'Content-Type': 'application/json' //默认值
                },
                success(res2) {
                  console.log(res2)
                  that.setData({
                    user_info: res2.data.result.user_list[0].user_info
                  })
                }
              })
            }
            if (!that.data.userInList) { // userInList要到第二次点击才生效。
              if (that.data.userGroup == "Students") {
                wx.navigateTo({
                  url: '../register/register',
                })
              }
              if (that.data.userGroup == "Teachers") {
                if (!that.data.allowRegT) {
                  wx.navigateTo({
                    url: '../canNotReg_t/canNotReg_t',
                  })
                }
                if (that.data.allowRegT) {
                  wx.navigateTo({
                    url: '../register_t/register_t',
                  })
                }
              }
            }
          } else {
            wx.showToast({
              title: '请再点一次',
              duration: 500
            })
          }
        }
      })
    }
  },

  //先授权登陆，再拍照注册
  btnreg: function() {
    wx.showModal({
      title: '使用须知',
      content: '请先授权，再选择身份。如果不成功，请再试一下！',
    })
  },

  //取消按钮
  cancel: function() {
    this.setData({
      hiddenPass: true,
    })
  },

  //确认
  confirm: function(e) {
    var that = this;
    this.setData({
      hiddenPass: true,
    })
    if ((that.data.password) == that.data.user_info) { //密码输入正确
      if (that.data.userGroup == "Students") {
        wx.navigateTo({
          url: '../search/search', //进入蓝牙界面
        })
      }
      if (that.data.userGroup == "Teachers") {
        wx.navigateTo({
          url: '../login_t/login_t', //进入教师提示
        })
      }
    } else {
      wx.showToast({
        title: '密码输入有误',
        icon: 'warn'
      })
    }
  },
  setPassword: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    that.setData({
      hiddenPass: true,
      password: "",
      error_code: 1,
      userInList: false,
      userGroup: "",
      allowRegT: false
    })

    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token', //是真实的接口地址
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
          token: res.data.access_token //获取到token
        })
        console.log(that.data.token)
      }
    })
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
    this.setData({
      hiddenPass: true,
      password: "",
      userGroup: ""
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    var that=this
    that.setData({
      password: "",
      userGroup: ""
    })
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