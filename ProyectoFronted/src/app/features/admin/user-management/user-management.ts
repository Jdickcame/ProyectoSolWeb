import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { AdminService } from '../../../core/services/admin';
import { User, UserRole } from '../../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="user-management-page bg-light min-vh-100 py-5">
      <div class="container-fluid px-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-2">Gestión de Usuarios</h2>
            <p class="text-muted mb-0">Administra todos los usuarios de la plataforma</p>
          </div>
          <button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#userModal" (click)="openCreateModal()">
            <i class="bi bi-person-plus me-2"></i>
            Crear Usuario
          </button>
        </div>

        <!-- Filters -->
        <div class="card-modern p-4 mb-4">
          <div class="row g-3">
            <div class="col-md-4">
              <input 
                type="text"
                class="form-control"
                placeholder="Buscar por nombre o email..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterUsers()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterRole" (ngModelChange)="filterUsers()">
                <option value="">Todos los roles</option>
                <option value="STUDENT">Estudiantes</option>
                <option value="TEACHER">Profesores</option>
                <option value="ADMIN">Administradores</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterStatus" (ngModelChange)="filterUsers()">
                <option value="">Todos los estados</option>
                <option value="ACTIVE">Activos</option>
                <option value="SUSPENDED">Suspendidos</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                <i class="bi bi-x-circle me-2"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card-modern p-4">
          @if (isLoading()) {
            <div class="text-center py-5">
              <app-loading-spinner [size]="50"></app-loading-spinner>
            </div>
          } @else if (filteredUsers().length > 0) {
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center gap-3">
                          @if (user.avatar) {
                            <img [src]="user.avatar" [alt]="user.name" class="rounded-circle" width="40" height="40">
                          } @else {
                            <div class="avatar-placeholder rounded-circle bg-gradient">
                              <span class="text-white fw-bold">{{ user.name.charAt(0) }}</span>
                            </div>
                          }
                          <div>
                            <div class="fw-semibold">{{ user.name }} {{ user.surname || '' }}</div>
                            @if (user.phoneNumber) {
                              <small class="text-muted">{{ user.phoneNumber }}</small>
                            }
                          </div>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" 
                          [class.bg-primary]="user.role === 'STUDENT'"
                          [class.bg-success]="user.role === 'TEACHER'"
                          [class.bg-danger]="user.role === 'ADMIN'">
                          {{ getRoleLabel(user.role) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge"
                          [class.bg-success]="user.status === 'ACTIVE'"
                          [class.bg-warning]="user.status === 'SUSPENDED'">
                          {{ getStatusLabel(user.status) }}
                        </span>
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" (click)="openEditModal(user)" data-bs-toggle="modal" data-bs-target="#userModal">
                            <i class="bi bi-pencil"></i>
                          </button>
                          @if (user.status === 'ACTIVE') {
                            <button class="btn btn-outline-warning" (click)="suspendUser(user.id, user.name)">
                              <i class="bi bi-pause-circle"></i>
                            </button>
                          } @else {
                            <button class="btn btn-outline-success" (click)="activateUser(user.id, user.name)">
                              <i class="bi bi-play-circle"></i>
                            </button>
                          }
                          <button class="btn btn-outline-danger" (click)="deleteUser(user.id, user.name)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="text-center py-5">
              <i class="bi bi-people display-3 text-muted"></i>
              <p class="mt-3 text-muted">No se encontraron usuarios</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div class="modal fade" id="userModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingUser() ? 'Editar Usuario' : 'Crear Usuario' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nombre *</label>
                  <input type="text" class="form-control" formControlName="name" [class.is-invalid]="isFieldInvalid('name')">
                  @if (isFieldInvalid('name')) {
                    <div class="invalid-feedback">El nombre es obligatorio</div>
                  }
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellido</label>
                  <input type="text" class="form-control" formControlName="surname">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control" formControlName="email" [class.is-invalid]="isFieldInvalid('email')">
                  @if (isFieldInvalid('email')) {
                    <div class="invalid-feedback">Email válido obligatorio</div>
                  }
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input type="tel" class="form-control" formControlName="phoneNumber">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Rol *</label>
                  <select class="form-select" formControlName="role" [class.is-invalid]="isFieldInvalid('role')">
                    <option value="">Selecciona un rol</option>
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Profesor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  @if (isFieldInvalid('role')) {
                    <div class="invalid-feedback">El rol es obligatorio</div>
                  }
                </div>
                <div class="col-md-6">
                  <label class="form-label">Estado *</label>
                  <select class="form-select" formControlName="status" [class.is-invalid]="isFieldInvalid('status')">
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                  </select>
                </div>
                @if (!editingUser()) {
                  <div class="col-md-6">
                    <label class="form-label">Contraseña *</label>
                    <input type="password" class="form-control" formControlName="password" [class.is-invalid]="isFieldInvalid('password')">
                    @if (isFieldInvalid('password')) {
                      <div class="invalid-feedback">Mínimo 6 caracteres</div>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-gradient" [disabled]="isSaving()">
                @if (isSaving()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Guardando...
                } @else {
                  {{ editingUser() ? 'Actualizar' : 'Crear' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .avatar-placeholder {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class UserManagement implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  users = this.adminService.users;
  filteredUsers = signal<User[]>([]);
  isLoading = this.adminService.isLoading;
  isSaving = signal<boolean>(false);
  editingUser = signal<User | null>(null);

  searchQuery: string = '';
  filterRole: string = '';
  filterStatus: string = '';

  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      surname: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      role: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: () => {
        this.filteredUsers.set(this.users());
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  filterUsers(): void {
    let filtered = this.users();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    if (this.filterRole) {
      filtered = filtered.filter(u => u.role === this.filterRole);
    }

    if (this.filterStatus) {
      filtered = filtered.filter(u => u.status === this.filterStatus);
    }

    this.filteredUsers.set(filtered);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.filteredUsers.set(this.users());
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.userForm.reset({ status: 'ACTIVE' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
  }

  openEditModal(user: User): void {
    this.editingUser.set(user);
    this.userForm.patchValue(user);
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const userData = this.userForm.value;

    if (this.editingUser()) {
      this.adminService.updateUser(this.editingUser()!.id, userData).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('Usuario actualizado');
          this.closeModal();
        },
        error: (error) => {
          this.isSaving.set(false);
          alert('Error: ' + error.message);
        }
      });
    } else {
      this.adminService.createUser(userData).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('Usuario creado');
          this.closeModal();
        },
        error: (error) => {
          this.isSaving.set(false);
          alert('Error: ' + error.message);
        }
      });
    }
  }

  suspendUser(userId: string, userName: string): void {
    if (confirm(`¿Suspender a ${userName}?`)) {
      this.adminService.updateUser(userId, { status: 'SUSPENDED' }).subscribe({
        next: () => alert('Usuario suspendido'),
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }

  activateUser(userId: string, userName: string): void {
    if (confirm(`¿Activar a ${userName}?`)) {
      this.adminService.updateUser(userId, { status: 'ACTIVE' }).subscribe({
        next: () => alert('Usuario activado'),
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }

  deleteUser(userId: string, userName: string): void {
    if (confirm(`¿ELIMINAR permanentemente a ${userName}?`)) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => alert('Usuario eliminado'),
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }

  closeModal(): void {
    const modal = document.getElementById('userModal');
    const backdrop = document.querySelector('.modal-backdrop');
    modal?.classList.remove('show');
    backdrop?.remove();
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'STUDENT': 'Estudiante',
      'TEACHER': 'Profesor',
      'ADMIN': 'Admin'
    };
    return labels[role] || role;
  }

  getStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Activo' : 'Suspendido';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}