import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface InstitutionAddress {
  type?: string;
  governorate?: string;
  city?: string;
  street?: string;
}

export interface InstitutionProfile {
  _id?: string;
  name?: string;
  institutionName?: string;
  type?: string;
  licenseNumber?: string;
  description?: string;
  contactNumber?: string;
  logo?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  addresses?: InstitutionAddress[];
  address?: string;
  documents?: Array<{ name?: string; url?: string; type?: string; verified?: boolean }>;
  createdAt?: string;
}

export interface InstitutionProfileResponse {
  status: string;
  message: string;
  data: InstitutionProfile;
}

@Injectable({ providedIn: 'root' })
export class InstitutionService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  getProfile(): Observable<InstitutionProfileResponse> {
    return this.http.get<InstitutionProfileResponse>(
      `${this.api}/api/v1/institutions/profile`,
      this.opts
    );
  }

  updateProfile(payload: {
    institutionName?: string;
    address?: string;
    contactNumber?: string;
    logo?: File | null;
  }): Observable<InstitutionProfileResponse> {
    const form = new FormData();
    if (payload.institutionName) form.append('institutionName', payload.institutionName);
    if (payload.address)         form.append('address', payload.address);
    if (payload.contactNumber)   form.append('contactNumber', payload.contactNumber);
    if (payload.logo)            form.append('logo', payload.logo);

    return this.http.put<InstitutionProfileResponse>(
      `${this.api}/api/v1/institutions/profile`,
      form,
      this.opts
    );
  }
}
