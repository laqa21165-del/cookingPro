import { startTransition, useDeferredValue, useMemo, useState } from 'react';

const chefsSeed = [
  {
    id: 'chef-luna',
    name: 'Luna',
    title: '会做温柔晚餐的主厨',
    signature: '新订单微信提醒已开启',
    styleNote: '番茄炖菜、焗饭、深夜热汤',
    shareHint: '今晚想吃点什么？我来做给你。',
    notificationEnabled: true,
    avatar: 'L',
    themeClass: 'theme-peach',
  },
  {
    id: 'chef-momo',
    name: 'Momo',
    title: '偏爱轻食和夜宵的小厨',
    signature: '暂未开启微信提醒，仅站内提醒',
    styleNote: '奶油意面、三明治、低负担甜点',
    shareHint: '把想吃的和想说的话都发给我吧。',
    notificationEnabled: false,
    avatar: 'M',
    themeClass: 'theme-apricot',
  },
];

const menuSeed = [
  {
    id: 'dish-1',
    chefId: 'chef-luna',
    name: '番茄奶油焗饭',
    wordsPrice: 48,
    description: '酸甜番茄配上浓郁奶香，适合想被安慰的一餐。',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    available: true,
  },
  {
    id: 'dish-2',
    chefId: 'chef-luna',
    name: '慢炖牛肉热汤',
    wordsPrice: 68,
    description: '汤底绵密，像认真听完一段长长的倾诉。',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80',
    available: true,
  },
  {
    id: 'dish-3',
    chefId: 'chef-luna',
    name: '香草烤鸡腿',
    wordsPrice: 55,
    description: '外酥里嫩，适合想补一点元气的时候。',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
    available: true,
  },
  {
    id: 'dish-4',
    chefId: 'chef-luna',
    name: '莓果酸奶杯',
    wordsPrice: 24,
    description: '给这份点单留一个轻盈的结尾。',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
    available: false,
  },
  {
    id: 'dish-5',
    chefId: 'chef-momo',
    name: '海盐奶油意面',
    wordsPrice: 52,
    description: '咸香和奶味刚好，适合一边吃一边聊天。',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    available: true,
  },
  {
    id: 'dish-6',
    chefId: 'chef-momo',
    name: '热压火腿三明治',
    wordsPrice: 28,
    description: '简单直接，像一句及时出现的晚安。',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    available: true,
  },
  {
    id: 'dish-7',
    chefId: 'chef-momo',
    name: '焦糖布丁',
    wordsPrice: 18,
    description: '小小的甜点，适合给文字支付添一点仪式感。',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
    available: true,
  },
  {
    id: 'dish-8',
    chefId: 'chef-momo',
    name: '晚安热可可',
    wordsPrice: 16,
    description: '给夜晚留一口温热，也留一点柔软回复。',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80',
    available: true,
  },
];

const initialOrders = [
  {
    id: 'order-20260708-001',
    code: 'NO. 001',
    chefId: 'chef-momo',
    customerName: '你',
    createdAt: '今天 11:20',
    status: '已完成',
    notifyStatus: 'fallback',
    unreadForChef: false,
    totalWords: 70,
    paymentText: '今天有一点累，想吃点热乎的东西，也想在晚饭的时候听你说说今天过得怎么样。希望这份意面和布丁能把我从加班里拉出来一点点。',
    chefReply: '已经做好啦，布丁会放在最上层，记得先吃热的那份。',
    items: [
      {
        id: 'dish-5',
        name: '海盐奶油意面',
        image: menuSeed[4].image,
        wordsPrice: 52,
        quantity: 1,
      },
      {
        id: 'dish-7',
        name: '焦糖布丁',
        image: menuSeed[6].image,
        wordsPrice: 18,
        quantity: 1,
      },
    ],
    reviews: {
      customer: {
        author: '用户评价',
        content: '这份意面比文字还治愈，布丁像认真收尾的一句话。',
        images: ['摆盘图'],
      },
      chef: {
        author: '厨师评价',
        content: '你的文字写得很具体，做起来也更有画面了。',
        images: [],
      },
    },
  },
  {
    id: 'order-20260708-002',
    code: 'NO. 002',
    chefId: 'chef-luna',
    customerName: '你',
    createdAt: '昨天 20:03',
    status: '已完成',
    notifyStatus: 'sent',
    unreadForChef: false,
    totalWords: 55,
    paymentText: '今天想吃一点踏实的热菜，不想太复杂，只想在吃饭的时候慢慢放松下来。',
    chefReply: '鸡腿多烤了两分钟，外皮会更香一点。',
    items: [
      {
        id: 'dish-3',
        name: '香草烤鸡腿',
        image: menuSeed[2].image,
        wordsPrice: 55,
        quantity: 1,
      },
    ],
    reviews: {
      customer: {
        author: '用户评价',
        content: '很有被照顾到的感觉，连回复也很像一起吃了顿饭。',
        images: [],
      },
      chef: null,
    },
  },
];

