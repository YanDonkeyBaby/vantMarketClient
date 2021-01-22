// components/xunhupay/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    params: { // 支付订单参数
      type: Object,
      value: null
    },
    envVersion:{
      type:String,
      value:'release'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showPayModal:false,
    paying: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setPaying(){},
    onTapCancel(){

    },
    navigateSuccess(){},
    navigateFail(){},
  }
})
