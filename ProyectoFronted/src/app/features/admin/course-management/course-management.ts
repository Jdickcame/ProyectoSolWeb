import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { RatingStars } from '../../../shared/components/rating-stars/rating-stars';
import { AdminService } from '../../../core/services/admin';
import { CourseService } from '../../../core/services/course';
import { Course, CourseStatus } from '../../../core/models';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer, LoadingSpinner, RatingStars],
  template: `
    <app-navbar></app-navbar>

    <div class="course-management-page bg-light min-vh-100 py-5">
      <div class="container-fluid px-4">
        <div class="mb-4">
          <h2 class="fw-bold mb-2">Gestión de Cursos</h2>
          <p class="text-muted mb-0">Administra y aprueba cursos de la plataforma</p>
        </div>

        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-3">
            <div class="stat-card card-modern p-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="text-muted small mb-1">Total Cursos</p>
                  <h3 class="fw-bold mb-0">{{ allCourses().length }}</h3>
                </div>
                <div class="stat-icon bg-gradient rounded-circle">
                  <i class="bi bi-collection text-white"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card card-modern p-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="text-muted small mb-1">Pendientes</p>
                  <h3 class="fw-bold mb-0">{{ pendingCourses().length }}</h3>
                </div>
                <div class="stat-icon bg-warning rounded-circle">
                  <i class="bi bi-clock-history text-white"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card card-modern p-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="text-muted small mb-1">Publicados</p>
                  <h3 class="fw-bold mb-0">{{ publishedCount() }}</h3>
                </div>
                <div class="stat-icon bg-success rounded-circle">
                  <i class="bi bi-check-circle text-white"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card card-modern p-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="text-muted small mb-1">Rechazados</p>
                  <h3 class="fw-bold mb-0">{{ rejectedCount() }}</h3>
                </div>
                <div class="stat-icon bg-danger rounded-circle">
                  <i class="bi bi-x-circle text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card-modern p-4 mb-4">
          <div class="row g-3">
            <div class="col-md-4">
              <input 
                type="text"
                class="form-control"
                placeholder="Buscar por título..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterCourses()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterStatus" (ngModelChange)="filterCourses()">
                <option value="">Todos los estados</option>
                <option value="PUBLISHED">Publicados</option>
                <option value="PENDING">Pendientes</option>
                <option value="DRAFT">Borradores</option>
                <option value="REJECTED">Rechazados</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterCategory" (ngModelChange)="filterCourses()">
                <option value="">Todas las categorías</option>
                <option value="PROGRAMMING">Programación</option>
                <option value="DESIGN">Diseño</option>
                <option value="BUSINESS">Negocios</option>
                <option value="MARKETING">Marketing</option>
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

        <!-- Courses Table -->
        <div class="card-modern p-4">
          @if (isLoading()) {
            <div class="text-center py-5">
              <app-loading-spinner [size]="50"></app-loading-spinner>
            </div>
          } @else if (filteredCourses().length > 0) {
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Profesor</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Estudiantes</th>
                    <th>Rating</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (course of filteredCourses(); track course.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center gap-3">
                          @if (course.thumbnail) {
                            <img 
                              [src]="course.thumbnail" 
                              [alt]="course.title"
                              class="rounded"
                              width="80"
                              height="60"
                              style="object-fit: cover;">
                          }
                          <div>
                            <div class="fw-semibold">{{ course.title }}</div>
                            <small class="text-muted">{{ course.shortDescription }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="fw-semibold">{{ course.teacherName }}</div>
                      </td>
                      <td>
                        <span class="badge bg-secondary">
                          {{ getCategoryLabel(course.category) }}
                        </span>
                      </td>
                      <td>
                        @if (course.price === 0) {
                          <span class="badge bg-success">Gratis</span>
                        } @else {
                          <strong>{{ '$' + course.price }}</strong>
                        }
                      </td>
                      <td>{{ course.enrolledStudents }}</td>
                      <td>
                        <app-rating-stars [rating]="course.rating"></app-rating-stars>
                        <small class="text-muted">({{ course.totalReviews }})</small>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          [class.bg-success]="course.status === 'PUBLISHED'"
                          [class.bg-warning]="course.status === 'PENDING'"
                          [class.bg-secondary]="course.status === 'DRAFT'"
                          [class.bg-danger]="course.status === 'REJECTED'">
                          {{ getStatusLabel(course.status) }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <a 
                            [routerLink]="['/courses', course.id]"
                            class="btn btn-outline-primary"
                            target="_blank"
                            title="Ver">
                            <i class="bi bi-eye"></i>
                          </a>
                          @if (course.status === 'PENDING') {
                            <button 
                              class="btn btn-outline-success"
                              (click)="approveCourse(course.id, course.title)"
                              title="Aprobar">
                              <i class="bi bi-check-lg"></i>
                            </button>
                            <button 
                              class="btn btn-outline-danger"
                              (click)="rejectCourse(course.id, course.title)"
                              title="Rechazar">
                              <i class="bi bi-x-lg"></i>
                            </button>
                          }
                          @if (course.status === 'PUBLISHED') {
                            <button 
                              class="btn btn-outline-warning"
                              (click)="unpublishCourse(course.id, course.title)"
                              title="Despublicar">
                              <i class="bi bi-pause-circle"></i>
                            </button>
                          }
                          <button 
                            class="btn btn-outline-danger"
                            (click)="deleteCourse(course.id, course.title)"
                            title="Eliminar">
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
              <i class="bi bi-inbox display-3 text-muted"></i>
              <p class="mt-3 text-muted">No se encontraron cursos</p>
            </div>
          }
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
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CourseManagement implements OnInit {
  private adminService = inject(AdminService);
  private courseService = inject(CourseService);

  pendingCourses = this.adminService.pendingCourses;
  allCourses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  isLoading = signal<boolean>(false);

  searchQuery: string = '';
  filterStatus: string = '';
  filterCategory: string = '';

  publishedCount = signal<number>(0);
  rejectedCount = signal<number>(0);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);

    this.courseService.getCourses({}).subscribe({
      next: (response) => {
        this.allCourses.set(response.courses);
        this.filteredCourses.set(response.courses);
        this.updateCounts();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading.set(false);
      }
    });

    this.adminService.getPendingCourses().subscribe({
      error: (error) => console.error('Error loading pending courses:', error)
    });
  }

  updateCounts(): void {
    const courses = this.allCourses();
    this.publishedCount.set(courses.filter(c => c.status === 'PUBLISHED').length);
    this.rejectedCount.set(courses.filter(c => c.status === 'REJECTED').length);
  }

  filterCourses(): void {
    let filtered = this.allCourses();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.shortDescription?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus) {
      filtered = filtered.filter(c => c.status === this.filterStatus);
    }

    if (this.filterCategory) {
      filtered = filtered.filter(c => c.category === this.filterCategory);
    }

    this.filteredCourses.set(filtered);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterCategory = '';
    this.filteredCourses.set(this.allCourses());
  }

  approveCourse(courseId: string, title: string): void {
    if (confirm(`¿Aprobar el curso "${title}"?`)) {
      this.adminService.approveCourse(courseId).subscribe({
        next: () => {
          alert('Curso aprobado');
          this.loadCourses();
        },
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }

  rejectCourse(courseId: string, title: string): void {
    const reason = prompt(`¿Por qué rechazas "${title}"?`);
    if (reason) {
      this.adminService.rejectCourse(courseId, reason).subscribe({
        next: () => {
          alert('Curso rechazado');
          this.loadCourses();
        },
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }

  unpublishCourse(courseId: string, title: string): void {
    if (confirm(`¿Despublicar el curso "${title}"?`)) {
      alert('Funcionalidad pendiente de implementación');
    }
  }

  deleteCourse(courseId: string, title: string): void {
    if (confirm(`¿ELIMINAR permanentemente "${title}"?`)) {
      alert('Funcionalidad pendiente de implementación');
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PUBLISHED': 'Publicado',
      'PENDING': 'Pendiente',
      'DRAFT': 'Borrador',
      'REJECTED': 'Rechazado'
    };
    return labels[status] || status;
  }
}