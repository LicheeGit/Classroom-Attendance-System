// login_t.js
Page({
  data: {
    base64: "",
    token: "",
    msg: null,
    userInfo: ""
  },
  //拍照并编码
  takePhoto() {
    //拍照
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
      }
    })
  },
  //上传人脸进行 比对
  login: function() {
    var that = this
    //图片base64编码
    wx.getFileSystemManager().readFile({
      filePath: this.data.src, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => { //成功的回调
        that.setData({
          base64: res.data
        })
      }
    })
    console.log("base64:" + that.data.base64)
    if (that.data.base64 != "") {
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/search?access_token=' + that.data.token,
        method: 'POST',
        data: {
          image: this.data.base64,
          image_type: 'BASE64',
          group_id_list: 'Teachers' //自己建的用户组id
        },
        header: {
          'Content-Type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res)
          if (res.data.error_msg == "match user is not found") {
            wx.showModal({
              title: '登录失败',
              content: '请联系管理员注册',
            })
          }
          if (res.data.error_msg == "SUCCESS") {
            that.setData({
              msg: res.data.result.user_list[0].score,
            })
            console.log(res)
            if (that.data.msg > 80) {
              wx.showToast({
                title: '验证通过',
                icon: 'success',
                duration: 1000
              })
              wx.navigateTo({
                url: '../start/start',
              })
            }
          }
        }
      });
    }
    if (that.data.base64 == "") {
      wx.showToast({
        title: '请重试',
        icon: 'loading',
        duration: 500
      })
    }
  },

  error(e) {
    console.log(e.detail)
  },
  onLoad: function(options) {
    var that = this
    //acess_token获取
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token', //真实的接口地址
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
          token: res.data.access_token //获取到token
        })
        console.log(that.data.token)
      }
    })
  }
})