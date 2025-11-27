import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { TeacherService } from '../../../core/services/teacher';
import { AuthService } from '../../../core/services/auth';
import { RevenuePeriod } from '../../../core/models';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="dashboard-page bg-light min-vh-100 py-5">
      <div class="container">
        <!-- Welcome Section -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card-modern p-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h2 class="fw-bold mb-2">¡Hola, {{ fullName() }}! 👨‍🏫</h2>
                  <p class="text-muted mb-0">Panel de profesor - Gestiona tus cursos</p>
                </div>
                <a routerLink="/teacher/course-form" class="btn btn-gradient">
                  <i class="bi bi-plus-circle me-2"></i>
                  Crear Curso
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row g-4 mb-5">
          <div class="col-md-3">
            <div class="stat-card card-modern p-4 text-center">
              <div class="stat-icon bg-gradient rounded-circle mx-auto mb-3">
                <i class="bi bi-collection text-white fs-2"></i>
              </div>
              <h3 class="fw-bold mb-1">{{ totalCourses() }}</h3>
              <p class="text-muted mb-0">Cursos Creados</p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card card-modern p-4 text-center">
              <div class="stat-icon bg-gradient rounded-circle mx-auto mb-3">
                <i class="bi bi-people text-white fs-2"></i>
              </div>
              <h3 class="fw-bold mb-1">{{ totalStudents() }}</h3>
              <p class="text-muted mb-0">Total Estudiantes</p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card card-modern p-4 text-center">
              <div class="stat-icon bg-gradient rounded-circle mx-auto mb-3">
                <i class="bi bi-currency-dollar text-white fs-2"></i>
              </div>
              <h3 class="fw-bold mb-1">
                @if (revenue()) {
                  {{ '$' + revenue()!.totalRevenue }}
                } @else {
                  $0
                }
              </h3>
              <p class="text-muted mb-0">Ingresos (30 días)</p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card card-modern p-4 text-center">
              <div class="stat-icon bg-gradient rounded-circle mx-auto mb-3">
                <i class="bi bi-camera-video text-white fs-2"></i>
              </div>
              <h3 class="fw-bold mb-1">{{ liveClasses().length }}</h3>
              <p class="text-muted mb-0">Clases Programadas</p>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        @if (revenue()) {
          <div class="mb-5">
            <div class="card-modern p-4">
              <h4 class="fw-bold mb-4">
                <i class="bi bi-graph-up me-2"></i>
                Ingresos Mensuales
              </h4>
              <div class="row">
                @for (month of revenue()!.revenueByMonth.slice(-6); track month.month) {
                  <div class="col-md-2 text-center">
                    <div class="revenue-bar mb-2">
                      <div 
                        class="bar bg-gradient"
                        [style.height.%]="getBarHeight(month.revenue)">
                      </div>
                    </div>
                    <small class="text-muted">{{ formatMonth(month.month) }}</small>
                    <div class="fw-bold">{{ '$' + month.revenue }}</div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- My Courses -->
        <div class="mb-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold mb-0">
              <i class="bi bi-collection me-2"></i>
              Mis Cursos
            </h4>
            <a routerLink="/teacher/my-courses" class="btn btn-outline-primary">
              Ver Todos
              <i class="bi bi-arrow-right ms-2"></i>
            </a>
          </div>

          @if (isLoadingCourses()) {
            <div class="text-center py-5">
              <app-loading-spinner [size]="50" message="Cargando cursos..."></app-loading-spinner>
            </div>
          } @else if (myCourses().length > 0) {
            <div class="row g-4">
              @for (course of myCourses().slice(0, 3); track course.id) {
                <div class="col-md-4">
                  <div class="card-modern p-3">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <h6 class="fw-bold mb-0">{{ course.title }}</h6>
                      <span 
                        class="badge"
                        [class.bg-success]="course.status === 'PUBLISHED'"
                        [class.bg-warning]="course.status === 'PENDING'"
                        [class.bg-secondary]="course.status === 'DRAFT'">
                        {{ getStatusLabel(course.status) }}
                      </span>
                    </div>
                    
                    <div class="d-flex justify-content-between text-muted small mb-3">
                      <div>
                        <i class="bi bi-people me-1"></i>
                        {{ course.enrolledStudents }} estudiantes
                      </div>
                      <div>
                        <i class="bi bi-star-fill text-warning me-1"></i>
                        {{ course.rating.toFixed(1) }}
                      </div>
                    </div>

                    <div class="d-flex gap-2">
                      <a 
                        [routerLink]="['/courses', course.id]" 
                        class="btn btn-sm btn-outline-primary flex-grow-1">
                        Ver
                      </a>
                      <a 
                        [routerLink]="['/teacher/course-form', course.id]" 
                        class="btn btn-sm btn-gradient flex-grow-1">
                        Editar
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="card-modern p-5 text-center">
              <i class="bi bi-inbox display-4 text-muted"></i>
              <h5 class="mt-3 mb-2">No has creado cursos aún</h5>
              <p class="text-muted mb-4">Crea tu primer curso y comienza a enseñar</p>
              <a routerLink="/teacher/course-form" class="btn btn-gradient">
                Crear Mi Primer Curso
              </a>
            </div>
          }
        </div>

        <!-- Upcoming Live Classes -->
        @if (liveClasses().length > 0) {
          <div class="mb-5">
            <h4 class="fw-bold mb-4">
              <i class="bi bi-camera-video me-2"></i>
              Próximas Clases en Vivo
            </h4>
            <div class="row g-4">
              @for (liveClass of liveClasses().slice(0, 2); track liveClass.id) {
                <div class="col-md-6">
                  <div class="card-modern p-4">
                    <h6 class="fw-bold mb-2">{{ liveClass.title }}</h6>
                    <p class="text-muted small mb-3">{{ liveClass.courseName }}</p>
                    
                    <div class="d-flex justify-content-between mb-3">
                      <small>
                        <i class="bi bi-calendar3 me-1"></i>
                        {{ formatDate(liveClass.scheduledDate) }}
                      </small>
                      <small>
                        <i class="bi bi-clock me-1"></i>
                        {{ liveClass.startTime }}
                      </small>
                    </div>

                    <a 
                      [href]="liveClass.meetingUrl" 
                      target="_blank"
                      class="btn btn-gradient w-100 btn-sm">
                      Iniciar Clase
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Quick Actions -->
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card-modern p-4">
              <h5 class="fw-bold mb-3">Acciones Rápidas</h5>
              <div class="d-grid gap-2">
                <a routerLink="/teacher/course-form" class="btn btn-outline-primary text-start">
                  <i class="bi bi-plus-circle me-2"></i>
                  Crear Nuevo Curso
                </a>
                <a routerLink="/teacher/live-class-management" class="btn btn-outline-primary text-start">
                  <i class="bi bi-camera-video me-2"></i>
                  Programar Clase en Vivo
                </a>
                <a routerLink="/teacher/my-courses" class="btn btn-outline-primary text-start">
                  <i class="bi bi-collection me-2"></i>
                  Gestionar Cursos
                </a>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card-modern p-4">
              <h5 class="fw-bold mb-3">Consejos para Profesores</h5>
              <ul class="list-unstyled mb-0">
                <li class="mb-3">
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Mantén tus cursos actualizados</small>
                </li>
                <li class="mb-3">
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Responde las dudas de tus estudiantes</small>
                </li>
                <li class="mb-3">
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Programa clases en vivo regularmente</small>
                </li>
                <li>
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Solicita feedback de tus estudiantes</small>
                </li>
              </ul>
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
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .revenue-bar {
      height: 150px;
      display: flex;
      align-items: flex-end;
      
      .bar {
        width: 100%;
        min-height: 20px;
        border-radius: 4px 4px 0 0;
        transition: height 0.3s ease;
      }
    }
  `]
})
export class Dashboard implements OnInit {
  private teacherService = inject(TeacherService);
  private authService = inject(AuthService);

  myCourses = this.teacherService.myCourses;
  liveClasses = this.teacherService.liveClasses;
  revenue = this.teacherService.revenue;
  totalCourses = this.teacherService.totalCourses;
  totalStudents = this.teacherService.totalStudents;
  
  fullName = this.authService.fullName;
  isLoadingCourses = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoadingCourses.set(true);

    this.teacherService.getMyCourses().subscribe({
      next: () => {
        this.isLoadingCourses.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoadingCourses.set(false);
      }
    });

    this.teacherService.getMyLiveClasses().subscribe({
      error: (error) => console.error('Error loading live classes:', error)
    });

    this.teacherService.getRevenue(RevenuePeriod.LAST_30_DAYS).subscribe({
      error: (error) => console.error('Error loading revenue:', error)
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PUBLISHED': 'Publicado',
      'PENDING': 'Pendiente',
      'DRAFT': 'Borrador',
      'REJECTED': 'Rechazado'
    };
    return labels[status] || status;
  }

  getBarHeight(revenue: number): number {
    const maxRevenue = Math.max(...(this.revenue()?.revenueByMonth.map(m => m.revenue) || [1]));
    return (revenue / maxRevenue) * 100;
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[parseInt(monthNum) - 1];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }
}