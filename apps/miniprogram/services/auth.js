"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
const request_1 = require("../utils/request");
function getMe() {
    return (0, request_1.request)({ url: '/me' });
}
