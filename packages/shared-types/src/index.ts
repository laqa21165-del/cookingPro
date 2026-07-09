export type OrderStatus = 'pending' | 'completed';
export type NotifyStatus = 'sent' | 'fallback' | 'failed';
export type ReviewerRole = 'customer' | 'chef';

export interface UserProfile {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
}

export interface BindingSummary {
  id: string;
  chefId: string;
  chefName: string | null;
  chefAvatarUrl: string | null;
}
