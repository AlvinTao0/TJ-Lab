//app.js
App({
  onLaunch: function () {
    var S = this;
    console.log(S)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        if(res.code) {
          wx.request({
            url: 'https://small.tjzmy.cn/api/auth',
            method: 'post',
            data: {
              code: res.code
            },
            header: {
              'content-type': 'multipart/form-data'
            },
            success: function (res) {
              if(res.statusCode == 200 && res.data.success == true) {
                S.globalData.userInfo = res.data.data;
                S.globalData.openid = res.data.data.openid;
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})