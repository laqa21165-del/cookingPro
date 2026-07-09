import { request } from '../utils/request';

export function getMenus(chefId: string) {
  return request({ url: `/menus?chefId=${chefId}` });
}

export function createMenuItem(data: Record<string, unknown>) {
  return request({ url: '/menus', method: 'POST', data });
}

export function updateMenuStatus(id: string, status: 'active' | 'inactive') {
  return request({ url: `/menus/${id}/status`, method: 'PATCH', data: { status } });
}

export function deleteMenuItem(id: string) {
  return request({ url: `/menus/${id}`, method: 'DELETE' });
}
