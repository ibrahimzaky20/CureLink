import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { DonationsService, Donation } from '../../../../core/services/donations/donations.service';

type Filter = 'all' | 'pending' | 'approved' | 'rejected' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-my-donations',
  imports: [RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './my-donations.component.html',
  styleUrl: './my-donations.component.scss'
})
export class MyDonationsComponent implements OnInit {
  private readonly api = inject(DonationsService);

  activeFilter = signal<Filter>('all');
  filters: Filter[] = ['all', 'pending', 'approved', 'rejected', 'delivered', 'cancelled'];

  donations  = signal<Donation[]>([]);
  loading    = signal(true);
  deleting   = signal<string | null>(null);

  page       = signal(1);
  totalPages = signal(1);

  ngOnInit() {
    this.loadDonations();
  }

  loadDonations() {
    this.loading.set(true);
    const filter = this.activeFilter();
    const status = filter !== 'all' ? filter : undefined;

    this.api.getMyDonations(this.page(), 10, status).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        const donations = data?.donations ?? data?.data?.donations ?? (Array.isArray(data) ? data : []);
        this.donations.set(donations);
        const pagination = data?.pagination ?? data?.data?.pagination;
        this.totalPages.set(pagination?.pages ?? 1);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load donations — status:', err.status, 'message:', err.message);
        this.loading.set(false);
      }
    });
  }

  setFilter(f: Filter) {
    this.activeFilter.set(f);
    this.page.set(1);
    this.loadDonations();
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadDonations();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.loadDonations();
    }
  }

  deleteDonation(id: string) {
    this.deleting.set(id);
    this.api.delete(id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.donations.update(list => list.filter(d => d._id !== id));
      },
      error: () => {
        this.deleting.set(null);
      }
    });
  }

  statusLabel(status: string): string {
    if (status === 'admin_review') return 'In Review';
    if (status === 'approved_by_institution') return 'Approved';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  medicineName(d: Donation): string {
    if (typeof d.medicine === 'string') return d.medicine;
    return d.medicine?.name ?? '';
  }
}
