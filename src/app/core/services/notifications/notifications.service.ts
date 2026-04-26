import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Notification {
  _id: string;
  user: string | { firstName?: string; lastName?: string; email?: string };
  title: string;
  type: string;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListResponse {
  status: string;
  message: string;
  data: Notification[];
  timestamp: string;
}

export interface NotificationResponse {
  status: string;
  message: string;
  data: Notification;
  timestamp: string;
}

export interface UnreadCountResponse {
  status: string;
  message: string;
  data: { unreadCount: number };
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  getAll(page = 1, limit = 10): Observable<NotificationsListResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<NotificationsListResponse>(`${this.api}/api/v1/notifications`, { ...this.opts, params });
  }

  getById(id: string): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.api}/api/v1/notifications/${id}`, this.opts);
  }

  markAsRead(id: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.api}/api/v1/notifications/${id}/read`, {}, this.opts);
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/notifications/read-all`, {}, this.opts);
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.api}/api/v1/notifications/unread-count`, this.opts);
  }

  delete(id: string): Observable<NotificationResponse> {
    return this.http.delete<NotificationResponse>(`${this.api}/api/v1/notifications/${id}`, this.opts);
  }

  deleteAllForUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/notifications/${userId}`, this.opts);
  }

  getDeleted(): Observable<NotificationsListResponse> {
    return this.http.get<NotificationsListResponse>(`${this.api}/api/v1/notifications/deleted`, this.opts);
  }

  restore(id: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.api}/api/v1/notifications/restore/${id}`, {}, this.opts);
  }
}
