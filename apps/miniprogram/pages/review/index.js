"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("../../services/file");
const review_1 = require("../../services/review");
Page({
    data: {
        orderId: '',
        content: '',
        imageUrl: '',
    },
    onLoad(options) {
        this.setData({ orderId: options.orderId || '' });
    },
    onContentInput(event) {
        this.setData({ content: event.detail.value });
    },
    async chooseImage() {
        try {
            const result = await new Promise((resolve, reject) => {
                wx.chooseImage({ count: 1, success: resolve, fail: reject });
            });
            const filePath = result.tempFilePaths[0];
            const uploaded = await (0, file_1.uploadImage)(filePath);
            this.setData({ imageUrl: uploaded.url });
            wx.showToast({ title: '图片上传成功', icon: 'success' });
        }
        catch (error) {
            wx.showToast({ title: error.message || '上传失败', icon: 'none' });
        }
    },
    async submit() {
        if (!this.data.content.trim()) {
            wx.showToast({ title: '请先填写评价内容', icon: 'none' });
            return;
        }
        try {
            await (0, review_1.createReview)({
                orderId: this.data.orderId,
                content: this.data.content,
                imageUrl: this.data.imageUrl,
            });
            wx.showToast({ title: '评价成功', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 600);
        }
        catch (error) {
            wx.showToast({ title: error.message || '提交失败', icon: 'none' });
        }
    },
});
