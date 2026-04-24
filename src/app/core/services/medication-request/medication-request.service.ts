import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreateRequestPayload {
  medicineName: string;
  strength?: string;
  dosageForm?: string;
  requiredQuantity: { amount: number; unit: string };
  priority?: string;
  expiresAt: string;
  notes?: string;
}

export interface UpdateRequestPayload {
  medicineName?: string;
  strength?: string;
  dosageForm?: string;
  requiredQuantity?: { amount: number; unit: string };
  priority?: string;
  expiresAt?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicationRequestService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  createRequest(data: CreateRequestPayload): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/requests`, data, this.opts);
  }

  getRequests(params?: { page?: number; limit?: number; status?: string; priority?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.priority) httpParams = httpParams.set('priority', params.priority);
    return this.http.get<any>(`${this.api}/api/v1/requests`, { ...this.opts, params: httpParams });
  }

  getRequest(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/requests/${id}`, this.opts);
  }

  updateRequest(id: string, data: UpdateRequestPayload): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/requests/${id}`, data, this.opts);
  }

  deleteRequest(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/requests/${id}`, this.opts);
  }

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/requests/statistics`, this.opts);
  }

  getMatches(id: string, params?: { page?: number; limit?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    return this.http.get<any>(`${this.api}/api/v1/requests/${id}/matches`, { ...this.opts, params: httpParams });
  }
}
