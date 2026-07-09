"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const binding_1 = require("../../services/binding");
const notification_1 = require("../../services/notification");
const demoOptions = [
    { openId: auth_1.DEMO_USERS.customer_demo.openId, label: '点单者' },
    { openId: auth_1.DEMO_USERS.chef_demo_a.openId, label: '厨师阿棕' },
    { openId: auth_1.DEMO_USERS.chef_demo_b.openId, label: '厨师小桃' },
];
function formatDemoOptions(currentDemoOpenId) {
    return demoOptions.map((item) => ({
        ...item,
        buttonClass: currentDemoOpenId === item.openId ? 'identity-chip identity-chip-active' : 'identity-chip',
    }));
}
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
Page({
    data: {
        me: null,
        demoOptions: formatDemoOptions('customer_demo'),
        currentDemoOpenId: 'customer_demo',
        roleLabel: '点单者',
        avatarText: '我',
        customerBindings: [],
        chefBindings: [],
        hasCustomerBindings: false,
        hasChefBindings: false,
        hasAnyBindings: false,
    },
    async onShow() {
        await this.loadMe();
    },
    async loadMe() {
        try {
            const me = await (0, auth_1.refreshMe)();
            const currentDemoOpenId = (0, auth_1.getSelectedDemoOpenId)();
            const customerBindings = formatCustomerBindings((me.bindings && me.bindings.asCustomer) || []);
            const chefBindings = formatChefBindings((me.bindings && me.bindings.asChef) || []);
            const roleLabel = (demoOptions.find((d) => d.openId === currentDemoOpenId) || {}).label || '点单者';
            const avatarText = (me.nickname || '我').slice(0, 1);
            this.setData({
                me,
                currentDemoOpenId,
                demoOptions: formatDemoOptions(currentDemoOpenId),
                roleLabel,
                avatarText,
                customerBindings,
                chefBindings,
                hasCustomerBindings: customerBindings.length > 0,
                hasChefBindings: chefBindings.length > 0,
                hasAnyBindings: customerBindings.length > 0 || chefBindings.length > 0,
            });
        }
        catch (error) {
            wx.showToast({ title: error.message || '加载失败', icon: 'none' });
        }
    },
    async switchIdentity(event) {
        const openId = event.currentTarget.dataset.id;
        try {
            await (0, auth_1.switchDemoUser)(openId);
            wx.showToast({ title: '演示身份已切换', icon: 'success' });
            await this.loadMe();
        }
        catch (error) {
            wx.showToast({ title: error.message || '切换失败', icon: 'none' });
        }
    },
    async removeBinding(event) {
        try {
            await (0, binding_1.deleteBinding)(event.currentTarget.dataset.id);
            wx.showToast({ title: '已解除绑定', icon: 'success' });
            await this.loadMe();
        }
        catch (error) {
            wx.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
    },
    async subscribeChefMessage() {
        try {
            await (0, notification_1.subscribeNotification)('tmpl_demo');
            wx.showToast({ title: '已记录提醒订阅', icon: 'success' });
            await this.loadMe();
        }
        catch (error) {
            wx.showToast({ title: error.message || '订阅失败', icon: 'none' });
        }
    },
    goHome() {
        wx.switchTab({ url: '/pages/home/index' });
    },
});