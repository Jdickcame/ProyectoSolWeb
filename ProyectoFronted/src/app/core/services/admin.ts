// ==========================================================================
// ADMIN SERVICE
// ==========================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { User, Course, CourseStatus } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private usersSignal = signal<User[]>([]);
  private pendingCoursesSignal = signal<Course[]>([]);
  private statsSignal = signal<any>(null);
  private loadingSignal = signal<boolean>(false);

  readonly users = computed(() => this.usersSignal());
  readonly pendingCourses = computed(() => this.pendingCoursesSignal());
  readonly stats = computed(() => this.statsSignal());
  readonly isLoading = computed(() => this.loadingSignal());

  getAllUsers(): Observable<User[]> {
    this.loadingSignal.set(true);
    return this.http.get<User[]>(`${this.API_URL}/admin/users`)
      .pipe(
        tap(users => {
          this.usersSignal.set(users);
          this.loadingSignal.set(false);
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/admin/users/${userId}`, { isActive })
      .pipe(
        tap(updated => {
          this.usersSignal.update(users =>
            users.map(u => u.id === userId ? updated : u)
          );
        }),
        catchError(this.handleError)
      );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/admin/users/${userId}`)
      .pipe(
        tap(() => {
          this.usersSignal.update((users: User[]) => users.filter((u: User) => u.id !== userId));
        }),
        catchError(this.handleError)
      );
  }

  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/admin/users`, userData).pipe(
      tap((user) => {
        this.usersSignal.update((users: User[]) => [...users, user]);
      }),
      catchError(this.handleError)
    );
  }

  updateUser(userId: string, userData: any): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/admin/users/${userId}`, userData).pipe(
      tap((updatedUser) => {
        this.usersSignal.update((users: User[]) => 
          users.map((u: User) => u.id === userId ? updatedUser : u)
        );
      }),
      catchError(this.handleError)
    );
  }

  getPendingCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.API_URL}/admin/courses/pending`)
      .pipe(
        tap(courses => this.pendingCoursesSignal.set(courses)),
        catchError(this.handleError)
      );
  }

  approveCourse(courseId: string): Observable<Course> {
    return this.http.patch<Course>(`${this.API_URL}/admin/courses/${courseId}/approve`, {})
      .pipe(
        tap(approved => {
          this.pendingCoursesSignal.update(courses =>
            courses.filter(c => c.id !== courseId)
          );
        }),
        catchError(this.handleError)
      );
  }

  rejectCourse(courseId: string, reason?: string): Observable<Course> {
    return this.http.patch<Course>(`${this.API_URL}/admin/courses/${courseId}/reject`, { reason })
      .pipe(
        tap(() => {
          this.pendingCoursesSignal.update(courses =>
            courses.filter(c => c.id !== courseId)
          );
        }),
        catchError(this.handleError)
      );
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/admin/stats`)
      .pipe(
        tap(stats => this.statsSignal.set(stats)),
        catchError(this.handleError)
      );
  }

  getRevenueReport(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    return this.http.get<any>(`${this.API_URL}/admin/reports/revenue`, { params })
      .pipe(catchError(this.handleError));
  }

  clearData(): void {
    this.usersSignal.set([]);
    this.pendingCoursesSignal.set([]);
    this.statsSignal.set(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || 'Error en la operación';
    console.error('❌ AdminService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}