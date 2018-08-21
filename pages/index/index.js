const app = getApp();
Page({
  data: {
    movies: [],
    tab_num: '1',
    userInfo: {},
    chatMsgs: [],
    txt: '',
    scrollTop: 0,
    userInfoBtnHidden: false
  },
  onLoad: function() {
    let $this = this;
    wx.setNavigationBarTitle({
      title: '月牙爱看-热映电影'
    })
    // 电影
    wx.request({
      url: 'https://small.tjzmy.cn/v2/movie/in_theaters',
      header: {
        "Content-Type": "json"
      },
      success: function(res) {
        $this.setData({
          movies: res.data.subjects
        })
      }
    })
  },
  startSocket: function() {
    var $this = this;
    wx.connectSocket({
      url: 'wss://small.tjzmy.cn/socket/?img=' + this.data.userInfo.avatarUrl + '&openid=' + app.globalData.openid,
      header: {
        'content-type': 'application/json'
      }
    })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！');
      var msg = '大家好';
      wx.sendSocketMessage({
        data: msg,
        fail: function (res) {
          console.log('发送失败1', res)
        },
        success: function(res) {
          $this.render(msg, $this.data.userInfo.avatarUrl, true);
        }
      })
    })
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！');
    })
    wx.onSocketMessage(function (res) {
      console.log('收到服务器内容：' + res.data);
      var resdata = JSON.parse(res.data);
      $this.render(resdata.message, resdata.img, false);
    })
    wx.onSocketClose(function(res) {
      console.log('Socket链接关闭');
      setTimeout(function() {
        $this.reconnect();
      }, 1000)
    })
  },
  reconnect: function(msg) {
    var $this = this;
    wx.connectSocket({
      url: 'wss://small.tjzmy.cn/socket/?img=' + $this.data.userInfo.avatarUrl + '&openid=' + app.globalData.openid,
      header: {
        'content-type': 'application/json'
      }
    })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！again');
      if (msg) {
        wx.sendSocketMessage({
          data: msg,
          fail: function(res) {
            console.log('重新链接并发送失败', res);
          },
          success: function(res) {
            $this.render(msg, $this.data.userInfo.avatarUrl, true);
          }
        })
      }
    })
  },
  detail: function(event) {
    let movie = event.currentTarget.dataset.movie;
    wx.navigateTo({
      url: '../movieDetail/movieDetail?id=' + movie.id
    })
  },
  getUserInfoFun: function () {
    var S = this;
    // 获取用户信息
    if (app.globalData.userInfo && app.globalData.userInfo.nickName) {
      // 已有用户信息
      S.setData({
        userInfo: app.globalData.userInfo
      })
      S.startSocket();
      return;
    } else {
      // 没有用户信息
      wx.getUserInfo({
        success: function (res) {
          console.log("userInfo:", res);
          app.globalData.userInfo = res.userInfo;
          S.setData({
            userInfo: res.userInfo
          })
          S.startSocket();
          S.saveUserInfo(res.userInfo);
        },
        fail: res => {
          var userInfo = {
            avatarUrl: 'http://o71pfzm86.bkt.clouddn.com/u=1587665103,1340804954&fm=21&gp=0.jpg'
          }
          app.globalData.userInfo = userInfo
          S.setData({
            userInfo: userInfo
          })
          S.startSocket();
          S.saveUserInfo(userInfo);
        }
      })
    }
  },
  tabSwitch: function(event) {
    let $this = this;
    $this.setData({
      tab_num: event.currentTarget.dataset.num
    })
    // 第一次点击聊天室以后，隐藏获取用户信息button
    if (event.currentTarget.dataset.num == '2' && !$this.data.userInfoBtnHidden) {
      $this.setData({
        userInfoBtnHidden: true
      });
    }
  },
  bindFormSubmit: function (e) {
    var $this = this;
    console.log(e.detail.value.textarea)
    var msg = e.detail.value.textarea;
    $this.send(msg);
  },
  inputSubmit: function (e) {
    var $this = this;
    $this.send(e.detail.value);
  },
  send: function(msg) {
    var $this = this;
    if (!msg) {
      return;
    }
    wx.sendSocketMessage({
      data: msg,
      fail: function (res) {
        console.log('发送失败2', res)
        $this.reconnect(msg);
      },
      success: function (res) {
        $this.render(msg, $this.data.userInfo.avatarUrl, true);
      }
    })
    this.setData({
      txt: ''
    })
  },
  saveUserInfo: function(userInfo) {
    var S = this;
    userInfo.openid = app.globalData.user.openid;
    wx.request({
      url: 'https://small.tjzmy.cn/api/user/save',
      method: 'post',
      data: userInfo,
      header: {
        'content-type': 'multipart/form-data'
      },
      success: function(res) {
        console.log(res)
      }
    })
  },
  render: function(msg, img, isOwn) {
    var $this = this;
    var chat = {
      img: img,
      msg: msg,
      isOwn: isOwn
    }
    var chatMsgs = $this.data.chatMsgs;
    chatMsgs.push(chat);
    $this.setData({
      chatMsgs: chatMsgs
    })
    var length = chatMsgs.length;
    $this.setData({
      scrollTop: 100 * chatMsgs.length
    })
  }
})