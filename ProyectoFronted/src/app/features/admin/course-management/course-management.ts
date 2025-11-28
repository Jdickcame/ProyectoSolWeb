import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Course } from '../../../core/models';
import { AdminService } from '../../../core/services/admin';
import { CourseService } from '../../../core/services/course';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { RatingStars } from '../../../shared/components/rating-stars/rating-stars';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer, LoadingSpinner, RatingStars],
  templateUrl: './course-management.html',
  styleUrls: ['./course-management.scss']
})
export class CourseManagement implements OnInit {
  private adminService = inject(AdminService);
  private courseService = inject(CourseService);

  pendingCourses = this.adminService.pendingCourses;
  allCourses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  isLoading = signal<boolean>(false);

  searchQuery: string = '';
  filterStatus: string = '';
  filterCategory: string = '';

  publishedCount = signal<number>(0);
  rejectedCount = signal<number>(0);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);

    this.courseService.getCourses({}).subscribe({
      next: (response) => {
        this.allCourses.set(response.courses);
        this.filteredCourses.set(response.courses);
        this.updateCounts();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading.set(false);
      }
    });

    this.adminService.getPendingCourses().subscribe({
      error: (error) => console.error('Error loading pending courses:', error)
    });
  }

  updateCounts(): void {
    const courses = this.allCourses();
    this.publishedCount.set(courses.filter(c => c.status === 'PUBLISHED').length);
    this.rejectedCount.set(courses.filter(c => c.status === 'REJECTED').length);
  }

  filterCourses(): void {
    let filtered = this.allCourses();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.shortDescription?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus) {
      filtered = filtered.filter(c => c.status === this.filterStatus);
    }

    if (this.filterCategory) {
      filtered = filtered.filter(c => c.category === this.filterCategory);
    }

    this.filteredCourses.set(filtered);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterCategory = '';
    this.filteredCourses.set(this.allCourses());
  }

  approveCourse(courseId: string, title: string): void {
    if (confirm(`¿Aprobar el curso "${title}"?`)) {
      this.adminService.approveCourse(courseId).subscribe({
        next: () => {
          alert('Curso aprobado');
          this.loadCourses();
        },
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }

  rejectCourse(courseId: string, title: string): void {
    const reason = prompt(`¿Por qué rechazas "${title}"?`);
    if (reason) {
      this.adminService.rejectCourse(courseId, reason).subscribe({
        next: () => {
          alert('Curso rechazado');
          this.loadCourses();
        },
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }

  unpublishCourse(courseId: string, title: string): void {
    if (confirm(`¿Despublicar el curso "${title}"?`)) {
      alert('Funcionalidad pendiente de implementación');
    }
  }

  deleteCourse(courseId: string, title: string): void {
    if (confirm(`¿ELIMINAR permanentemente "${title}"?`)) {
      alert('Funcionalidad pendiente de implementación');
    }
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'PROGRAMMING': 'Programación',
      'DESIGN': 'Diseño',
      'BUSINESS': 'Negocios',
      'MARKETING': 'Marketing',
    };
    return categories[category] || category;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PUBLISHED': 'Publicado',
      'PENDING': 'Pendiente',
      'DRAFT': 'Borrador',
      'REJECTED': 'Rechazado'
    };
    return labels[status] || status;
  }
}