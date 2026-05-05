import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthServiceService } from '../services/auth/auth-service.service';
import { Router } from '@angular/router';

const PUBLIC_PATHS = [
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/verify-email',
  '/api/v1/auth/resend-verification',
  '/api/v1/auth/refresh-token',
];

let isRefreshing = false;
const refreshToken$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const isPublic = PUBLIC_PATHS.some(p => req.url.includes(p));

  if (!isPublic) {
    const token = auth.getToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isPublic) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshToken$.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => {
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            return next(retryReq);
          })
        );
      }

      isRefreshing = true;
      refreshToken$.next(null);

      return auth.refreshToken().pipe(
        switchMap(() => {
          isRefreshing = false;
          const newToken = auth.getToken();
          refreshToken$.next(newToken);
          const retryReq = newToken
            ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
            : req;
          return next(retryReq);
        }),
        catchError(refreshErr => {
          isRefreshing = false;
          refreshToken$.next('');
          auth.clearUser();
          router.navigate(['/auth/login']);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
