import { clearToken, getToken, setToken } from './store';

// 生产域名（上线前把 api.<你的域名> 换成你已备案的 HTTPS 域名，仅改这一处）
const PROD_BASE_URL = 'https://api.<你的域名>/api/v1';
// 开发版联调用内网直连（同一 WiFi 下后端 IP）
const DEV_BASE_URL = 'http://192.168.0.8:3000/api/v1';

function resolveBaseUrl(): string {
  try {
    const env = (wx.getAccountInfoSync() as any).miniProgram.envVersion; // 'develop' | 'trial' | 'release'
    if (env === 'develop') return DEV_BASE_URL; // 开发版 / 真机调试 → 内网
    return PROD_BASE_URL; // 体验版 / 正式版 → 生产
  } catch (e) {
    return PROD_BASE_URL;
  }
}

const BASE_URL = resolveBaseUrl();
type RequestOptions = {
  url: string;
  method?: string;
  data?: any;
};

export function request<TResponse = any>(options: RequestOptions): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: (options.method || 'GET') as any,
      data: options.data,
      header: {
        Authorization: getToken() ? `Bearer ${getToken()}` : '',
      },
      success: async (response) => {
        if (response.statusCode === 401) {
          clearToken();
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data as TResponse);
          return;
        }

        const message = (response.data as any)?.message || '请求失败';
        reject(new Error(Array.isArray(message) ? message.join('，') : message));
      },
      fail: reject,
    });
  });
}

export async function uploadFile(filePath: string) {
  return new Promise<any>((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/files/upload`,
      filePath,
      name: 'file',
      header: {
        Authorization: getToken() ? `Bearer ${getToken()}` : '',
      },
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(JSON.parse(response.data));
          return;
        }
        reject(new Error(response.data || '上传失败'));
      },
      fail: reject,
    });
  });
}

export function saveToken(token: string) {
  setToken(token);
}
