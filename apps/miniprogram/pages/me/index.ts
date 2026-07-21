// @ts-nocheck
import { ensureLogin, refreshMe } from '../../utils/auth';
import { deleteBinding } from '../../services/binding';
import { subscribeNotification, WECHAT_TEMPLATE_ID } from '../../services/notification';
import { updateProfile } from '../../services/user';

function formatCustomerBindings(bindings = []) {
  return bindings.map((item) => ({
    ...item,
    displayName: item.chefName || '未命名厨师',
    relatedUserId: item.chefId,
  }));
}

function formatChefBindings(bindings = []) {
  return bindings.map((item) => ({
    ...item,
    displayName: item.customerName || '未命名顾客',
    relatedUserId: item.customerId,
  }));
}

function computeRoleLabel(me) {
  const asChef = (me && me.bindings && me.bindings.asChef) ? me.bindings.asChef.length : 0;
  const asCustomer = (me && me.bindings && me.bindings.asCustomer) ? me.bindings.asCustomer.length : 0;
  if (asChef > 0 && asCustomer > 0) return '顾客 · 厨师';
  if (asChef > 0) return '厨师';
  if (asCustomer > 0) return '顾客';
  return '新朋友';
}

Page({
  data: {
    me: null,
    avatarText: '我',
    roleLabel: '新朋友',
    canSubscribe: false,
    customerBindings: [],
    chefBindings: [],
    hasCustomerBindings: false,
    hasChefBindings: false,
    hasAnyBindings: false,
  },
  async onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 3 });
    }
    await this.loadMe();
  },
  async loadMe() {
    try {
      await ensureLogin();
      const me = await refreshMe();
      const customerBindings = formatCustomerBindings(me.bindings?.asCustomer || []);
      const chefBindings = formatChefBindings(me.bindings?.asChef || []);
      const roleLabel = computeRoleLabel(me);
      const avatarText = (me.nickname || '我').slice(0, 1);
      this.setData({
        me,
        avatarText,
        roleLabel,
        canSubscribe: roleLabel.indexOf('厨师') !== -1,
        customerBindings,
        chefBindings,
        hasCustomerBindings: customerBindings.length > 0,
        hasChefBindings: chefBindings.length > 0,
        hasAnyBindings: customerBindings.length > 0 || chefBindings.length > 0,
      });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },
  async removeBinding(event) {
    try {
      await deleteBinding(event.currentTarget.dataset.id);
      wx.showToast({ title: '已解除绑定', icon: 'success' });
      await this.loadMe();
    } catch (error) {
      wx.showToast({ title: error.message || '删除失败', icon: 'none' });
    }
  },
  async subscribeChefMessage() {
    try {
      const res: any = await new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds: [WECHAT_TEMPLATE_ID],
          success: resolve,
          fail: reject,
        });
      });
      const status = res && res[WECHAT_TEMPLATE_ID];
      if (status === 'reject') {
        wx.showToast({ title: '你拒绝了消息提醒', icon: 'none' });
        return;
      }
      if (status === 'ban') {
        wx.showToast({ title: '模板不可用，联系开发者', icon: 'none' });
        return;
      }
      await subscribeNotification(WECHAT_TEMPLATE_ID);
      wx.showToast({ title: '已开启新订单提醒', icon: 'success' });
      await this.loadMe();
    } catch (error) {
      wx.showToast({ title: '订阅失败，请重试', icon: 'none' });
    }
  },
  async onNicknameBlur(event) {
    const nickname = (event.detail.value || '').trim();
    const current = (this.data.me && this.data.me.nickname) || '';
    if (nickname === current) return;
    try {
      await updateProfile({ nickname });
      await this.loadMe();
    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    }
  },
  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },
});
