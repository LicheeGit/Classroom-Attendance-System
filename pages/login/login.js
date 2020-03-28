// login.js
Page({
  data: {
    base64: "",
    token: "",
    msg: null,
    userInfo: "",
    hiddenModelInput: true,
    lessonToken:""
  },

  setLessonToken: function(e){
    this.setData({
      lessonToken: e.detail.value
    })
  },

  cancel: function(){
    this.setData({
      hiddenModelInput:true
    });
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

  inputToken: function(){
    var that=this
    that.setData({
      hiddenModelInput:false
    });
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
  },
  //上传人脸进行 比对
  login: function() {
    var that = this
    that.setData({
      hiddenModelInput: true
    });
    if (that.data.base64 != "") {
      wx.request({
        url: 'https://aip.baidubce.com/rest/2.0/face/v3/search?access_token=' + that.data.token,
        method: 'POST',
        data: {
          image: this.data.base64,
          image_type: 'BASE64',
          group_id_list: 'Students' //自己建的用户组id
        },
        header: {
          'Content-Type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res)
          if (res.data.error_msg == "match user is not found") {
            wx.showModal({
              title: '签到失败',
              content: '请先注册使用',
            })
          }
          if (res.data.error_msg == "SUCCESS"){
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
            //该生登录，将信息拷贝至Kaoqin组
            if (res.data.error_msg == "SUCCESS") {
              wx.request({
                url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/copy?access_token=' + that.data.token,
                method: 'POST',
                data: {
                  user_id: res.data.result.user_list[0].user_id,
                  src_group_id: 'Students',
                  dst_group_id: that.data.lessonToken //自己建的用户组id
                },
                header: {
                  'Content-Type': 'application/json' // 默认值
                },
                success(res2) {
                  console.log(res2)
                  if (res2.data.error_msg == "dst group is not exist") {
                    wx.showModal({
                      title: '签到失败',
                      content: '请确认教师是否开启考勤',
                    })
                  }
                  if (res2.data.error_code == 0) {
                    wx.navigateTo({
                      url: '../success/success',
                    })
                  }
                }
              })
            }
            }
          }
        }
      });
    }
    if(that.data.base64==""){
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
      url: 'https://aip.baidubce.com/oauth/2.0/token',
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
  }
})