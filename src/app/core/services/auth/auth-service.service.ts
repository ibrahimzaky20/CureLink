import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AuthUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'donor' | 'institution' | 'admin' | 'superadmin';
  isVerified: boolean;
  institution?: {
    _id: string;
    name: string;
    isVerified: boolean;
  };
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'donor' | 'institution' | 'admin' | 'superadmin';
}

@Injectable({ providedIn: 'root' })
export class AuthServiceService {
  private readonly http       = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api        = environment.apiUrl;

  readonly currentUser = signal<AuthUser | null>(this.loadUser());

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ── User persistence (localStorage) ──────────────────────────────────
  private loadUser(): AuthUser | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  saveToken(token: string): void {
    if (!this.isBrowser()) return;
    sessionStorage.setItem('access_token', token);
  }

  getToken(): string {
    if (!this.isBrowser()) return '';
    return sessionStorage.getItem('access_token') ?? '';
  }

  saveUser(user: AuthUser): void {
    if (!this.isBrowser()) return;
    if ((user as any).accessToken) {
      this.saveToken((user as any).accessToken);
    }
    const stored = { ...user } as any;
    delete stored.accessToken;
    localStorage.setItem('auth_user', JSON.stringify(stored));
    this.currentUser.set(stored);
  }

  clearUser(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  // ── Pending registration data ─────────────────────────────────────────
  savePendingReg(email: string, role: 'donor' | 'institution'): void {
    if (!this.isBrowser()) return;
    sessionStorage.setItem('pending_reg', JSON.stringify({ email, role }));
  }

  getPendingReg(): { email: string; role: 'donor' | 'institution' } | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = sessionStorage.getItem('pending_reg');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  clearPendingReg(): void {
    if (!this.isBrowser()) return;
    sessionStorage.removeItem('pending_reg');
  }

  // ── HTTP options (always send cookies) ───────────────────────────────
  private opts = { withCredentials: true };

  // ── API calls ─────────────────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/register`, payload, this.opts).pipe(
      tap(res => {
        const user = res?.data?.user;
        if (user) this.saveUser(user);
      })
    );
  }

  verifyEmail(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/verify-email`, { email, otp }, this.opts);
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/resend-verification`, { email }, this.opts);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/login`, { email, password }, this.opts).pipe(
      tap(res => {
        // Tokens are set as HttpOnly cookies by the server.
        // We save only the user object for local state.
        const user = res?.data?.user;
        if (user) this.saveUser(user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/logout`, {}, this.opts).pipe(
      tap(() => this.clearUser())
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/refresh-token`, {}, this.opts);
  }

  me(): Observable<any> {
    return this.http.get<any>(`${this.api}/api/v1/auth/me`, this.opts).pipe(
      tap(res => {
        const user = res?.data?.user;
        if (user) this.saveUser(user);
      })
    );
  }

  registerInstitution(
    name: string,
    type: string,
    licenseNumber: string,
    description: string,
    governorate: string,
    city: string,
    street: string,
    logo: File | null
  ): Observable<any> {
    const form = new FormData();
    form.append('name', name);
    form.append('type', type);
    form.append('licenseNumber', licenseNumber);
    form.append('description', description);
    form.append('addresses', JSON.stringify([{ type: 'main', governorate, city, street }]));
    if (logo) form.append('logo', logo);
    const token = this.getToken();
    const opts = token
      ? { ...this.opts, headers: { Authorization: `Bearer ${token}` } }
      : this.opts;
    return this.http.post<any>(`${this.api}/api/v1/institutions/register`, form, opts);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/forgot-password`, { email }, this.opts);
  }

  verifyResetOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/verify-reset-otp`, { email, otp }, this.opts);
  }

  resetPassword(email: string, otp: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/api/v1/auth/reset-password`, { email, otp, password }, this.opts);
  }

  addDocuments(document: File): Observable<any> {
    const form = new FormData();
    form.append('tax_card', document);
    const token = this.getToken();
    const opts = token
      ? { ...this.opts, headers: { Authorization: `Bearer ${token}` } }
      : this.opts;
    return this.http.post<any>(`${this.api}/api/v1/institutions/documents`, form, opts);
  }
}
