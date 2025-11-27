import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (course) {
      <div class="course-card card-modern h-100">
        <!-- Thumbnail -->
        <div class="course-thumbnail position-relative">
          @if (course.thumbnail) {
            <img 
              [src]="course.thumbnail" 
              [alt]="course.title"
              class="w-100">
          } @else {
            <div class="placeholder-thumbnail bg-gradient d-flex align-items-center justify-content-center">
              <i class="bi bi-play-circle text-white" style="font-size: 3rem;"></i>
            </div>
          }
          
          <!-- Badge de nivel -->
          <span class="badge badge-gradient position-absolute top-0 end-0 m-2">
            {{ getLevelText(course.level) }}
          </span>
          
          <!-- Badge de precio -->
          @if (course.price === 0) {
            <span class="badge bg-success position-absolute top-0 start-0 m-2">
              Gratis
            </span>
          }
        </div>

        <!-- Contenido -->
        <div class="course-content p-3">
          <!-- Categoría -->
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-secondary small">
              {{ getCategoryText(course.category) }}
            </span>
            @if (course.hasLiveClasses) {
              <span class="badge bg-danger small">
                <i class="bi bi-camera-video me-1"></i>En Vivo
              </span>
            }
          </div>

          <!-- Título -->
          <h5 class="course-title mb-2">
            <a [routerLink]="['/courses', course.id]" class="text-decoration-none text-dark">
              {{ course.title }}
            </a>
          </h5>

          <!-- Descripción corta -->
          @if (course.shortDescription) {
            <p class="text-muted small mb-3">
              {{ course.shortDescription | slice:0:80 }}{{ course.shortDescription.length > 80 ? '...' : '' }}
            </p>
          }

          <!-- Profesor -->
          <div class="d-flex align-items-center gap-2 mb-3">
            @if (course.teacherAvatar) {
              <img 
                [src]="course.teacherAvatar" 
                [alt]="course.teacherName"
                class="rounded-circle"
                width="24"
                height="24">
            }
            <small class="text-muted">{{ course.teacherName }}</small>
          </div>

          <!-- Rating y estudiantes -->
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-1">
              <i class="bi bi-star-fill text-warning"></i>
              <span class="fw-semibold">{{ course.rating.toFixed(1) }}</span>
              <small class="text-muted">({{ course.totalReviews }})</small>
            </div>
            <small class="text-muted">
              <i class="bi bi-people me-1"></i>{{ course.enrolledStudents }}
            </small>
          </div>

          <!-- Precio y botón -->
          <div class="d-flex align-items-center justify-content-between">
            @if (course.price === 0) {
              <span class="h5 mb-0 text-success fw-bold">Gratis</span>
            } @else {
              <span class="h5 mb-0 fw-bold">
                {{ course.currency }} {{ course.price }}
              </span>
            }
            <a 
              [routerLink]="['/courses', course.id]" 
              class="btn btn-sm btn-gradient">
              Ver Curso
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .course-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
      border: none;
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      }
    }

    .course-thumbnail {
      height: 200px;
      overflow: hidden;
      
      img {
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .placeholder-thumbnail {
      height: 200px;
    }

    .course-title {
      font-size: 1.1rem;
      line-height: 1.4;
      
      a {
        transition: color 0.2s;
        
        &:hover {
          color: #6366F1 !important;
        }
      }
    }
  `]
})
export class CourseCard {
  @Input() course!: Course;

  getLevelText(level: string): string {
    const levels: { [key: string]: string } = {
      'BEGINNER': 'Principiante',
      'INTERMEDIATE': 'Intermedio',
      'ADVANCED': 'Avanzado',
      'ALL_LEVELS': 'Todos los niveles'
    };
    return levels[level] || level;
  }

  getCategoryText(category: string): string {
    const categories: { [key: string]: string } = {
      'PROGRAMMING': 'Programación',
      'DESIGN': 'Diseño',
      'BUSINESS': 'Negocios',
      'MARKETING': 'Marketing',
      'LANGUAGES': 'Idiomas',
      'DATA_SCIENCE': 'Ciencia de Datos',
      'PERSONAL_DEVELOPMENT': 'Desarrollo Personal',
      'PHOTOGRAPHY': 'Fotografía',
      'MUSIC': 'Música',
      'OTHER': 'Otro'
    };
    return categories[category] || category;
  }
}