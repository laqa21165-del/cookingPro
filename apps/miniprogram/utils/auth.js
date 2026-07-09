"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_USERS = void 0;
exports.getSelectedDemoOpenId = getSelectedDemoOpenId;
exports.setSelectedDemoOpenId = setSelectedDemoOpenId;
exports.loginDemoUser = loginDemoUser;
exports.ensureLogin = ensureLogin;
exports.switchDemoUser = switchDemoUser;
exports.refreshMe = refreshMe;
const request_1 = require("./request");
const store_1 = require("./store");
const DEMO_OPEN_ID_KEY = 'word-order-demo-openid';
exports.DEMO_USERS = {
    customer_demo: { openId: 'customer_demo', nickname: '今天想吃饭' },
    chef_demo_a: { openId: 'chef_demo_a', nickname: '阿棕' },
    chef_demo_b: { openId: 'chef_demo_b', nickname: '小桃' },
};
function getSelectedDemoOpenId() {
    return wx.getStorageSync(DEMO_OPEN_ID_KEY) || 'customer_demo';
}
function setSelectedDemoOpenId(openId) {
    wx.setStorageSync(DEMO_OPEN_ID_KEY, openId);
}
async function loginDemoUser(openId = getSelectedDemoOpenId()) {
    const profile = exports.DEMO_USERS[openId] || exports.DEMO_USERS.customer_demo;
    (0, store_1.clearToken)();
    const response = await (0, request_1.request)({
        url: '/auth/login',
        method: 'POST',
        data: {
            code: `demo-${profile.openId}`,
            nickname: profile.nickname,
            mockOpenId: profile.openId,
        },
    });
    (0, request_1.saveToken)(response.accessToken);
    (0, store_1.setToken)(response.accessToken);
    (0, store_1.setUser)(response.user);
    setSelectedDemoOpenId(profile.openId);
    wx.setStorageSync('word-order-login-openid', profile.openId);
    return response.user;
}
async function ensureLogin() {
    const token = wx.getStorageSync('word-order-token');
    const selectedOpenId = getSelectedDemoOpenId();
    const loginOpenId = wx.getStorageSync('word-order-login-openid');
    if (token && loginOpenId === selectedOpenId) {
        return token;
    }
    await loginDemoUser(selectedOpenId);
    return wx.getStorageSync('word-order-token');
}
async function switchDemoUser(openId) {
    setSelectedDemoOpenId(openId);
    return loginDemoUser(openId);
}
async function refreshMe() {
    const me = await (0, request_1.request)({ url: '/me' });
    (0, store_1.setUser)(me);
    return me;
}
