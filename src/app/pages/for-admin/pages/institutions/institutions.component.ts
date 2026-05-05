import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { AdminService } from '../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-admin-institutions',
  imports: [NgClass],
  templateUrl: './institutions.component.html',
  styleUrl: './institutions.component.scss'
})
export class InstitutionsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  institutions = signal<any[]>([]);
  loading      = signal(true);
  activeTab    = signal<'all' | 'pending'>('all');

  showDetail      = signal(false);
  selectedInst    = signal<any>(null);
  instDocuments   = signal<any[]>([]);
  docsLoading     = signal(false);
  docsError       = signal('');
  detailLoading   = signal(false);
  actionLoading   = signal(false);
  actionError     = signal('');

  ngOnInit() {
    this.load();
  }

  switchTab(tab: 'all' | 'pending') {
    this.activeTab.set(tab);
    this.load();
  }

  load() {
    this.loading.set(true);
    const obs = this.activeTab() === 'pending'
      ? this.admin.getPendingInstitutions()
      : this.admin.getInstitutions();

    obs.subscribe({
      next: res => {
        this.institutions.set(res?.data?.institutions ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  viewDetails(inst: any) {
    this.detailLoading.set(true);
    this.actionError.set('');
    this.instDocuments.set([]);
    this.showDetail.set(true);

    this.admin.getInstitution(inst._id).subscribe({
      next: res => {
        const full = res?.data?.institution ?? inst;
        this.selectedInst.set(full);
        this.detailLoading.set(false);
        this.loadDocuments(full._id ?? inst._id);
      },
      error: () => {
        this.selectedInst.set(inst);
        this.detailLoading.set(false);
        this.loadDocuments(inst._id);
      }
    });
  }

  private loadDocuments(insId: string) {
    this.docsLoading.set(true);
    this.docsError.set('');
    this.admin.getInstitutionDocuments(insId).subscribe({
      next: res => {
        this.instDocuments.set(res?.data?.institutionDocs ?? []);
        this.docsLoading.set(false);
      },
      error: err => {
        this.docsLoading.set(false);
        this.docsError.set(err?.error?.message ?? 'Failed to load documents.');
      }
    });
  }

  closeDetail() {
    this.showDetail.set(false);
    this.selectedInst.set(null);
    this.instDocuments.set([]);
  }

  verify() {
    const inst = this.selectedInst();
    if (!inst) return;
    this.actionLoading.set(true);
    this.actionError.set('');
    this.admin.verifyInstitution(inst._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeDetail();
        this.load();
      },
      error: err => {
        this.actionLoading.set(false);
        this.actionError.set(err?.error?.message ?? 'Failed to verify institution.');
      }
    });
  }

  reject() {
    const inst = this.selectedInst();
    if (!inst) return;
    this.actionLoading.set(true);
    this.actionError.set('');
    this.admin.rejectInstitution(inst._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeDetail();
        this.load();
      },
      error: err => {
        this.actionLoading.set(false);
        this.actionError.set(err?.error?.message ?? 'Failed to reject institution.');
      }
    });
  }

  getStatusClass(inst: any): string {
    const s = inst.verificationStatus;
    if (s === 'verified') return 'verified';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  }

  getStatusLabel(inst: any): string {
    const s = inst.verificationStatus;
    if (s === 'verified') return 'Verified';
    if (s === 'rejected') return 'Rejected';
    return 'Pending';
  }
}