const initialDraftDish = {
  name: '',
  wordsPrice: '',
  description: '',
  imagePreview: '',
  imageName: '',
};

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('customer');
  const [chefs, setChefs] = useState(chefsSeed);
  const [menuItems, setMenuItems] = useState(menuSeed);
  const [boundChefIds, setBoundChefIds] = useState(['chef-luna']);
  const [selectedChefId, setSelectedChefId] = useState('chef-luna');
  const [orders, setOrders] = useState(initialOrders);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [bindingConfirmed, setBindingConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [cart, setCart] = useState({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentText, setPaymentText] = useState('');
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completionReply, setCompletionReply] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRole, setReviewRole] = useState('customer');
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [menuDraft, setMenuDraft] = useState(initialDraftDish);
  const [menuMessage, setMenuMessage] = useState('');
  const [menuCreateOpen, setMenuCreateOpen] = useState(false);

  const boundChefs = useMemo(function () {
    return chefs.filter(function (chef) {
      return boundChefIds.includes(chef.id);
    });
  }, [boundChefIds, chefs]);

  const selectedChef = chefs.find(function (chef) {
    return chef.id === selectedChefId;
  }) || boundChefs[0] || null;

  const filteredMenu = useMemo(function () {
    const normalized = deferredSearch.trim().toLowerCase();
    return menuItems.filter(function (item) {
      const matchesChef = selectedChef ? item.chefId === selectedChef.id : false;
      const matchesKeyword = !normalized || item.name.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized);
      return matchesChef && matchesKeyword;
    });
  }, [deferredSearch, menuItems, selectedChef]);

  const cartItems = useMemo(function () {
    return Object.entries(cart)
      .map(function (entry) {
        const id = entry[0];
        const quantity = entry[1];
        const menuItem = menuItems.find(function (item) {
          return item.id === id;
        });
        if (!menuItem || quantity <= 0) return null;
        return Object.assign({}, menuItem, { quantity: quantity });
      })
      .filter(Boolean);
  }, [cart, menuItems]);

  const totalQuantity = cartItems.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);
  const totalWords = cartItems.reduce(function (sum, item) {
    return sum + item.wordsPrice * item.quantity;
  }, 0);
  const paymentCount = paymentText.trim().length;
  const activeOrder = orders.find(function (order) {
    return order.id === activeOrderId;
  }) || null;
  const menuItemsForChef = selectedChef
    ? menuItems.filter(function (item) {
        return item.chefId === selectedChef.id;
      })
    : [];
  const customerOrders = orders.filter(function (order) {
    return order.customerName === '你';
  });
  const visibleOrders = viewMode === 'customer' ? customerOrders : orders;

  function switchTab(tab) {
    startTransition(function () {
      setCurrentTab(tab);
    });
  }

  function updateCart(itemId, nextQuantity) {
    setCart(function (previous) {
      const safeQuantity = Math.max(0, nextQuantity);
      if (safeQuantity === 0) {
        const nextCart = Object.assign({}, previous);
        delete nextCart[itemId];
        return nextCart;
      }
      return Object.assign({}, previous, { [itemId]: safeQuantity });
    });
  }

  function handleBindConfirm() {
    setBoundChefIds(function (previous) {
      if (previous.includes('chef-momo')) return previous;
      return previous.concat('chef-momo');
    });
    setBindingConfirmed(true);
    setShareSheetOpen(false);
    if (!selectedChefId) {
      setSelectedChefId('chef-momo');
    }
    setCurrentTab('home');
  }

  function handleCreateOrder() {
    if (!selectedChef || paymentCount < totalWords || cartItems.length === 0) return;
    const nextId = 'order-' + Date.now();
    const nextOrder = {
      id: nextId,
      code: 'NO. ' + String(orders.length + 1).padStart(3, '0'),
      chefId: selectedChef.id,
      customerName: '你',
      createdAt: '刚刚',
      status: '待制作',
      notifyStatus: selectedChef.notificationEnabled ? 'sent' : 'fallback',
      unreadForChef: true,
      totalWords: totalWords,
      paymentText: paymentText,
      chefReply: '',
      items: cartItems.map(function (item) {
        return {
          id: item.id,
          name: item.name,
          image: item.image,
          wordsPrice: item.wordsPrice,
          quantity: item.quantity,
        };
      }),
      reviews: {
        customer: null,
        chef: null,
      },
    };
    setOrders(function (previous) {
      return [nextOrder].concat(previous);
    });
    setCart({});
    setPaymentText('');
    setCheckoutOpen(false);
    setSuccessOrderId(nextId);
    setActiveOrderId(nextId);
  }

  function openOrderDetail(orderId) {
    setActiveOrderId(orderId);
    setDetailOpen(true);
    setOrders(function (previous) {
      return previous.map(function (order) {
        return order.id === orderId ? Object.assign({}, order, { unreadForChef: false }) : order;
      });
    });
  }

  function handleCompleteOrder() {
    if (!activeOrder) return;
    setOrders(function (previous) {
      return previous.map(function (order) {
        return order.id === activeOrder.id
          ? Object.assign({}, order, {
              status: '已完成',
              chefReply: completionReply.trim(),
              unreadForChef: false,
            })
          : order;
      });
    });
    setCompletionReply('');
    setCompleteOpen(false);
    setDetailOpen(true);
  }

  function openReview(orderId, role) {
    setActiveOrderId(orderId);
    setReviewRole(role);
    setReviewText('');
    setReviewImages([]);
    setReviewOpen(true);
  }

  function submitReview() {
    if (!activeOrder || !reviewText.trim()) return;
    setOrders(function (previous) {
      return previous.map(function (order) {
        return order.id === activeOrder.id
          ? Object.assign({}, order, {
              reviews: Object.assign({}, order.reviews, {
                [reviewRole]: {
                  author: reviewRole === 'customer' ? '用户评价' : '厨师评价',
                  content: reviewText.trim(),
                  images: reviewImages,
                },
              }),
            })
          : order;
      });
    });
    setReviewOpen(false);
    setReviewText('');
    setReviewImages([]);
  }

  function toggleChefNotify(chefId) {
    setChefs(function (previous) {
      return previous.map(function (chef) {
        return chef.id === chefId
          ? Object.assign({}, chef, {
              notificationEnabled: !chef.notificationEnabled,
              signature: !chef.notificationEnabled ? '新订单微信提醒已开启' : '暂未开启微信提醒，仅站内提醒',
            })
          : chef;
      });
    });
  }

  function handleRemoveBinding(chefId) {
    setBoundChefIds(function (previous) {
      const nextIds = previous.filter(function (id) {
        return id !== chefId;
      });
      if (selectedChefId === chefId) {
        setSelectedChefId(nextIds[0] || '');
      }
      return nextIds;
    });
  }

  function handleMenuImageChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (loadEvent) {
      setMenuDraft(function (previous) {
        return Object.assign({}, previous, {
          imagePreview: typeof loadEvent.target.result === 'string' ? loadEvent.target.result : '',
          imageName: file.name,
        });
      });
    };
    reader.readAsDataURL(file);
  }

  function resetMenuDraft() {
    setMenuDraft(initialDraftDish);
  }

  function handleMenuDraftSubmit() {
    if (!selectedChef) return;
    if (!menuDraft.name.trim() || !menuDraft.wordsPrice) {
      setMenuMessage('请先补齐菜名和文字价格');
      return;
    }
    const newItem = {
      id: 'dish-' + Date.now(),
      chefId: selectedChef.id,
      name: menuDraft.name.trim(),
      wordsPrice: Number(menuDraft.wordsPrice),
      description: menuDraft.description.trim() || '这是原型里新加的一道菜。',
      image: menuDraft.imagePreview || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
      available: true,
    };
    setMenuItems(function (previous) {
      return [newItem].concat(previous);
    });
    resetMenuDraft();
    setMenuCreateOpen(false);
    setMenuMessage('已模拟新增菜品，正式版会接云数据库');
  }

  function toggleDishAvailability(itemId) {
    setMenuItems(function (previous) {
      return previous.map(function (item) {
        return item.id === itemId ? Object.assign({}, item, { available: !item.available }) : item;
      });
    });
  }

  const successOrder = successOrderId
    ? orders.find(function (item) {
        return item.id === successOrderId;
      }) || null
    : null;
  const successChef = successOrder
    ? chefs.find(function (chef) {
        return chef.id === successOrder.chefId;
      }) || null
    : null;
  const nextChef =
    chefs.find(function (chef) {
      return !boundChefIds.includes(chef.id);
    }) || null;

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <main className="phone-stage">
        <section className="phone-frame">
          <header className="topbar">
            <div>
              <p className="eyebrow">文字支付点单 demo</p>
              <h1>把想吃的，变成一段会送达的文字</h1>
            </div>
            <div className="mode-switch">
              <button type="button" className={viewMode === 'customer' ? 'is-active' : ''} onClick={function () { setViewMode('customer'); }}>
                点单者
              </button>
              <button type="button" className={viewMode === 'chef' ? 'is-active' : ''} onClick={function () { setViewMode('chef'); }}>
                厨师
              </button>
            </div>
          </header>

          <section className="screen-body">
            {currentTab === 'home' ? (
              <HomePage
                chefs={boundChefs}
                bindingConfirmed={bindingConfirmed}
                openShareSheet={function () { setShareSheetOpen(true); }}
                chooseChef={function (chefId) { setSelectedChefId(chefId); switchTab('order'); }}
                directEnter={function () { switchTab('order'); }}
              />
            ) : null}
            {currentTab === 'order' ? (
              <OrderPage
                boundChefs={boundChefs}
                selectedChef={selectedChef}
                selectedChefId={selectedChefId}
                onSelectChef={setSelectedChefId}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filteredMenu={filteredMenu}
                cart={cart}
                updateCart={updateCart}
                openCheckout={function () { setCheckoutOpen(true); }}
                totalQuantity={totalQuantity}
                totalWords={totalWords}
              />
            ) : null}
            {currentTab === 'orders' ? (
              <OrdersPage
                orders={visibleOrders}
                chefs={chefs}
                viewMode={viewMode}
                onOpenDetail={openOrderDetail}
                onSwitchMode={setViewMode}
                onGoToOrder={function () { switchTab('order'); }}
              />
            ) : null}
            {currentTab === 'menu' ? (
              <MenuPage
                chefs={boundChefs}
                selectedChef={selectedChef}
                onSelectChef={setSelectedChefId}
                items={menuItemsForChef}
                draft={menuDraft}
                onDraftChange={setMenuDraft}
                onImageChange={handleMenuImageChange}
                onSubmitDraft={handleMenuDraftSubmit}
                onToggleAvailability={toggleDishAvailability}
                message={menuMessage}
                createOpen={menuCreateOpen}
                onOpenCreate={function () { setMenuCreateOpen(true); setMenuMessage(''); }}
                onCloseCreate={function () { setMenuCreateOpen(false); resetMenuDraft(); }}
              />
            ) : null}
            {currentTab === 'me' ? (
              <MePage
                chefs={boundChefs}
                viewMode={viewMode}
                onSwitchMode={setViewMode}
                onToggleNotify={toggleChefNotify}
                onRemoveBinding={handleRemoveBinding}
                onOpenShare={function () { setShareSheetOpen(true); }}
              />
            ) : null}
          </section>

          <nav className="tabbar">
            {[
              ['home', '首页'],
              ['order', '点单'],
              ['orders', '订单'],
              ['menu', '菜单'],
              ['me', '我的'],
            ].map(function (pair) {
              const key = pair[0];
              const label = pair[1];
              return (
                <button key={key} type="button" className={currentTab === key ? 'is-active' : ''} onClick={function () { switchTab(key); }}>
                  {label}
                </button>
              );
            })}
          </nav>
        </section>
      </main>

      {shareSheetOpen ? <ShareSheet nextChef={nextChef} onClose={function () { setShareSheetOpen(false); }} onConfirm={handleBindConfirm} /> : null}
      {checkoutOpen ? (
        <CheckoutSheet
          chef={selectedChef}
          cartItems={cartItems}
          totalWords={totalWords}
          paymentText={paymentText}
          paymentCount={paymentCount}
          onPaymentChange={setPaymentText}
          onUpdateCart={updateCart}
          onClose={function () { setCheckoutOpen(false); }}
          onSubmit={handleCreateOrder}
        />
      ) : null}
      {successOrder ? (
        <SuccessSheet
          order={successOrder}
          chef={successChef}
          onClose={function () { setSuccessOrderId(null); }}
          onViewOrder={function () { const orderId = successOrder.id; setSuccessOrderId(null); setCurrentTab('orders'); openOrderDetail(orderId); }}
          onChefView={function () { setSuccessOrderId(null); setViewMode('chef'); setCurrentTab('orders'); }}
        />
      ) : null}
      {detailOpen && activeOrder ? (
        <OrderDetailSheet
          order={activeOrder}
          chef={chefs.find(function (item) { return item.id === activeOrder.chefId; })}
          viewMode={viewMode}
          onClose={function () { setDetailOpen(false); }}
          onComplete={function () { setDetailOpen(false); setCompleteOpen(true); }}
          onReview={openReview}
        />
      ) : null}
      {completeOpen && activeOrder ? (
        <CompleteSheet
          order={activeOrder}
          reply={completionReply}
          onReplyChange={setCompletionReply}
          onClose={function () { setCompleteOpen(false); }}
          onSubmit={handleCompleteOrder}
        />
      ) : null}
      {reviewOpen && activeOrder ? (
        <ReviewSheet
          role={reviewRole}
          reviewText={reviewText}
          reviewImages={reviewImages}
          onReviewTextChange={setReviewText}
          onToggleImage={function (label) {
            setReviewImages(function (previous) {
              return previous.includes(label)
                ? previous.filter(function (item) { return item !== label; })
                : previous.concat(label).slice(0, 3);
            });
          }}
          onClose={function () { setReviewOpen(false); }}
          onSubmit={submitReview}
        />
      ) : null}
    </div>
  );
}

