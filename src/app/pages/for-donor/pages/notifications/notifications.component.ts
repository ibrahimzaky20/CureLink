import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationsService, Notification } from '../../../../core/services/notifications/notifications.service';

type Filter = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private readonly api = inject(NotificationsService);

  activeFilter = signal<Filter>('all');
  filters: Filter[] = ['all', 'unread', 'read'];

  notifications = signal<Notification[]>([]);
  loading       = signal(true);
  unreadCount   = signal(0);
  markingAll    = signal(false);

  page       = signal(1);
  totalPages = signal(1);

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications() {
    this.loading.set(true);
    this.api.getAll(this.page(), 10).subscribe({
      next: (res: any) => {
        const list: Notification[] = res?.data ?? [];
        const filtered = this.applyFilter(list);
        this.notifications.set(filtered);
        const pagination = res?.pagination ?? res?.data?.pagination;
        this.totalPages.set(pagination?.pages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadUnreadCount() {
    this.api.getUnreadCount().subscribe({
      next: (res) => this.unreadCount.set(res?.data?.unreadCount ?? 0),
      error: () => {}
    });
  }

  applyFilter(list: Notification[]): Notification[] {
    const f = this.activeFilter();
    if (f === 'unread') return list.filter(n => !n.isRead);
    if (f === 'read') return list.filter(n => n.isRead);
    return list;
  }

  setFilter(f: Filter) {
    this.activeFilter.set(f);
    this.page.set(1);
    this.loadNotifications();
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) return;
    this.api.markAsRead(notification._id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      }
    });
  }

  markAllAsRead() {
    this.markingAll.set(true);
    this.api.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
        this.markingAll.set(false);
      },
      error: () => this.markingAll.set(false)
    });
  }

  deleteNotification(id: string) {
    this.api.delete(id).subscribe({
      next: () => {
        const removed = this.notifications().find(n => n._id === id);
        this.notifications.update(list => list.filter(n => n._id !== id));
        if (removed && !removed.isRead) {
          this.unreadCount.update(c => Math.max(0, c - 1));
        }
      }
    });
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadNotifications();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.loadNotifications();
    }
  }

  cleanMessage(msg: string): string {
    return msg?.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const labels: Record<string, string> = {
        medicationName: 'your medication',
        donationId: 'your donation',
        institutionName: 'the institution',
        userName: 'the user',
      };
      return labels[key] ?? key;
    }) ?? '';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return '';
  }
}
