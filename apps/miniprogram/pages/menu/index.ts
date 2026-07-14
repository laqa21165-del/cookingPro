// @ts-nocheck
import { refreshMe } from '../../utils/auth';
import { deleteMenuItem, getMenus, updateMenuStatus } from '../../services/menu';

function formatItems(items = []) {
  return items.map((item) => ({
    ...item,
    statusText: item.status === 'active' ? '可点' : '已下架',
    toggleActionText: item.status === 'active' ? '下架' : '上架',
    textPriceText: `${item.textPrice} 字 / 份`,
    statusTagClass: item.status === 'active' ? 'soft-pill success' : 'soft-pill neutral',
  }));
}

Page({
  data: {
    me: null,
    items: [],
    hasItems: false,
  },
  async onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 2 });
    }
    await this.loadData();
  },
  async loadData() {
    try {
      const me = await refreshMe();
      const items = await getMenus(me.id);
      this.setData({ me, items: formatItems(items), hasItems: items.length > 0 });
    } catch (error) {
      wx.showToast({ title: error.message || '加载菜单失败', icon: 'none' });
    }
  },
  goCreate() {
    wx.navigateTo({ url: '/pages/menu-create/index' });
  },
  editItem(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/menu-create/index?id=' + id });
  },
  async toggleStatus(event) {
    const { id, status } = event.currentTarget.dataset;
    try {
      await updateMenuStatus(id, status === 'active' ? 'inactive' : 'active');
      await this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message || '修改状态失败', icon: 'none' });
    }
  },
  async removeItem(event) {
    const id = event.currentTarget.dataset.id;
    try {
      const res = await new Promise((resolve, reject) => {
        wx.showModal({
          title: '确认删除',
          content: '删除后无法恢复，确定要删除这道菜吗？',
          confirmText: '删除',
          confirmColor: '#C2674E',
          success: resolve,
          fail: reject,
        });
      });
      if (!res.confirm) return;
      await deleteMenuItem(id);
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message || '删除失败', icon: 'none' });
    }
  },
});
