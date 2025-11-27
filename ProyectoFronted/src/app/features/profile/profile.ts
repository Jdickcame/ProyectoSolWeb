import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="profile-page bg-light min-vh-100 py-5">
      <div class="container">
        <div class="row">
          <!-- Sidebar -->
          <div class="col-lg-3 mb-4">
            <div class="card-modern p-4 text-center">
              <div class="position-relative d-inline-block mb-3">
                @if (userAvatar()) {
                  <img 
                    [src]="userAvatar()" 
                    [alt]="fullName()"
                    class="rounded-circle"
                    width="120"
                    height="120"
                    style="object-fit: cover;">
                } @else {
                  <div class="avatar-placeholder rounded-circle bg-gradient mx-auto">
                    <span class="text-white display-4">{{ fullName().charAt(0) }}</span>
                  </div>
                }
                <button class="btn btn-sm btn-gradient position-absolute bottom-0 end-0 rounded-circle" style="width: 35px; height: 35px;">
                  <i class="bi bi-camera"></i>
                </button>
              </div>

              <h5 class="fw-bold mb-1">{{ fullName() }}</h5>
              <p class="text-muted mb-3">{{ userEmail() }}</p>
              <span class="badge badge-gradient">{{ getRoleLabel(userRole()) }}</span>

              <hr class="my-4">

              <div class="d-grid gap-2">
                <button 
                  class="btn btn-outline-primary text-start"
                  [class.active]="activeTab() === 'profile'"
                  (click)="activeTab.set('profile')">
                  <i class="bi bi-person me-2"></i>
                  Mi Perfil
                </button>
                <button 
                  class="btn btn-outline-primary text-start"
                  [class.active]="activeTab() === 'security'"
                  (click)="activeTab.set('security')">
                  <i class="bi bi-shield-lock me-2"></i>
                  Seguridad
                </button>
                <button 
                  class="btn btn-outline-primary text-start"
                  [class.active]="activeTab() === 'preferences'"
                  (click)="activeTab.set('preferences')">
                  <i class="bi bi-gear me-2"></i>
                  Preferencias
                </button>
                <hr class="my-2">
                <button class="btn btn-outline-danger text-start" (click)="logout()">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="col-lg-9">
            @if (activeTab() === 'profile') {
              <div class="card-modern p-4 mb-4">
                <h4 class="fw-bold mb-4">Información Personal</h4>

                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Nombre *</label>
                      <input 
                        type="text"
                        class="form-control"
                        formControlName="name"
                        [class.is-invalid]="isFieldInvalid('name')">
                      @if (isFieldInvalid('name')) {
                        <div class="invalid-feedback">El nombre es obligatorio</div>
                      }
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Apellido</label>
                      <input 
                        type="text"
                        class="form-control"
                        formControlName="surname">
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Email *</label>
                      <input 
                        type="email"
                        class="form-control"
                        formControlName="email"
                        [class.is-invalid]="isFieldInvalid('email')">
                      @if (isFieldInvalid('email')) {
                        <div class="invalid-feedback">Email válido obligatorio</div>
                      }
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Teléfono</label>
                      <input 
                        type="tel"
                        class="form-control"
                        formControlName="phoneNumber">
                    </div>

                    <div class="col-12">
                      <label class="form-label fw-semibold">Biografía</label>
                      <textarea 
                        class="form-control"
                        formControlName="biography"
                        rows="4"
                        placeholder="Cuéntanos sobre ti...">
                      </textarea>
                    </div>

                    @if (userRole() === 'TEACHER') {
                      <div class="col-12">
                        <h6 class="fw-bold mt-3 mb-3">Redes Sociales</h6>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">LinkedIn</label>
                        <input 
                          type="url"
                          class="form-control"
                          formControlName="linkedin"
                          placeholder="https://linkedin.com/in/...">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Twitter</label>
                        <input 
                          type="url"
                          class="form-control"
                          formControlName="twitter"
                          placeholder="https://twitter.com/...">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Sitio Web</label>
                        <input 
                          type="url"
                          class="form-control"
                          formControlName="website"
                          placeholder="https://...">
                      </div>
                    }
                  </div>

                  <hr class="my-4">

                  <div class="d-flex gap-2">
                    <button 
                      type="submit"
                      class="btn btn-gradient"
                      [disabled]="isSaving() || profileForm.invalid">
                      @if (isSaving()) {
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      } @else {
                        <i class="bi bi-save me-2"></i>
                        Guardar Cambios
                      }
                    </button>
                    <button 
                      type="button"
                      class="btn btn-outline-secondary"
                      (click)="resetForm()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            }

            @if (activeTab() === 'security') {
              <div class="card-modern p-4 mb-4">
                <h4 class="fw-bold mb-4">Seguridad</h4>

                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label fw-semibold">Contraseña Actual *</label>
                      <input 
                        type="password"
                        class="form-control"
                        formControlName="currentPassword"
                        [class.is-invalid]="isPasswordFieldInvalid('currentPassword')">
                      @if (isPasswordFieldInvalid('currentPassword')) {
                        <div class="invalid-feedback">La contraseña actual es obligatoria</div>
                      }
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Nueva Contraseña *</label>
                      <input 
                        type="password"
                        class="form-control"
                        formControlName="newPassword"
                        [class.is-invalid]="isPasswordFieldInvalid('newPassword')">
                      @if (isPasswordFieldInvalid('newPassword')) {
                        <div class="invalid-feedback">Mínimo 6 caracteres</div>
                      }
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Confirmar Contraseña *</label>
                      <input 
                        type="password"
                        class="form-control"
                        formControlName="confirmPassword"
                        [class.is-invalid]="isPasswordFieldInvalid('confirmPassword') || passwordsDoNotMatch()">
                      @if (isPasswordFieldInvalid('confirmPassword')) {
                        <div class="invalid-feedback">Confirma la contraseña</div>
                      }
                      @if (passwordsDoNotMatch()) {
                        <div class="invalid-feedback d-block">Las contraseñas no coinciden</div>
                      }
                    </div>
                  </div>

                  <hr class="my-4">

                  <button 
                    type="submit"
                    class="btn btn-gradient"
                    [disabled]="isSaving() || passwordForm.invalid || passwordsDoNotMatch()">
                    @if (isSaving()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Actualizando...
                    } @else {
                      <i class="bi bi-shield-check me-2"></i>
                      Cambiar Contraseña
                    }
                  </button>
                </form>
              </div>

              <div class="card-modern p-4">
                <h5 class="fw-bold mb-3">Autenticación de Dos Factores</h5>
                <p class="text-muted">Agrega una capa extra de seguridad a tu cuenta</p>
                <button class="btn btn-outline-primary">
                  <i class="bi bi-shield-plus me-2"></i>
                  Habilitar 2FA
                </button>
              </div>
            }

            @if (activeTab() === 'preferences') {
              <div class="card-modern p-4">
                <h4 class="fw-bold mb-4">Preferencias</h4>

                <div class="mb-4">
                  <h6 class="fw-bold mb-3">Notificaciones</h6>
                  <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="emailNotif" checked>
                    <label class="form-check-label" for="emailNotif">
                      Recibir notificaciones por email
                    </label>
                  </div>
                  <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="courseUpdates" checked>
                    <label class="form-check-label" for="courseUpdates">
                      Actualizaciones de cursos
                    </label>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="marketing">
                    <label class="form-check-label" for="marketing">
                      Ofertas y promociones
                    </label>
                  </div>
                </div>

                <hr>

                <div class="mb-4">
                  <h6 class="fw-bold mb-3">Idioma</h6>
                  <select class="form-select">
                    <option selected>Español</option>
                    <option>English</option>
                    <option>Português</option>
                  </select>
                </div>

                <hr>

                <div>
                  <h6 class="fw-bold mb-3 text-danger">Zona de Peligro</h6>
                  <button class="btn btn-outline-danger">
                    <i class="bi bi-trash me-2"></i>
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .avatar-placeholder {
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn.active {
      background: rgba(99, 102, 241, 0.1);
      color: #6366F1;
      border-color: #6366F1;
    }
  `]
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  fullName = this.authService.fullName;
  userEmail = this.authService.userEmail;
  userAvatar = this.authService.userAvatar;
  userRole = this.authService.userRole;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  activeTab = signal<'profile' | 'security' | 'preferences'>('profile');
  isSaving = signal<boolean>(false);

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      biography: [''],
      linkedin: [''],
      twitter: [''],
      website: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    // TODO: Cargar datos del usuario desde el backend
    this.profileForm.patchValue({
      name: this.fullName().split(' ')[0],
      surname: this.fullName().split(' ')[1] || '',
      email: this.userEmail()
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    setTimeout(() => {
      this.isSaving.set(false);
      alert('Perfil actualizado exitosamente');
    }, 1500);
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.passwordsDoNotMatch()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    setTimeout(() => {
      this.isSaving.set(false);
      this.passwordForm.reset();
      alert('Contraseña actualizada exitosamente');
    }, 1500);
  }

  resetForm(): void {
    this.loadUserData();
  }

  passwordsDoNotMatch(): boolean {
    const newPass = this.passwordForm.get('newPassword')?.value;
    const confirmPass = this.passwordForm.get('confirmPassword')?.value;
    const confirmTouched = this.passwordForm.get('confirmPassword')?.touched;
    
    return !!(confirmTouched && newPass && confirmPass && newPass !== confirmPass);
  }

  logout(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.authService.logout();
    }
  }

  getRoleLabel(role: string | null): string {
    if (!role) return 'Usuario';
    const labels: { [key: string]: string } = {
      'STUDENT': 'Estudiante',
      'TEACHER': 'Profesor',
      'ADMIN': 'Administrador'
    };
    return labels[role] || role;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}