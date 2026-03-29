import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader/loader.service';

const SILENT_PATHS = [
  '/api/v1/auth/refresh-token',
];

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const isSilent = SILENT_PATHS.some(p => req.url.includes(p));
  if (isSilent) return next(req);

  const loader = inject(LoaderService);
  loader.show();
  return next(req).pipe(finalize(() => loader.hide()));
};
