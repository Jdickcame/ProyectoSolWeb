import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course } from '../../../core/models';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course';
import { StudentService } from '../../../core/services/student';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { RatingStars } from '../../../shared/components/rating-stars/rating-stars';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, RatingStars, LoadingSpinner],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.scss']
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