// ==========================================================================
// AUTH INTERCEPTOR
// ==========================================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { authComputed } from '../signals/auth-state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = authComputed.currentToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};