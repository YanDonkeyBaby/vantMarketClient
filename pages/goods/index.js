// pages/goods/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsId: 0,
    goodsData: {},
    goodsImages: [],
    goodsContentInfo: {},
    showSkuPanel: false,
    goodsSkuData: {},
    selectedGoodsSku: {},
    selectedAttrValue: {},
    selectedGoodsSkuObject: {}

  },
  //显示规格面板
  showSkuPanelPopup() {
    this.setData({
      showSkuPanel: true
    });
  },

  // 关闭规格面板
  onCloseSkuPanel(e) {
    this.setData({
      showSkuPanel: false
    })
  },

  // 加入购物车
  async addToCart(e) {
    if(!this.data.selectedGoodsSkuObject.sku){
      wx.showModal({
        title: '请选择商品规格',
          showCancel: false
      })
      this.showSkuPanelPopup();
      return
    }

    let goods_id = this.data.goodsId
    let goods_sku_id = this.data.selectedGoodsSkuObject.sku.id
    let goods_sku_desc = this.data.selectedGoodsSkuObject.text
    const data = {
      goods_id,
      goods_sku_id,
      goods_sku_desc
    }
    let res = await wx.wxp.request4({
      url:  `${getApp().wxp.URL_BASE}/user/my/carts`,
      method:'post',
      data
    })
    if(res.data.msg == 'ok'){
      wx.showToast({
        title: '已添加'
      })
    }

  },
  toCart(e){
    wx.switchTab({
      url: '/pages/cart/index',
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let goodsId = options.goodsId
    this.data.goodsId = goodsId
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('goodsData', (res) => {
      console.log(res)
      let goodsImages = res.data.goods_infos.filter(item => item.kind == 0)
      let goodsContentInfo = res.data.goods_infos.filter(item => item.kind == 1)
      this.setData({
        goodsData: res.data,
        goodsImages,
        goodsContentInfo
      })
    })

    //获取sku规格数据
    let goodsSkuDataRes = await wx.wxp.request({
      url: `${getApp().wxp.URL_BASE}/goods/goods/${goodsId}/sku`,
    })
    if (goodsSkuDataRes) {
      let goodsSkuData = goodsSkuDataRes.data.data
      this.setData({
        goodsSkuData
      })
    }

  },
  // 选择规格
  onTapSkuTag(e) {
    // 获取及设置选择的规格
    let attrvalue = e.currentTarget.dataset.attrvalue
    let attrkey = e.currentTarget.dataset.attrkey
    console.log(attrvalue, attrkey)
    let selectedAttrValue = this.data.selectedAttrValue
    selectedAttrValue[attrkey] = attrvalue
    this.setData({
      selectedAttrValue
    })

    //根据所选规格，找到对应的价格及库存
    let totalIdValue = 0
    let goodsAttrKeys = this.data.goodsSkuData.goodsAttrKeys
    for (let i = 0; i < goodsAttrKeys.length; i++) {
      let attrKey = goodsAttrKeys[i].attr_key
      if (selectedAttrValue[attrKey]) {
        totalIdValue += selectedAttrValue[attrKey].id
      }
    }
    let goodsSku = this.data.goodsSkuData.goodsSku
    let tempTotalIdValue = 0
    for (let j = 0; j < goodsSku.length; j++) {
      let goodsAttrPath = goodsSku[j].goods_attr_path
      if (goodsAttrPath.length != goodsAttrKeys.length) {
        break
      }
      tempTotalIdValue = 0
      goodsAttrPath.forEach(item => tempTotalIdValue += item)
      if (tempTotalIdValue == totalIdValue) {
        let selectedGoodsSku = goodsSku[j]
        this.setData({
          selectedGoodsSku
        })
        break
      }

    }

  },
  // 确定选择的规格
  onConfirmGoodsSku() {
    let goodsSkuData = this.data.goodsSkuData
    let selectedGoodsSkuObject = this.data.selectedGoodsSkuObject
    selectedGoodsSkuObject.sku = Object.assign({}, this.data.selectedGoodsSku)
    selectedGoodsSkuObject.text = ''
    for (let i = 0; i < goodsSkuData.goodsAttrKeys.length; i++) {
      let item = goodsSkuData.goodsAttrKeys[i]
      if (!this.data.selectedAttrValue[item.attr_key]) {
        wx.showModal({
          title: '没有选择全部规格',
          showCancel: false
        })
        return
      }
      selectedGoodsSkuObject.text += this.data.selectedAttrValue[item.attr_key].attr_value + ' '
    }
    this.setData({
      selectedGoodsSkuObject,
      showSkuPanel: false
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