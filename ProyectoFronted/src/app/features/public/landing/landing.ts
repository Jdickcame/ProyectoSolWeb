import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '../../../core/models';
import { CourseService } from '../../../core/services/course';
import { CourseCard, Footer, LoadingSpinner, Navbar } from '../../../shared/components';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, CourseCard, LoadingSpinner],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing implements OnInit {
  private courseService = inject(CourseService);

  featuredCourses: Course[] = [];
  readonly isLoading = this.courseService.isLoading;

  ngOnInit() {
    this.loadFeaturedCourses();
  }

  private loadFeaturedCourses() {
    this.courseService.getFeaturedCourses(6).subscribe({
      next: (courses) => {
        this.featuredCourses = courses;
      },
      error: (error) => {
        console.error('Error loading featured courses:', error);
        // En desarrollo, mostrar cursos mock si falla
        this.featuredCourses = this.getMockCourses();
      }
    });
  }

  private getMockCourses(): Course[] {
    // Datos mock para desarrollo
    return [];
  }
}