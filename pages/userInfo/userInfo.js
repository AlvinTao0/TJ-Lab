// pages/userInfo/userInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    options: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var $this = this;
    $this.setData({
      options: options
    })
    // 获取用户数据
    $this.getUserInfo(options._id);
  },

  /**
   * 获取用户信息
   * @param {String} _id
   */
  getUserInfo: function(_id) {
    var $this = this;
    // 测试_id:
    // var _id = $this.options._id || '5c452505c1105d53ea45578e';
    var _id = $this.options._id;
    wx.request({
      url: 'https://small.tjzmy.cn/api/user/info?_id=' + _id,
      header: {
        'content-type': 'json'
      },
      success: function(res) {
        if (res.data.success) {
          $this.setData({
            userInfo: res.data.data,
            show: true
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '暂无用户信息',
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      }
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