"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithWechat = loginWithWechat;
exports.ensureLogin = ensureLogin;
exports.refreshMe = refreshMe;
const request_1 = require("./request");
const store_1 = require("./store");
function loginWithWechat() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res),
      fail: reject,
    });
  }).then((res) => (0, request_1.request)({
    url: '/auth/login',
    method: 'POST',
    data: { code: res.code },
  }).then((response) => {
    (0, request_1.saveToken)(response.accessToken);
    (0, store_1.setToken)(response.accessToken);
    (0, store_1.setUser)(response.user);
    wx.setStorageSync('word-order-login-openid', response.user ? response.user.openId : undefined);
    return response.accessToken;
  }));
}
async function ensureLogin() {
  const token = wx.getStorageSync('word-order-token');
  if (token) {
    return token;
  }
  return loginWithWechat();
}
async function refreshMe() {
  const me = await (0, request_1.request)({ url: '/me' });
  (0, store_1.setUser)(me);
  return me;
}
