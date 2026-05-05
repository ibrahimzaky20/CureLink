import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  // ── Dashboard ─────────────────────────────────────────────────────────

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/dashboard/stats`, this.opts);
  }

  getRecentActivity(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/dashboard/recent-activity`, this.opts);
  }

  getSystemSummary(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/dashboard/summary`, this.opts);
  }

  getAlerts(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/dashboard/alerts`, this.opts);
  }

  // ── Donations ─────────────────────────────────────────────────────────

  getDonations(page = 1, limit = 10, filters?: { status?: string; medicineId?: string; donorId?: string }): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.status)     params = params.set('status', filters.status);
    if (filters?.medicineId) params = params.set('medicineId', filters.medicineId);
    if (filters?.donorId)    params = params.set('donorId', filters.donorId);
    return this.http.get<any>(`${this.api}/api/v1/admin/donations`, { ...this.opts, params });
  }

  getPendingDonations(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(`${this.api}/api/v1/admin/donations/pending`, { ...this.opts, params });
  }

  approveDonation(id: string, notes?: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/donations/${id}/approve`, { notes }, this.opts);
  }

  rejectDonation(id: string, notes: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/donations/${id}/reject`, { notes }, this.opts);
  }

  changeDonationStatus(id: string, status: string, notes?: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/donations/${id}/status`, { status, notes }, this.opts);
  }

  deleteDonation(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/admin/donations/${id}`, this.opts);
  }

  getExpiringDonations(days = 30): Observable<any> {
    const params = new HttpParams().set('days', days);
    return this.http.get<any>(`${this.api}/api/v1/admin/donations/expiring`, { ...this.opts, params });
  }

  exportDonations(filters?: { status?: string; startDate?: string; endDate?: string }): Observable<Blob> {
    return this.http.post(`${this.api}/api/v1/admin/donations/export`, filters ?? {}, {
      ...this.opts,
      responseType: 'blob'
    });
  }

  // ── Users ─────────────────────────────────────────────────────────────

  getUsers(page = 1, limit = 10, filters?: { role?: string; status?: string; search?: string }): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.role)   params = params.set('role', filters.role);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<any>(`${this.api}/api/v1/admin/users`, { ...this.opts, params });
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/users/${id}`, this.opts);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/admin/users/${id}`, this.opts);
  }

  changeUserRole(id: string, role: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/users/${id}/role`, { role }, this.opts);
  }

  toggleUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/users/${id}/status`, { isActive }, this.opts);
  }

  getUserActivity(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/users/${id}/activity`, this.opts);
  }

  exportUsers(): Observable<Blob> {
    return this.http.post(`${this.api}/api/v1/admin/users/export`, {}, {
      ...this.opts,
      responseType: 'blob'
    });
  }

  // ── Analytics ─────────────────────────────────────────────────────────

  getDonationAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/donations`, this.opts);
  }

  getDonationTrends(period = 'monthly', from?: string, to?: string, limit = 12): Observable<any> {
    let params = new HttpParams().set('period', period).set('limit', limit);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<any>(`${this.api}/api/v1/analytics/donations/trends`, { ...this.opts, params });
  }

  getDonationCategories(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/donations/categories`, this.opts);
  }

  getDonationGeographic(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/donations/geographic`, this.opts);
  }

  getInstitutionAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/institutions`, this.opts);
  }

  getInstitutionTypes(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/institutions/types`, this.opts);
  }

  getInstitutionPerformance(limit = 12): Observable<any> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<any>(`${this.api}/api/v1/analytics/institutions/performance`, { ...this.opts, params });
  }

  getRequestAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/requests`, this.opts);
  }

  getRequestTrends(period = 'monthly', from?: string, to?: string, limit = 12): Observable<any> {
    let params = new HttpParams().set('period', period).set('limit', limit);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<any>(`${this.api}/api/v1/analytics/requests/trends`, { ...this.opts, params });
  }

  getRequestFulfillment(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/requests/fulfillment`, this.opts);
  }

  getMatchingAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/matching`, this.opts);
  }

  getMatchingSuccessRate(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/matching/success-rate`, this.opts);
  }

  getMatchingEfficiency(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/matching/efficiency`, this.opts);
  }

  getUserAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/analytics/users`, this.opts);
  }

  // ── Reports ───────────────────────────────────────────────────────────

  generateReport(type: string, body: any): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/reports/${type}`, body, this.opts);
  }

  getReports(page = 1, limit = 10, filters?: { type?: string; format?: string }): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.type)   params = params.set('type', filters.type);
    if (filters?.format) params = params.set('format', filters.format);
    return this.http.get<any>(`${this.api}/api/v1/reports`, { ...this.opts, params });
  }

  downloadReport(id: string): Observable<Blob> {
    return this.http.get(`${this.api}/api/v1/reports/${id}`, {
      withCredentials: true,
      responseType: 'blob'
    });
  }

  deleteReport(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/reports/${id}`, this.opts);
  }

  // ── Institutions ──────────────────────────────────────────────────────

  getInstitutions(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/institutions`, this.opts);
  }

  getPendingInstitutions(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/institutions/pending`, this.opts);
  }

  getInstitution(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/institutions/${id}`, this.opts);
  }

  verifyInstitution(id: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/institutions/${id}/verify`, {}, this.opts);
  }

  rejectInstitution(id: string, reason: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/institutions/${id}/reject`, { reason }, this.opts);
  }

  getInstitutionDocuments(insId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/admin/institutions/documents/${insId}`, this.opts);
  }
}
