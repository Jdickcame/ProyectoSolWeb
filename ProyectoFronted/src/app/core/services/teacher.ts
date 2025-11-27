// ==========================================================================
// TEACHER SERVICE
// ==========================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  LiveClass,
  CreateLiveClassDto,
  UpdateLiveClassDto,
  TeacherRevenue,
  RevenuePeriod,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private myCoursesSignal = signal<Course[]>([]);
  private liveClassesSignal = signal<LiveClass[]>([]);
  private revenueSignal = signal<TeacherRevenue | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly myCourses = computed(() => this.myCoursesSignal());
  readonly liveClasses = computed(() => this.liveClassesSignal());
  readonly revenue = computed(() => this.revenueSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly totalCourses = computed(() => this.myCoursesSignal().length);
  readonly totalStudents = computed(() => 
    this.myCoursesSignal().reduce((sum, c) => sum + c.enrolledStudents, 0)
  );

  getMyCourses(): Observable<Course[]> {
    this.loadingSignal.set(true);
    return this.http.get<Course[]>(`${this.API_URL}/teachers/my-courses`)
      .pipe(
        tap(courses => {
          this.myCoursesSignal.set(courses);
          this.loadingSignal.set(false);
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  createCourse(courseData: CreateCourseDto): Observable<Course> {
    return this.http.post<Course>(`${this.API_URL}/teachers/courses`, courseData)
      .pipe(
        tap(newCourse => {
          this.myCoursesSignal.update(courses => [newCourse, ...courses]);
        }),
        catchError(this.handleError)
      );
  }

  updateCourse(courseId: string, updates: UpdateCourseDto): Observable<Course> {
    return this.http.patch<Course>(`${this.API_URL}/teachers/courses/${courseId}`, updates)
      .pipe(
        tap(updated => {
          this.myCoursesSignal.update(courses =>
            courses.map(c => c.id === courseId ? updated : c)
          );
        }),
        catchError(this.handleError)
      );
  }

  deleteCourse(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/teachers/courses/${courseId}`)
      .pipe(
        tap(() => {
          this.myCoursesSignal.update(courses =>
            courses.filter(c => c.id !== courseId)
          );
        }),
        catchError(this.handleError)
      );
  }

  getMyLiveClasses(): Observable<LiveClass[]> {
    return this.http.get<LiveClass[]>(`${this.API_URL}/teachers/live-classes`)
      .pipe(
        tap(classes => this.liveClassesSignal.set(classes)),
        catchError(this.handleError)
      );
  }

  createLiveClass(classData: CreateLiveClassDto): Observable<LiveClass> {
    return this.http.post<LiveClass>(`${this.API_URL}/teachers/live-classes`, classData)
      .pipe(
        tap(newClass => {
          this.liveClassesSignal.update(classes => [newClass, ...classes]);
        }),
        catchError(this.handleError)
      );
  }

  updateLiveClass(classId: string, updates: UpdateLiveClassDto): Observable<LiveClass> {
    return this.http.patch<LiveClass>(`${this.API_URL}/teachers/live-classes/${classId}`, updates)
      .pipe(
        tap(updated => {
          this.liveClassesSignal.update(classes =>
            classes.map(c => c.id === classId ? updated : c)
          );
        }),
        catchError(this.handleError)
      );
  }

  deleteLiveClass(classId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/teachers/live-classes/${classId}`)
      .pipe(
        tap(() => {
          this.liveClassesSignal.update(classes =>
            classes.filter(c => c.id !== classId)
          );
        }),
        catchError(this.handleError)
      );
  }

  getRevenue(period: RevenuePeriod = RevenuePeriod.LAST_30_DAYS): Observable<TeacherRevenue> {
    return this.http.get<TeacherRevenue>(`${this.API_URL}/teachers/revenue?period=${period}`)
      .pipe(
        tap(revenue => this.revenueSignal.set(revenue)),
        catchError(this.handleError)
      );
  }

  getCourseStudents(courseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/teachers/courses/${courseId}/students`)
      .pipe(catchError(this.handleError));
  }

  getCourseById(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.API_URL}/teachers/courses/${courseId}`)
      .pipe(catchError(this.handleError));
  }

  clearData(): void {
    this.myCoursesSignal.set([]);
    this.liveClassesSignal.set([]);
    this.revenueSignal.set(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || 'Error en la operación';
    console.error('❌ TeacherService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}