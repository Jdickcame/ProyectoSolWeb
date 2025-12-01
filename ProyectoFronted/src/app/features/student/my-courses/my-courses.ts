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

  // CAMBIO CLAVE: Usamos 'enrollments' en lugar de 'enrolledCourses'
  // Esto trae el objeto completo: { progressPercentage: 50, course: {...} }
  enrollments = this.studentService.enrollments;
  isLoading = this.studentService.isLoading;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Llamamos al historial de inscripciones para tener el progreso real
    this.studentService.getEnrollmentHistory().subscribe({
      error: (error) => console.error('Error loading enrollments:', error)
    });
  }
}