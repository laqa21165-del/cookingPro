"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBindings = getBindings;
exports.createBindingShare = createBindingShare;
exports.confirmBinding = confirmBinding;
exports.deleteBinding = deleteBinding;
const request_1 = require("../utils/request");
function getBindings() {
    return (0, request_1.request)({ url: '/bindings' });
}
function createBindingShare() {
    return (0, request_1.request)({ url: '/bindings/share', method: 'POST', data: {} });
}
function confirmBinding(token) {
    return (0, request_1.request)({ url: '/bindings/confirm', method: 'POST', data: { token } });
}
function deleteBinding(relatedUserId) {
    return (0, request_1.request)({ url: `/bindings/${relatedUserId}`, method: 'DELETE' });
}