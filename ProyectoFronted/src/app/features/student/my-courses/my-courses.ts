import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { RatingStars } from '../../../shared/components/rating-stars/rating-stars';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner, RatingStars],
  templateUrl: './my-courses.html',
  styleUrls: ['./my-courses.scss']
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