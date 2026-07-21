"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeNotification = subscribeNotification;
exports.WECHAT_TEMPLATE_ID = 'sqBeT8zgAX9z1W9pIqpWHfI3We68Ik4otVd0uwQhDaI';
const request_1 = require("../utils/request");
function subscribeNotification(templateId) {
    return (0, request_1.request)({ url: '/notifications/subscribe', method: 'POST', data: { templateId } });
}
