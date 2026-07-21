"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./utils/auth");
const store_1 = require("./utils/store");
App({
    globalData: {
        apiBaseUrl: 'http://192.168.0.8:3000/api/v1',
        token: (0, store_1.getToken)(),
        user: (0, store_1.getUser)(),
    },
    async onLaunch() {
        try {
            await (0, auth_1.ensureLogin)();
        }
        catch (error) {
            console.warn('login failed on launch', error);
        }
    },
});
