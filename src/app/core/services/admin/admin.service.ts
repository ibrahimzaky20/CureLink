import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

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

  rejectInstitution(id: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/admin/institutions/${id}/reject`, {}, this.opts);
  }
}
