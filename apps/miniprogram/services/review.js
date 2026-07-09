"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
const request_1 = require("../utils/request");
function createReview(data) {
    return (0, request_1.request)({ url: '/reviews', method: 'POST', data });
}
