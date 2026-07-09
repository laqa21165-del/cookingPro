import { request } from '../utils/request';

export function getMe() {
  return request({ url: '/me' });
}
