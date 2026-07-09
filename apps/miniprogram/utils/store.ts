const TOKEN_KEY = 'word-order-token';
const USER_KEY = 'word-order-user';

export function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || '';
}

export function setToken(token: string) {
  wx.setStorageSync(TOKEN_KEY, token);
}

export function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

export function getUser<T = Record<string, unknown>>() {
  return (wx.getStorageSync(USER_KEY) as T) || null;
}

export function setUser(user: Record<string, unknown>) {
  wx.setStorageSync(USER_KEY, user);
}
