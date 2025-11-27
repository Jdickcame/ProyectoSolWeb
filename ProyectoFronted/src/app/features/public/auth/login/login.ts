import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { UserLoginDto } from '../../../../core/models';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinner],
  template: `
    <div class="login-page bg-dark-theme min-vh-100 d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 col-md-7">
            <div class="card-modern p-5">
              <!-- Logo -->
              <div class="text-center mb-4">
                <a routerLink="/home" class="text-decoration-none">
                  <h2 class="text-gradient fw-bold mb-2">EduConect</h2>
                </a>
                <p class="text-muted">Inicia sesión en tu cuenta</p>
              </div>

              <!-- Error Alert -->
              @if (errorMessage()) {
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ errorMessage() }}
                  <button 
                    type="button" 
                    class="btn-close" 
                    (click)="errorMessage.set('')">
                  </button>
                </div>
              }

              <!-- Login Form -->
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <!-- Email -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="bi bi-envelope me-2"></i>Correo Electrónico
                  </label>
                  <input 
                    type="email"
                    class="form-control form-control-lg"
                    formControlName="email"
                    placeholder="tu@email.com"
                    [class.is-invalid]="isFieldInvalid('email')">
                  @if (isFieldInvalid('email')) {
                    <div class="invalid-feedback">
                      @if (loginForm.get('email')?.hasError('required')) {
                        El correo es obligatorio
                      }
                      @if (loginForm.get('email')?.hasError('email')) {
                        Ingresa un correo válido
                      }
                    </div>
                  }
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="bi bi-lock me-2"></i>Contraseña
                  </label>
                  <div class="input-group">
                    <input 
                      [type]="showPassword() ? 'text' : 'password'"
                      class="form-control form-control-lg"
                      formControlName="password"
                      placeholder="••••••••"
                      [class.is-invalid]="isFieldInvalid('password')">
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      (click)="togglePassword()">
                      <i class="bi" [class.bi-eye]="!showPassword()" [class.bi-eye-slash]="showPassword()"></i>
                    </button>
                  </div>
                  @if (isFieldInvalid('password')) {
                    <div class="invalid-feedback d-block">
                      La contraseña es obligatoria
                    </div>
                  }
                </div>

                <!-- Remember & Forgot -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="rememberMe">
                    <label class="form-check-label small" for="rememberMe">
                      Recordarme
                    </label>
                  </div>
                  <a routerLink="/auth/forgot-password" class="small text-decoration-none">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="btn btn-gradient w-100 btn-lg mb-3"
                  [disabled]="isLoading()">
                  @if (isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Iniciando sesión...
                  } @else {
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Iniciar Sesión
                  }
                </button>

                <!-- Divider -->
                <div class="text-center my-4">
                  <span class="text-muted small">o</span>
                </div>

                <!-- Register Link -->
                <div class="text-center">
                  <span class="text-muted">¿No tienes cuenta?</span>
                  <a routerLink="/auth/register" class="text-decoration-none ms-1">
                    Regístrate aquí
                  </a>
                </div>
              </form>

              <!-- Back to Home -->
              <div class="text-center mt-4">
                <a routerLink="/home" class="text-muted text-decoration-none small">
                  <i class="bi bi-arrow-left me-1"></i>
                  Volver al inicio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .card-modern {
      animation: fadeInScale 0.4s ease-out;
    }

    .form-control:focus,
    .form-check-input:focus {
      border-color: #6366F1;
      box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
    }

    .input-group .btn-outline-secondary {
      border-left: 0;
      
      &:hover {
        background: transparent;
        color: #6366F1;
      }
    }
  `]
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: UserLoginDto = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.authService.navigateToDashboard();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Error al iniciar sesión. Intenta nuevamente.');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}