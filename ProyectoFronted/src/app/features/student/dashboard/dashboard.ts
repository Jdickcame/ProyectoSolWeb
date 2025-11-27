import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { StudentService } from '../../../core/services/student';
import { CourseCard } from '../../../shared/components/course-card/course-card';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, CourseCard, LoadingSpinner],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);

  enrolledCourses = this.studentService.enrolledCourses;
  upcomingClasses = this.studentService.upcomingClasses;
  totalEnrolledCourses = this.studentService.totalEnrolledCourses;
  overallProgress = this.studentService.overallProgress;
  
  fullName = this.authService.fullName;
  isLoadingCourses = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoadingCourses.set(true);

    this.studentService.getEnrolledCourses().subscribe({
      next: () => {
        this.isLoadingCourses.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoadingCourses.set(false);
      }
    });

    this.studentService.getUpcomingLiveClasses().subscribe({
      error: (error) => console.error('Error loading live classes:', error)
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}