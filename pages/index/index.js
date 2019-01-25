const app = getApp();
Page({
  data: {
    movies: [],
    tab_num: '1',
    userInfo: {},
    chatMsgs: [],
    txt: '',
    scrollTop: 0,
    userInfoBtnHidden: false,
    start: 'Infinity',
    limit: 20,
    loading: false,
    enouth: false
  },
  onLoad: function() {
    let $this = this;
    // app.setWatcher(this.data, this.watch, this);
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
    // 聊天
    $this.getHistory();
  },
  
  // 开始第一次链接websocket
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
          console.log('收到服务器内容：', res);
        }
      })
    })
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！');
    })
    wx.onSocketMessage(function (res) {
      console.log('收到服务器内容：' + res.data);
      console.log('收到信息时用户的信息data.userInfo', $this.data.userInfo)
      var resdata = JSON.parse(res.data);
      $this.render(resdata);
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
            console.log('收到服务器内容：', res.data);
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
  openUserInfo: function(event) {
    let _id = event.currentTarget.dataset._id;
    wx.navigateTo({
      url: '../userInfo/userInfo?_id=' + _id
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
      S.setData({
        userInfoBtnHidden: true,
        tab_num: '2'
      })
      return;
    } else {
      // 没有用户信息
      wx.getUserInfo({
        success: function (res) {
          console.log("userInfo:", res);
          res.userInfo.openid = app.globalData.openid;
          app.globalData.userInfo = res.userInfo;
          S.setData({
            userInfo: res.userInfo
          })
          S.startSocket();
          S.saveUserInfo(res.userInfo);
          S.setData({
            userInfoBtnHidden: true,
            tab_num: '2'
          })
        },
        fail: res => {
          // 用户拒绝，返回前一页
          S.setData({
            tab_num: '1'
          })
        }
      })
    }
  },
  tabSwitch: function(event) {
    let $this = this;
    let tab_num = event.currentTarget.dataset.num;
    if (tab_num == '2' && !$this.data.userInfoBtnHidden) {
      return;
    }
    $this.setData({
      tab_num: event.currentTarget.dataset.num
    })
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
      }
    })
    this.setData({
      txt: ''
    })
  },
  saveUserInfo: function(userInfo) {
    var S = this;
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
  render: function(chat) {
    var $this = this;
    var chatMsgs = $this.data.chatMsgs;
    chatMsgs.push(chat);
    $this.setData({
      chatMsgs: chatMsgs,
      scrollTop: 100 * chatMsgs.length
    })
  },
  getHistory: function(isUpper) {
    var S = this;
    if(S.data.far || S.data.enough) {
      return;
    }
    S.setData({
      loading: true,
      far: true
    })
    wx.request({
      url: 'https://small.tjzmy.cn/api/chat/list2',
      data: {
        start: S.data.start,
        limit: S.data.limit
      },
      header: {
        'content-type': 'json'
      },
      success: function (res) {
        if(res.statusCode == 200) {
          if(res.data.data.length > 0) {
            var chatMsgs = S.data.chatMsgs;
            chatMsgs = res.data.data.reverse().concat(chatMsgs);
            S.setData({
              chatMsgs: chatMsgs,
              start: res.data.data[0].td
            })
            console.log('td', S.data.start)
            if(!isUpper) {
              S.setData({
                scrollTop: 100 * chatMsgs.length + 'rpx'
              })
            } else {
              S.setData({
                scrollTop: 100 * S.data.limit.length + 'rpx'
              })
            }
          } else {
            console.log('enough')
            S.setData({
              enough: true
            })
          }
        }
      },
      complete: function() {
        S.setData({
          loading: false
        })
        setTimeout(function() {
          S.setData({
            far: false
          })
        }, 2000)
      }
    })
  },
  upper: function() {
    this.getHistory(true);
  }
})