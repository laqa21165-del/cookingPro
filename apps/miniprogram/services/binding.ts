import { request } from '../utils/request';

export function getBindings() {
  return request({ url: '/bindings' });
}

export function createBindingShare() {
  return request({ url: '/bindings/share', method: 'POST', data: {} });
}

export function confirmBinding(token: string) {
  return request({ url: '/bindings/confirm', method: 'POST', data: { token } });
}

export function deleteBinding(relatedUserId: string) {
  return request({ url: `/bindings/${relatedUserId}`, method: 'DELETE' });
}