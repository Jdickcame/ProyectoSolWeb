import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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

  // CORRECCIÓN: Definimos explícitamente que puede ser null o cualquier objeto
  stats = signal<any | null>(null);

  revenue = computed(() => this.stats()?.totalRevenue || 0);
  
  // Asegúrate de que estos signals existan en tu AdminService o defínelos aquí si son locales
  // Si AdminService no tiene 'pendingCourses' como signal pública, defínela aquí:
  pendingCourses = signal<any[]>([]); 
  users = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  // Totales individuales por si acaso
  totalUsers = signal<number>(0);
  totalCourses = signal<number>(0);
  totalEnrollments = signal<number>(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.adminService.getGlobalStats().subscribe({
      next: (data) => {
        // 2. Solo llenamos stats
        this.stats.set(data); 
        this.isLoading.set(false);
      },
      error: (err) => console.error(err)
    });

    // 2. Cargar Cursos Pendientes
    this.adminService.getPendingCourses().subscribe({
      next: (courses) => this.pendingCourses.set(courses),
      error: (error) => console.error('Error loading pending courses:', error)
    });

    // 3. Cargar Usuarios
    this.adminService.getAllUsers().subscribe({
      next: (usersList) => {
        this.users.set(usersList);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading.set(false);
      }
    });
  }

  approveCourse(courseId: string, courseTitle: string): void {
    if (confirm(`¿Aprobar el curso "${courseTitle}"?`)) {
      this.adminService.approveCourse(courseId).subscribe({
        next: () => {
          alert('Curso aprobado exitosamente');
          this.loadDashboardData(); // Recargar datos
        },
        error: (error) => alert('Error al aprobar: ' + error.message)
      });
    }
  }

  rejectCourse(courseId: string, courseTitle: string): void {
    const reason = prompt(`¿Por qué rechazas el curso "${courseTitle}"?`);
    if (reason) {
      this.adminService.rejectCourse(courseId, reason).subscribe({
        next: () => {
          alert('Curso rechazado');
          this.loadDashboardData(); // Recargar datos
        },
        error: (error) => alert('Error al rechazar: ' + error.message)
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