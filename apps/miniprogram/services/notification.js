"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeNotification = subscribeNotification;
const request_1 = require("../utils/request");
function subscribeNotification(templateId) {
    return (0, request_1.request)({ url: '/notifications/subscribe', method: 'POST', data: { templateId } });
}
