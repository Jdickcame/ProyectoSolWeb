// ==========================================================================
// AUTH GUARD
// ==========================================================================

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { authComputed } from '../signals/auth-state';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isAuthenticated = authComputed.isAuthenticated();

  if (!isAuthenticated) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  return true;
};