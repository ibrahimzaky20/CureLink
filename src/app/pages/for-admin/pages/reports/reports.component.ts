import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-reports',
  imports: [NgClass, FormsModule, DatePipe, UpperCasePipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  reports    = signal<any[]>([]);
  loading    = signal(true);
  page       = signal(1);
  totalPages = signal(1);
  total      = signal(0);

  typeFilter   = signal('');
  statusFilter = signal('');

  // Generate modal
  showGenerateModal = signal(false);
  genType           = signal<string>('donations');
  genFormat         = signal<string>('pdf');
  genStartDate      = signal('');
  genEndDate        = signal('');
  genStatus         = signal('');
  genPriority       = signal('');
  genYear           = signal(new Date().getFullYear());
  genMonth          = signal(new Date().getMonth() + 1);
  generating        = signal(false);
  genError          = signal('');

  // Detail modal
  showDetailModal = signal(false);
  selectedReport  = signal<any>(null);

  // Delete modal
  showDeleteModal = signal(false);
  actionLoading   = signal(false);

  reportTypes = ['donations', 'institutions', 'requests', 'matching', 'monthly_summary'];

  objectKeys = Object.keys;

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading.set(true);
    const filters: any = {};
    if (this.typeFilter())   filters.type   = this.typeFilter();
    if (this.statusFilter()) filters.status = this.statusFilter();

    this.admin.getReports(this.page(), 10, filters).subscribe({
      next: res => {
        this.reports.set(res?.data?.reports ?? []);
        this.total.set(res?.data?.pagination?.total ?? 0);
        this.totalPages.set(res?.data?.pagination?.pages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onTypeFilter(type: string) {
    this.typeFilter.set(type);
    this.page.set(1);
    this.loadReports();
  }

  onStatusFilter(status: string) {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadReports();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadReports();
  }

  // ── Generate Modal ──
  openGenerateModal() {
    this.showGenerateModal.set(true);
    this.genType.set('donations');
    this.genFormat.set('pdf');
    this.genStartDate.set('');
    this.genEndDate.set('');
    this.genStatus.set('');
    this.genPriority.set('');
    this.genYear.set(new Date().getFullYear());
    this.genMonth.set(new Date().getMonth() + 1);
    this.genError.set('');
  }

  closeGenerateModal() {
    this.showGenerateModal.set(false);
  }

  generateReport() {
    this.generating.set(true);
    this.genError.set('');

    let body: any = { format: this.genFormat() };

    if (this.genType() === 'monthly_summary') {
      body.year = this.genYear();
      body.month = this.genMonth();
    } else {
      if (this.genStartDate()) body.startDate = this.genStartDate();
      if (this.genEndDate())   body.endDate   = this.genEndDate();
      if (this.genStatus())    body.status    = this.genStatus();
      if (this.genPriority())  body.priority  = this.genPriority();
    }

    this.admin.generateReport(this.genType(), body).subscribe({
      next: () => {
        this.generating.set(false);
        this.closeGenerateModal();
        this.loadReports();
      },
      error: err => {
        this.generating.set(false);
        this.genError.set(err?.error?.message ?? 'Failed to generate report.');
      }
    });
  }

  // ── Detail Modal ──
  openDetail(report: any) {
    this.selectedReport.set(report);
    this.showDetailModal.set(true);
  }

  closeDetail() {
    this.showDetailModal.set(false);
    this.selectedReport.set(null);
  }

  // ── Download ──
  download(report: any) {
    this.admin.downloadReport(report._id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = report.fileName ?? `report.${report.format === 'excel' ? 'xlsx' : 'pdf'}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }

  // ── Delete Modal ──
  openDeleteModal(report: any) {
    this.selectedReport.set(report);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
  }

  confirmDelete() {
    const r = this.selectedReport();
    if (!r) return;
    this.actionLoading.set(true);
    this.admin.deleteReport(r._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeDeleteModal();
        this.loadReports();
      },
      error: () => this.actionLoading.set(false)
    });
  }

  getStatusClass(status: string): string {
    if (status === 'ready') return 'status-ready';
    if (status === 'processing') return 'status-processing';
    return 'status-failed';
  }

  getTypeLabel(type: string): string {
    return type?.replace(/_/g, ' ') ?? '';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
