// @ts-nocheck
import { confirmBinding } from '../../services/binding';
import { ensureLogin } from '../../utils/auth';

Page({
  data: {
    token: '',
    readonly: false,
    result: null,
  },
  onLoad(options) {
    const token = options.token || '';
    this.setData({ token, readonly: !!token });
  },
  onTokenInput(event) {
    this.setData({ token: event.detail.value.trim() });
  },
  async confirm() {
    const token = this.data.token.trim();
    if (!token) {
      wx.showToast({ title: '请先输入厨师发来的 token', icon: 'none' });
      return;
    }
    try {
      await ensureLogin();
      const result = await confirmBinding(token);
      this.setData({ result });
      wx.setStorageSync('binding-confirmed', true);
      wx.showToast({ title: '绑定成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/index' });
      }, 500);
    } catch (error) {
      wx.showToast({ title: error.message || '绑定失败', icon: 'none' });
    }
  },
});
