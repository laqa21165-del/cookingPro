// @ts-nocheck
import { ensureLogin, refreshMe } from '../../utils/auth';
import { createBindingShare, getBindings } from '../../services/binding';

const HAND_FONT_FAMILY = 'Sarasa Gothic SC';
const HAND_FONT_SOURCE = '';

let handFontRequested = false;

function loadHandFont() {
  if (handFontRequested || !HAND_FONT_SOURCE || !wx.loadFontFace) {
    return;
  }
  handFontRequested = true;
  wx.loadFontFace({
    family: HAND_FONT_FAMILY,
    source: `url("${HAND_FONT_SOURCE}")`,
    global: false,
    fail: () => {
      handFontRequested = false;
    },
  });
}

function formatBindings(bindings = []) {
  return bindings.map((item) => ({
    ...item,
    displayName: item.chefName || '未命名厨师',
    avatarText: (item.chefName || '厨').charAt(0),
  }));
}

function getGreetingContent() {
  const hour = new Date().getHours();
  if (hour < 6) {
    return {
      title: '夜深啦，把心意交给文字吧',
      subline: '今天也辛苦啦，慢慢挑。',
    };
  }
  if (hour < 12) {
    return {
      title: '早上好，把心意交给文字吧',
      subline: '今天也辛苦啦，慢慢挑。',
    };
  }
  if (hour < 18) {
    return {
      title: '下午好，把心意交给文字吧',
      subline: '今天也辛苦啦，慢慢挑。',
    };
  }
  return {
    title: '晚上好，把心意交给文字吧',
    subline: '今天也辛苦啦，慢慢挑。',
  };
}

Page({
  data: {
    me: null,
    customerBindings: [],
    shareLink: null,
    bindingConfirmed: false,
    hasBindings: false,
    greetingTitle: '',
    greetingSubline: '',
  },
  async onLoad() {
    loadHandFont();
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage'] });
    }
  },
  async onShow() {
    if (wx.hideTabBar) {
      wx.hideTabBar({ animation: false });
    }
    const greeting = getGreetingContent();
    this.setData({
      greetingTitle: greeting.title,
      greetingSubline: greeting.subline,
    });
    await this.bootstrap();
  },
  onHide() {
    if (wx.showTabBar) {
      wx.showTabBar({ animation: false });
    }
  },
  onUnload() {
    if (wx.showTabBar) {
      wx.showTabBar({ animation: false });
    }
  },
  async bootstrap() {
    try {
      await ensureLogin();
      const [me, bindings] = await Promise.all([refreshMe(), getBindings()]);
      const customerBindings = formatBindings(me.bindings?.asCustomer || bindings.asCustomer || []);
      const bindingConfirmed = !!wx.getStorageSync('binding-confirmed');
      if (bindingConfirmed) {
        wx.removeStorageSync('binding-confirmed');
      }
      this.setData({
        me,
        customerBindings,
        bindingConfirmed,
        hasBindings: customerBindings.length > 0,
      });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },
  async prepareShare() {
    try {
      const shareLink = await createBindingShare();
      this.setData({ shareLink });
      wx.showToast({ title: '邀请口令已生成', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: error.message || '生成失败', icon: 'none' });
    }
  },
  copyShareToken() {
    const token = this.data.shareLink?.token;
    if (!token) {
      wx.showToast({ title: '请先生成邀请口令', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: token,
      success: () => wx.showToast({ title: '口令已复制', icon: 'success' }),
      fail: () => wx.showToast({ title: '复制失败', icon: 'none' }),
    });
  },
  goBindChef() {
    wx.navigateTo({ url: '/pages/bind-confirm/index' });
  },
  directEnter() {
    wx.navigateTo({ url: '/pages/order/index' });
  },
  chooseChef(event) {
    const chefId = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order/index?chefId=${chefId}` });
  },
  goOrdersTab() {
    wx.switchTab({ url: '/pages/orders/index' });
  },
  goMenuTab() {
    wx.switchTab({ url: '/pages/menu/index' });
  },
  goMeTab() {
    wx.switchTab({ url: '/pages/me/index' });
  },
  noopTab() {},
  onShareAppMessage() {
    const shareLink = this.data.shareLink;
    if (!shareLink?.token) {
      return {
        title: '邀请你绑定我的菜单，之后就能直接点单',
        path: '/pages/home/index',
      };
    }
    return {
      title: shareLink.shareTitle || '邀请你绑定我的菜单，之后就能直接点单',
      path: shareLink.miniProgramPath || `/pages/bind-confirm/index?token=${shareLink.token}`,
    };
  },
});