"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrders = getOrders;
exports.getOrderDetail = getOrderDetail;
exports.completeOrder = completeOrder;
const request_1 = require("../utils/request");
function createOrder(data) {
    return (0, request_1.request)({ url: '/orders', method: 'POST', data });
}
function getOrders(role = 'all') {
    return (0, request_1.request)({ url: `/orders?role=${role}` });
}
function getOrderDetail(id) {
    return (0, request_1.request)({ url: `/orders/${id}` });
}
function completeOrder(id, chefReply) {
    return (0, request_1.request)({ url: `/orders/${id}/complete`, method: 'PATCH', data: { chefReply } });
}
