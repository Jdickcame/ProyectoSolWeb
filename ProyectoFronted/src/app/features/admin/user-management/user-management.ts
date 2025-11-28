import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../core/models';
import { AdminService } from '../../../core/services/admin';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar, Footer, LoadingSpinner],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
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