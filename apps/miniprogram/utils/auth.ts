import { request, saveToken } from './request';
import { clearToken, setToken, setUser } from './store';

const DEMO_OPEN_ID_KEY = 'word-order-demo-openid';

export const DEMO_USERS = {
  customer_demo: { openId: 'customer_demo', nickname: '今天想吃饭' },
  chef_demo_a: { openId: 'chef_demo_a', nickname: '阿棕' },
  chef_demo_b: { openId: 'chef_demo_b', nickname: '小桃' },
};

type DemoUserKey = keyof typeof DEMO_USERS;

export function getSelectedDemoOpenId() {
  return wx.getStorageSync(DEMO_OPEN_ID_KEY) || 'customer_demo';
}

export function setSelectedDemoOpenId(openId: string) {
  wx.setStorageSync(DEMO_OPEN_ID_KEY, openId);
}

function getDemoProfile(openId: string) {
  return DEMO_USERS[openId as DemoUserKey] || DEMO_USERS.customer_demo;
}

export async function loginDemoUser(openId = getSelectedDemoOpenId()) {
  const profile = getDemoProfile(openId);
  clearToken();

  const response = await request<{
    accessToken: string;
    user: Record<string, unknown>;
  }>({
    url: '/auth/login',
    method: 'POST',
    data: {
      code: `demo-${profile.openId}`,
      nickname: profile.nickname,
      mockOpenId: profile.openId,
    },
  });

  saveToken(response.accessToken);
  setToken(response.accessToken);
  setUser(response.user);
  setSelectedDemoOpenId(profile.openId);
  wx.setStorageSync('word-order-login-openid', profile.openId);
  return response.user;
}

export async function ensureLogin() {
  const token = wx.getStorageSync('word-order-token');
  const selectedOpenId = getSelectedDemoOpenId();
  const loginOpenId = wx.getStorageSync('word-order-login-openid');

  if (token && loginOpenId === selectedOpenId) {
    return token;
  }

  await loginDemoUser(selectedOpenId);
  return wx.getStorageSync('word-order-token');
}

export async function switchDemoUser(openId: string) {
  setSelectedDemoOpenId(openId);
  return loginDemoUser(openId);
}

export async function refreshMe() {
  const me = await request({ url: '/me' });
  setUser(me as Record<string, unknown>);
  return me;
}
