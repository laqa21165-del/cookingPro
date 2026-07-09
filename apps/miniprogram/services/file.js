"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
const request_1 = require("../utils/request");
function uploadImage(filePath) {
    return (0, request_1.uploadFile)(filePath);
}
