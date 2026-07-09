"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenus = getMenus;
exports.createMenuItem = createMenuItem;
exports.updateMenuStatus = updateMenuStatus;
exports.deleteMenuItem = deleteMenuItem;
const request_1 = require("../utils/request");
function getMenus(chefId) {
    return (0, request_1.request)({ url: `/menus?chefId=${chefId}` });
}
function createMenuItem(data) {
    return (0, request_1.request)({ url: '/menus', method: 'POST', data });
}
function updateMenuStatus(id, status) {
    return (0, request_1.request)({ url: `/menus/${id}/status`, method: 'PATCH', data: { status } });
}
function deleteMenuItem(id) {
    return (0, request_1.request)({ url: `/menus/${id}`, method: 'DELETE' });
}
