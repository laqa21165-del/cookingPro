Component({
  data: {
    selected: 0,
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
    ],
    routeMap: {
      'pages/home/index': 0,
      'pages/orders/index': 1,
      'pages/menu/index': 2,
      'pages/me/index': 3
    }
  },
  lifetimes: {
    attached() {
      this.syncSelected();
    }
  },
  pageLifetimes: {
    show() {
      this.syncSelected();
    }
  },
  methods: {
    syncSelected() {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      const route = current?.route || '';
      const selected = this.data.routeMap[route];
      if (typeof selected === 'number' && selected !== this.data.selected) {
        this.setData({ selected });
      }
    },
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset;
      if (!path) {
        return;
      }
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (`/${current?.route || ''}` === path) {
        this.syncSelected();
        return;
      }
      this.setData({ selected: Number(index) || 0 });
      wx.switchTab({ url: path });
    }
  }
});
