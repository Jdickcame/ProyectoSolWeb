// ==========================================================================
// STUDENT SERVICE
// Servicio para operaciones específicas de estudiantes
// ==========================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  Course,
  Enrollment,
  CreateEnrollmentDto,
  CourseProgress,
  Review,
  CreateReviewDto,
  UpdateReviewDto,
  LiveClass,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Signals para estado local
  private enrolledCoursesSignal = signal<Course[]>([]);
  private enrollmentsSignal = signal<Enrollment[]>([]);
  private progressSignal = signal<Map<string, CourseProgress>>(new Map());
  private upcomingClassesSignal = signal<LiveClass[]>([]);
  private loadingSignal = signal<boolean>(false);

  // Computed signals
  readonly enrolledCourses = computed(() => this.enrolledCoursesSignal());
  readonly enrollments = computed(() => this.enrollmentsSignal());
  readonly upcomingClasses = computed(() => this.upcomingClassesSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly totalEnrolledCourses = computed(() => this.enrolledCoursesSignal().length);
  
  // Progreso total (promedio)
  readonly overallProgress = computed(() => {
    const progressMap = this.progressSignal();
    if (progressMap.size === 0) return 0;
    
    const total = Array.from(progressMap.values())
      .reduce((sum, p) => sum + p.progressPercentage, 0);
    return Math.round(total / progressMap.size);
  });

  /**
   * Obtener cursos inscritos del estudiante
   */
  getEnrolledCourses(): Observable<Course[]> {
    this.loadingSignal.set(true);
    
    return this.http.get<Course[]>(`${this.API_URL}/students/enrolled-courses`)
      .pipe(
        tap(courses => {
          this.enrolledCoursesSignal.set(courses);
          this.loadingSignal.set(false);
          console.log(`✅ ${courses.length} cursos inscritos cargados`);
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Inscribirse a un curso
   */
  enrollInCourse(enrollmentData: CreateEnrollmentDto): Observable<Enrollment> {
    this.loadingSignal.set(true);
    
    return this.http.post<Enrollment>(`${this.API_URL}/enrollments`, enrollmentData)
      .pipe(
        tap(enrollment => {
          // Agregar a la lista de inscripciones
          this.enrollmentsSignal.update(enrollments => [...enrollments, enrollment]);
          this.loadingSignal.set(false);
          console.log('✅ Inscripción exitosa');
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener progreso en un curso específico
   */
  getCourseProgress(courseId: string): Observable<CourseProgress> {
    return this.http.get<CourseProgress>(`${this.API_URL}/students/courses/${courseId}/progress`)
      .pipe(
        tap(progress => {
          // Actualizar en el Map
          this.progressSignal.update(map => {
            map.set(courseId, progress);
            return new Map(map);
          });
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Marcar lección como completada
   */
  completeLesson(courseId: string, lessonId: string): Observable<CourseProgress> {
    return this.http.post<CourseProgress>(
      `${this.API_URL}/students/courses/${courseId}/lessons/${lessonId}/complete`,
      {}
    ).pipe(
      tap(updatedProgress => {
        // Actualizar progreso en el Map
        this.progressSignal.update(map => {
          map.set(courseId, updatedProgress);
          return new Map(map);
        });
        console.log('✅ Lección completada');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener próximas clases en vivo
   */
  getUpcomingLiveClasses(): Observable<LiveClass[]> {
    return this.http.get<LiveClass[]>(`${this.API_URL}/students/upcoming-classes`)
      .pipe(
        tap(classes => {
          this.upcomingClassesSignal.set(classes);
          console.log(`✅ ${classes.length} clases próximas`);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Registrar asistencia a clase en vivo
   */
  attendLiveClass(liveClassId: string): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/students/live-classes/${liveClassId}/attend`,
      {}
    ).pipe(
      tap(() => console.log('✅ Asistencia registrada')),
      catchError(this.handleError)
    );
  }

  /**
   * Crear reseña para un curso
   */
  createReview(reviewData: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(`${this.API_URL}/reviews`, reviewData)
      .pipe(
        tap(review => console.log('✅ Reseña creada:', review.rating, 'estrellas')),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar reseña existente
   */
  updateReview(reviewId: string, updates: UpdateReviewDto): Observable<Review> {
    return this.http.patch<Review>(`${this.API_URL}/reviews/${reviewId}`, updates)
      .pipe(
        tap(() => console.log('✅ Reseña actualizada')),
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar reseña
   */
  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/reviews/${reviewId}`)
      .pipe(
        tap(() => console.log('✅ Reseña eliminada')),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener certificado de un curso completado
   */
  getCertificate(courseId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/students/courses/${courseId}/certificate`, {
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ Certificado descargado')),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener historial de inscripciones
   */
  getEnrollmentHistory(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.API_URL}/students/enrollments`)
      .pipe(
        tap(enrollments => {
          this.enrollmentsSignal.set(enrollments);
          console.log(`✅ ${enrollments.length} inscripciones en el historial`);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verificar si está inscrito en un curso
   */
  isEnrolledInCourse(courseId: string): Observable<boolean> {
    return this.http.get<{ enrolled: boolean }>(
      `${this.API_URL}/students/courses/${courseId}/is-enrolled`
    ).pipe(
      tap(response => console.log(`Inscrito en ${courseId}:`, response.enrolled)),
      catchError(this.handleError),
      // @ts-ignore
      map(response => response.enrolled)
    );
  }

  /**
   * Limpiar datos
   */
  clearData(): void {
    this.enrolledCoursesSignal.set([]);
    this.enrollmentsSignal.set([]);
    this.progressSignal.set(new Map());
    this.upcomingClassesSignal.set([]);
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicia sesión';
          break;
        case 403:
          errorMessage = 'No tienes permiso para esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'Ya estás inscrito en este curso';
          break;
        case 500:
          errorMessage = 'Error del servidor';
          break;
        default:
          errorMessage = error.error?.message || 'Error en la operación';
      }
    }

    console.error('❌ Error en StudentService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}