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

  // Detail modal
  showDetail      = signal(false);
  selectedInst    = signal<any>(null);
  detailLoading   = signal(false);

  ngOnInit() {
    this.loadInstitutions();
  }

  loadInstitutions() {
    this.loading.set(true);
    this.admin.getInstitutions().subscribe({
      next: res => {
        this.institutions.set(res?.data?.institutions ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  viewDetails(inst: any) {
    this.detailLoading.set(true);
    this.showDetail.set(true);
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

  closeDetail() {
    this.showDetail.set(false);
    this.selectedInst.set(null);
  }

  getVerifiedClass(inst: any): string {
    if (inst.isVerified) return 'verified';
    return 'unverified';
  }
}
