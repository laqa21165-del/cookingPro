import { ensureLogin } from './utils/auth';
import { getToken, getUser } from './utils/store';

App({
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:3000/api/v1',
    token: getToken(),
    user: getUser(),
  },
  async onLaunch() {
    try {
      await ensureLogin();
    } catch (error) {
      console.warn('login failed on launch', error);
    }
  },
} as any);
