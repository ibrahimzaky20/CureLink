import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-user-management',
  imports: [NgClass, FormsModule, DatePipe, UpperCasePipe],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private readonly admin = inject(AdminService);

  users      = signal<any[]>([]);
  loading    = signal(true);
  page       = signal(1);
  totalPages = signal(1);
  total      = signal(0);

  roleFilter   = signal('');
  statusFilter = signal('');
  searchQuery  = signal('');

  // Detail modal
  showDetailModal  = signal(false);
  selectedUser     = signal<any>(null);
  userActivity     = signal<any[]>([]);
  detailLoading    = signal(false);

  // Role modal
  showRoleModal = signal(false);
  newRole       = signal('');
  actionLoading = signal(false);

  // Status toggle
  togglingId = signal<string | null>(null);

  // Delete modal
  showDeleteModal = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    const filters: any = {};
    if (this.roleFilter())   filters.role   = this.roleFilter();
    if (this.statusFilter()) filters.status = this.statusFilter();
    if (this.searchQuery())  filters.search = this.searchQuery();

    this.admin.getUsers(this.page(), 10, filters).subscribe({
      next: res => {
        this.users.set(res?.data?.users ?? []);
        this.total.set(res?.data?.pagination?.total ?? 0);
        this.totalPages.set(res?.data?.pagination?.pages ?? res?.data?.pagination?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onRoleFilter(role: string) {
    this.roleFilter.set(role);
    this.page.set(1);
    this.loadUsers();
  }

  onStatusFilter(status: string) {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadUsers();
  }

  onSearch() {
    this.page.set(1);
    this.loadUsers();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadUsers();
  }

  // ── Detail Modal ──
  openDetail(user: any) {
    this.selectedUser.set(user);
    this.userActivity.set([]);
    this.showDetailModal.set(true);
    this.detailLoading.set(true);

    this.admin.getUserActivity(user._id).subscribe({
      next: res => {
        this.userActivity.set(res?.data ?? []);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false)
    });
  }

  closeDetail() {
    this.showDetailModal.set(false);
    this.selectedUser.set(null);
  }

  // ── Role Modal ──
  openRoleModal(user: any) {
    this.selectedUser.set(user);
    this.newRole.set(user.role);
    this.showRoleModal.set(true);
  }

  closeRoleModal() {
    this.showRoleModal.set(false);
  }

  changeRole() {
    const u = this.selectedUser();
    if (!u) return;
    this.actionLoading.set(true);
    this.admin.changeUserRole(u._id, this.newRole()).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeRoleModal();
        this.loadUsers();
      },
      error: () => this.actionLoading.set(false)
    });
  }

  // ── Toggle Status ──
  toggleStatus(user: any) {
    this.togglingId.set(user._id);
    this.admin.toggleUserStatus(user._id, !user.isActive).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u)
        );
        this.togglingId.set(null);
      },
      error: () => this.togglingId.set(null)
    });
  }

  // ── Delete Modal ──
  openDeleteModal(user: any) {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
  }

  confirmDelete() {
    const u = this.selectedUser();
    if (!u) return;
    this.actionLoading.set(true);
    this.admin.deleteUser(u._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: () => this.actionLoading.set(false)
    });
  }

  // ── Export ──
  exportUsers() {
    this.admin.exportUsers().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }

  getRoleClass(role: string): string {
    if (role === 'admin' || role === 'superadmin') return 'role-admin';
    if (role === 'institution') return 'role-institution';
    return 'role-donor';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }
}
