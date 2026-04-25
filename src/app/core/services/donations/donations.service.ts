import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Medicine {
  _id: string;
  name: string;
  strength?: string;
  dosageForm?: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'other';
  category?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Donation {
  _id: string;
  donor: string | { firstName?: string; lastName?: string; email?: string };
  medicine: string | Medicine;
  quantity: { amount: number; unit: 'box' | 'bottle' | 'strip' | 'unit' };
  expiryDate: string;
  status: 'pending' | 'admin_review' | 'available' | 'matched' | 'approved_by_institution' | 'delivered' | 'rejected' | 'expired' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  batchNumber?: string;
  conditionNotes?: string;
  images?: string[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DonationsListResponse {
  status: string;
  message: string;
  data: { donations: Donation[]; pagination: Pagination };
}

export interface DonationResponse {
  status: string;
  message: string;
  data: Donation;
}

@Injectable({ providedIn: 'root' })
export class DonationsService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  getAll(page = 1, limit = 20): Observable<DonationsListResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<DonationsListResponse>(`${this.api}/api/v1/donations`, { ...this.opts, params });
  }

  getById(id: string): Observable<DonationResponse> {
    return this.http.get<DonationResponse>(`${this.api}/api/v1/donations/${id}`, this.opts);
  }
}
