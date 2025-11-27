import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { RatingStars } from '../../../shared/components/rating-stars/rating-stars';
import { StudentService } from '../../../core/services/student';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner, RatingStars],
  template: `
    <app-navbar></app-navbar>

    <div class="my-courses-page bg-light min-vh-100 py-5">
      <div class="container">
        <!-- Header -->
        <div class="mb-5">
          <h2 class="fw-bold mb-2">Mis Cursos</h2>
          <p class="text-muted">Continúa tu aprendizaje donde lo dejaste</p>
        </div>

        @if (isLoading()) {
          <div class="text-center py-5">
            <app-loading-spinner [size]="60" message="Cargando cursos..."></app-loading-spinner>
          </div>
        } @else if (enrolledCourses().length > 0) {
          <div class="row g-4">
            @for (course of enrolledCourses(); track course.id) {
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
                    
                    <!-- Progress Bar -->
                    <div class="progress-overlay">
                      <div class="progress" style="height: 6px;">
                        <div 
                          class="progress-bar bg-gradient" 
                          [style.width.%]="getProgress(course.id)"
                          role="progressbar">
                        </div>
                      </div>
                      <small class="text-white">{{ getProgress(course.id) }}% completado</small>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="p-3">
                    <h6 class="fw-bold mb-2">{{ course.title }}</h6>
                    
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <small class="text-muted">{{ course.teacherName }}</small>
                    </div>

                    <div class="d-flex align-items-center justify-content-between">
                      <app-rating-stars [rating]="course.rating"></app-rating-stars>
                      <a 
                        [routerLink]="['/student/course-viewer', course.id]" 
                        class="btn btn-sm btn-gradient">
                        Continuar
                        <i class="bi bi-arrow-right ms-1"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="card-modern p-5 text-center">
            <i class="bi bi-inbox display-3 text-muted"></i>
            <h4 class="mt-4 mb-2">No tienes cursos inscritos</h4>
            <p class="text-muted mb-4">Explora nuestra biblioteca y comienza a aprender</p>
            <a routerLink="/courses" class="btn btn-gradient btn-lg">
              Explorar Cursos
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

    .progress-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      padding: 0.5rem;
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
  private studentService = inject(StudentService);

  enrolledCourses = this.studentService.enrolledCourses;
  isLoading = this.studentService.isLoading;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.studentService.getEnrolledCourses().subscribe({
      error: (error) => console.error('Error loading courses:', error)
    });
  }

  getProgress(courseId: string): number {
    // TODO: Implementar obtención de progreso real
    return Math.floor(Math.random() * 100);
  }
}