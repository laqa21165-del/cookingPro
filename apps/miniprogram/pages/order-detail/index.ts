// @ts-nocheck
import { getOrderDetail, completeOrder } from '../../services/order';
import { refreshMe } from '../../utils/auth';

function formatOrder(order, me) {
  const isChef = order.chefId === me.id;
  const reviews = (order.reviews || []).map((item) => ({
    ...item,
    reviewerRoleText: item.reviewerRole === 'chef' ? '厨师' : '顾客',
  }));
  const reviewerRole = isChef ? 'chef' : 'customer';
  const canReview = order.status === 'completed' && !reviews.some((item) => item.reviewerRole === reviewerRole);

  return {
    ...order,
    statusText: order.status === 'pending' ? '进行中' : '已完成',
    notifyStatusText: order.notifyStatus === 'sent' ? '已通知厨师' : '已站内提醒',
    reviews,
    hasReviews: reviews.length > 0,
    isChef,
    canReview,
    showCompleteCard: isChef && order.status === 'pending',
  };
}

Page({
  data: {
    order: null,
    me: null,
    chefReply: '',
    showChefShareModal: false,
  },
  async onLoad(options) {
    this.orderId = options.id;
    this.isNew = options.new === '1';
    this.shareModalShown = false;
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage'] });
    }
    await this.loadData();
  },
  async onShow() {
    if (this.orderId) {
      await this.loadData();
    }
  },
  async loadData() {
    try {
      const [rawOrder, me] = await Promise.all([getOrderDetail(this.orderId), refreshMe()]);
      const order = formatOrder(rawOrder, me);
      this.setData({ order, me, chefReply: order.chefReply || '' });
      if (this.isNew && !this.shareModalShown) {
        this.shareModalShown = true;
        this.setData({ showChefShareModal: true });
      }
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },
  onChefReplyInput(event) {
    this.setData({ chefReply: event.detail.value });
  },
  async handleComplete() {
    try {
      await completeOrder(this.orderId, this.data.chefReply);
      wx.showToast({ title: '订单已完成', icon: 'success' });
      await this.loadData();
      const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
      if (tabBar && typeof tabBar.refreshOrderBadge === 'function') {
        tabBar.refreshOrderBadge();
      }
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  },
  goReview() {
    wx.navigateTo({ url: `/pages/review/index?orderId=${this.orderId}` });
  },
  onChefShareTap() {
    this.setData({ showChefShareModal: false });
  },
  closeChefShareModal() {
    this.setData({ showChefShareModal: false });
  },
  onShareAppMessage() {
    const order = this.data.order || {};
    const items = (order.items || [])
      .map((it) => `${it.name} x${it.quantity}`)
      .join('、');
    const shortId = String(this.orderId || '').slice(-4).toUpperCase();
    let title = `【新点单 ${shortId}】${items || '点了一单，快来看看～'}`;
    if (title.length > 60) {
      title = title.slice(0, 57) + '…';
    }
    return {
      title,
      path: `/pages/order-detail/index?id=${this.orderId}`,
    };
  },
});
