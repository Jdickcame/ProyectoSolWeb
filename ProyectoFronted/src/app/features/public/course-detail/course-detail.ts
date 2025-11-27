import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { RatingStars } from '../../../shared/components/rating-stars/rating-stars';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { CourseService } from '../../../core/services/course';
import { AuthService } from '../../../core/services/auth';
import { StudentService } from '../../../core/services/student';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, RatingStars, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    @if (isLoading()) {
      <div class="min-vh-100 d-flex align-items-center justify-content-center">
        <app-loading-spinner [size]="60" message="Cargando curso..."></app-loading-spinner>
      </div>
    } @else if (course()) {
      <!-- Hero Section -->
      <section class="course-hero bg-dark-theme text-white py-5">
        <div class="container">
          <div class="row">
            <div class="col-lg-8">
              <!-- Breadcrumb -->
              <nav aria-label="breadcrumb" class="mb-3">
                <ol class="breadcrumb">
                  <li class="breadcrumb-item">
                    <a routerLink="/courses" class="text-white-50">Cursos</a>
                  </li>
                  <li class="breadcrumb-item">
                    <span class="text-white-50">{{ getCategoryLabel(course()!.category) }}</span>
                  </li>
                  <li class="breadcrumb-item active text-white">{{ course()!.title }}</li>
                </ol>
              </nav>

              <!-- Title -->
              <h1 class="display-5 fw-bold mb-3">{{ course()!.title }}</h1>
              
              <!-- Short Description -->
              <p class="lead text-white-50 mb-4">{{ course()!.shortDescription }}</p>

              <!-- Meta Info -->
              <div class="d-flex flex-wrap gap-4 align-items-center mb-4">
                <div class="d-flex align-items-center gap-2">
                  <app-rating-stars [rating]="course()!.rating" [showValue]="true"></app-rating-stars>
                  <small class="text-white-50">({{ course()!.totalReviews }} reseñas)</small>
                </div>
                <div>
                  <i class="bi bi-people me-2"></i>
                  <span>{{ course()!.enrolledStudents }} estudiantes</span>
                </div>
                <div>
                  <span class="badge badge-gradient">{{ getLevelLabel(course()!.level) }}</span>
                </div>
              </div>

              <!-- Teacher -->
              <div class="d-flex align-items-center gap-3">
                @if (course()!.teacherAvatar) {
                  <img 
                    [src]="course()!.teacherAvatar" 
                    [alt]="course()!.teacherName"
                    class="rounded-circle"
                    width="50"
                    height="50">
                }
                <div>
                  <small class="text-white-50">Creado por</small>
                  <div class="fw-semibold">{{ course()!.teacherName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <section class="py-5">
        <div class="container">
          <div class="row">
            <!-- Left Column - Course Info -->
            <div class="col-lg-8 mb-4">
              <!-- Preview Video/Image -->
              @if (course()!.thumbnail) {
                <div class="course-preview mb-4 rounded-3 overflow-hidden">
                  <img 
                    [src]="course()!.thumbnail" 
                    [alt]="course()!.title"
                    class="w-100">
                </div>
              }

              <!-- Description -->
              <div class="card-modern p-4 mb-4">
                <h4 class="fw-bold mb-3">Descripción</h4>
                <p class="text-muted">{{ course()!.description }}</p>
              </div>

              <!-- What you'll learn -->
              @if (course()!.learningObjectives && course()!.learningObjectives.length > 0) {
                <div class="card-modern p-4 mb-4">
                  <h4 class="fw-bold mb-3">Lo que aprenderás</h4>
                  <div class="row">
                    @for (objective of course()!.learningObjectives; track $index) {
                      <div class="col-md-6 mb-2">
                        <div class="d-flex gap-2">
                          <i class="bi bi-check-circle-fill text-success"></i>
                          <span>{{ objective }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Requirements -->
              @if (course()!.requirements && course()!.requirements.length > 0) {
                <div class="card-modern p-4 mb-4">
                  <h4 class="fw-bold mb-3">Requisitos</h4>
                  <ul class="list-unstyled">
                    @for (req of course()!.requirements; track $index) {
                      <li class="mb-2">
                        <i class="bi bi-dot"></i> {{ req }}
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Course Content -->
              @if (course()!.syllabus && course()!.syllabus.sections && course()!.syllabus.sections.length > 0) {
                <div class="card-modern p-4 mb-4">
                  <h4 class="fw-bold mb-3">Contenido del curso</h4>
                  <div class="accordion" id="syllabusAccordion">
                    @for (section of course()!.syllabus.sections; track section.id) {
                      <div class="accordion-item border-0 mb-2">
                        <h2 class="accordion-header">
                          <button 
                            class="accordion-button collapsed" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            [attr.data-bs-target]="'#section' + $index">
                            <strong>{{ section.title }}</strong>
                            <span class="ms-auto me-3 text-muted small">
                              {{ section.lessons && section.lessons.length || 0 }} lecciones
                            </span>
                          </button>
                        </h2>
                        <div 
                          [id]="'section' + $index" 
                          class="accordion-collapse collapse" 
                          data-bs-parent="#syllabusAccordion">
                          <div class="accordion-body">
                            @if (section.lessons && section.lessons.length > 0) {
                              <ul class="list-unstyled mb-0">
                                @for (lesson of section.lessons; track lesson.id) {
                                  <li class="d-flex justify-content-between align-items-center py-2 border-bottom">
                                    <div>
                                      <i class="bi bi-play-circle me-2"></i>
                                      {{ lesson.title }}
                                    </div>
                                    <small class="text-muted">{{ lesson.duration }} min</small>
                                  </li>
                                }
                              </ul>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Right Column - Enrollment Card -->
            <div class="col-lg-4">
              <div class="card-modern p-4 sticky-top" style="top: 100px;">
                <!-- Price -->
                <div class="text-center mb-4">
                  @if (course()!.price === 0) {
                    <h2 class="display-4 fw-bold text-success mb-0">Gratis</h2>
                  } @else {
                    <h2 class="display-4 fw-bold mb-0">
                      {{ course()!.currency }} {{ course()!.price }}
                    </h2>
                  }
                </div>

                <!-- Enroll Button -->
                @if (isAuthenticated()) {
                  @if (isEnrolled()) {
                    <button class="btn btn-success w-100 btn-lg mb-3" disabled>
                      <i class="bi bi-check-circle me-2"></i>
                      Ya inscrito
                    </button>
                    <a routerLink="/student/my-courses" class="btn btn-outline-primary w-100">
                      Ir a mis cursos
                    </a>
                  } @else {
                    <button 
                      class="btn btn-gradient w-100 btn-lg mb-3"
                      (click)="enrollNow()"
                      [disabled]="isEnrolling()">
                      @if (isEnrolling()) {
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      } @else {
                        <i class="bi bi-cart-plus me-2"></i>
                        Inscribirse Ahora
                      }
                    </button>
                  }
                } @else {
                  <a routerLink="/auth/login" class="btn btn-gradient w-100 btn-lg mb-3">
                    Inicia sesión para inscribirte
                  </a>
                }

                <hr class="my-4">

                <!-- Course Details -->
                <h6 class="fw-bold mb-3">Este curso incluye:</h6>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <i class="bi bi-clock me-2 text-primary"></i>
                    <strong>{{ course()!.totalDuration }}</strong> minutos de contenido
                  </li>
                  @if (course()!.hasLiveClasses) {
                    <li class="mb-3">
                      <i class="bi bi-camera-video me-2 text-primary"></i>
                      Clases en vivo
                    </li>
                  }
                  @if (course()!.hasCertificate) {
                    <li class="mb-3">
                      <i class="bi bi-award me-2 text-primary"></i>
                      Certificado de finalización
                    </li>
                  }
                  <li class="mb-3">
                    <i class="bi bi-phone me-2 text-primary"></i>
                    Acceso en móvil y PC
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-infinity me-2 text-primary"></i>
                    Acceso de por vida
                  </li>
                </ul>

                <hr class="my-4">

                <!-- Share -->
                <div class="text-center">
                  <small class="text-muted d-block mb-2">Compartir este curso</small>
                  <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-facebook"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-twitter"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-whatsapp"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-link-45deg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    } @else {
      <div class="min-vh-100 d-flex align-items-center justify-content-center">
        <div class="text-center">
          <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
          <h3 class="mt-4">Curso no encontrado</h3>
          <p class="text-muted">El curso que buscas no existe o ha sido eliminado</p>
          <a routerLink="/courses" class="btn btn-gradient mt-3">Ver todos los cursos</a>
        </div>
      </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    .course-hero {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
    }

    .breadcrumb {
      background: transparent;
      margin-bottom: 0;
      padding: 0;
    }

    .breadcrumb-item + .breadcrumb-item::before {
      color: rgba(255, 255, 255, 0.5);
    }

    .course-preview {
      max-height: 400px;
      
      img {
        object-fit: cover;
        height: 400px;
      }
    }

    .accordion-button {
      background-color: #f8f9fa;
      
      &:not(.collapsed) {
        background-color: #e9ecef;
      }
    }
  `]
})
export class CourseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private studentService = inject(StudentService);

  course = signal<Course | null>(null);
  isLoading = signal<boolean>(false);
  isEnrolled = signal<boolean>(false);
  isEnrolling = signal<boolean>(false);

  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = params['id'];
      if (courseId) {
        this.loadCourse(courseId);
        if (this.isAuthenticated()) {
          this.checkEnrollment(courseId);
        }
      }
    });
  }

  loadCourse(courseId: string): void {
    this.isLoading.set(true);
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.course.set(course);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading.set(false);
        this.course.set(null);
      }
    });
  }

  checkEnrollment(courseId: string): void {
    this.studentService.isEnrolledInCourse(courseId).subscribe({
      next: (enrolled) => {
        this.isEnrolled.set(enrolled);
      },
      error: () => {
        this.isEnrolled.set(false);
      }
    });
  }

  enrollNow(): void {
    const currentCourse = this.course();
    if (!currentCourse) return;

    this.isEnrolling.set(true);

    this.studentService.enrollInCourse({
      courseId: currentCourse.id,
      paymentMethod: currentCourse.price === 0 ? 'FREE' as any : 'CREDIT_CARD' as any
    }).subscribe({
      next: () => {
        this.isEnrolling.set(false);
        this.isEnrolled.set(true);
        alert('¡Inscripción exitosa! Ya puedes acceder al curso.');
        this.router.navigate(['/student/my-courses']);
      },
      error: (error) => {
        this.isEnrolling.set(false);
        alert(error.message || 'Error al inscribirse. Intenta nuevamente.');
      }
    });
  }

  getCategoryLabel(category: string): string {
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
    };
    return categories[category] || category;
  }

  getLevelLabel(level: string): string {
    const levels: { [key: string]: string } = {
      'BEGINNER': 'Principiante',
      'INTERMEDIATE': 'Intermedio',
      'ADVANCED': 'Avanzado',
      'ALL_LEVELS': 'Todos los niveles'
    };
    return levels[level] || level;
  }
}