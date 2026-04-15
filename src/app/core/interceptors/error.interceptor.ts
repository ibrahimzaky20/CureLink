import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = extractMessage(error);
      return throwError(() => ({ status: error.status, message }));
    })
  );
};

function extractMessage(error: HttpErrorResponse): string {
  if (error.error instanceof ProgressEvent || error.status === 0) {
    return 'Network error. Please check your connection.';
  }

  const body: any = error.error;

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string') return body.message;
    if (typeof body.error === 'string')   return body.error;
    if (Array.isArray(body.errors) && body.errors.length) {
      const first = body.errors[0];
      if (typeof first === 'string') return first;
      if (first?.message) return first.message;
    }
  }

  if (typeof body === 'string' && !body.trim().startsWith('<')) {
    return body;
  }

  switch (error.status) {
    case 400: return 'Invalid request.';
    case 401: return 'Unauthorized.';
    case 403: return 'Access denied.';
    case 404: return 'Resource not found.';
    case 409: return 'Conflict with existing data.';
    case 422: return 'Validation failed.';
    case 429: return 'Too many requests. Please try again later.';
    case 500: return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504: return 'The server is temporarily unavailable. Please try again later.';
    default:  return 'Something went wrong. Please try again.';
  }
}
