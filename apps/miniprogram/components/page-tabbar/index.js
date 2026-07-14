Component({
  properties: {
    selected: {
      type: String,
      value: 'home'
    }
  },
  data: {
    tabs: [
      {
        key: 'home',
        text: '首页',
        path: '/pages/home/index',
        icon: '/images/icons/tab-home.svg',
        activeIcon: '/images/icons/tab-home-active.svg'
      },
      {
        key: 'orders',
        text: '订单',
        path: '/pages/orders/index',
        icon: '/images/icons/tab-orders.svg',
        activeIcon: '/images/icons/tab-orders-active.svg'
      },
      {
        key: 'menu',
        text: '菜单',
        path: '/pages/menu/index',
        icon: '/images/icons/tab-menu.svg',
        activeIcon: '/images/icons/tab-menu-active.svg'
      },
      {
        key: 'me',
        text: '我的',
        path: '/pages/me/index',
        icon: '/images/icons/tab-me.svg',
        activeIcon: '/images/icons/tab-me-active.svg'
      }
    ]
  },
  methods: {
    switchTab(event) {
      const path = event.currentTarget.dataset.path;
      if (!path) {
        return;
      }
      wx.switchTab({ url: path });
    }
  }
});
