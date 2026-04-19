import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-admin-donations',
  imports: [NgClass, FormsModule],
  templateUrl: './donations.component.html',
  styleUrl: './donations.component.scss'
})
export class DonationsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  donations = signal<any[]>([]);
  loading   = signal(true);
  page      = signal(1);
  totalPages = signal(1);
  total      = signal(0);
  statusFilter = signal('');

  // Modal state
  showStatusModal  = signal(false);
  showDeleteModal  = signal(false);
  selectedDonation = signal<any>(null);
  newStatus        = signal('');
  statusNotes      = signal('');
  actionLoading    = signal(false);

  ngOnInit() {
    this.loadDonations();
  }

  loadDonations() {
    this.loading.set(true);
    const filters = this.statusFilter() ? { status: this.statusFilter() } : undefined;
    this.admin.getDonations(this.page(), 10, filters).subscribe({
      next: res => {
        this.donations.set(res?.data?.donations ?? []);
        this.total.set(res?.data?.pagination?.total ?? 0);
        this.totalPages.set(res?.data?.pagination?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(status: string) {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadDonations();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadDonations();
  }

  openStatusModal(donation: any) {
    this.selectedDonation.set(donation);
    this.newStatus.set(donation.status);
    this.statusNotes.set('');
    this.showStatusModal.set(true);
  }

  closeStatusModal() {
    this.showStatusModal.set(false);
    this.selectedDonation.set(null);
  }

  changeStatus() {
    const d = this.selectedDonation();
    if (!d) return;
    this.actionLoading.set(true);
    this.admin.changeDonationStatus(d._id, this.newStatus(), this.statusNotes() || undefined).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeStatusModal();
        this.loadDonations();
      },
      error: () => this.actionLoading.set(false)
    });
  }

  openDeleteModal(donation: any) {
    this.selectedDonation.set(donation);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedDonation.set(null);
  }

  confirmDelete() {
    const d = this.selectedDonation();
    if (!d) return;
    this.actionLoading.set(true);
    this.admin.deleteDonation(d._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeDeleteModal();
        this.loadDonations();
      },
      error: () => this.actionLoading.set(false)
    });
  }

  exportCSV() {
    const filters = this.statusFilter() ? { status: this.statusFilter() } : undefined;
    this.admin.exportDonations(filters).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'donations-export.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
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
