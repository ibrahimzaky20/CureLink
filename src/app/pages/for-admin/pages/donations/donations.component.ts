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

  donations    = signal<any[]>([]);
  loading      = signal(true);
  page         = signal(1);
  totalPages   = signal(1);
  total        = signal(0);
  activeTab    = signal<'all' | 'pending'>('all');
  statusFilter = signal('');

  showStatusModal  = signal(false);
  showDeleteModal  = signal(false);
  showReviewModal  = signal(false);
  showDetailModal  = signal(false);
  selectedDonation = signal<any>(null);
  detailDonation   = signal<any>(null);
  activeImgIndex   = signal(0);
  newStatus        = signal('');
  statusNotes      = signal('');
  reviewAction     = signal<'approve' | 'reject'>('approve');
  reviewNotes      = signal('');
  actionLoading    = signal(false);
  actionError      = signal('');

  ngOnInit() {
    this.load();
  }

  switchTab(tab: 'all' | 'pending') {
    this.activeTab.set(tab);
    this.statusFilter.set('');
    this.page.set(1);
    this.load();
  }

  onFilterChange(status: string) {
    this.statusFilter.set(status);
    this.page.set(1);
    this.load();
  }

  load() {
    this.loading.set(true);
    if (this.activeTab() === 'pending') {
      this.admin.getPendingDonations(this.page(), 10).subscribe({
        next: res => {
          this.donations.set(res?.data?.donations ?? []);
          this.total.set(res?.data?.pagination?.total ?? 0);
          this.totalPages.set(res?.data?.pagination?.totalPages ?? 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
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
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  // ── Detail view ──

  viewDetails(donation: any) {
    this.detailDonation.set(donation);
    this.activeImgIndex.set(0);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailDonation.set(null);
  }

  // ── Review (approve / reject) ──

  openReviewModal(donation: any, action: 'approve' | 'reject') {
    this.selectedDonation.set(donation);
    this.reviewAction.set(action);
    this.reviewNotes.set('');
    this.actionError.set('');
    this.showReviewModal.set(true);
  }

  closeReviewModal() {
    this.showReviewModal.set(false);
    this.selectedDonation.set(null);
  }

  confirmReview() {
    const d = this.selectedDonation();
    if (!d) return;
    this.actionLoading.set(true);

    const obs = this.reviewAction() === 'approve'
      ? this.admin.approveDonation(d._id, this.reviewNotes() || undefined)
      : this.admin.rejectDonation(d._id, this.reviewNotes());

    obs.subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeReviewModal();
        this.load();
      },
      error: err => {
        this.actionLoading.set(false);
        this.actionError.set(err?.error?.message ?? 'Action failed. Please try again.');
      }
    });
  }

  // ── Change status ──

  openStatusModal(donation: any) {
    this.selectedDonation.set(donation);
    this.newStatus.set(donation.status);
    this.statusNotes.set('');
    this.actionError.set('');
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
    this.actionError.set('');
    this.admin.changeDonationStatus(d._id, this.newStatus(), this.statusNotes() || undefined).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeStatusModal();
        this.load();
      },
      error: err => {
        this.actionLoading.set(false);
        this.actionError.set(err?.error?.message ?? 'Failed to update status.');
      }
    });
  }

  // ── Delete ──

  openDeleteModal(donation: any) {
    this.selectedDonation.set(donation);
    this.actionError.set('');
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
        this.load();
      },
      error: err => {
        this.actionLoading.set(false);
        this.actionError.set(err?.error?.message ?? 'Failed to delete donation.');
      }
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
