Page({
  data: {
    vtabs: [],
    activeTab: 0,
    goodsListMap:{},
    lastIndexForLoadMore:-1,
    loading:true,
  },

  async onLoad() {
    let categories = await wx.wxp.request({
      url: getApp().globalData.api_url+'/goods/categories',
    })
    if(categories){
      categories = categories.data.data
    }
    let vtabs = [];
    for(let j=0;j<categories.length;j++){
      const item = categories[j]
      if(j<3) this.getGoodsListByCategory(item.id,j)
      vtabs.push({title: item.category_name,id:item.id})
    }
    this.setData({
      vtabs,
      loading:false
    })
  },

  onScrollToIndexLower(e){
    console.log('scorll to index lower',e.detail)
    let index = e.detail.index
    // 这是一个多发事件,避免重复触发
    if (index != this.data.lastIndexForLoadMore){
      let cate = this.data.vtabs[index]
      let categoryId = cate.id
      this.getGoodsListByCategory(categoryId,index, true)
      this.data.lastIndexForLoadMore = index 
    }
  },

  // 重新计算高度
  reClacChildHeight(index){
    const categoryVtabs = this.selectComponent('#category-vtabs')
    const goodsContent = this.selectComponent(`#goods-content${index}`)
    categoryVtabs.calcChildHeight(goodsContent)
  },
  
  async getGoodsListByCategory(categoryId,index,loadNextPage = false){
    const pageSize = 10
    let pageIndex = 1
    let listMap = this.data.goodsListMap[categoryId]
    if(listMap){
      // 加载完了就不需要重复加载了
      if(listMap.row.length>=listMap.count) return;
      if(listMap.pageIndex){
        pageIndex = listMap.pageIndex
        if(loadNextPage) pageIndex++
      }
    }
    let goodsList = await wx.wxp.request({
      url: getApp().globalData.api_url+`/goods/goods?page_size=${pageSize}0&page_index=${pageIndex}&category_id=${categoryId}`,
    })
    if(goodsList) goodsList = goodsList.data.data.rows
    if(listMap){
      listMap.pageIndex = pageIndex
      listMap.count = goodsList.count
      listMap.rows.push(...goodsList.rows)
      this.setData({
        [`goodsListMap[${categoryId}]`] : listMap
      })
    }else{
      goodsList.pageIndex = pageIndex
      this.setData({
        [`goodsListMap[${categoryId}]`] : goodsList
      })
    }
    this.reClacChildHeight(index)
  },
  onCategoryChanged(index){
    let cate = this.data.vtabs[index]
    let categoryId = cate.id
    if(!this.data.goodsListMap[categoryId]){
      this.getGoodsListByCategory(categoryId,index)
    }
  },
  async onTapGoods(e){
    wx.showLoading({
      title: 'loading...',
    })
    let goodsId = e.currentTarget.dataset.id
    let goods = await wx.wxp.request({
      url: getApp().globalData.api_url+ `/goods/goods/${goodsId}`
    })
    if(goods){
      goods = goods.data.data
      wx.navigateTo({
        url: `/pages/goods/index?goodsId=${goodsId}`,
        success: function(res){
          res.eventChannel.emit('goodsData',{data:goods})
        }
      })
    }
    
    wx.hideLoading()
  },

  onTabCLick(e) {
    const index = e.detail.index
    console.log('tabClick', index)
    this.onCategoryChanged(index)
  },

  onChange(e) {
    const index = e.detail.index
    console.log('change', index)
    this.onCategoryChanged(index)
  }

})
