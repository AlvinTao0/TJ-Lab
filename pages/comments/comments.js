// pages/comments/comments.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentsData: {},
    show: false,
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var $this = this;
    wx.request({
      url: 'https://small.tjzmy.cn/v2/movie/subject/' + options.id + '/comments?apikey=0df993c66c0c636e29ecbb5344252a4a&count=20',
      header: {
        'content-type': 'json'
      },
      success: function (res) {
        $this.setData({
          commentsData: res.data,
          show: true
        })
        wx.setNavigationBarTitle({
          title: res.data.subject.title + '-短评'
        })
      }
    })
  },
  scrollTolower: function () {
    var $this = this;
    if (!$this.data.loading) {
      $this.setData({
        loading: true
      })
      var start = $this.data.commentsData.start + $this.data.commentsData.count;
      wx.request({
        url: 'https://small.tjzmy.cn/v2/movie/subject/' + $this.options.id + '/comments?apikey=0df993c66c0c636e29ecbb5344252a4a&count=20&start=' + start,
        header: {
          'content-type': 'json'
        },
        success: function (res) {
          var commentsData = $this.data.commentsData;
          commentsData.comments = commentsData.comments.concat(res.data.comments);
          console.log(commentsData)
          commentsData.start = res.data.start;
          $this.setData({
            commentsData: commentsData,
            loading: false
          })
        }
      })
    }
    
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