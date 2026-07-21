"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = updateProfile;
const request_1 = require("../utils/request");
function updateProfile(data) {
    return (0, request_1.request)({ url: '/me', method: 'PATCH', data });
}
