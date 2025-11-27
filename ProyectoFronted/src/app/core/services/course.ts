// ==========================================================================
// COURSE SERVICE
// Servicio para gestión de cursos con Signals
// ==========================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import {
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilters,
  CoursePaginatedResponse,
  CourseStatus,
  CourseProgress,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Signals para estado local
  private coursesSignal = signal<Course[]>([]);
  private loadingSignal = signal<boolean>(false);
  private selectedCourseSignal = signal<Course | null>(null);
  private totalCoursesSignal = signal<number>(0);

  // Computed signals (solo lectura)
  readonly courses = computed(() => this.coursesSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly selectedCourse = computed(() => this.selectedCourseSignal());
  readonly totalCourses = computed(() => this.totalCoursesSignal());
  readonly hasCourses = computed(() => this.coursesSignal().length > 0);

  /**
   * Obtener todos los cursos (con filtros opcionales)
   */
  getCourses(filters?: CourseFilters): Observable<CoursePaginatedResponse> {
    this.loadingSignal.set(true);
    
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.level) params = params.set('level', filters.level);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.minRating) params = params.set('minRating', filters.minRating.toString());
      if (filters.language) params = params.set('language', filters.language);
      if (filters.hasLiveClasses !== undefined) params = params.set('hasLiveClasses', filters.hasLiveClasses.toString());
      if (filters.searchQuery) params = params.set('search', filters.searchQuery);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http.get<CoursePaginatedResponse>(`${this.API_URL}/courses`, { params })
      .pipe(
        tap(response => {
          this.coursesSignal.set(response.courses);
          this.totalCoursesSignal.set(response.total);
          this.loadingSignal.set(false);
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener curso por ID
   */
  getCourseById(courseId: string): Observable<Course> {
    this.loadingSignal.set(true);
    
    return this.http.get<Course>(`${this.API_URL}/courses/${courseId}`)
      .pipe(
        tap(course => {
          this.selectedCourseSignal.set(course);
          this.loadingSignal.set(false);
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Crear nuevo curso (solo profesores)
   */
  createCourse(courseData: CreateCourseDto): Observable<Course> {
    this.loadingSignal.set(true);
    
    return this.http.post<Course>(`${this.API_URL}/courses`, courseData)
      .pipe(
        tap(newCourse => {
          // Agregar el nuevo curso a la lista
          this.coursesSignal.update(courses => [newCourse, ...courses]);
          this.loadingSignal.set(false);
          console.log('✅ Curso creado:', newCourse.title);
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Actualizar curso existente
   */
  updateCourse(courseId: string, updates: UpdateCourseDto): Observable<Course> {
    this.loadingSignal.set(true);
    
    return this.http.patch<Course>(`${this.API_URL}/courses/${courseId}`, updates)
      .pipe(
        tap(updatedCourse => {
          // Actualizar en la lista
          this.coursesSignal.update(courses =>
            courses.map(c => c.id === courseId ? updatedCourse : c)
          );
          // Actualizar curso seleccionado si es el mismo
          if (this.selectedCourseSignal()?.id === courseId) {
            this.selectedCourseSignal.set(updatedCourse);
          }
          this.loadingSignal.set(false);
          console.log('✅ Curso actualizado:', updatedCourse.title);
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Eliminar curso
   */
  deleteCourse(courseId: string): Observable<void> {
    this.loadingSignal.set(true);
    
    return this.http.delete<void>(`${this.API_URL}/courses/${courseId}`)
      .pipe(
        tap(() => {
          // Remover de la lista
          this.coursesSignal.update(courses =>
            courses.filter(c => c.id !== courseId)
          );
          this.loadingSignal.set(false);
          console.log('✅ Curso eliminado');
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Publicar curso (cambiar estado a PUBLISHED)
   */
  publishCourse(courseId: string): Observable<Course> {
    return this.updateCourseStatus(courseId, CourseStatus.PUBLISHED);
  }

  /**
   * Archivar curso
   */
  archiveCourse(courseId: string): Observable<Course> {
    return this.updateCourseStatus(courseId, CourseStatus.ARCHIVED);
  }

  /**
   * Cambiar estado de un curso
   */
  private updateCourseStatus(courseId: string, status: CourseStatus): Observable<Course> {
    return this.http.patch<Course>(`${this.API_URL}/courses/${courseId}/status`, { status })
      .pipe(
        tap(updatedCourse => {
          this.coursesSignal.update(courses =>
            courses.map(c => c.id === courseId ? updatedCourse : c)
          );
          console.log(`✅ Estado del curso cambiado a: ${status}`);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener cursos de un profesor específico
   */
  getCoursesByTeacher(teacherId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.API_URL}/teachers/${teacherId}/courses`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener cursos populares/destacados
   */
  getFeaturedCourses(limit: number = 6): Observable<Course[]> {
    const params = new HttpParams()
      .set('featured', 'true')
      .set('limit', limit.toString());

    return this.http.get<Course[]>(`${this.API_URL}/courses/featured`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Buscar cursos por texto
   */
  searchCourses(query: string): Observable<Course[]> {
    const params = new HttpParams().set('q', query);
    
    return this.http.get<Course[]>(`${this.API_URL}/courses/search`, { params })
      .pipe(
        tap(courses => {
          this.coursesSignal.set(courses);
          console.log(`🔍 Encontrados ${courses.length} cursos`);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener progreso de un estudiante en un curso
   */
  getCourseProgress(courseId: string): Observable<CourseProgress> {
    return this.http.get<CourseProgress>(`${this.API_URL}/courses/${courseId}/progress`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Marcar lección como completada
   */
  markLessonAsComplete(courseId: string, lessonId: string): Observable<CourseProgress> {
    return this.http.post<CourseProgress>(
      `${this.API_URL}/courses/${courseId}/lessons/${lessonId}/complete`,
      {}
    ).pipe(
      tap(() => console.log('✅ Lección marcada como completada')),
      catchError(this.handleError)
    );
  }

  /**
   * Limpiar curso seleccionado
   */
  clearSelectedCourse(): void {
    this.selectedCourseSignal.set(null);
  }

  /**
   * Limpiar lista de cursos
   */
  clearCourses(): void {
    this.coursesSignal.set([]);
    this.totalCoursesSignal.set(0);
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
          errorMessage = 'Curso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'El curso ya existe';
          break;
        case 500:
          errorMessage = 'Error del servidor';
          break;
        default:
          errorMessage = error.error?.message || 'Error en la operación';
      }
    }

    console.error('❌ Error en CourseService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}