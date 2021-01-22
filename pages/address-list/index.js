// pages/address-list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedAddressId:0,
    addressList: [],
    radio:0,
    slideButtons: [{
      type: 'warn',
      text: '删除'
    }]
  },
  getAddressFromWeixin(e){
    if(wx.canIUse('chooseAddress.success.userName')){
      wx.chooseAddress({
        success: async (res) => {
          let addressList = this.data.addressList
          let addressContained = addressList.find(item=>item.telNumber==res.telNumber)
          if(addressContained){
            this.setData({
              selectedAddressId:addressContained.id
            })
            return
          }
          let data = {
            userName: res.userName,
            telNumber: res.telNumber,
            region: [res.provinceName, res.cityName, res.countyName],
            detailInfo: res.detailInfo
          }
          let res1 = await wx.wxp.request4({
            url: `${getApp().wxp.URL_BASE}/user/my/address`,
            method:'post',
            data
          })
          if(res1.data.msg=='ok'){
            let item = res1.data.data
            addressList.push(item)
            this.setData({
              addressList,
              selectedAddressId:item.id
            })
          }else{
            wx.showToast({
              title: '添加不成功，是不是添加过了？',
            })
          }
        },
      })
    }
  },

  onChange(e){
    // let selectedAddressId = e.detail
    this.setData({
      selectedAddressId:e.detail
    })
  },
  async onSlideButtonTap(e){
    let id = e.currentTarget.dataset.id
    let data = {id}
    let res = await wx.wxp.request4({
      url: `${getApp().wxp.URL_BASE}/user/my/address`,
      method:'delete',
      data
    })
    if(res.data.msg == 'ok'){
      let addressList = this.data.addressList
      let selectedAddressId = this.data.selectedAddressId
      for(let j=0;j<addressList.length;j++){
        if (addressList[j].id == id){
          addressList.splice(j, 1)
          break
        }
      }
      this.setData({
        addressList,
        selectedAddressId:id==selectedAddressId?addressList[0].id:selectedAddressId
      })
    }
  },
  edit(e){
    let id = e.currentTarget.dataset.id
    let addressList = this.data.addressList
    let address = addressList.find(item=>item.id == id)
    wx.navigateTo({
      url: '/pages/new-address/index',
      success:(res)=>{
        res.eventChannel.emit('editAddress',address)
        res.eventChannel.on('savedNewAddress',this.onSavedAddress)
      }
    })
  },
  confirm(){
    let selectedAddressId = this.data.selectedAddressId
    let addressList = this.data.addressList
    let item = addressList.find(item=>item.id == selectedAddressId)
    let opener = this.getOpenerEventChannel()
    opener.emit('selectAddress',item)
    wx.navigateBack({
      delta: 1,
    })
  },
  // 新增完收货地址后回调这个方法
  onSavedAddress(address){
    let addressList = this.data.addressList
    let hasExist = addressList.some((item,index)=>{
      if(item.id == address.id){
        addressList[index]=address
        return true
      }
      return false
    })
    if(!hasExist){
      addressList.push(address)
    }
    this.setData({
      addressList,
      selectedAddressId: address.id
    })
  },
  navigateToNewAddressPage(){
    wx.navigateTo({
      url: '/pages/new-address/index',
      success:(res)=>{
        res.eventChannel.on("savedNewAddress",this.onSavedAddress)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let res = await wx.wxp.request4({
      url: `${getApp().wxp.URL_BASE}/user/my/address`,
      method:'get'
    })
    let addressList = res.data.data
    let selectedAddressId = addressList[0].id
    this.setData({
      selectedAddressId,
      addressList
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