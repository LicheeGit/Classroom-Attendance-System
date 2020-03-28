// register.js
const app = getApp()
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    nickName: "",
    src: "", //图片的链接
    token: "",
    base64: "",
    msg: "",
    password: ""
  },

  //拍照
  takePhoto() {
    var that = this;
    //拍照
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath //获取图片
        })

        //图片base64编码
        wx.getFileSystemManager().readFile({
          filePath: this.data.src, //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调
            this.setData({
              base64: res.data
            })
          }
        })
      } //拍照成功结束

    }) //调用相机结束

    //上传人脸进行注册
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + this.data.token,
      method: 'POST',
      data: {
        image: this.data.base64,
        image_type: 'BASE64',
        group_id: 'Students', //自己建的用户组id
        user_id: this.data.nickName, //这里获取用户昵称
        user_info: this.data.password //存储用户密码
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      success(res) {
        that.setData({
          msg: res.data.error_msg
        })
        console.log(that.data.msg)
        console.log(res)
        //做成功判断
        if (that.data.msg == 'SUCCESS') { //微信js字符串使用单引号
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000
          })
          wx.navigateBack({
            
          })
          wx.navigateTo({
            url: '../welcome/welcome',
          })
        }
      }
    }),
      //失败尝试
      wx.showToast({
        title: '请重试',
        icon: 'loading',
        duration: 500
      })
  },
  error(e) {
    console.log(e.detail)
  },
  setPassword: function (e) {
    this.setData({ password: e.detail.value })
  },
  //获取用户信息
  bindGetUserInfo: function (e) {
    var that=this
    this.setData({
      nickName: e.detail.userInfo.nickName
    })
    if(that.data.nickName!=""){
      wx.showToast({
        title: '授权成功',
        icon: 'success',
        duration: 1000
      })
    }
  },

  //先授权登陆，再拍照注册
  btnreg: function () {
    wx.showModal({
      title: '注册须知',
      content: '请先授权再进行注册，点击注册按钮前请检查密码输入，确认无误后再注册',
    })
  },

  onLoad: function(options){
    var that = this
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
          token: res.data.access_token //获取到token
        })
        console.log(that.data.token)
      }
    })
  }
})