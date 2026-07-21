import { request } from '../utils/request';

export function updateProfile(data: { nickname?: string; avatarUrl?: string }) {
  return request({ url: '/me', method: 'PATCH', data });
}
