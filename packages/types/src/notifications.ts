import { BaseEntity } from './common';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type NotificationTopic =
  | 'SECURITY_ALERT'
  | 'BUDGET_EXCEEDED'
  | 'BILL_DUE'
  | 'LARGE_TRANSACTION'
  | 'GOAL_MILESTONE'
  | 'PORTFOLIO_SWING'
  | 'DIVIDEND_CREDITED'
  | 'SYSTEM_ANNOUNCEMENT';

export interface AppNotification extends BaseEntity {
  userId: string;
  topic: NotificationTopic;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

