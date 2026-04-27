import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type Tab = 'donations' | 'institutions' | 'requests' | 'matching' | 'users';

@Component({
  selector: 'app-analytics',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private readonly admin = inject(AdminService);
  private charts: Map<string, Chart> = new Map();

  activeTab = signal<Tab>('donations');
  loading   = signal(true);

  // Donations
  donationSummary    = signal<any>(null);
  donationByStatus   = signal<any[]>([]);
  donationTrends     = signal<any[]>([]);
  donationCategories = signal<any[]>([]);
  donationGeographic = signal<any[]>([]);
  trendPeriod        = signal('monthly');

  // Institutions
  institutionSummary     = signal<any>(null);
  institutionByActivity  = signal<any[]>([]);
  institutionTypes       = signal<any[]>([]);
  institutionPerformance = signal<any[]>([]);

  // Requests
  requestSummary     = signal<any>(null);
  requestByStatus    = signal<any[]>([]);
  requestByPriority  = signal<any[]>([]);
  requestTrends      = signal<any[]>([]);
  requestFulfillment = signal<any>(null);

  // Matching
  matchingSummary     = signal<any>(null);
  matchingSuccessRate = signal<any>(null);
  matchingEfficiency  = signal<any>(null);

  // Users
  userSummary = signal<any>(null);
  userByRole  = signal<any[]>([]);

  tabs: { key: Tab; label: string }[] = [
    { key: 'donations',    label: 'Donations' },
    { key: 'institutions', label: 'Institutions' },
    { key: 'requests',     label: 'Requests' },
    { key: 'matching',     label: 'Matching' },
    { key: 'users',        label: 'Users' },
  ];

  ngOnInit() {
    this.loadTab('donations');
  }

  ngOnDestroy() {
    this.destroyAllCharts();
  }

  switchTab(tab: Tab) {
    this.activeTab.set(tab);
    this.destroyAllCharts();
    this.loadTab(tab);
  }

  loadTab(tab: Tab) {
    this.loading.set(true);
    switch (tab) {
      case 'donations':    this.loadDonations(); break;
      case 'institutions': this.loadInstitutions(); break;
      case 'requests':     this.loadRequests(); break;
      case 'matching':     this.loadMatching(); break;
      case 'users':        this.loadUsers(); break;
    }
  }

  // ── Donations ──
  loadDonations() {
    let done = 0;
    const check = () => {
      if (++done >= 4) {
        this.loading.set(false);
        setTimeout(() => this.renderDonationCharts(), 50);
      }
    };

    this.admin.getDonationAnalytics().subscribe({
      next: res => {
        this.donationSummary.set(res?.data?.summary ?? null);
        this.donationByStatus.set(this.toArray(res?.data?.byStatus));
        check();
      },
      error: () => check()
    });
    this.admin.getDonationTrends(this.trendPeriod()).subscribe({
      next: res => { this.donationTrends.set(this.toArray(res?.data?.data)); check(); },
      error: () => check()
    });
    this.admin.getDonationCategories().subscribe({
      next: res => { this.donationCategories.set(this.toArray(res?.data?.data)); check(); },
      error: () => check()
    });
    this.admin.getDonationGeographic().subscribe({
      next: res => { this.donationGeographic.set(this.toArray(res?.data?.data)); check(); },
      error: () => check()
    });
  }

  onTrendPeriodChange(period: string) {
    this.trendPeriod.set(period);
    this.admin.getDonationTrends(period).subscribe({
      next: res => {
        this.donationTrends.set(this.toArray(res?.data?.data));
        this.destroyAllCharts();
        setTimeout(() => this.renderDonationCharts(), 50);
      },
      error: () => {}
    });
  }

  // ── Institutions ──
  loadInstitutions() {
    let done = 0;
    const check = () => {
      if (++done >= 3) {
        this.loading.set(false);
        setTimeout(() => this.renderInstitutionCharts(), 50);
      }
    };

    this.admin.getInstitutionAnalytics().subscribe({
      next: res => {
        this.institutionSummary.set(res?.data?.summary ?? null);
        this.institutionByActivity.set(this.toArray(res?.data?.byActivity));
        check();
      },
      error: () => check()
    });
    this.admin.getInstitutionTypes().subscribe({
      next: res => { this.institutionTypes.set(this.toArray(res?.data?.data)); check(); },
      error: () => check()
    });
    this.admin.getInstitutionPerformance().subscribe({
      next: res => { this.institutionPerformance.set(this.toArray(res?.data?.data)); check(); },
      error: () => check()
    });
  }

  // ── Requests ──
  loadRequests() {
    let done = 0;
    const check = () => {
      if (++done >= 3) {
        this.loading.set(false);
        setTimeout(() => this.renderRequestCharts(), 50);
      }
    };

    this.admin.getRequestAnalytics().subscribe({
      next: res => {
        this.requestSummary.set(res?.data?.summary ?? null);
        this.requestByStatus.set(this.toArray(res?.data?.byStatus));
        this.requestByPriority.set(this.toArray(res?.data?.byPriority));
        check();
      },
      error: () => check()
    });
    this.admin.getRequestTrends(this.trendPeriod()).subscribe({
      next: res => { this.requestTrends.set(this.toArray(res?.data?.data)); check(); },
      error: () => check()
    });
    this.admin.getRequestFulfillment().subscribe({
      next: res => { this.requestFulfillment.set(res?.data ?? null); check(); },
      error: () => check()
    });
  }

  // ── Matching ──
  loadMatching() {
    let done = 0;
    const check = () => {
      if (++done >= 3) {
        this.loading.set(false);
        setTimeout(() => this.renderMatchingCharts(), 50);
      }
    };

    this.admin.getMatchingAnalytics().subscribe({
      next: res => { this.matchingSummary.set(res?.data ?? null); check(); },
      error: () => check()
    });
    this.admin.getMatchingSuccessRate().subscribe({
      next: res => { this.matchingSuccessRate.set(res?.data ?? null); check(); },
      error: () => check()
    });
    this.admin.getMatchingEfficiency().subscribe({
      next: res => { this.matchingEfficiency.set(res?.data ?? null); check(); },
      error: () => check()
    });
  }

  // ── Users ──
  loadUsers() {
    this.admin.getUserAnalytics().subscribe({
      next: res => {
        this.userSummary.set(res?.data?.summary ?? null);
        this.userByRole.set(this.toArray(res?.data?.byRole));
        this.loading.set(false);
        setTimeout(() => this.renderUserCharts(), 50);
      },
      error: () => this.loading.set(false)
    });
  }

  // ── Chart Rendering ──
  private renderDonationCharts() {
    this.destroyAllCharts();
    const summary = this.donationSummary();
    const byStatus = this.donationByStatus();
    const trends = this.donationTrends();
    const categories = this.donationCategories();
    const geographic = this.donationGeographic();

    if (byStatus.length) {
      this.createDoughnut('donationStatusChart', {
        labels: byStatus.map(s => this.capitalize(s._id)),
        data: byStatus.map(s => s.count),
        colors: byStatus.map(s => this.statusColor(s._id)),
      });
    } else if (summary) {
      this.createDoughnut('donationStatusChart', {
        labels: ['Delivered', 'Pending', 'Matched', 'Expired'],
        data: [summary.delivered ?? 0, summary.pending ?? 0, summary.matched ?? 0, summary.expired ?? 0],
        colors: ['#16A34A', '#F59E0B', '#3B82F6', '#EF4444'],
      });
    }

    if (trends.length) {
      this.createLine('donationTrendsChart', {
        labels: trends.map(t => t.period ?? ''),
        data: trends.map(t => t.count ?? 0),
        label: 'Donations',
        color: '#2BCEB8',
      });
    }

    if (categories.length) {
      this.createBar('donationCategoriesChart', {
        labels: categories.map(c => c.category ?? 'Unknown'),
        data: categories.map(c => c.count ?? 0),
        colors: categories.map((_, i) => this.getCategoryColor(i)),
      });
    }

    if (geographic.length) {
      this.createHorizontalBar('donationGeoChart', {
        labels: geographic.map(g => g.carrier ?? g.phonePrefix ?? 'Unknown'),
        data: geographic.map(g => g.count ?? 0),
        color: '#39A0EA',
      });
    }
  }

  private renderInstitutionCharts() {
    this.destroyAllCharts();
    const summary = this.institutionSummary();
    const types = this.institutionTypes();
    const perf = this.institutionPerformance();

    if (summary) {
      this.createDoughnut('instStatusChart', {
        labels: ['Active', 'Inactive', 'Verified'],
        data: [summary.active ?? 0, summary.inactive ?? 0, summary.verified ?? 0],
        colors: ['#16A34A', '#EF4444', '#3B82F6'],
      });
    }

    if (types.length) {
      this.createDoughnut('instTypesChart', {
        labels: types.map(t => this.capitalize(t.type ?? t._id ?? 'Unknown')),
        data: types.map(t => t.count ?? 0),
        colors: types.map((_, i) => this.getCategoryColor(i)),
      });
    }

    if (perf.length) {
      this.createHorizontalBar('instPerfChart', {
        labels: perf.map(p => p.name ?? 'Institution'),
        data: perf.map(p => p.donationsReceived ?? 0),
        color: '#2BCEB8',
      });
    }
  }

  private renderRequestCharts() {
    this.destroyAllCharts();
    const summary = this.requestSummary();
    const byStatus = this.requestByStatus();
    const trends = this.requestTrends();
    const fulfillment = this.requestFulfillment();

    if (byStatus.length) {
      this.createDoughnut('reqStatusChart', {
        labels: byStatus.map(s => this.capitalize(s._id)),
        data: byStatus.map(s => s.count),
        colors: byStatus.map(s => this.statusColor(s._id)),
      });
    } else if (summary) {
      this.createDoughnut('reqStatusChart', {
        labels: ['Open', 'Fulfilled', 'Partial', 'Cancelled', 'Expired'],
        data: [summary.open ?? 0, summary.fulfilled ?? 0, summary.partial ?? 0, summary.cancelled ?? 0, summary.expired ?? 0],
        colors: ['#F59E0B', '#16A34A', '#3B82F6', '#EF4444', '#94A3B8'],
      });
    }

    if (trends.length) {
      this.createLine('reqTrendsChart', {
        labels: trends.map(t => t.period ?? ''),
        data: trends.map(t => t.count ?? 0),
        label: 'Requests',
        color: '#8B5CF6',
      });
    }

    if (fulfillment) {
      this.createDoughnut('reqFulfillChart', {
        labels: ['Fully Fulfilled', 'Partially', 'Unfulfilled'],
        data: [fulfillment.fullyFulfilled ?? 0, fulfillment.partiallyFulfilled ?? 0, fulfillment.unfulfilled ?? 0],
        colors: ['#2BCEB8', '#3B82F6', '#E2E8F0'],
      });
    }
  }

  private renderMatchingCharts() {
    this.destroyAllCharts();
    const summary = this.matchingSummary();
    const successRate = this.matchingSuccessRate();

    if (summary) {
      this.createDoughnut('matchStatusChart', {
        labels: ['Matched', 'Delivered', 'Unmatched'],
        data: [summary.matched ?? 0, summary.delivered ?? 0, summary.unmatched ?? 0],
        colors: ['#3B82F6', '#16A34A', '#E2E8F0'],
      });
    }

    if (successRate?.byStatus?.length) {
      this.createDoughnut('matchSuccessChart', {
        labels: successRate.byStatus.map((s: any) => this.capitalize(s._id)),
        data: successRate.byStatus.map((s: any) => s.count),
        colors: successRate.byStatus.map((s: any) => this.statusColor(s._id)),
      });
    } else if (successRate?.overall) {
      this.createDoughnut('matchSuccessChart', {
        labels: ['Delivered', 'Rejected'],
        data: [successRate.overall.successfullyDelivered ?? 0, successRate.overall.rejectedByInstitution ?? 0],
        colors: ['#2BCEB8', '#EF4444'],
      });
    }
  }

  private renderUserCharts() {
    this.destroyAllCharts();
    const summary = this.userSummary();
    const byRole = this.userByRole();

    if (byRole.length) {
      this.createDoughnut('userRoleChart', {
        labels: byRole.map(r => this.capitalize(r._id)),
        data: byRole.map(r => r.count),
        colors: byRole.map((_, i) => this.getCategoryColor(i)),
      });
    }

    if (summary) {
      this.createDoughnut('userStatusChart', {
        labels: ['Active', 'Inactive'],
        data: [summary.active ?? 0, summary.inactive ?? 0],
        colors: ['#16A34A', '#E2E8F0'],
      });
    }
  }

  // ── Chart Factories ──
  private createDoughnut(id: string, opts: { labels: string[]; data: number[]; colors: string[] }) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    this.charts.get(id)?.destroy();
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: opts.labels,
        datasets: [{ data: opts.data, backgroundColor: opts.colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } },
        }
      }
    });
    this.charts.set(id, chart);
  }

  private createLine(id: string, opts: { labels: string[]; data: number[]; label: string; color: string }) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    this.charts.get(id)?.destroy();
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: opts.labels,
        datasets: [{
          label: opts.label, data: opts.data, borderColor: opts.color, backgroundColor: opts.color + '20',
          fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4,
          pointBackgroundColor: '#fff', pointBorderColor: opts.color, pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
          y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
        }
      }
    });
    this.charts.set(id, chart);
  }

  private createBar(id: string, opts: { labels: string[]; data: number[]; colors: string[] }) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    this.charts.get(id)?.destroy();
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: opts.labels,
        datasets: [{ data: opts.data, backgroundColor: opts.colors, borderRadius: 6, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
          y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
        }
      }
    });
    this.charts.set(id, chart);
  }

  private createHorizontalBar(id: string, opts: { labels: string[]; data: number[]; color: string }) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    this.charts.get(id)?.destroy();
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: opts.labels,
        datasets: [{ data: opts.data, backgroundColor: opts.color + 'CC', borderRadius: 6, borderSkipped: false }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#0F172A' } },
        }
      }
    });
    this.charts.set(id, chart);
  }

  private destroyAllCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts.clear();
  }

  // ── Helpers ──
  formatGrowth(val: number): string {
    if (val == null) return '-';
    return (val >= 0 ? '+' : '') + val.toFixed(1) + '%';
  }

  getCategoryColor(index: number): string {
    const colors = ['#2BCEB8', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];
    return colors[index % colors.length];
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      delivered: '#16A34A', approved: '#16A34A', fulfilled: '#16A34A', active: '#16A34A', verified: '#3B82F6',
      pending: '#F59E0B', open: '#F59E0B', partial: '#3B82F6', matched: '#3B82F6',
      rejected: '#EF4444', cancelled: '#EF4444', expired: '#94A3B8', inactive: '#94A3B8',
    };
    return map[status?.toLowerCase()] ?? '#94A3B8';
  }

  capitalize(str: string): string {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }

  getStatusCount(arr: any[], id: string): number {
    return arr.find(s => s._id === id)?.count ?? 0;
  }

  private toArray(val: any): any[] {
    return Array.isArray(val) ? val : [];
  }
}
