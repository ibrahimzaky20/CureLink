import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { AuthServiceService } from '../../../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, NgClass, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly auth  = inject(AuthServiceService);

  userName = signal(this.auth.currentUser()?.firstName ?? 'Admin');
  isSuperadmin = this.auth.currentUser()?.role === 'superadmin';

  stats = signal({
    totalDonations: 0,
    pendingDonations: 0,
    totalInstitutions: 0,
    pendingInstitutions: 0
  });

  recentDonations = signal<any[]>([]);
  pendingInstitutions = signal<any[]>([]);
  expiringDonations = signal<any[]>([]);

  recentActivity = signal<any[]>([]);
  systemSummary = signal<any>(null);
  alerts = signal<any[]>([]);

  loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.admin.getDonations(1, 5).subscribe({
      next: res => {
        this.recentDonations.set(res?.data?.donations ?? []);
        this.stats.update(s => ({ ...s, totalDonations: res?.data?.pagination?.total ?? 0 }));
      },
      error: () => {}
    });

    this.admin.getPendingDonations(1, 100).subscribe({
      next: res => {
        this.stats.update(s => ({ ...s, pendingDonations: res?.data?.donations?.length ?? res?.data?.pagination?.total ?? 0 }));
      },
      error: () => {}
    });

    this.admin.getExpiringDonations(30).subscribe({
      next: res => {
        this.expiringDonations.set(res?.data?.donations?.slice(0, 5) ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.admin.getInstitutions().subscribe({
      next: res => {
        const institutions = res?.data?.institutions ?? [];
        this.stats.update(s => ({ ...s, totalInstitutions: institutions.length }));
      },
      error: () => {}
    });

    this.admin.getPendingInstitutions().subscribe({
      next: res => {
        const pending = res?.data?.institutions ?? [];
        this.pendingInstitutions.set(pending.slice(0, 5));
        this.stats.update(s => ({ ...s, pendingInstitutions: pending.length }));
      },
      error: () => {}
    });

    if (this.isSuperadmin) {
      this.admin.getRecentActivity().subscribe({
        next: res => this.recentActivity.set(res?.data?.slice(0, 8) ?? []),
        error: () => {}
      });

      this.admin.getSystemSummary().subscribe({
        next: res => this.systemSummary.set(res?.data ?? null),
        error: () => {}
      });

      this.admin.getAlerts().subscribe({
        next: res => this.alerts.set(res?.data ?? []),
        error: () => {}
      });
    }
  }

  getAlertClass(level: string): string {
    if (level === 'critical') return 'alert-critical';
    if (level === 'warning')  return 'alert-warning';
    return 'alert-info';
  }

  formatGrowth(value: number): string {
    if (value > 0) return `+${value}%`;
    if (value < 0) return `${value}%`;
    return '0%';
  }

  getActivityIcon(type: string): string {
    const t = type?.toUpperCase();
    if (t?.includes('USER'))       return 'user';
    if (t?.includes('DONATION'))   return 'donation';
    if (t?.includes('INSTITUTION')) return 'institution';
    if (t?.includes('REQUEST'))    return 'request';
    return 'default';
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'available' || s === 'approved') return 'approved';
    if (s === 'pending' || s === 'admin_review') return 'pending';
    if (s === 'rejected' || s === 'expired') return 'rejected';
    if (s === 'delivered') return 'delivered';
    return 'default';
  }
}
