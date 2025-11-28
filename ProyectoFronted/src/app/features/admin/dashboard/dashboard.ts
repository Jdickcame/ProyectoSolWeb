import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin';
import { AuthService } from '../../../core/services/auth';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  stats = this.adminService.stats;
  pendingCourses = this.adminService.pendingCourses;
  users = this.adminService.users;
  isLoading = this.adminService.isLoading;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.adminService.getDashboardStats().subscribe({
      error: (error) => console.error('Error loading stats:', error)
    });

    this.adminService.getPendingCourses().subscribe({
      error: (error) => console.error('Error loading pending courses:', error)
    });

    this.adminService.getAllUsers().subscribe({
      error: (error) => console.error('Error loading users:', error)
    });
  }

  approveCourse(courseId: string, courseTitle: string): void {
    if (confirm(`¿Aprobar el curso "${courseTitle}"?`)) {
      this.adminService.approveCourse(courseId).subscribe({
        next: () => {
          alert('Curso aprobado exitosamente');
        },
        error: (error) => {
          alert('Error al aprobar: ' + error.message);
        }
      });
    }
  }

  rejectCourse(courseId: string, courseTitle: string): void {
    const reason = prompt(`¿Por qué rechazas el curso "${courseTitle}"?`);
    if (reason) {
      this.adminService.rejectCourse(courseId, reason).subscribe({
        next: () => {
          alert('Curso rechazado');
        },
        error: (error) => {
          alert('Error al rechazar: ' + error.message);
        }
      });
    }
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'PROGRAMMING': 'Programación',
      'DESIGN': 'Diseño',
      'BUSINESS': 'Negocios',
      'MARKETING': 'Marketing',
    };
    return categories[category] || category;
  }

  getRoleLabel(role: string): string {
    const roles: { [key: string]: string } = {
      'STUDENT': 'Estudiante',
      'TEACHER': 'Profesor',
      'ADMIN': 'Admin'
    };
    return roles[role] || role;
  }
}