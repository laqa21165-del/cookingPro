"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
exports.uploadFile = uploadFile;
exports.saveToken = saveToken;
const store_1 = require("./store");
// 生产域名（上线前把 api.<你的域名> 换成你已备案的 HTTPS 域名，仅改这一处）
var PROD_BASE_URL = 'https://api.<你的域名>/api/v1';
// 开发版联调用内网直连（同一 WiFi 下后端 IP）
var DEV_BASE_URL = 'http://192.168.0.8:3000/api/v1';
function resolveBaseUrl() {
    try {
        var env = wx.getAccountInfoSync().miniProgram.envVersion;
        if (env === 'develop')
            return DEV_BASE_URL;
        return PROD_BASE_URL;
    }
    catch (e) {
        return PROD_BASE_URL;
    }
}
var BASE_URL = resolveBaseUrl();
function request(options) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${BASE_URL}${options.url}`,
            method: (options.method || 'GET'),
            data: options.data,
            header: {
                Authorization: (0, store_1.getToken)() ? `Bearer ${(0, store_1.getToken)()}` : '',
            },
            success: async (response) => {
                var _a;
                if (response.statusCode === 401) {
                    (0, store_1.clearToken)();
                }
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(response.data);
                    return;
                }
                const message = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.message) || '请求失败';
                reject(new Error(Array.isArray(message) ? message.join('，') : message));
            },
            fail: reject,
        });
    });
}
async function uploadFile(filePath) {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: `${BASE_URL}/files/upload`,
            filePath,
            name: 'file',
            header: {
                Authorization: (0, store_1.getToken)() ? `Bearer ${(0, store_1.getToken)()}` : '',
            },
            success: (response) => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(JSON.parse(response.data));
                    return;
                }
                reject(new Error(response.data || '上传失败'));
            },
            fail: reject,
        });
    });
}
function saveToken(token) {
    (0, store_1.setToken)(token);
}
