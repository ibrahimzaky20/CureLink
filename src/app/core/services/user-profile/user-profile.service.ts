import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Session {
  _id: string;
  device?: string;
  ip?: string;
  lastActive?: string;
  createdAt: string;
  isCurrent?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/users/profile`, this.opts);
  }

  updateProfile(data: { email?: string; phone?: string }): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/v1/users/profile`, data, this.opts);
  }

  uploadAvatar(file: File): Observable<any> {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.post<any>(`${this.api}/api/v1/users/upload-avatar`, form, this.opts);
  }

  deleteAvatar(): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/users/avatar`, this.opts);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.patch<any>(
      `${this.api}/api/v1/users/change-password`,
      { oldPassword, newPassword },
      this.opts
    );
  }

  getSessions(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/users/sessions`, this.opts);
  }

  revokeAllSessions(): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/users/sessions`, this.opts);
  }

  revokeSession(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/api/v1/users/sessions/${id}`, this.opts);
  }
}
