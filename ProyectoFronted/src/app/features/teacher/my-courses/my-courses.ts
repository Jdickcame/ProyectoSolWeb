import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { TeacherService } from '../../../core/services/teacher';

@Component({
  selector: 'app-teacher-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="my-courses-page bg-light min-vh-100 py-5">
      <div class="container">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 class="fw-bold mb-2">Mis Cursos</h2>
            <p class="text-muted mb-0">Gestiona y edita tus cursos</p>
          </div>
          <a routerLink="/teacher/course-form" class="btn btn-gradient">
            <i class="bi bi-plus-circle me-2"></i>
            Crear Curso
          </a>
        </div>

        @if (isLoading()) {
          <div class="text-center py-5">
            <app-loading-spinner [size]="60" message="Cargando cursos..."></app-loading-spinner>
          </div>
        } @else if (myCourses().length > 0) {
          <div class="row g-4">
            @for (course of myCourses(); track course.id) {
              <div class="col-lg-4 col-md-6">
                <div class="course-card card-modern h-100">
                  <!-- Thumbnail -->
                  <div class="course-thumbnail position-relative">
                    @if (course.thumbnail) {
                      <img [src]="course.thumbnail" [alt]="course.title" class="w-100">
                    } @else {
                      <div class="placeholder-thumbnail bg-gradient">
                        <i class="bi bi-play-circle text-white fs-1"></i>
                      </div>
                    }
                    
                    <!-- Status Badge -->
                    <span 
                      class="badge position-absolute top-0 end-0 m-2"
                      [class.bg-success]="course.status === 'PUBLISHED'"
                      [class.bg-warning]="course.status === 'PENDING'"
                      [class.bg-secondary]="course.status === 'DRAFT'"
                      [class.bg-danger]="course.status === 'REJECTED'">
                      {{ getStatusLabel(course.status) }}
                    </span>
                  </div>

                  <!-- Content -->
                  <div class="p-3">
                    <h6 class="fw-bold mb-3">{{ course.title }}</h6>

                    <!-- Stats -->
                    <div class="row g-2 mb-3">
                      <div class="col-4 text-center">
                        <i class="bi bi-people text-muted d-block"></i>
                        <small class="fw-bold">{{ course.enrolledStudents }}</small>
                        <small class="d-block text-muted">Estudiantes</small>
                      </div>
                      <div class="col-4 text-center">
                        <i class="bi bi-star-fill text-warning d-block"></i>
                        <small class="fw-bold">{{ course.rating.toFixed(1) }}</small>
                        <small class="d-block text-muted">Rating</small>
                      </div>
                      <div class="col-4 text-center">
                        <i class="bi bi-currency-dollar text-muted d-block"></i>
                        <small class="fw-bold">{{ course.price }}</small>
                        <small class="d-block text-muted">Precio</small>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="d-flex gap-2">
                      <a 
                        [routerLink]="['/courses', course.id]" 
                        class="btn btn-sm btn-outline-primary flex-grow-1">
                        <i class="bi bi-eye me-1"></i>
                        Ver
                      </a>
                      <a 
                        [routerLink]="['/teacher/course-form', course.id]" 
                        class="btn btn-sm btn-gradient flex-grow-1">
                        <i class="bi bi-pencil me-1"></i>
                        Editar
                      </a>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        (click)="confirmDelete(course.id, course.title)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="card-modern p-5 text-center">
            <i class="bi bi-inbox display-3 text-muted"></i>
            <h4 class="mt-4 mb-2">No tienes cursos creados</h4>
            <p class="text-muted mb-4">Crea tu primer curso y comienza a compartir tu conocimiento</p>
            <a routerLink="/teacher/course-form" class="btn btn-gradient btn-lg">
              <i class="bi bi-plus-circle me-2"></i>
              Crear Mi Primer Curso
            </a>
          </div>
        }
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .course-thumbnail {
      height: 200px;
      overflow: hidden;
      
      img {
        height: 100%;
        object-fit: cover;
      }
    }

    .placeholder-thumbnail {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .course-card {
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
      }
    }
  `]
})
export class MyCourses implements OnInit {
  private teacherService = inject(TeacherService);

  myCourses = this.teacherService.myCourses;
  isLoading = this.teacherService.isLoading;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.teacherService.getMyCourses().subscribe({
      error: (error) => console.error('Error loading courses:', error)
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

  confirmDelete(courseId: string, courseTitle: string): void {
    if (confirm(`¿Estás seguro de eliminar el curso "${courseTitle}"?`)) {
      this.teacherService.deleteCourse(courseId).subscribe({
        next: () => {
          alert('Curso eliminado exitosamente');
        },
        error: (error) => {
          alert('Error al eliminar el curso: ' + error.message);
        }
      });
    }
  }
}