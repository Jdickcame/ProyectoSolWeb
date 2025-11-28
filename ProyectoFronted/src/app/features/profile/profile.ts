import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Footer],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
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