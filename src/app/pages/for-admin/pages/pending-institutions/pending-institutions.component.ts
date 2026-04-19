import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-pending-institutions',
  imports: [FormsModule],
  templateUrl: './pending-institutions.component.html',
  styleUrl: './pending-institutions.component.scss'
})
export class PendingInstitutionsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  institutions = signal<any[]>([]);
  loading      = signal(true);

  // Detail + action modal
  showModal       = signal(false);
  selectedInst    = signal<any>(null);
  detailLoading   = signal(false);
  actionLoading   = signal(false);

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.loading.set(true);
    this.admin.getPendingInstitutions().subscribe({
      next: res => {
        this.institutions.set(res?.data?.institutions ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal(inst: any) {
    this.detailLoading.set(true);
    this.showModal.set(true);
    this.admin.getInstitution(inst._id).subscribe({
      next: res => {
        this.selectedInst.set(res?.data?.institution ?? inst);
        this.detailLoading.set(false);
      },
      error: () => {
        this.selectedInst.set(inst);
        this.detailLoading.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedInst.set(null);
  }

  verify() {
    const inst = this.selectedInst();
    if (!inst) return;
    this.actionLoading.set(true);
    this.admin.verifyInstitution(inst._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeModal();
        this.loadPending();
      },
      error: () => this.actionLoading.set(false)
    });
  }

  reject() {
    const inst = this.selectedInst();
    if (!inst) return;
    this.actionLoading.set(true);
    this.admin.rejectInstitution(inst._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeModal();
        this.loadPending();
      },
      error: () => this.actionLoading.set(false)
    });
  }
}
