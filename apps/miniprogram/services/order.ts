import { request } from '../utils/request';

export function createOrder(data: Record<string, unknown>) {
  return request({ url: '/orders', method: 'POST', data });
}

export function getOrders(role: 'all' | 'customer' | 'chef' = 'all') {
  return request({ url: `/orders?role=${role}` });
}

export function getOrderDetail(id: string) {
  return request({ url: `/orders/${id}` });
}

export function completeOrder(id: string, chefReply: string) {
  return request({ url: `/orders/${id}/complete`, method: 'PATCH', data: { chefReply } });
}
