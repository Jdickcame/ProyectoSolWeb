import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { AdminService } from '../../../core/services/admin';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="dashboard-page bg-light min-vh-100 py-5">
      <div class="container-fluid px-4">
        <!-- Welcome Section -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card-modern p-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h2 class="fw-bold mb-2">Panel de Administrador 🛡️</h2>
                  <p class="text-muted mb-0">Gestiona la plataforma EduConect</p>
                </div>
                <div class="d-flex gap-2">
                  <a routerLink="/admin/course-management" class="btn btn-outline-primary">
                    <i class="bi bi-collection me-2"></i>
                    Cursos
                  </a>
                  <a routerLink="/admin/user-management" class="btn btn-gradient">
                    <i class="bi bi-people me-2"></i>
                    Usuarios
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        @if (stats()) {
          <div class="row g-4 mb-5">
            <div class="col-lg-3 col-md-6">
              <div class="stat-card card-modern p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <p class="text-muted mb-1">Total Usuarios</p>
                    <h3 class="fw-bold mb-0">{{ stats()!.totalUsers }}</h3>
                  </div>
                  <div class="stat-icon bg-gradient rounded-circle">
                    <i class="bi bi-people text-white fs-3"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="stat-card card-modern p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <p class="text-muted mb-1">Total Cursos</p>
                    <h3 class="fw-bold mb-0">{{ stats()!.totalCourses }}</h3>
                  </div>
                  <div class="stat-icon bg-gradient rounded-circle">
                    <i class="bi bi-book text-white fs-3"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="stat-card card-modern p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <p class="text-muted mb-1">Inscripciones</p>
                    <h3 class="fw-bold mb-0">{{ stats()!.totalEnrollments }}</h3>
                  </div>
                  <div class="stat-icon bg-gradient rounded-circle">
                    <i class="bi bi-graph-up text-white fs-3"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="stat-card card-modern p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <p class="text-muted mb-1">Ingresos Totales</p>
                    <h3 class="fw-bold mb-0">{{ '$' + stats()!.totalRevenue }}</h3>
                  </div>
                  <div class="stat-icon bg-gradient rounded-circle">
                    <i class="bi bi-currency-dollar text-white fs-3"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <div class="row g-4">
          <!-- Pending Courses -->
          <div class="col-lg-8">
            <div class="card-modern p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0">
                  <i class="bi bi-clock-history me-2"></i>
                  Cursos Pendientes de Aprobación
                </h5>
                <span class="badge bg-warning">{{ pendingCourses().length }}</span>
              </div>

              @if (isLoading()) {
                <div class="text-center py-5">
                  <app-loading-spinner [size]="50"></app-loading-spinner>
                </div>
              } @else if (pendingCourses().length > 0) {
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Profesor</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (course of pendingCourses().slice(0, 5); track course.id) {
                        <tr>
                          <td>
                            <strong>{{ course.title }}</strong>
                            <br>
                            <small class="text-muted">{{ course.shortDescription }}</small>
                          </td>
                          <td>{{ course.teacherName }}</td>
                          <td>
                            <span class="badge bg-secondary">
                              {{ getCategoryLabel(course.category) }}
                            </span>
                          </td>
                          <td>
                            @if (course.price === 0) {
                              <span class="badge bg-success">Gratis</span>
                            } @else {
                              {{ '$' + course.price }}
                            }
                          </td>
                          <td>
                            <div class="btn-group btn-group-sm">
                              <button 
                                class="btn btn-success"
                                (click)="approveCourse(course.id, course.title)">
                                <i class="bi bi-check-lg"></i>
                              </button>
                              <button 
                                class="btn btn-danger"
                                (click)="rejectCourse(course.id, course.title)">
                                <i class="bi bi-x-lg"></i>
                              </button>
                              <a 
                                [routerLink]="['/courses', course.id]"
                                class="btn btn-outline-primary"
                                target="_blank">
                                <i class="bi bi-eye"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="text-center py-5">
                  <i class="bi bi-check-circle display-4 text-success"></i>
                  <p class="text-muted mt-3">No hay cursos pendientes de aprobación</p>
                </div>
              }
            </div>
          </div>

          <!-- Recent Users -->
          <div class="col-lg-4">
            <div class="card-modern p-4 h-100">
              <h5 class="fw-bold mb-4">
                <i class="bi bi-person-plus me-2"></i>
                Usuarios Recientes
              </h5>

              @if (users().length > 0) {
                <div class="list-group list-group-flush">
                  @for (user of users().slice(0, 5); track user.id) {
                    <div class="list-group-item px-0">
                      <div class="d-flex align-items-center gap-3">
                        @if (user.avatar) {
                          <img 
                            [src]="user.avatar" 
                            [alt]="user.name"
                            class="rounded-circle"
                            width="40"
                            height="40">
                        } @else {
                          <div class="avatar-placeholder rounded-circle bg-gradient">
                            <span class="text-white">{{ user.name.charAt(0) }}</span>
                          </div>
                        }
                        <div class="flex-grow-1">
                          <div class="fw-semibold">{{ user.name }}</div>
                          <small class="text-muted">{{ user.email }}</small>
                        </div>
                        <span 
                          class="badge"
                          [class.bg-primary]="user.role === 'STUDENT'"
                          [class.bg-success]="user.role === 'TEACHER'"
                          [class.bg-danger]="user.role === 'ADMIN'">
                          {{ getRoleLabel(user.role) }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-muted text-center py-4">No hay usuarios recientes</p>
              }
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-4 mt-4">
          <div class="col-md-3">
            <a routerLink="/admin/user-management" class="action-card card-modern p-4 text-decoration-none">
              <div class="text-center">
                <i class="bi bi-people display-4 text-primary mb-3"></i>
                <h6 class="fw-bold">Gestionar Usuarios</h6>
                <p class="text-muted small mb-0">Ver y administrar usuarios</p>
              </div>
            </a>
          </div>

          <div class="col-md-3">
            <a routerLink="/admin/course-management" class="action-card card-modern p-4 text-decoration-none">
              <div class="text-center">
                <i class="bi bi-collection display-4 text-success mb-3"></i>
                <h6 class="fw-bold">Gestionar Cursos</h6>
                <p class="text-muted small mb-0">Aprobar y gestionar cursos</p>
              </div>
            </a>
          </div>

          <div class="col-md-3">
            <a routerLink="/admin/reports" class="action-card card-modern p-4 text-decoration-none">
              <div class="text-center">
                <i class="bi bi-bar-chart display-4 text-warning mb-3"></i>
                <h6 class="fw-bold">Reportes</h6>
                <p class="text-muted small mb-0">Ver estadísticas e informes</p>
              </div>
            </a>
          </div>

          <div class="col-md-3">
            <div class="action-card card-modern p-4">
              <div class="text-center">
                <i class="bi bi-gear display-4 text-secondary mb-3"></i>
                <h6 class="fw-bold">Configuración</h6>
                <p class="text-muted small mb-0">Ajustes de la plataforma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .stat-card {
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
      }
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-placeholder {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .action-card {
      transition: all 0.3s ease;
      display: block;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }
    }
  `]
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