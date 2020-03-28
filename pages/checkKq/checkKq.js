// pages/checkKq/checkKq.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lessonToken: "",
    token: "",
    kaoqinStudents: [], // 已考勤学生列表
    textLog: "", // 显示已考勤学生列表
    studentsNum: 0, // 已考勤学生人数
    notGetStuList: true, // 未获取到考勤学生名单
    allStudents: [], // 已注册学生名单
    totalNum: 0, // 总注册学生数
    realNotPresentNum: 0, // 实际缺勤人数
    notPresentList: "", //缺勤学生名单
    notPresentArray: [], // 缺勤数组
    qingJiaList: [], // 请假学生名单
    qingJiaNum: 0,
    hiddenModal: false,
    queQinArray: []
  },

  confirm: function() {
    var that = this
    this.refreshList()
    this.getUnpresentList()
    that.setData({
      notPresentArray: that.data.notPresentArray,
      hiddenModal: true
    })
  },

  cancel: function() {
    this.setData({
      hiddenModal: true
    })
    wx.navigateBack({

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
          studentsNum: res.data.result.user_id_list.length,
        })
        if (res.data.error_msg == "SUCCESS") {
          wx.showToast({
            title: '刷新列表成功',
          })
        }
      }
    })
  },

  getUnpresentList: function() {
    var that = this;
    that.setData({
      notPresentList: ""
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
    var notPresentNum = 0;
    for (var i = 0; i < that.data.totalNum; i++) {
      var studentPresent = false;
      for (var j = 0; j < that.data.studentsNum; j++) {
        if (that.data.allStudents[i] == that.data.kaoqinStudents[j]) {
          studentPresent = true;
        }
      }
      if (!studentPresent) {
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
  },

  getUp: function() {
    var that = this
    this.refreshList()
    this.getUnpresentList()
    that.setData({
      notPresentArray: that.data.notPresentArray
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

  getUnpresent: function() {
    var that = this
    that.setData({
      queQinArray:[]
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
    var that = this
    console.log(options)
    that.setData({
      lessonToken: "Kaoqin"
    })
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
          token: res.data.access_token, //获取到token
        })
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
  onShow: function() {},

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