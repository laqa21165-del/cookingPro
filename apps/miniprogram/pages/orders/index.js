// @ts-nocheck
import { getOrders } from '../../services/order';
/**
 * 将时间值转为「YYYY-MM-DD HH:mm:ss」。
 * 兼容三种输入：ISO 字符串、Date 对象、Unix 时间戳数字。
 * 纯字符串截取 + Date 兜底，不依赖任何 JS 引擎特性。
 */
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
function formatOrders(orders = [], orderRole = 'customer') {
  return orders.map((order) => ({
    ...order,
    shortId: String(order.id || '').slice(-4).toUpperCase(),
    statusText: order.status === 'pending' ? '进行中' : '已完成',
    statusClass: order.status === 'pending' ? 'soft-pill primary' : 'soft-pill success',
    itemsText: (order.items || []).map((sub) => `${sub.name} x${sub.quantity}`).join(' ・ '),
    notifyStatusText: order.notifyStatus === 'sent' ? '已通知厨师' : '已站内提醒',
    showNewBadge: orderRole === 'chef' && !!order.unreadForChef,
    createdAtText: formatDateTime(order.createdAt),
  }));
}

Page({
  data: {
    orderRole: 'chef',
    orders: [],
    chefTabClass: 'mode-tab mode-tab-active',
    customerTabClass: 'mode-tab',
    hasOrders: false,
    emptyTitle: '这里还没有收到订单',
    emptyCopy: '有人下单后，新的订单会出现在这里。',
  },
  async onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 1 });
      if (typeof tabBar.refreshOrderBadge === 'function') {
        tabBar.refreshOrderBadge();
      }
    }
    await this.loadOrders();
  },
  async loadOrders() {
    try {
      const orderRole = this.data.orderRole;
      const rawOrders = await getOrders(orderRole);
      this.setData({
        orders: formatOrders(rawOrders, orderRole),
        customerTabClass: orderRole === 'customer' ? 'mode-tab mode-tab-active' : 'mode-tab',
        chefTabClass: orderRole === 'chef' ? 'mode-tab mode-tab-active' : 'mode-tab',
        hasOrders: rawOrders.length > 0,
        emptyTitle: orderRole === 'customer' ? '这里还没有订单' : '这里还没有收到订单',
        emptyCopy: orderRole === 'customer' ? '先去点一份菜，再回来看看完整闭环。' : '有人下单后，新的订单会出现在这里。',
      });
    } catch (error) {
      wx.showToast({ title: error.message || '加载订单失败', icon: 'none' });
    }
  },
  async switchRole(event) {
    const role = event.currentTarget.dataset.role;
    this.setData({ orderRole: role });
    await this.loadOrders();
  },
  goDetail(event) {
    wx.navigateTo({ url: `/pages/order-detail/index?id=${event.currentTarget.dataset.id}` });
  },
  goOrder() {
    wx.navigateTo({ url: '/pages/order/index' });
  },
});
