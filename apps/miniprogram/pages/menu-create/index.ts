// @ts-nocheck
import { uploadImage } from '../../services/file';
import { createMenuItem, updateMenuItem, getMenus } from '../../services/menu';
import { refreshMe } from '../../utils/auth';

Page({
  data: {
    form: {
      name: '',
      description: '',
      textPrice: '',
      imageUrl: '',
    },
    uploading: false,
    editingId: '',       // 非空表示编辑模式
  },
  async onLoad(query) {
    if (query.id) {
      this.setData({ editingId: query.id });
      await this.loadItemData(query.id);
    }
  },
  // 编辑模式：加载已有菜品数据回填表单
  async loadItemData(id) {
    try {
      const me = await refreshMe();
      const items = await getMenus(me.id);
      const item = items.find((i) => i.id === id);
      if (!item) { wx.showToast({ title: '菜品不存在', icon: 'none' }); return; }
      this.setData({
        form: {
          name: item.name || '',
          description: item.description || '',
          textPrice: String(item.textPrice || ''),
          imageUrl: item.imageUrl || '',
        },
      });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
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
      const uploaded = await uploadImage(filePath);
      this.setData({ 'form.imageUrl': uploaded.url, uploading: false });
      wx.showToast({ title: '图片上传成功', icon: 'success' });
    } catch (error) {
      this.setData({ uploading: false });
      wx.showToast({ title: error.message || '上传失败', icon: 'none' });
    }
  },
  async submit() {
    const form = this.data.form;
    if (!form.name || !form.textPrice) {
      wx.showToast({ title: '请填写名称和所需字数', icon: 'none' });
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description,
        textPrice: Number(form.textPrice),
        imageUrl: form.imageUrl,
      };
      if (this.data.editingId) {
        // 编辑模式：调用更新接口
        await updateMenuItem(this.data.editingId, payload);
        wx.showToast({ title: '修改成功', icon: 'success' });
      } else {
        // 新建模式
        await createMenuItem(payload);
        wx.showToast({ title: '保存成功', icon: 'success' });
      }
      setTimeout(() => wx.navigateBack(), 600);
    } catch (error) {
      wx.showToast({ title: error.message || (this.data.editingId ? '修改失败' : '创建失败'), icon: 'none' });
    }
  },
});
