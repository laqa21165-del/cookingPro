import { request, saveToken } from './request';
import { setToken, setUser } from './store';

/** 调起 wx.login 拿 code，发给后端换 token；成功则写入本地存储。 */
export async function loginWithWechat(): Promise<string> {
  const { code } = await new Promise<{ code: string }>((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res as { code: string }),
      fail: reject,
    });
  });

  const response = await request<{
    accessToken: string;
    user: Record<string, unknown>;
  }>({
    url: '/auth/login',
    method: 'POST',
    data: { code },
  });

  saveToken(response.accessToken);
  setToken(response.accessToken);
  setUser(response.user);
  wx.setStorageSync('word-order-login-openid', (response.user as Record<string, unknown>)?.openId);
  return response.accessToken;
}

/**
 * 确保已登录：本地有 token 直接复用；否则用微信 code 静默登录。
 * wx.login 不需要用户授权（不弹窗），可随页面自动发起。
 */
export async function ensureLogin(): Promise<string> {
  const token = wx.getStorageSync('word-order-token');
  if (token) {
    return token;
  }
  return loginWithWechat();
}

export async function refreshMe() {
  const me = await request({ url: '/me' });
  setUser(me as Record<string, unknown>);
  return me;
}
