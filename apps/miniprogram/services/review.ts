import { request } from '../utils/request';

export function createReview(data: Record<string, unknown>) {
  return request({ url: '/reviews', method: 'POST', data });
}
