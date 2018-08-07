// pages/movieDetail/movieDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    detail: {},
    comments: [],
    photos: [],
    imagesList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let $this = this;
    // 获取保存到相册的权限
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('授权成功')
            }
          })
        }
      }
    })
    wx.request({
      url: 'https://small.tjzmy.cn/v2/movie/subject/' + options.id,
      header: {
        'content-type': 'json'
      },
      success: function(res) {
        $this.setData({
          detail: res.data,
          show: true
        })
        wx.setNavigationBarTitle({
          title: '月牙爱看-' + res.data.title
        })
      }
    })
    wx.request({
      url: 'https://small.tjzmy.cn/v2/movie/subject/' + options.id + '/comments?apikey=0df993c66c0c636e29ecbb5344252a4a&count=3',
      header: {
        'content-type': 'json'
      },
      success: function(res) {
        $this.setData({
          comments: res.data.comments
        })
      }
    })
    wx.request({
      url: 'https://small.tjzmy.cn/v2/movie/subject/' + options.id + '/photos?apikey=0df993c66c0c636e29ecbb5344252a4a',
      header: {
        'content-type': 'json'
      },
      success: function (res) {
        let arr = [];
        for(let i=0;i<res.data.photos.length;i++) {
          let photo = res.data.photos[i];
          arr.push(photo.image);
        }
        $this.setData({
          photos: res.data.photos,
          imagesList: arr
        })
      }
    })
  },
  preview: function(event) {
    let $this = this;
    let src = event.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: $this.data.imagesList,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})