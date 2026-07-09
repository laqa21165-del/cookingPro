"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const menu_1 = require("../../services/menu");
function formatItems(items = []) {
    return items.map((item) => ({
        ...item,
        statusText: item.status === 'active' ? '上架中' : '已下架',
        toggleActionText: item.status === 'active' ? '下架' : '上架',
        textPriceText: `${item.textPrice} 字 / 份`,
        statusTagClass: item.status === 'active' ? 'status-tag active' : 'status-tag inactive',
    }));
}
Page({
    data: {
        me: null,
        items: [],
        hasItems: false,
    },
    async onShow() {
        await this.loadData();
    },
    async loadData() {
        try {
            const me = await (0, auth_1.refreshMe)();
            const items = await (0, menu_1.getMenus)(me.id);
            this.setData({ me, items: formatItems(items), hasItems: items.length > 0 });
        }
        catch (error) {
            wx.showToast({ title: error.message || '加载菜单失败', icon: 'none' });
        }
    },
    goCreate() {
        wx.navigateTo({ url: '/pages/menu-create/index' });
    },
    async toggleStatus(event) {
        const { id, status } = event.currentTarget.dataset;
        try {
            await (0, menu_1.updateMenuStatus)(id, status === 'active' ? 'inactive' : 'active');
            await this.loadData();
        }
        catch (error) {
            wx.showToast({ title: error.message || '修改状态失败', icon: 'none' });
        }
    },
    async removeItem(event) {
        try {
            await (0, menu_1.deleteMenuItem)(event.currentTarget.dataset.id);
            wx.showToast({ title: '已删除', icon: 'success' });
            await this.loadData();
        }
        catch (error) {
            wx.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
    },
});
