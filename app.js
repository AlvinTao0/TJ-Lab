//app.js
App({
  onLaunch: function () {
    var S = this;
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
  /**
    * 设置监听器
    */
  setWatcher(data, watch, currentThis) { // 接收index.js传过来的data对象和watch对象
    Object.keys(watch).forEach(v => { // 将watch对象内的key遍历
      this.observe(data, v, watch[v], currentThis); // 监听data内的v属性，传入watch内对应函数以调用
    })
  },

  /**
   * 监听属性 并执行监听函数
   */
  observe(obj, key, watchFun, currentThis) {
    var val = obj[key]; // 给该属性设默认值
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        val = value;
        watchFun.call(currentThis, value, val); // 赋值(set)时，调用对应函数
      },
      get: function () {
        return val;
      }
    })
  },
  globalData: {
    userInfo: null
  }
})