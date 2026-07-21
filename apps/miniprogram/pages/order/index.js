// @ts-nocheck
import { ensureLogin, refreshMe } from '../../utils/auth';
import { getMenus } from '../../services/menu';
import { createOrder } from '../../services/order';

function formatBoundChefs(boundChefsRaw = [], selectedChefId = '') {
  return boundChefsRaw.map((item) => ({
    ...item,
    pillClass: item.id === selectedChefId ? 'chef-pill chef-pill-active' : 'chef-pill',
  }));
}

function formatCartItems(cartItems = []) {
  return cartItems.map((item) => ({
    ...item,
    quantityText: String(item.quantity),
    textPriceText: `${item.textPrice} 字 / 份`,
    subtractDisabled: item.quantity <= 0,
  }));
}

function recalc(page) {
  const keyword = page.data.keyword.trim();
  const cartItems = page.data.cartItems || [];
  const cartMap = {};
  cartItems.forEach((item) => {
    cartMap[item.menuItemId] = item.quantity;
  });

  const filteredMenu = (page.data.menuItems || [])
    .filter((item) => item.status !== 'inactive')
    .filter((item) => !keyword || item.name.includes(keyword) || (item.description || '').includes(keyword))
    .map((item) => {
      const quantity = cartMap[item.id] || 0;
      const isInactive = item.status === 'inactive';
      return {
        ...item,
        quantity,
        quantityText: String(quantity),
        subtractDisabled: quantity <= 0,
        addDisabled: isInactive,
        tagText: isInactive ? '已下架' : '可点',
      };
    });

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalWords = cartItems.reduce((sum, item) => sum + item.textPrice * item.quantity, 0);
  const paymentCount = (page.data.paymentText || '').replace(/\s+/g, '').length;
  const showCart = totalQuantity > 0 ? page.data.showCart : false;

  page.setData({
    boundChefs: formatBoundChefs(page.data.boundChefsRaw, page.data.selectedChefId),
    filteredMenu,
    cartItems: formatCartItems(cartItems),
    totalQuantity,
    totalWords,
    paymentCount,
    showCart,
    hasFilteredMenu: filteredMenu.length > 0,
    hasCartItems: totalQuantity > 0,
    cartActionText: showCart ? '收起' : '查看',
    floatingCartClass: totalQuantity > 0 ? 'floating-cart is-visible' : 'floating-cart',
    paymentCountClass: totalQuantity > 0 && paymentCount >= totalWords ? 'count-ok' : 'count-warn',
    submitDisabled: totalQuantity === 0 || paymentCount < totalWords,
  });
}

function updateCart(page, menuItem, delta) {
  const nextCartItems = [...page.data.cartItems];
  const menuItemId = menuItem.menuItemId || menuItem.id;
  const target = nextCartItems.find((item) => item.menuItemId === menuItemId);

  if (target) {
    target.quantity += delta;
  } else if (delta > 0) {
    nextCartItems.push({
      menuItemId,
      name: menuItem.name,
      textPrice: menuItem.textPrice,
      imageUrl: menuItem.imageUrl,
      quantity: 1,
    });
  }

  page.setData({ cartItems: nextCartItems.filter((item) => item.quantity > 0) });
  recalc(page);
}

Page({
  data: {
    boundChefsRaw: [],
    boundChefs: [],
    selectedChefId: '',
    selectedChefName: '',
    menuItems: [],
    filteredMenu: [],
    keyword: '',
    cartItems: [],
    showCart: false,
    paymentText: '',
    totalQuantity: 0,
    totalWords: 0,
    paymentCount: 0,
    cartActionText: '查看',
    floatingCartClass: 'floating-cart',
    paymentCountClass: 'count-warn',
    submitDisabled: true,
    hasBindings: true,
    hasFilteredMenu: false,
    hasCartItems: false,
  },
  async onLoad(options) {
    this.initialChefId = options.chefId || '';
  },
  async onShow() {
    await this.bootstrap();
  },
  async bootstrap() {
    try {
      await ensureLogin();
      const me = await refreshMe();
      const boundChefsRaw = (me.bindings?.asCustomer || []).map((item) => ({
        id: item.chefId,
        name: item.chefName || '未命名厨师',
      }));
      const selectedChefId = this.data.selectedChefId || this.initialChefId || (boundChefsRaw[0] ? boundChefsRaw[0].id : '');
      const selectedChef = boundChefsRaw.find((item) => item.id === selectedChefId) || null;

      this.setData({
        boundChefsRaw,
        selectedChefId,
        selectedChefName: selectedChef ? selectedChef.name : '',
        hasBindings: boundChefsRaw.length > 0,
      });

      if (selectedChefId) {
        await this.loadMenus(selectedChefId);
      } else {
        this.setData({ menuItems: [] });
        recalc(this);
      }
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },
  async loadMenus(chefId) {
    const menuItems = await getMenus(chefId);
    this.setData({ menuItems });
    recalc(this);
  },
  async selectChef(event) {
    const chefId = event.currentTarget.dataset.id;
    const chef = this.data.boundChefsRaw.find((item) => item.id === chefId);
    this.setData({
      selectedChefId: chefId,
      selectedChefName: chef ? chef.name : '',
      keyword: '',
      cartItems: [],
      paymentText: '',
      showCart: false,
    });
    await this.loadMenus(chefId);
  },
  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
    recalc(this);
  },
  addItem(event) {
    const menuItemId = event.currentTarget.dataset.id;
    const item = this.data.menuItems.find((candidate) => candidate.id === menuItemId)
      || this.data.cartItems.find((candidate) => candidate.menuItemId === menuItemId);
    if (item) {
      updateCart(this, item, 1);
    }
  },
  subtractItem(event) {
    const menuItemId = event.currentTarget.dataset.id;
    const item = this.data.cartItems.find((candidate) => candidate.menuItemId === menuItemId)
      || this.data.menuItems.find((candidate) => candidate.id === menuItemId);
    if (item) {
      updateCart(this, item, -1);
    }
  },
  toggleCart() {
    if (!this.data.totalQuantity) {
      return;
    }
    this.setData({ showCart: !this.data.showCart });
    recalc(this);
  },
  onPaymentInput(event) {
    this.setData({ paymentText: event.detail.value });
    recalc(this);
  },
  async submitOrder() {
    if (this.data.submitDisabled) {
      wx.showToast({ title: '文字数量还不够', icon: 'none' });
      return;
    }

    try {
      const order = await createOrder({
        chefId: this.data.selectedChefId,
        items: this.data.cartItems.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
        paymentText: this.data.paymentText,
      });

      this.setData({ cartItems: [], showCart: false, paymentText: '' });
      recalc(this);

      wx.showToast({ title: '下单成功', icon: 'success' });
      wx.redirectTo({ url: `/pages/order-detail/index?id=${order.id}&new=1` });
    } catch (error) {
      wx.showToast({ title: error.message || '下单失败', icon: 'none' });
    }
  },
});
