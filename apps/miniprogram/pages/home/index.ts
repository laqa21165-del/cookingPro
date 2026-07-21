// @ts-nocheck
import { ensureLogin, refreshMe } from '../../utils/auth';
import { createBindingShare, getBindings } from '../../services/binding';
import { getOrders } from '../../services/order';

function formatBindings(bindings = []) {
  return bindings.map((item) => ({
    ...item,
    displayName: item.chefName || '未命名厨师',
    avatarText: (item.chefName || '厨').charAt(0),
  }));
}

function getGreetingContent() {
  const hour = new Date().getHours();
  if (hour < 6) {
    return {
      title: '夜深了，把心意交给文字',
      subline: '今天也辛苦啦，慢慢挑',
    };
  }
  if (hour < 12) {
    return {
      title: '早上好，把心意交给文字',
      subline: '今天也辛苦啦，慢慢挑',
    };
  }
  if (hour < 18) {
    return {
      title: '下午好，把心意交给文字',
      subline: '今天也辛苦啦，慢慢挑',
    };
  }
  return {
    title: '晚上好，把心意交给文字',
    subline: '今天也辛苦啦，慢慢挑',
  };
}

function formatDateTime(value) {
  if (!value && value !== 0) return '';
  var d;
  var num = Number(value);
  if (!isNaN(num) && String(value).trim() !== '') {
    // 数字时间戳（秒或毫秒）：统一转成毫秒后交给 new Date，按设备本地时区解析
    d = new Date(num > 1e12 ? num : num * 1000);
  } else {
    // ISO 字符串（如 2026-07-13T10:06:55.123Z）：new Date 会自动按本地时区换算
    d = new Date(value);
  }
  if (isNaN(d.getTime())) {
    return String(value);
  }
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
         ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

function formatTodoOrders(orders = []) {
  return (orders || [])
    .filter((order) => order.status === 'pending')
    .slice(0, 3)
    .map((order) => ({
      id: order.id,
      shortId: String(order.id || '').slice(-4).toUpperCase(),
      itemsText: (order.items || []).map((sub: any) => `${sub.name} x${sub.quantity}`).join(' ・ '),
      itemCount: (order.items || []).reduce((sum: number, sub: any) => sum + (sub.quantity || 0), 0),
      createdAtText: formatDateTime(order.createdAt),
      unread: !!order.unreadForChef,
    }));
}

Page({
  data: {
    me: null,
    customerBindings: [],
    shareLink: null,
    bindingConfirmed: false,
    hasBindings: false,
    greetingTitle: '',
    greetingSubline: '',
    topInset: 60,
    todoOrders: [],
    hasTodoOrders: false,
  },
  async onLoad() {
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage'] });
    }
  },
  async onShow() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const menuRect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const topInset = menuRect ? menuRect.bottom + 18 : (windowInfo.statusBarHeight || 20) + 52;
    const greeting = getGreetingContent();
    this.setData({
      topInset,
      greetingTitle: greeting.title,
      greetingSubline: greeting.subline,
    });
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 0 });
    }
    await this.bootstrap();
  },
  async bootstrap() {
    try {
      await ensureLogin();
      const [me, bindings, chefOrders] = await Promise.all([refreshMe(), getBindings(), getOrders('chef')]);
      const customerBindings = formatBindings(me.bindings?.asCustomer || bindings.asCustomer || []);
      const bindingConfirmed = !!wx.getStorageSync('binding-confirmed');
      if (bindingConfirmed) {
        wx.removeStorageSync('binding-confirmed');
      }
      this.setData({
        me,
        customerBindings,
        bindingConfirmed,
        hasBindings: customerBindings.length > 0,
        todoOrders: formatTodoOrders(chefOrders),
        hasTodoOrders: (chefOrders || []).some((order) => order.status === 'pending'),
      });
      const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
      if (tabBar && typeof tabBar.refreshOrderBadge === 'function') {
        tabBar.refreshOrderBadge();
      }
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },
  async prepareShare() {
    try {
      const shareLink = await createBindingShare();
      this.setData({ shareLink });
      wx.showToast({ title: '邀请口令已生成', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: error.message || '生成失败', icon: 'none' });
    }
  },
  copyShareToken() {
    const token = this.data.shareLink?.token;
    if (!token) {
      wx.showToast({ title: '请先生成邀请口令', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: token,
      success: () => wx.showToast({ title: '口令已复制', icon: 'success' }),
      fail: () => wx.showToast({ title: '复制失败', icon: 'none' }),
    });
  },
  goBindChef() {
    wx.navigateTo({ url: '/pages/bind-confirm/index' });
  },
  directEnter() {
    wx.navigateTo({ url: '/pages/order/index' });
  },
  chooseChef(event) {
    const chefId = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order/index?chefId=${chefId}` });
  },
  goOrders() {
    wx.switchTab({ url: '/pages/orders/index' });
  },
  goTodoOrder(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  },
  onShareAppMessage() {
    const shareLink = this.data.shareLink;
    if (!shareLink?.token) {
      return {
        title: '邀请你绑定我的菜单，之后就能直接点单',
        path: '/pages/home/index',
      };
    }
    return {
      title: shareLink.shareTitle || '邀请你绑定我的菜单，之后就能直接点单',
      path: shareLink.miniProgramPath || `/pages/bind-confirm/index?token=${shareLink.token}`,
    };
  },
});
