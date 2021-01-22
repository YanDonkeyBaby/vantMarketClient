// pages/confirm-order/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {
      userName: '选择'
    },
    carts: [],
    totalprice: 0,
    userMessage: '',
    prepareSubmchPay:false,
    submchPayParams:{},
    submchPayorderResult:{}
  },
  toSelectAddress() {
    wx.navigateTo({
      url: '/pages/address-list/index',
      success: (res) => {
        res.eventChannel.on('selectAddress', address => {
          address.addressInfo = address.region.join('') + address.detailInfo
          this.setData({
            address
          })
        })
      }
    })
  },
  async removeCartsGoods(goodsCartsIds){
    let data = {
      ids:goodsCartsIds
    }
    let res = await wx.wxp.request4({
      url: `${getApp.wxp.URL_BASE}/user/my/carts`,
      method:'delete',
      data
    })
    if(res.data.msg=='ok'){
      wx.switchTab({
        url: '/pages/cart/index',
      })
    }else{
      wx.showModal({
        title: '更新购物车数据失败',
        showCancel: false
      })
    }
    
  },
  onSubmit(e) {
    wx.showActionSheet({
      itemList: ['默认支付','小微商户'],
      success:(res)=>{
        let index = res.tapIndex
        if(index == 0){
          this.startNormalPay(e)
        }else if(index == 1){
          this.startSubmchPay(e)
        }
      },
      fail:(res)=>{
        console.log(res.errMsg)
      }
    })
  },
  // 微信默认支付
  startNormalPay(e){
    wx.showModal({
      title: '暂未实现',
      showCancel:false
    })
  },
  //小微商户支付
  async startSubmchPay(e){
    let address = this.data.address
    if(!address.id){
      wx.showModal({
        title: '没有选择收货地址',
        showCancel: false
      })
      return
    }
    let addressDesc = `${address.userName},${address.telNumber},${address.region.join(',')},${address.detailInfo}`
    let carts = this.data.carts
    let goodsCartsIds = carts.map(item=>item.id)
    let goodsNameDesc = carts.map(item =>`${item.goods_name}(${item.sku_desc})X${item.num}`).join(',')
    if(goodsNameDesc.length>200) goodsNameDesc = goodsNameDesc.substr(0,200)+'..'
    let data = {
      totalFee: this.data.totalPrice,
      addressId: address.id,
      addressDesc,
      goodsCartsIds,
      goodsNameDesc
    }
    let res = await wx.wxp.request4({
      url: `${getApp().wxp.URL_BASE}/user/my/order3`,
      method:'post',
      data
    })
    let submchPayParams = res.data.data.params
    console.log("submchPayParams",submchPayParams);
    this.setData({
      prepareSubmchPay:true,
      submchPayParams
    })
  },
  async bindPaySuccess(res){
    console.log('success', res)
    this.setData({
      submchPayorderResult: res.detail.info
    })
    await wx.wxp.showModal({
      title: '支付成功',
      content: '支付单号：' + res.detail.info.orderId,
      showCancel: false
    })
    let carts = this.data.carts
    let goodsCartsIds = carts.map(item => item.id)
    this.removeCartsGoods(goodsCartsIds)
  },
  bindPayFail(){
    console.log('fail', res)
    this.setData({
      submchPayorderResult: res.detail.info
    })
    if (res.detail.error) {
      console.error('发起支付失败', res.detail.info)
      wx.showModal({
        title: '支付失败，请重试',
        content: '支付单号：' + res.detail.info.orderId,
        showCancel: false
      })
    } else if (res.detail.navigateSuccess) {
      console.log('[取消支付] 支付单号：', res.detail.info.orderId)
      wx.showModal({
        title: '支付取消了，why?',
        content: '支付单号：' + res.detail.info.orderId,
        showCancel: false
      })
    }
  },
  bindPayComplete(){
    this.setData({
      prepareSubmchPay:false
    })
  },
  // 重新计算总价
  calcTotalPrice() {
    let totalPrice = 0
    let carts = this.data.carts
    carts.forEach(item => {
      totalPrice += item.price * item.num
    })
    this.setData({
      totalPrice
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('cartData', (res) => {
      this.setData({
        carts: res.data
      })
    })
    this.calcTotalPrice()
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