function HomePage(props) {
  return (
    <div className="page">
      <section className="hero-card hero-card-with-mascot">
        <div>
          <p className="eyebrow">首页</p>
          <h2>今天想吃什么，也想顺便说点什么？</h2>
          <p className="hero-copy">这里的支付不是金额，而是一段认真写下来的文字。先绑定厨师，再开始一次会被看见的点单。</p>
        </div>
        <PuppyMascot note="汪，今天也认真接住你的想吃和想说。" />
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={props.openShareSheet}>绑定厨师</button>
          <button type="button" className="secondary-button" onClick={props.directEnter}>直接进入</button>
        </div>
      </section>
      {props.bindingConfirmed ? (
        <section className="notice-card success">
          <strong>绑定确认成功</strong>
          <span>双方已经建立关系，现在可以给新绑定的厨师点单了。</span>
        </section>
      ) : null}
      <section className="section-block">
        <div className="section-title">
          <h3>最近可点单的厨师</h3>
          <span>多对多绑定，当前已绑定 {props.chefs.length} 位</span>
        </div>
        {props.chefs.length === 0 ? (
          <div className="empty-inline-card">
            <strong>还没有绑定的厨师</strong>
            <p>先去绑定一位厨师，再开始点单。</p>
          </div>
        ) : (
          <div className="chef-grid">
            {props.chefs.map(function (chef) {
              return (
                <button type="button" key={chef.id} className={'chef-card ' + chef.themeClass} onClick={function () { props.chooseChef(chef.id); }}>
                  <div className="chef-avatar">{chef.avatar}</div>
                  <div className="chef-meta">
                    <strong>{chef.name}</strong>
                    <span>{chef.title}</span>
                    <small>{chef.styleNote}</small>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function OrderPage(props) {
  return (
    <div className="page page-scrollable page-with-cart">
      <section className="section-block">
        <div className="section-title">
          <h3>先选择 1 位厨师</h3>
          <span>一个订单只对应一个厨师，后续更容易履约</span>
        </div>
        {props.boundChefs.length === 0 ? (
          <div className="empty-inline-card">
            <strong>还没有可点单的厨师</strong>
            <p>请先返回首页或我的页面绑定关系。</p>
          </div>
        ) : (
          <div className="chef-strip">
            {props.boundChefs.map(function (chef) {
              return (
                <button type="button" key={chef.id} className={props.selectedChefId === chef.id ? 'pill-button is-active' : 'pill-button'} onClick={function () { props.onSelectChef(chef.id); }}>
                  {chef.name}
                </button>
              );
            })}
          </div>
        )}
      </section>
      {props.selectedChef ? (
        <section className="section-block">
          <div className="search-panel">
            <div>
              <p className="eyebrow">开始点菜</p>
              <h3>{props.selectedChef.name} 的菜单</h3>
            </div>
            <input className="search-input" value={props.searchTerm} onChange={function (event) { props.onSearchChange(event.target.value); }} placeholder="搜索菜名或描述" />
          </div>
          <div className="dish-list">
            {props.filteredMenu.map(function (item) {
              const quantity = props.cart[item.id] || 0;
              return (
                <article key={item.id} className={item.available ? 'dish-card' : 'dish-card is-offline'}>
                  <img src={item.image} alt={item.name} />
                  <div className="dish-content">
                    <div className="dish-header">
                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                      </div>
                      <strong>{item.wordsPrice} 字</strong>
                    </div>
                    <div className="dish-footer">
                      <span>{item.available ? '可下单' : '已下架，仅展示历史样式'}</span>
                      <div className="stepper">
                        <button type="button" onClick={function () { props.updateCart(item.id, quantity - 1); }} disabled={quantity === 0}>-</button>
                        <span>{quantity}</span>
                        <button type="button" onClick={function () { props.updateCart(item.id, quantity + 1); }} disabled={!item.available}>+</button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
      <button type="button" className={props.totalQuantity > 0 ? 'floating-cart is-visible' : 'floating-cart'} onClick={props.openCheckout}>
        <div>
          <strong>{props.totalQuantity} 份菜品已加入购物车</strong>
          <span>当前需要至少写 {props.totalWords} 个字才能下单</span>
        </div>
        <span>查看</span>
      </button>
    </div>
  );
}

function OrdersPage(props) {
  return (
    <div className="page page-scrollable">
      <section className="section-block">
        <div className="section-title">
          <h3>查看订单</h3>
          <span>下单菜品、支付文字、回复和评价都会沉淀在这里</span>
        </div>
        <div className="mode-tabs">
          <button type="button" className={props.viewMode === 'customer' ? 'is-active' : ''} onClick={function () { props.onSwitchMode('customer'); }}>我下的订单</button>
          <button type="button" className={props.viewMode === 'chef' ? 'is-active' : ''} onClick={function () { props.onSwitchMode('chef'); }}>我收到的订单</button>
        </div>
      </section>
      <div className="order-list">
        {props.orders.length === 0 ? (
          <section className="empty-card">
            <strong>这里还没有订单</strong>
            <p>先去点一份菜，再回来看看完整闭环。</p>
            <button type="button" className="secondary-button" onClick={props.onGoToOrder}>去点菜</button>
          </section>
        ) : null}
        {props.orders.map(function (order) {
          const chef = props.chefs.find(function (item) { return item.id === order.chefId; });
          return (
            <button type="button" key={order.id} className="order-card" onClick={function () { props.onOpenDetail(order.id); }}>
              <div className="order-card-top">
                <div>
                  <strong>{order.code}</strong>
                  <span>{chef && chef.name}</span>
                </div>
                <div className="order-state-group">
                  {order.unreadForChef && props.viewMode === 'chef' ? <span className="new-badge">新订单</span> : null}
                  <span className={'status-pill status-' + order.status}>{order.status}</span>
                </div>
              </div>
              <p className="order-line">{order.items.map(function (item) { return item.name + ' x' + item.quantity; }).join('、')}</p>
              <div className="order-card-bottom">
                <span>{order.createdAt}</span>
                <span>{order.notifyStatus === 'sent' ? '已通知厨师' : '未开启微信提醒，已站内提醒'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MenuPage(props) {
  if (props.createOpen) {
    return (
      <div className="page page-scrollable">
        <section className="editor-card editor-page-card">
          <div className="section-title section-title-stack">
            <div>
              <p className="eyebrow">添加菜品</p>
              <h3>给 {props.selectedChef ? props.selectedChef.name : '当前厨师'} 新增一道菜</h3>
            </div>
            <button type="button" className="ghost-button" onClick={props.onCloseCreate}>返回</button>
          </div>
          <PuppyMascot compact note="汪，我来帮你把新菜品摆好看一点。" />
          <div className="upload-card">
            <div className="upload-preview">
              {props.draft.imagePreview ? <img src={props.draft.imagePreview} alt="菜品预览" /> : <div className="upload-placeholder">上传一张菜品图</div>}
            </div>
            <label className="upload-button">
              <span>{props.draft.imageName || '选择图片'}</span>
              <input type="file" accept="image/*" onChange={props.onImageChange} />
            </label>
          </div>
          <div className="editor-grid">
            <input value={props.draft.name} onChange={function (event) { props.onDraftChange(function (previous) { return Object.assign({}, previous, { name: event.target.value }); }); }} placeholder="菜品名称" />
            <input value={props.draft.wordsPrice} onChange={function (event) { props.onDraftChange(function (previous) { return Object.assign({}, previous, { wordsPrice: event.target.value.replace(/\D/g, '') }); }); }} placeholder="文字价格" />
          </div>
          <textarea value={props.draft.description} onChange={function (event) { props.onDraftChange(function (previous) { return Object.assign({}, previous, { description: event.target.value }); }); }} placeholder="菜品描述" />
          <div className="editor-actions editor-actions-stack">
            <button type="button" className="primary-button" onClick={props.onSubmitDraft}>保存菜品</button>
            <span>{props.message || '支持上传图片，保存后会回到菜单列表。'}</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page page-scrollable">
      <section className="section-block">
        <div className="section-title">
          <h3>菜单管理</h3>
          <span>点击按钮进入添加菜品页面，正式版可直接接入云数据库</span>
        </div>
        {props.chefs.length === 0 ? (
          <div className="empty-inline-card">
            <strong>还没有绑定的厨师</strong>
            <p>请先绑定关系后，再维护对应厨师的菜单。</p>
          </div>
        ) : (
          <div className="chef-strip">
            {props.chefs.map(function (chef) {
              return (
                <button type="button" key={chef.id} className={props.selectedChef && props.selectedChef.id === chef.id ? 'pill-button is-active' : 'pill-button'} onClick={function () { props.onSelectChef(chef.id); }}>
                  {chef.name}
                </button>
              );
            })}
          </div>
        )}
      </section>
      <section className="section-block action-card">
        <div>
          <p className="eyebrow">添加入口</p>
          <h3>把新菜品放进菜单里</h3>
        </div>
        <button type="button" className="primary-button" onClick={props.onOpenCreate} disabled={!props.selectedChef}>添加菜品</button>
      </section>
      <div className="menu-preview-list">
        {props.items.map(function (item) {
          return (
            <article key={item.id} className="menu-preview-card">
              <img src={item.image} alt={item.name} />
              <div className="menu-preview-content">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.wordsPrice} 字</span>
                </div>
                <p>{item.description}</p>
                <div className="inline-actions">
                  <button type="button">编辑</button>
                  <button type="button" onClick={function () { props.onToggleAvailability(item.id); }}>
                    {item.available ? '下架' : '重新上架'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MePage(props) {
  return (
    <div className="page">
      <section className="profile-card profile-card-with-dog">
        <div>
          <p className="eyebrow">个人设置</p>
          <h3>当前原型支持双角色切换</h3>
          <p>正式版会在这里承接微信登录信息、绑定关系管理、消息订阅状态和个人资料。</p>
        </div>
        <PuppyMascot compact note="汪，我也会帮你看好绑定关系。" />
        <div className="mode-tabs">
          <button type="button" className={props.viewMode === 'customer' ? 'is-active' : ''} onClick={function () { props.onSwitchMode('customer'); }}>以点单者查看</button>
          <button type="button" className={props.viewMode === 'chef' ? 'is-active' : ''} onClick={function () { props.onSwitchMode('chef'); }}>以厨师查看</button>
        </div>
      </section>
      <section className="section-block">
        <div className="section-title">
          <h3>绑定关系与提醒</h3>
          <span>可以开启提醒，也可以直接删除当前绑定关系</span>
        </div>
        <div className="settings-list">
          {props.chefs.length === 0 ? (
            <div className="empty-inline-card">
              <strong>还没有绑定关系</strong>
              <p>可以点击下方按钮继续绑定厨师。</p>
            </div>
          ) : null}
          {props.chefs.map(function (chef) {
            return (
              <div key={chef.id} className="setting-row setting-row-stack">
                <div>
                  <strong>{chef.name}</strong>
                  <span>{chef.signature}</span>
                </div>
                <div className="setting-actions">
                  <button type="button" className={chef.notificationEnabled ? 'toggle-chip is-on' : 'toggle-chip'} onClick={function () { props.onToggleNotify(chef.id); }}>
                    {chef.notificationEnabled ? '已开启提醒' : '未开启提醒'}
                  </button>
                  <button type="button" className="danger-link" onClick={function () { props.onRemoveBinding(chef.id); }}>删除绑定</button>
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" className="secondary-button wide" onClick={props.onOpenShare}>再绑定一位厨师</button>
      </section>
    </div>
  );
}

function ShareSheet(props) {
  return (
    <Overlay onClose={props.onClose}>
      <div className="sheet-card">
        <p className="eyebrow">模拟微信分享</p>
        <h3>把绑定链接发给厨师好友</h3>
        <p>正式版会通过微信分享链接完成绑定。原型里直接模拟好友确认，帮助你快速看到多对多绑定后的效果。</p>
        <div className="share-preview">
          <strong>{props.nextChef ? '发给：' + props.nextChef.name : '当前没有新的厨师可模拟绑定'}</strong>
          <span>{props.nextChef ? props.nextChef.shareHint : '你已经把两位预置厨师都绑定成功了。'}</span>
        </div>
        <div className="sheet-actions">
          <button type="button" className="secondary-button" onClick={props.onClose}>取消</button>
          <button type="button" className="primary-button" onClick={props.onConfirm} disabled={!props.nextChef}>模拟好友确认绑定</button>
        </div>
      </div>
    </Overlay>
  );
}

function CheckoutSheet(props) {
  return (
    <Overlay onClose={props.onClose}>
      <div className="sheet-card tall">
        <div className="sheet-header">
          <div>
            <p className="eyebrow">确认下单</p>
            <h3>给 {props.chef && props.chef.name} 发送这份点单</h3>
          </div>
          <button type="button" className="ghost-button" onClick={props.onClose}>关闭</button>
        </div>
        <div className="cart-preview-list">
          {props.cartItems.length === 0 ? (
            <div className="empty-inline-card">
              <strong>购物车已经空了</strong>
              <p>可以关闭弹层，回到菜单继续添加菜品。</p>
            </div>
          ) : null}
          {props.cartItems.map(function (item) {
            return (
              <div key={item.id} className="cart-preview-row cart-preview-row-editable">
                <div className="cart-preview-meta">
                  <strong>{item.name}</strong>
                  <span>{item.wordsPrice * item.quantity} 字</span>
                </div>
                <div className="stepper">
                  <button type="button" onClick={function () { props.onUpdateCart(item.id, item.quantity - 1); }}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={function () { props.onUpdateCart(item.id, item.quantity + 1); }}>+</button>
                </div>
              </div>
            );
          })}
        </div>
        <section className="payment-panel">
          <div className="section-title">
            <h3>文字支付</h3>
            <span>至少需要 {props.totalWords} 个字</span>
          </div>
          <textarea value={props.paymentText} onChange={function (event) { props.onPaymentChange(event.target.value); }} placeholder="写下此刻想吃什么、为什么想吃，或者你想顺便说的话。" />
          <div className="payment-footer">
            <span className={props.paymentCount >= props.totalWords ? 'ok' : 'warning'}>当前 {props.paymentCount} / {props.totalWords} 字</span>
            <button type="button" className="primary-button" onClick={props.onSubmit} disabled={props.paymentCount < props.totalWords || props.cartItems.length === 0}>满足字数后确认下单</button>
          </div>
        </section>
      </div>
    </Overlay>
  );
}

function SuccessSheet(props) {
  return (
    <Overlay onClose={props.onClose}>
      <div className="sheet-card success-card">
        <p className="eyebrow">下单成功</p>
        <h3>文字已送达，订单已经发给 {props.chef && props.chef.name}</h3>
        <p>{props.order && props.order.notifyStatus === 'sent' ? '这位厨师已开启微信提醒，原型里展示为“已通知厨师”。' : '这位厨师暂未开启微信提醒，原型里展示为“已站内提醒”。'}</p>
        <div className="success-status">
          <strong>{props.order && props.order.notifyStatus === 'sent' ? '已通知厨师' : '已站内提醒'}</strong>
          <span>{props.order && props.order.notifyStatus === 'sent' ? '微信提醒已发出' : '订单页红点会保留'}</span>
        </div>
        <div className="sheet-actions">
          <button type="button" className="secondary-button" onClick={props.onViewOrder}>查看订单详情</button>
          <button type="button" className="primary-button" onClick={props.onChefView}>切到厨师视角</button>
        </div>
      </div>
    </Overlay>
  );
}

function OrderDetailSheet(props) {
  const canComplete = props.viewMode === 'chef' && props.order.status === '待制作';
  const canCustomerReview = props.viewMode === 'customer' && props.order.status === '已完成' && !props.order.reviews.customer;
  const canChefReview = props.viewMode === 'chef' && props.order.status === '已完成' && !props.order.reviews.chef;

  return (
    <Overlay onClose={props.onClose}>
      <div className="sheet-card tall">
        <div className="sheet-header">
          <div>
            <p className="eyebrow">订单详情</p>
            <h3>{props.order.code}</h3>
          </div>
          <button type="button" className="ghost-button" onClick={props.onClose}>关闭</button>
        </div>
        <div className="detail-summary">
          <div>
            <span>厨师</span>
            <strong>{props.chef && props.chef.name}</strong>
          </div>
          <div>
            <span>状态</span>
            <strong>{props.order.status}</strong>
          </div>
          <div>
            <span>提醒</span>
            <strong>{props.order.notifyStatus === 'sent' ? '已通知厨师' : '未开启微信提醒，已站内提醒'}</strong>
          </div>
        </div>
        <section className="detail-block">
          <div className="section-title">
            <h3>下单菜品</h3>
            <span>历史订单保存的是快照，不会受菜单变更影响</span>
          </div>
          <div className="detail-items">
            {props.order.items.map(function (item) {
              return (
                <div key={item.id} className="detail-item-row">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>x{item.quantity}</span>
                  </div>
                  <span>{item.wordsPrice * item.quantity} 字</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="detail-block">
          <div className="section-title">
            <h3>支付文字</h3>
            <span>共 {props.order.totalWords} 字要求</span>
          </div>
          <p className="detail-text">{props.order.paymentText}</p>
        </section>
        <section className="detail-block">
          <div className="section-title">
            <h3>厨师回复</h3>
            <span>{props.order.chefReply ? '已完成时附带回复' : '当前还没有回复'}</span>
          </div>
          <p className="detail-text muted">{props.order.chefReply || '等厨师完成订单后，这里会看到附带的文字回复。'}</p>
        </section>
        <section className="detail-block">
          <div className="section-title">
            <h3>评价</h3>
            <span>双方各可评价 1 次，并支持带图</span>
          </div>
          <div className="review-list">
            <ReviewCard review={props.order.reviews.customer} fallback="用户还没有评价" />
            <ReviewCard review={props.order.reviews.chef} fallback="厨师还没有评价" />
          </div>
        </section>
        <div className="sheet-actions">
          {canComplete ? <button type="button" className="primary-button" onClick={props.onComplete}>完成订单</button> : null}
          {canCustomerReview ? <button type="button" className="primary-button" onClick={function () { props.onReview(props.order.id, 'customer'); }}>我来评价</button> : null}
          {canChefReview ? <button type="button" className="primary-button" onClick={function () { props.onReview(props.order.id, 'chef'); }}>作为厨师评价</button> : null}
          <button type="button" className="secondary-button" onClick={props.onClose}>返回订单列表</button>
        </div>
      </div>
    </Overlay>
  );
}

function ReviewCard(props) {
  if (!props.review) {
    return (
      <div className="review-card empty">
        <strong>{props.fallback}</strong>
      </div>
    );
  }
  return (
    <div className="review-card">
      <strong>{props.review.author}</strong>
      <p>{props.review.content}</p>
      {props.review.images.length > 0 ? (
        <div className="review-images">
          {props.review.images.map(function (item) {
            return <span key={item}>{item}</span>;
          })}
        </div>
      ) : null}
    </div>
  );
}

function CompleteSheet(props) {
  return (
    <Overlay onClose={props.onClose}>
      <div className="sheet-card">
        <p className="eyebrow">完成订单</p>
        <h3>给 {props.order.customerName} 回一句话</h3>
        <textarea value={props.reply} onChange={function (event) { props.onReplyChange(event.target.value); }} placeholder="可选填写，比如“已经做好啦，记得趁热吃”。" />
        <div className="sheet-actions">
          <button type="button" className="secondary-button" onClick={props.onClose}>取消</button>
          <button type="button" className="primary-button" onClick={props.onSubmit}>确认完成订单</button>
        </div>
      </div>
    </Overlay>
  );
}

function ReviewSheet(props) {
  return (
    <Overlay onClose={props.onClose}>
      <div className="sheet-card">
        <p className="eyebrow">带图评价</p>
        <h3>{props.role === 'customer' ? '用户评价' : '厨师评价'}</h3>
        <textarea value={props.reviewText} onChange={function (event) { props.onReviewTextChange(event.target.value); }} placeholder="写一句这次点单最想留下的话。" />
        <div className="upload-strip">
          {['摆盘图', '细节图', '合照感'].map(function (label) {
            const active = props.reviewImages.includes(label);
            return (
              <button type="button" key={label} className={active ? 'upload-chip is-active' : 'upload-chip'} onClick={function () { props.onToggleImage(label); }}>
                {active ? '已选 ' + label : '添加 ' + label}
              </button>
            );
          })}
        </div>
        <div className="sheet-actions">
          <button type="button" className="secondary-button" onClick={props.onClose}>取消</button>
          <button type="button" className="primary-button" onClick={props.onSubmit} disabled={!props.reviewText.trim()}>提交评价</button>
        </div>
      </div>
    </Overlay>
  );
}

function PuppyMascot(props) {
  return (
    <div className={props.compact ? 'puppy-card compact' : 'puppy-card'}>
      <div className="puppy-face">
        <span className="puppy-ear left" />
        <span className="puppy-ear right" />
        <span className="puppy-eye left" />
        <span className="puppy-eye right" />
        <span className="puppy-cheek left" />
        <span className="puppy-cheek right" />
        <span className="puppy-nose" />
        <span className="puppy-mouth" />
      </div>
      <div className="puppy-note">{props.note}</div>
    </div>
  );
}

function Overlay(props) {
  return (
    <div className="overlay">
      <button type="button" className="overlay-backdrop" aria-label="关闭弹层" onClick={props.onClose} />
      <div className="overlay-panel">{props.children}</div>
    </div>
  );
}

export default App;
