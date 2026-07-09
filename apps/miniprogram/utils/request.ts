import { clearToken, getToken, setToken } from './store';

const BASE_URL = 'http://127.0.0.1:3000/api/v1';

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
