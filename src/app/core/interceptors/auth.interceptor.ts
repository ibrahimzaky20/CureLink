import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
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

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const isPublic = PUBLIC_PATHS.some(p => req.url.includes(p));

  const token = auth.getToken();
  if (token && !isPublic) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing && !isPublic) {
        isRefreshing = true;
        return auth.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            const newToken = auth.getToken();
            const retryReq = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;
            return next(retryReq);
          }),
          catchError(refreshErr => {
            isRefreshing = false;
            auth.clearUser();
            router.navigate(['/auth/login']);
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
