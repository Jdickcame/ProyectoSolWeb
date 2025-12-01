import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Course } from '../../../core/models';
import { AdminService } from '../../../core/services/admin';
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
  public adminService = inject(AdminService);
  
  // Signals principales
  allCourses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  isLoading = signal<boolean>(false);

  // --- CORRECCIÓN 1: Restauramos pendingCourses usando un computed signal ---
  // Esto filtra automáticamente la lista principal cuando cambia
  pendingCourses = computed(() => this.allCourses().filter(c => c.status === 'PENDING'));

  // Filtros
  searchQuery: string = '';
  filterStatus: string = '';
  filterCategory: string = '';

  // Contadores (Signals)
  publishedCount = signal<number>(0);
  rejectedCount = signal<number>(0);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);

    this.adminService.getAllCourses().subscribe({
      next: (courses) => {
        const safeCourses = courses || [];
        this.allCourses.set(safeCourses);
        this.filteredCourses.set(safeCourses);
        this.updateCounts();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading.set(false);
      }
    });
  }

  updateCounts(): void {
    const courses = this.allCourses();
    if (!courses) return;

    this.publishedCount.set(courses.filter(c => c.status === 'PUBLISHED').length);
    this.rejectedCount.set(courses.filter(c => c.status === 'REJECTED').length);
    // Nota: pendingCourses se actualiza solo gracias a 'computed'
  }

  filterCourses(): void {
    let filtered = this.allCourses();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        (c.title?.toLowerCase().includes(query)) || 
        (c.shortDescription?.toLowerCase().includes(query))
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
      this.isLoading.set(true);
      this.adminService.approveCourse(courseId).subscribe({
        next: () => {
          this.loadCourses();
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
          alert('Error al aprobar');
        }
      });
    }
  }

  rejectCourse(courseId: string, title: string): void {
    const reason = prompt(`¿Por qué rechazas "${title}"?`);
    if (reason) {
      this.isLoading.set(true);
      this.adminService.rejectCourse(courseId, reason).subscribe({
        next: () => {
          this.loadCourses();
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
          alert('Error al rechazar');
        }
      });
    }
  }

  // --- CORRECCIÓN 2: Restauramos los métodos que faltaban ---
  
  unpublishCourse(courseId: string, title: string): void {
    if (confirm(`¿Despublicar el curso "${title}"?`)) {
      alert('Funcionalidad pendiente de implementación en el backend');
    }
  }

  deleteCourse(courseId: string, title: string): void {
    if (confirm(`¿ELIMINAR permanentemente "${title}"?`)) {
      alert('Funcionalidad pendiente de implementación en el backend');
    }
  }
  // ----------------------------------------------------------

  // Helpers visuales
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning text-dark';
      case 'REJECTED': return 'badge bg-danger';
      case 'DRAFT': return 'badge bg-secondary';
      default: return 'badge bg-light text-dark';
    }
  }
}