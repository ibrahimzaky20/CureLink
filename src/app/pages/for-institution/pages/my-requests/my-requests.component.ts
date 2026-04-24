import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MedicationRequestService } from '../../../../core/services/medication-request/medication-request.service';

type Filter = 'all' | 'open' | 'partially_fulfilled' | 'fulfilled' | 'cancelled' | 'expired';

interface MedRequest {
  _id: string;
  medicineName: string;
  strength?: string;
  dosageForm?: string;
  requiredQuantity: { amount: number; unit: string };
  priority: string;
  status: string;
  expiresAt: string;
  notes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-my-requests',
  imports: [RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss'
})
export class MyRequestsComponent implements OnInit {
  private readonly api = inject(MedicationRequestService);

  activeFilter = signal<Filter>('all');
  filters: Filter[] = ['all', 'open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'];

  requests  = signal<MedRequest[]>([]);
  loading   = signal(true);
  deleting  = signal<string | null>(null);

  stats = signal({ total: 0, open: 0, fulfilled: 0, cancelled: 0 });

  page       = signal(1);
  totalPages = signal(1);

  ngOnInit() {
    this.loadStats();
    this.loadRequests();
  }

  loadStats() {
    this.api.getStatistics().subscribe({
      next: (res) => {
        const s = res?.data?.summary ?? res?.data ?? {};
        this.stats.set({
          total:     s.total ?? 0,
          open:      s.open ?? 0,
          fulfilled: s.fulfilled ?? 0,
          cancelled: s.cancelled ?? 0,
        });
      },
      error: () => {}
    });
  }

  loadRequests() {
    this.loading.set(true);
    const filter = this.activeFilter();
    const params: any = { page: this.page(), limit: 10 };
    if (filter !== 'all') params.status = filter;

    this.api.getRequests(params).subscribe({
      next: (res) => {
        this.requests.set(res?.data?.requests ?? res?.data ?? []);
        const pagination = res?.data?.pagination;
        if (pagination) {
          this.totalPages.set(pagination.pages ?? 1);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setFilter(f: Filter) {
    this.activeFilter.set(f);
    this.page.set(1);
    this.loadRequests();
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadRequests();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.loadRequests();
    }
  }

  deleteRequest(id: string) {
    this.deleting.set(id);
    this.api.deleteRequest(id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.requests.update(list => list.filter(r => r._id !== id));
        this.loadStats();
      },
      error: () => {
        this.deleting.set(null);
      }
    });
  }

  filterLabel(f: Filter): string {
    if (f === 'all') return 'All';
    if (f === 'partially_fulfilled') return 'Partial';
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
}
