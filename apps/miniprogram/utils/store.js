"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = getToken;
exports.setToken = setToken;
exports.clearToken = clearToken;
exports.getUser = getUser;
exports.setUser = setUser;
const TOKEN_KEY = 'word-order-token';
const USER_KEY = 'word-order-user';
function getToken() {
    return wx.getStorageSync(TOKEN_KEY) || '';
}
function setToken(token) {
    wx.setStorageSync(TOKEN_KEY, token);
}
function clearToken() {
    wx.removeStorageSync(TOKEN_KEY);
}
function getUser() {
    return wx.getStorageSync(USER_KEY) || null;
}
function setUser(user) {
    wx.setStorageSync(USER_KEY, user);
}
