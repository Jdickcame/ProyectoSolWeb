import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { UserRegistrationDto, UserRole } from '../../../../core/models';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinner],
  template: `
    <div class="register-page bg-dark-theme min-vh-100 d-flex align-items-center py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8">
            <div class="card-modern p-5">
              <!-- Logo -->
              <div class="text-center mb-4">
                <a routerLink="/home" class="text-decoration-none">
                  <h2 class="text-gradient fw-bold mb-2">EduConect</h2>
                </a>
                <p class="text-muted">Crea tu cuenta gratuita</p>
              </div>

              <!-- Success Alert -->
              @if (successMessage()) {
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ successMessage() }}
                  <button 
                    type="button" 
                    class="btn-close" 
                    (click)="successMessage.set('')">
                  </button>
                </div>
              }

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

              <!-- Register Form -->
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <!-- Role Selection -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="bi bi-person-badge me-2"></i>¿Cómo quieres usar EduConect?
                  </label>
                  <div class="row g-3">
                    <div class="col-6">
                      <input 
                        type="radio" 
                        class="btn-check" 
                        id="roleStudent" 
                        formControlName="role"
                        [value]="UserRole.STUDENT">
                      <label class="btn btn-outline-primary w-100 py-3" for="roleStudent">
                        <i class="bi bi-book d-block fs-4 mb-2"></i>
                        <strong>Estudiante</strong>
                        <small class="d-block text-muted">Quiero aprender</small>
                      </label>
                    </div>
                    <div class="col-6">
                      <input 
                        type="radio" 
                        class="btn-check" 
                        id="roleTeacher" 
                        formControlName="role"
                        [value]="UserRole.TEACHER">
                      <label class="btn btn-outline-primary w-100 py-3" for="roleTeacher">
                        <i class="bi bi-easel d-block fs-4 mb-2"></i>
                        <strong>Profesor</strong>
                        <small class="d-block text-muted">Quiero enseñar</small>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="row g-3">
                  <!-- Name -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">
                      <i class="bi bi-person me-2"></i>Nombre
                    </label>
                    <input 
                      type="text"
                      class="form-control"
                      formControlName="name"
                      placeholder="Juan"
                      [class.is-invalid]="isFieldInvalid('name')">
                    @if (isFieldInvalid('name')) {
                      <div class="invalid-feedback">
                        El nombre es obligatorio
                      </div>
                    }
                  </div>

                  <!-- Surname -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">
                      Apellido
                    </label>
                    <input 
                      type="text"
                      class="form-control"
                      formControlName="surname"
                      placeholder="Pérez">
                  </div>
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="bi bi-envelope me-2"></i>Correo Electrónico
                  </label>
                  <input 
                    type="email"
                    class="form-control"
                    formControlName="email"
                    placeholder="tu@email.com"
                    [class.is-invalid]="isFieldInvalid('email')">
                  @if (isFieldInvalid('email')) {
                    <div class="invalid-feedback">
                      @if (registerForm.get('email')?.hasError('required')) {
                        El correo es obligatorio
                      }
                      @if (registerForm.get('email')?.hasError('email')) {
                        Ingresa un correo válido
                      }
                    </div>
                  }
                </div>

                <!-- Phone (optional) -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="bi bi-phone me-2"></i>Teléfono (opcional)
                  </label>
                  <input 
                    type="tel"
                    class="form-control"
                    formControlName="phoneNumber"
                    placeholder="+51 999 999 999">
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="bi bi-lock me-2"></i>Contraseña
                  </label>
                  <div class="input-group">
                    <input 
                      [type]="showPassword() ? 'text' : 'password'"
                      class="form-control"
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
                      @if (registerForm.get('password')?.hasError('required')) {
                        La contraseña es obligatoria
                      }
                      @if (registerForm.get('password')?.hasError('minlength')) {
                        Debe tener al menos 6 caracteres
                      }
                    </div>
                  }
                  <small class="text-muted">Mínimo 6 caracteres</small>
                </div>

                <!-- Confirm Password -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="bi bi-lock-fill me-2"></i>Confirmar Contraseña
                  </label>
                  <input 
                    [type]="showPassword() ? 'text' : 'password'"
                    class="form-control"
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    [class.is-invalid]="isFieldInvalid('confirmPassword') || passwordsDoNotMatch()">
                  @if (isFieldInvalid('confirmPassword')) {
                    <div class="invalid-feedback">
                      Confirma tu contraseña
                    </div>
                  }
                  @if (passwordsDoNotMatch()) {
                    <div class="invalid-feedback d-block">
                      Las contraseñas no coinciden
                    </div>
                  }
                </div>

                <!-- Terms -->
                <div class="mb-4">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="terms"
                      formControlName="acceptTerms"
                      [class.is-invalid]="isFieldInvalid('acceptTerms')">
                    <label class="form-check-label small" for="terms">
                      Acepto los 
                      <a routerLink="/terms" target="_blank">términos y condiciones</a> 
                      y la 
                      <a routerLink="/privacy" target="_blank">política de privacidad</a>
                    </label>
                    @if (isFieldInvalid('acceptTerms')) {
                      <div class="invalid-feedback d-block">
                        Debes aceptar los términos y condiciones
                      </div>
                    }
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="btn btn-gradient w-100 btn-lg mb-3"
                  [disabled]="isLoading()">
                  @if (isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Creando cuenta...
                  } @else {
                    <i class="bi bi-person-plus me-2"></i>
                    Crear Cuenta
                  }
                </button>

                <!-- Login Link -->
                <div class="text-center">
                  <span class="text-muted">¿Ya tienes cuenta?</span>
                  <a routerLink="/auth/login" class="text-decoration-none ms-1">
                    Inicia sesión aquí
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
    .register-page {
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .card-modern {
      animation: fadeInScale 0.4s ease-out;
    }

    .btn-check:checked + .btn-outline-primary {
      background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%);
      border-color: transparent;
      color: white;
    }
  `]
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly UserRole = UserRole;
  
  registerForm: FormGroup;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    this.registerForm = this.fb.group({
      role: [UserRole.STUDENT, Validators.required],
      name: ['', Validators.required],
      surname: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.passwordsDoNotMatch()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { confirmPassword, acceptTerms, ...userData } = this.registerForm.value;
    const registrationData: UserRegistrationDto = userData;

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo...');
        
        setTimeout(() => {
          this.authService.navigateToDashboard();
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Error al crear la cuenta. Intenta nuevamente.');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  passwordsDoNotMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    const confirmTouched = this.registerForm.get('confirmPassword')?.touched;
    
    return !!(confirmTouched && password && confirmPassword && password !== confirmPassword);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}