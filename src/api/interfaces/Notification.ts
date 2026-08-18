import { Paginated } from './Common';

/**
 * In-app notification (blueprint §3.5). Fired by workflow events — the approvals
 * module emits these on each transition.
 */
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: string; // "approval.assigned" | "record.approved" | ...
  isRead: boolean;
  link: string | null; // (assumed) deep link, e.g. /records/:id
  createdAt: string;
}

/** List payload: a page of notifications plus the total unread count. */
export interface NotificationsPage extends Paginated<Notification> {
  unreadCount: number;
}

export interface MarkAllReadResponse {
  updated: number;
}
