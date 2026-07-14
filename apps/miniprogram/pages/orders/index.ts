// @ts-nocheck
import { getOrders } from '../../services/order';

/**
 * 将时间值转为「YYYY-MM-DD HH:mm:ss」。
 * 兼容三种输入：ISO 字符串、Date 对象、Unix 时间戳数字。
 * 纯字符串截取 + Date 兜底，不依赖任何 JS 引擎特性。
 */
function formatDateTime(value) {
  // 1) 空值 → 原样返回空
  if (!value && value !== 0) return '';

  var s = String(value);

  // 2) ISO 字符串直接截取（最快路径，不经过 new Date）
  //    匹配 2026-07-13T10:06:55 或 2026-07-13T10:06:55.123Z 或带时区偏移
  var isoMatch = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/
  );
  if (isoMatch) {
    return isoMatch[1] + '-' + isoMatch[2] + '-' + isoMatch[3] +
           ' ' + isoMatch[4] + ':' + isoMatch[5] + ':' + isoMatch[6];
  }

  // 3) 纯数字（Unix 时间戳秒或毫秒）
  var num = Number(value);
  if (!isNaN(num)) {
    var d = new Date(num > 1e12 ? num : num * 1000);
    if (!isNaN(d.getTime())) {
      var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
             ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }
  }

  // 4) 全部失败 → 原样回退显示
  return s;
}

function formatOrders(orders = [], orderRole = 'customer') {
  return orders.map((order) => ({
    ...order,
    shortId: String(order.id || '').slice(0, 4).toUpperCase(),
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
    orderRole: 'customer',
    orders: [],
    chefTabClass: 'mode-tab mode-tab-active',
    customerTabClass: 'mode-tab',
    hasOrders: false,
    emptyTitle: '这里还没有订单',
    emptyCopy: '先去点一份菜，再回来看看完整闭环。',
  },
  async onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 1 });
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
