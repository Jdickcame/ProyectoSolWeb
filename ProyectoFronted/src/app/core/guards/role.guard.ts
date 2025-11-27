// ==========================================================================
// ROLE GUARD
// ==========================================================================

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { authComputed } from '../signals/auth-state';
import { UserRole } from '../models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const userRole = authComputed.userRole();
    const isAuthenticated = authComputed.isAuthenticated();

    if (!isAuthenticated) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};