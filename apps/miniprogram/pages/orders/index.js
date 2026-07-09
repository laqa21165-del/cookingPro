"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("../../services/order");
function formatOrders(orders = [], orderRole = 'customer') {
    return orders.map((order) => ({
        ...order,
        shortId: String(order.id || '').slice(0, 8),
        statusText: order.status === 'pending' ? '待制作' : '已完成',
        statusClass: `order-status ${order.status}`,
        itemsText: (order.items || []).map((sub) => `${sub.name} x ${sub.quantity}`).join('、'),
        notifyStatusText: order.notifyStatus === 'sent' ? '已通知厨师' : '未开启微信提醒，已站内提醒',
        showNewBadge: orderRole === 'chef' && !!order.unreadForChef,
    }));
}
Page({
    data: {
        orderRole: 'customer',
        orders: [],
        customerTabClass: 'mode-tab mode-tab-active',
        chefTabClass: 'mode-tab',
        hasOrders: false,
        emptyTitle: '这里还没有订单',
        emptyCopy: '先去点一份菜，再回来看看完整闭环。',
    },
    async onShow() {
        await this.loadOrders();
    },
    async loadOrders() {
        try {
            const orderRole = this.data.orderRole;
            const rawOrders = await (0, order_1.getOrders)(orderRole);
            this.setData({
                orders: formatOrders(rawOrders, orderRole),
                customerTabClass: orderRole === 'customer' ? 'mode-tab mode-tab-active' : 'mode-tab',
                chefTabClass: orderRole === 'chef' ? 'mode-tab mode-tab-active' : 'mode-tab',
                hasOrders: rawOrders.length > 0,
                emptyTitle: orderRole === 'customer' ? '这里还没有订单' : '这里还没有收到订单',
                emptyCopy: orderRole === 'customer'
                    ? '先去点一份菜，再回来看看完整闭环。'
                    : '有人下单后，新的订单会出现在这里。',
            });
        }
        catch (error) {
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
