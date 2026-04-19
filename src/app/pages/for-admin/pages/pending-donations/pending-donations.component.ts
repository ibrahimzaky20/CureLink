import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-pending-donations',
  imports: [FormsModule],
  templateUrl: './pending-donations.component.html',
  styleUrl: './pending-donations.component.scss'
})
export class PendingDonationsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  donations    = signal<any[]>([]);
  loading      = signal(true);
  page         = signal(1);
  totalPages   = signal(1);

  // Action modal
  showModal        = signal(false);
  modalAction      = signal<'approve' | 'reject'>('approve');
  selectedDonation = signal<any>(null);
  actionNotes      = signal('');
  actionLoading    = signal(false);

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.loading.set(true);
    this.admin.getPendingDonations(this.page(), 10).subscribe({
      next: res => {
        this.donations.set(res?.data?.donations ?? []);
        this.totalPages.set(res?.data?.pagination?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadPending();
  }

  openModal(donation: any, action: 'approve' | 'reject') {
    this.selectedDonation.set(donation);
    this.modalAction.set(action);
    this.actionNotes.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedDonation.set(null);
  }

  confirmAction() {
    const d = this.selectedDonation();
    if (!d) return;
    this.actionLoading.set(true);

    const obs = this.modalAction() === 'approve'
      ? this.admin.approveDonation(d._id, this.actionNotes() || undefined)
      : this.admin.rejectDonation(d._id, this.actionNotes());

    obs.subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeModal();
        this.loadPending();
      },
      error: () => this.actionLoading.set(false)
    });
  }
}
