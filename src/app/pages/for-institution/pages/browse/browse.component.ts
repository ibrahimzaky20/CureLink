import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DonationsService, Donation, Medicine } from '../../../../core/services/donations/donations.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-browse',
  imports: [FormsModule, DatePipe],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent implements OnInit {
  private readonly donationsApi = inject(DonationsService);

  readonly searchQuery = signal('');
  readonly donations   = signal<Donation[]>([]);
  readonly errorMsg    = signal('');

  readonly selected   = signal<Donation | null>(null);
  readonly detailError   = signal('');

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.donations();
    if (!q) return list;
    return list.filter(d => {
      const med = this.medicineOf(d);
      return med.name?.toLowerCase().includes(q) || med.category?.toLowerCase().includes(q);
    });
  });

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll(): void {
    this.errorMsg.set('');
    this.donationsApi.getAll(1, 50).subscribe({
      next: (res) => {
        this.donations.set(res?.data?.donations ?? []);
      },
      error: (err) => {
        this.errorMsg.set(err?.message ?? 'Failed to load donations.');
      }
    });
  }

  openDetails(d: Donation): void {
    this.selected.set(d);
    this.detailError.set('');
    this.donationsApi.getById(d._id).subscribe({
      next: (res) => {
        this.selected.set(res?.data ?? d);
      },
      error: (err) => {
        this.detailError.set(err?.message ?? 'Failed to load donation details.');
      }
    });
  }

  closeDetails(): void {
    this.selected.set(null);
    this.detailError.set('');
  }

  medicineOf(d: Donation): Partial<Medicine> {
    return typeof d.medicine === 'object' && d.medicine ? d.medicine : {};
  }

  donorLabel(d: Donation): string {
    const donor = d.donor;
    if (donor && typeof donor === 'object') {
      return `${donor.firstName ?? ''} ${donor.lastName ?? ''}`.trim() || 'Anonymous';
    }
    return 'Anonymous';
  }

  imageUrl(path: string | undefined): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = environment.apiUrl.replace(/\/$/, '');
    const rel  = path.replace(/^\//, '');
    return `${base}/${rel}`;
  }

  requestItem(d: Donation): void {
    alert(`Request sent for donation: ${this.medicineOf(d).name ?? d._id}`);
  }
}
