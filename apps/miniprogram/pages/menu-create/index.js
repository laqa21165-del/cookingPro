"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("../../services/file");
const menu_1 = require("../../services/menu");
Page({
    data: {
        form: {
            name: '',
            description: '',
            textPrice: '',
            imageUrl: '',
        },
        uploading: false,
    },
    onFieldInput(event) {
        const field = event.currentTarget.dataset.field;
        this.setData({ [`form.${field}`]: event.detail.value });
    },
    async chooseImage() {
        try {
            const result = await new Promise((resolve, reject) => {
                wx.chooseImage({ count: 1, success: resolve, fail: reject });
            });
            const filePath = result.tempFilePaths[0];
            this.setData({ uploading: true });
            const uploaded = await (0, file_1.uploadImage)(filePath);
            this.setData({ 'form.imageUrl': uploaded.url, uploading: false });
            wx.showToast({ title: '图片上传成功', icon: 'success' });
        }
        catch (error) {
            this.setData({ uploading: false });
            wx.showToast({ title: error.message || '上传失败', icon: 'none' });
        }
    },
    async submit() {
        const form = this.data.form;
        if (!form.name || !form.textPrice) {
            wx.showToast({ title: '请填写名称和文字价格', icon: 'none' });
            return;
        }
        try {
            await (0, menu_1.createMenuItem)({
                name: form.name,
                description: form.description,
                textPrice: Number(form.textPrice),
                imageUrl: form.imageUrl,
            });
            wx.showToast({ title: '添加成功', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 600);
        }
        catch (error) {
            wx.showToast({ title: error.message || '创建失败', icon: 'none' });
        }
    },
});
