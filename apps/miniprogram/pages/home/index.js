"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const binding_1 = require("../../services/binding");
function formatBindings(bindings = []) {
    return bindings.map((item) => ({
        ...item,
        displayName: item.chefName || '未命名厨师',
        avatarText: (item.chefName || '厨').charAt(0),
    }));
}
Page({
    data: {
        me: null,
        customerBindings: [],
        shareLink: null,
        bindingConfirmed: false,
        hasBindings: false,
    },
    async onLoad() {
        if (wx.showShareMenu) {
            wx.showShareMenu({ menus: ['shareAppMessage'] });
        }
    },
    async onShow() {
        await this.bootstrap();
    },
    async bootstrap() {
        try {
            await (0, auth_1.ensureLogin)();
            const [me, bindings] = await Promise.all([(0, auth_1.refreshMe)(), (0, binding_1.getBindings)()]);
            const customerBindings = formatBindings((me.bindings && me.bindings.asCustomer) || bindings.asCustomer || []);
            const bindingConfirmed = !!wx.getStorageSync('binding-confirmed');
            if (bindingConfirmed) {
                wx.removeStorageSync('binding-confirmed');
            }
            this.setData({
                me,
                customerBindings,
                bindingConfirmed,
                hasBindings: customerBindings.length > 0,
            });
        }
        catch (error) {
            wx.showToast({ title: error.message || '加载失败', icon: 'none' });
        }
    },
    async prepareShare() {
        try {
            const shareLink = await (0, binding_1.createBindingShare)();
            this.setData({ shareLink });
            wx.showToast({ title: '邀请链接已生成', icon: 'success' });
        }
        catch (error) {
            wx.showToast({ title: error.message || '生成失败', icon: 'none' });
        }
    },
    copyShareToken() {
        var _a;
        const token = (_a = this.data.shareLink) === null || _a === void 0 ? void 0 : _a.token;
        if (!token) {
            wx.showToast({ title: '请先生成邀请口令', icon: 'none' });
            return;
        }
        wx.setClipboardData({
            data: token,
            success: () => wx.showToast({ title: '已复制 token', icon: 'success' }),
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
    onShareAppMessage() {
        const shareLink = this.data.shareLink;
        if (!(shareLink === null || shareLink === void 0 ? void 0 : shareLink.token)) {
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