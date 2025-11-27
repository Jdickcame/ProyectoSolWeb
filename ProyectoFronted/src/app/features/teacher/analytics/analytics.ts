import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { TeacherService } from '../../../core/services/teacher';
import { RevenuePeriod } from '../../../core/models';

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="analytics-page bg-light min-vh-100 py-5">
      <div class="container-fluid px-4">
        <!-- Header -->
        <div class="mb-4">
          <h2 class="fw-bold mb-2">
            <i class="bi bi-bar-chart-line me-2"></i>
            Analytics y Reportes
          </h2>
          <p class="text-muted">Estadísticas detalladas de tus cursos y rendimiento</p>
        </div>

        @if (isLoading()) {
          <div class="text-center py-5">
            <app-loading-spinner [size]="60" message="Cargando estadísticas..."></app-loading-spinner>
          </div>
        } @else {
          <!-- Period Selector -->
          <div class="mb-4">
            <div class="btn-group" role="group">
              @for (period of periods; track period.value) {
                <button 
                  type="button"
                  class="btn"
                  [class.btn-gradient]="selectedPeriod() === period.value"
                  [class.btn-outline-primary]="selectedPeriod() !== period.value"
                  (click)="changePeriod(period.value)">
                  {{ period.label }}
                </button>
              }
            </div>
          </div>

          <!-- Revenue Overview -->
          @if (revenue()) {
            <div class="row g-4 mb-4">
              <div class="col-md-3">
                <div class="stat-card card-modern p-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted small mb-1">Ingresos Totales</p>
                      <h3 class="fw-bold mb-0">{{ '$' + revenue()!.totalRevenue }}</h3>
                      <small class="text-success">
                        <i class="bi bi-arrow-up"></i>
                        {{ revenue()!.percentageChange.toFixed(1) }}%
                      </small>
                    </div>
                    <div class="stat-icon bg-gradient rounded-circle">
                      <i class="bi bi-currency-dollar text-white"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="stat-card card-modern p-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted small mb-1">Promedio por Curso</p>
                      <h3 class="fw-bold mb-0">{{ '$' + revenue()!.averageRevenuePerCourse.toFixed(2) }}</h3>
                    </div>
                    <div class="stat-icon bg-gradient rounded-circle">
                      <i class="bi bi-graph-up text-white"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="stat-card card-modern p-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted small mb-1">Inscripciones</p>
                      <h3 class="fw-bold mb-0">{{ revenue()!.totalEnrollments }}</h3>
                    </div>
                    <div class="stat-icon bg-gradient rounded-circle">
                      <i class="bi bi-people text-white"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="stat-card card-modern p-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted small mb-1">Tasa de Conversión</p>
                      <h3 class="fw-bold mb-0">{{ revenue()!.conversionRate.toFixed(1) }}%</h3>
                    </div>
                    <div class="stat-icon bg-gradient rounded-circle">
                      <i class="bi bi-percent text-white"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <div class="row g-4">
            <!-- Revenue Chart -->
            <div class="col-lg-8">
              <div class="card-modern p-4 h-100">
                <h5 class="fw-bold mb-4">Ingresos por Mes</h5>
                
                @if (revenue() && revenue()!.revenueByMonth.length > 0) {
                  <div class="revenue-chart">
                    @for (month of revenue()!.revenueByMonth; track month.month) {
                      <div class="chart-item">
                        <div class="chart-bar-wrapper">
                          <div 
                            class="chart-bar bg-gradient"
                            [style.height.%]="getBarHeight(month.revenue)"
                            [title]="'$' + month.revenue">
                          </div>
                        </div>
                        <small class="chart-label">{{ formatMonth(month.month) }}</small>
                        <div class="chart-value fw-bold">{{ '$' + month.revenue }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-5 text-muted">
                    <i class="bi bi-graph-down display-4"></i>
                    <p class="mt-3">No hay datos de ingresos para este período</p>
                  </div>
                }
              </div>
            </div>

            <!-- Top Courses -->
            <div class="col-lg-4">
              <div class="card-modern p-4 h-100">
                <h5 class="fw-bold mb-4">Cursos Más Rentables</h5>
                
                @if (revenue() && revenue()!.topPerformingCourses.length > 0) {
                  <div class="list-group list-group-flush">
                    @for (course of revenue()!.topPerformingCourses.slice(0, 5); track course.courseId) {
                      <div class="list-group-item px-0 py-3">
                        <div class="d-flex justify-content-between align-items-start">
                          <div class="flex-grow-1 me-3">
                            <h6 class="fw-semibold mb-1">{{ course.courseTitle }}</h6>
                            <small class="text-muted">
                              {{ course.enrollments }} inscripciones
                            </small>
                          </div>
                          <div class="text-end">
                            <div class="fw-bold text-success">{{ '$' + course.revenue }}</div>
                          </div>
                        </div>
                        <div class="progress mt-2" style="height: 4px;">
                          <div 
                            class="progress-bar bg-gradient" 
                            [style.width.%]="getPercentage(course.revenue)">
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-4 text-muted">
                    <i class="bi bi-inbox display-4"></i>
                    <p class="mt-3 small">No hay datos disponibles</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Course Performance -->
          <div class="row g-4 mt-4">
            <div class="col-12">
              <div class="card-modern p-4">
                <h5 class="fw-bold mb-4">Rendimiento por Curso</h5>
                
                @if (myCourses().length > 0) {
                  <div class="table-responsive">
                    <table class="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Curso</th>
                          <th>Estudiantes</th>
                          <th>Rating</th>
                          <th>Reseñas</th>
                          <th>Ingresos</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (course of myCourses(); track course.id) {
                          <tr>
                            <td>
                              <div class="d-flex align-items-center gap-3">
                                @if (course.thumbnail) {
                                  <img 
                                    [src]="course.thumbnail" 
                                    [alt]="course.title"
                                    class="rounded"
                                    width="60"
                                    height="40"
                                    style="object-fit: cover;">
                                }
                                <div>
                                  <div class="fw-semibold">{{ course.title }}</div>
                                  <small class="text-muted">{{ getCategoryLabel(course.category) }}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>{{ course.enrolledStudents }}</strong>
                            </td>
                            <td>
                              <div class="d-flex align-items-center gap-1">
                                <i class="bi bi-star-fill text-warning"></i>
                                <strong>{{ course.rating.toFixed(1) }}</strong>
                              </div>
                            </td>
                            <td>{{ course.totalReviews }}</td>
                            <td>
                              <strong class="text-success">
                                {{ '$' + (course.price * course.enrolledStudents) }}
                              </strong>
                            </td>
                            <td>
                              <span 
                                class="badge"
                                [class.bg-success]="course.status === 'PUBLISHED'"
                                [class.bg-warning]="course.status === 'PENDING'"
                                [class.bg-secondary]="course.status === 'DRAFT'">
                                {{ getStatusLabel(course.status) }}
                              </span>
                            </td>
                            <td>
                              <div class="btn-group btn-group-sm">
                                <a 
                                  [routerLink]="['/courses', course.id]"
                                  class="btn btn-outline-primary"
                                  target="_blank">
                                  <i class="bi bi-eye"></i>
                                </a>
                                <a 
                                  [routerLink]="['/teacher/course-form', course.id]"
                                  class="btn btn-outline-secondary">
                                  <i class="bi bi-pencil"></i>
                                </a>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="text-center py-5 text-muted">
                    <i class="bi bi-inbox display-3"></i>
                    <p class="mt-3">No tienes cursos creados</p>
                    <a routerLink="/teacher/course-form" class="btn btn-gradient mt-2">
                      Crear Mi Primer Curso
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Student Engagement & Activity -->
          <div class="row g-4 mt-4">
            <div class="col-md-6">
              <div class="card-modern p-4">
                <h5 class="fw-bold mb-4">
                  <i class="bi bi-people-fill me-2"></i>
                  Engagement de Estudiantes
                </h5>
                
                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Tasa de Finalización</span>
                    <strong>67%</strong>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-success" style="width: 67%"></div>
                  </div>
                </div>

                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Participación en Clases</span>
                    <strong>82%</strong>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-gradient" style="width: 82%"></div>
                  </div>
                </div>

                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Entrega de Tareas</span>
                    <strong>74%</strong>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-info" style="width: 74%"></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Satisfacción General</span>
                    <strong>4.6/5.0</strong>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-warning" style="width: 92%"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card-modern p-4">
                <h5 class="fw-bold mb-4">
                  <i class="bi bi-clock-history me-2"></i>
                  Actividad Reciente
                </h5>
                
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-icon bg-success">
                      <i class="bi bi-person-plus text-white"></i>
                    </div>
                    <div class="timeline-content">
                      <small class="text-muted">Hace 2 horas</small>
                      <p class="mb-0"><strong>5 nuevos estudiantes</strong> inscritos</p>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon bg-primary">
                      <i class="bi bi-star-fill text-white"></i>
                    </div>
                    <div class="timeline-content">
                      <small class="text-muted">Hace 5 horas</small>
                      <p class="mb-0"><strong>Nueva reseña 5★</strong></p>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon bg-warning">
                      <i class="bi bi-camera-video text-white"></i>
                    </div>
                    <div class="timeline-content">
                      <small class="text-muted">Ayer</small>
                      <p class="mb-0"><strong>Clase en vivo</strong> - 45 asistentes</p>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon bg-info">
                      <i class="bi bi-chat-dots text-white"></i>
                    </div>
                    <div class="timeline-content">
                      <small class="text-muted">Hace 2 días</small>
                      <p class="mb-0"><strong>12 nuevas preguntas</strong> en el foro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
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
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .revenue-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 0.5rem;
      height: 250px;
      padding: 1rem 0;
    }

    .chart-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-bar-wrapper {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: flex-end;
    }

    .chart-bar {
      width: 100%;
      min-height: 20px;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        opacity: 0.8;
        transform: translateY(-5px);
      }
    }

    .chart-label {
      font-size: 0.75rem;
      text-align: center;
    }

    .chart-value {
      font-size: 0.85rem;
      text-align: center;
    }

    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 2rem;
      
      &:last-child {
        padding-bottom: 0;
      }
      
      &::before {
        content: '';
        position: absolute;
        left: -1.5rem;
        top: 2rem;
        width: 2px;
        height: calc(100% - 1rem);
        background: #e9ecef;
      }
      
      &:last-child::before {
        display: none;
      }
    }

    .timeline-icon {
      position: absolute;
      left: -2rem;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timeline-content {
      padding-left: 0.5rem;
    }
  `]
})
export class Analytics implements OnInit {
  private teacherService = inject(TeacherService);

  revenue = this.teacherService.revenue;
  myCourses = this.teacherService.myCourses;
  isLoading = signal<boolean>(false);
  selectedPeriod = signal<RevenuePeriod>(RevenuePeriod.LAST_30_DAYS);

  periods = [
    { value: RevenuePeriod.LAST_7_DAYS, label: 'Últimos 7 días' },
    { value: RevenuePeriod.LAST_30_DAYS, label: 'Últimos 30 días' },
    { value: RevenuePeriod.LAST_90_DAYS, label: 'Últimos 90 días' },
    { value: RevenuePeriod.LAST_YEAR, label: 'Último año' },
    { value: RevenuePeriod.ALL_TIME, label: 'Todo el tiempo' },
  ];

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);

    this.teacherService.getRevenue(this.selectedPeriod()).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading revenue:', error);
        this.isLoading.set(false);
      }
    });

    this.teacherService.getMyCourses().subscribe({
      error: (error) => console.error('Error loading courses:', error)
    });
  }

  changePeriod(period: RevenuePeriod): void {
    this.selectedPeriod.set(period);
    this.loadAnalytics();
  }

  getBarHeight(revenue: number): number {
    if (!this.revenue() || this.revenue()!.revenueByMonth.length === 0) {
      return 0;
    }
    const maxRevenue = Math.max(...this.revenue()!.revenueByMonth.map(m => m.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }

  getPercentage(revenue: number): number {
    if (!this.revenue() || this.revenue()!.totalRevenue === 0) {
      return 0;
    }
    return (revenue / this.revenue()!.totalRevenue) * 100;
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[parseInt(monthNum) - 1];
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PUBLISHED': 'Publicado',
      'PENDING': 'Pendiente',
      'DRAFT': 'Borrador',
    };
    return labels[status] || status;
  }
}