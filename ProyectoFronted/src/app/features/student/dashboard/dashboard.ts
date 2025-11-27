import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { CourseCard } from '../../../shared/components/course-card/course-card';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { StudentService } from '../../../core/services/student';
import { AuthService } from '../../../core/services/auth';
import { Course, LiveClass } from '../../../core/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, CourseCard, LoadingSpinner],
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
                  <h2 class="fw-bold mb-2">¡Hola, {{ fullName() }}! 👋</h2>
                  <p class="text-muted mb-0">Bienvenido a tu panel de estudiante</p>
                </div>
                <a routerLink="/courses" class="btn btn-gradient">
                  <i class="bi bi-search me-2"></i>
                  Explorar Cursos
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row g-4 mb-5">
          <div class="col-md-4">
            <div class="stat-card card-modern p-4 text-center">
              <div class="stat-icon bg-gradient rounded-circle mx-auto mb-3">
                <i class="bi bi-book text-white fs-2"></i>
              </div>
              <h3 class="fw-bold mb-1">{{ totalEnrolledCourses() }}</h3>
              <p class="text-muted mb-0">Cursos Inscritos</p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-card card-modern p-4 text-center">
              <div class="stat-icon bg-gradient rounded-circle mx-auto mb-3">
                <i class="bi bi-graph-up text-white fs-2"></i>
              </div>
              <h3 class="fw-bold mb-1">{{ overallProgress() }}%</h3>
              <p class="text-muted mb-0">Progreso General</p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-card card-modern p-4 text-center">
              <div class="stat-icon bg-gradient rounded-circle mx-auto mb-3">
                <i class="bi bi-camera-video text-white fs-2"></i>
              </div>
              <h3 class="fw-bold mb-1">{{ upcomingClasses().length }}</h3>
              <p class="text-muted mb-0">Clases Próximas</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Live Classes -->
        @if (upcomingClasses().length > 0) {
          <div class="mb-5">
            <h4 class="fw-bold mb-4">
              <i class="bi bi-camera-video me-2"></i>
              Próximas Clases en Vivo
            </h4>
            <div class="row g-4">
              @for (liveClass of upcomingClasses(); track liveClass.id) {
                <div class="col-md-6">
                  <div class="card-modern p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 class="fw-bold mb-1">{{ liveClass.title }}</h6>
                        <small class="text-muted">{{ liveClass.courseName }}</small>
                      </div>
                      <span class="badge bg-danger">En Vivo</span>
                    </div>
                    
                    <div class="mb-3">
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="bi bi-calendar3 text-muted"></i>
                        <small>{{ formatDate(liveClass.scheduledDate) }}</small>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-clock text-muted"></i>
                        <small>{{ liveClass.startTime }} ({{ liveClass.duration }} min)</small>
                      </div>
                    </div>

                    <a 
                      [href]="liveClass.meetingUrl" 
                      target="_blank"
                      class="btn btn-gradient w-100">
                      <i class="bi bi-play-circle me-2"></i>
                      Unirse a la Clase
                    </a>
                  </div>
                </div>
              }
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
            <a routerLink="/student/my-courses" class="btn btn-outline-primary">
              Ver Todos
              <i class="bi bi-arrow-right ms-2"></i>
            </a>
          </div>

          @if (isLoadingCourses()) {
            <div class="text-center py-5">
              <app-loading-spinner [size]="50" message="Cargando cursos..."></app-loading-spinner>
            </div>
          } @else if (enrolledCourses().length > 0) {
            <div class="row g-4">
              @for (course of enrolledCourses().slice(0, 3); track course.id) {
                <div class="col-md-4">
                  <app-course-card [course]="course"></app-course-card>
                </div>
              }
            </div>
          } @else {
            <div class="card-modern p-5 text-center">
              <i class="bi bi-inbox display-4 text-muted"></i>
              <h5 class="mt-3 mb-2">No tienes cursos inscritos</h5>
              <p class="text-muted mb-4">Comienza tu aprendizaje inscribiéndote en un curso</p>
              <a routerLink="/courses" class="btn btn-gradient">
                Explorar Cursos
              </a>
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card-modern p-4">
              <h5 class="fw-bold mb-3">Acciones Rápidas</h5>
              <div class="d-grid gap-2">
                <a routerLink="/student/my-courses" class="btn btn-outline-primary text-start">
                  <i class="bi bi-collection me-2"></i>
                  Ver Mis Cursos
                </a>
                <a routerLink="/courses" class="btn btn-outline-primary text-start">
                  <i class="bi bi-search me-2"></i>
                  Buscar Cursos
                </a>
                <a routerLink="/student/profile" class="btn btn-outline-primary text-start">
                  <i class="bi bi-person me-2"></i>
                  Editar Perfil
                </a>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card-modern p-4">
              <h5 class="fw-bold mb-3">Consejos de Aprendizaje</h5>
              <ul class="list-unstyled mb-0">
                <li class="mb-3">
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Establece metas de aprendizaje semanales</small>
                </li>
                <li class="mb-3">
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Practica regularmente lo que aprendes</small>
                </li>
                <li class="mb-3">
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Participa activamente en clases en vivo</small>
                </li>
                <li>
                  <i class="bi bi-lightbulb text-warning me-2"></i>
                  <small>Revisa el material antes de exámenes</small>
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
  `]
})
export class Dashboard implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);

  enrolledCourses = this.studentService.enrolledCourses;
  upcomingClasses = this.studentService.upcomingClasses;
  totalEnrolledCourses = this.studentService.totalEnrolledCourses;
  overallProgress = this.studentService.overallProgress;
  
  fullName = this.authService.fullName;
  isLoadingCourses = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoadingCourses.set(true);

    this.studentService.getEnrolledCourses().subscribe({
      next: () => {
        this.isLoadingCourses.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoadingCourses.set(false);
      }
    });

    this.studentService.getUpcomingLiveClasses().subscribe({
      error: (error) => console.error('Error loading live classes:', error)
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}