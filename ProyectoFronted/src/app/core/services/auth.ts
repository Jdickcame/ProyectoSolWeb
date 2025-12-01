// ==========================================================================
// AUTH SERVICE
// Servicio de autenticación con integración de Signals
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, finalize } from 'rxjs/operators';
import { computed } from '@angular/core';

import { 
  User, 
  UserLoginDto, 
  UserRegistrationDto, 
  AuthResponse 
} from '../models';
import { 
  authActions, 
  authComputed, 
  restoreAuthFromStorage,
  initAuthStorageEffect,
  authState
} from '../signals/auth-state';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = environment.apiUrl;
  
  // Signals expuestos (solo lectura)
  readonly currentUser = authComputed.currentUser;
  readonly isAuthenticated = authComputed.isAuthenticated;
  readonly isLoading = authComputed.isLoading;
  readonly userRole = authComputed.userRole;
  readonly isStudent = authComputed.isStudent;
  readonly isTeacher = authComputed.isTeacher;
  readonly isAdmin = authComputed.isAdmin;
  readonly fullName = authComputed.fullName;
  readonly userEmail = computed(() => authState().user?.email || '');
  readonly userAvatar = authComputed.userAvatar;

  constructor() {
    // Inicializar effect de sincronización con localStorage
    initAuthStorageEffect();
    
    // Intentar restaurar sesión al iniciar
    this.initializeAuth();
  }

  /**
   * Inicializar autenticación (restaurar desde localStorage)
   */
  private initializeAuth(): void {
    const restored = restoreAuthFromStorage();
    if (restored) {
      console.log('✅ Sesión restaurada desde localStorage');
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: UserLoginDto): Observable<AuthResponse> {
    authActions.setLoading(true);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar usuario y token en el signal
          authActions.setUser(response.user, response.token);
          console.log('✅ Login exitoso:', response.user.email);
        }),
        catchError(this.handleError),
        finalize(() => {
            // ESTO SE EJECUTA SIEMPRE (Éxito o Error)
            authActions.setLoading(false); // Spinner OFF
        })
      );
  }

  /**
   * Registrar nuevo usuario
   */
  register(userData: UserRegistrationDto): Observable<AuthResponse> {
    authActions.setLoading(true);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          authActions.setUser(response.user, response.token);
          console.log('✅ Registro exitoso:', response.user.email);
        }),
        catchError(this.handleError),
        finalize(() => {
            // ESTO SE EJECUTA SIEMPRE (Éxito o Error)
            authActions.setLoading(false); // Spinner OFF
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    authActions.logout();
    this.router.navigate(['/home']);
    console.log('✅ Sesión cerrada');
  }

  /**
   * Verificar si el token es válido
   */
  validateToken(): Observable<boolean> {
    const token = authComputed.currentToken();
    
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    return this.http.get<{ valid: boolean }>(`${this.API_URL}/auth/validate`)
      .pipe(
        map(response => response.valid),
        catchError(() => {
          // Si el token no es válido, cerrar sesión
          this.logout();
          return throwError(() => new Error('Invalid token'));
        })
      );
  }

  /**
   * Actualizar perfil del usuario
   */
  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/profile`, updates)
      .pipe(
        tap(updatedUser => {
          authActions.updateUser(updatedUser);
          console.log('✅ Perfil actualizado');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      tap(() => console.log('✅ Contraseña actualizada')),
      catchError(this.handleError)
    );
  }

  /**
   * Solicitar reseteo de contraseña
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/forgot-password`, { email })
      .pipe(
        tap(() => console.log('✅ Email de reseteo enviado')),
        catchError(this.handleError)
      );
  }

  /**
   * Resetear contraseña con token
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/reset-password`, {
      token,
      newPassword
    }).pipe(
      tap(() => console.log('✅ Contraseña reseteada')),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return authComputed.currentToken();
  }

  /**
   * Navegar al dashboard según el rol del usuario
   */
  navigateToDashboard(): void {
    if (this.isStudent()) {
      this.router.navigate(['/student/dashboard']);
    } else if (this.isTeacher()) {
      this.router.navigate(['/teacher/dashboard']);
    } else if (this.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'Credenciales inválidas';
          break;
        case 403:
          errorMessage = 'No tienes permiso para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'El email ya está registrado';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intenta más tarde';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('❌ Error en AuthService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}