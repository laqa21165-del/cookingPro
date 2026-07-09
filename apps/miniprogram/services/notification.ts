import { request } from '../utils/request';

export function subscribeNotification(templateId: string) {
  return request({ url: '/notifications/subscribe', method: 'POST', data: { templateId } });
}
