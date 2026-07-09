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
    statusText: order.status === 'pending' ? '待制作' : '已完成',
    notifyStatusText: order.notifyStatus === 'sent' ? '已通知厨师' : '未开启微信提醒，已站内提醒',
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
  },
  async onLoad(options) {
    this.orderId = options.id;
    await this.loadData();
  },
  async loadData() {
    try {
      const [rawOrder, me] = await Promise.all([getOrderDetail(this.orderId), refreshMe()]);
      const order = formatOrder(rawOrder, me);
      this.setData({ order, me, chefReply: order.chefReply || '' });
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
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  },
  goReview() {
    wx.navigateTo({ url: `/pages/review/index?orderId=${this.orderId}` });
  },
});
