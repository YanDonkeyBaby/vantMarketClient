// pages/cart/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoginPanel:false,
    cartIdSelectedResult:[],
    allIsSelected:false,
    editMode:false,
    carts:[],
    totalPrice:0
  },

  calcTotalPrice(){
    let totalPrice =0
    let ids = this.data.cartIdSelectedResult
    let carts = this.data.carts
    ids.forEach(id=>{
      carts.some(item=>{
        if(item.id == id){
          totalPrice += item.price * item.num
          return true
        }
          return false
      })
    })
    this.setData({
      totalPrice
    })

  },

  changeEditMode(){
    let editMode = !this.data.editMode
    this.setData({
      editMode
    })
  },
  onSelectGoodsItem(e){
    let cartIdSelectedResult = e.detail
    this.setData({
      cartIdSelectedResult
    })
    this.calcTotalPrice()
  },
  onSelectAll(e){
    let allIsSelected = e.detail
    let carts = this.data.carts
    let cartIdSelectedResult = this.data.cartIdSelectedResult
    cartIdSelectedResult=[]
    if(allIsSelected){
      carts.forEach(item=>{
        cartIdSelectedResult.push(`${item.id}`)
      })
    }
    this.setData({
      cartIdSelectedResult,
      allIsSelected
    })
    this.calcTotalPrice()
  },

  async onCartGoodsNumChanged(e){
    let cartGoodsId = e.currentTarget.dataset.id
    let oldNum = parseInt(e.currentTarget.dataset.num)
    let num = e.detail
    let data = {num}
    let res = await wx.wxp.request4({
      url:`${getApp().wxp.URL_BASE}/user/my/carts/${cartGoodsId}`,
      method:'put',
      data
    })
    if(res.data.msg == 'ok'){
      wx.showToast({
        title: num>oldNum?'增加成功':'减少成功',
      })
      // 修复数据
      let carts = this.data.carts
      carts.some(item=>{
        if(item.id==cartGoodsId){
          item.num = num
          return true
        }
          return false
      })
      this.calcTotalPrice()
    }else{
      wx.showToast({
        title: '增加失败',
      })
    }
  },

  onCartConfirm(e){
    let carts = this.data.carts
    let cartData = []
    let ids = this.data.cartIdSelectedResult
    if(ids.length === 0){
      wx.showModal({
        title: '未选择商品',
        showCancel: false
      })
      return
    }
    for(let i=0;i<ids.length;i++){
      carts.some(item=>{
        if(item.id == ids[i]){
          cartData.push(Object.assign({},item))
          return true
        }
        return false
      })
    }
    wx.navigateTo({
      url: '/page/confirm-order/index',
      success:function(res){
        res.eventChannel.emit('cartData',{data:cartData})
      }
    })

  },

  

  onClickEditAddress(e){

  },
  async removeCartGoods(){
    let ids = this.data.cartIdSelectedResult
    if(ids.length===0){
      wx.showModal({
        title: '没有选择商品',
        showCancel: false
      })
      return
    }
    let data = {ids}
    let res = await wx.wxp.request4({
      url:`${getApp().wxp.URL_BASE}/user/my/carts`,
      method:'delete',
      data
    })
    if(res.data.msg == 'ok'){
      let carts = this.data.carts
      for(let i=0;i<ids.length;i++){
        carts.some((item,index)=>{
          if(item.id == ids[i]){
            carts.splice(index,1)
            return true
          }
          return false
        })
      }
      this.setData({
        carts
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow:async function () {
    let res = await wx.wxp.request4({
      url: `${getApp().wxp.URL_BASE}/user/my/carts`,
      method:'get'
    })
    if(res.data.msg == "ok"){
      let carts = res.data.data
      this.setData({
        carts
      })
    }
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