import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeacherService } from '../../../core/services/teacher';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-teacher-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  templateUrl: './my-courses.html',
  styleUrls: ['./my-courses.scss']
})
export class MyCourses implements OnInit {
  private teacherService = inject(TeacherService);

  myCourses = this.teacherService.myCourses;
  isLoading = this.teacherService.isLoading;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.teacherService.getMyCourses().subscribe({
      error: (error) => console.error('Error loading courses:', error)
    });
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

  confirmDelete(courseId: string, courseTitle: string): void {
    if (confirm(`¿Estás seguro de eliminar el curso "${courseTitle}"?`)) {
      this.teacherService.deleteCourse(courseId).subscribe({
        next: () => {
          alert('Curso eliminado exitosamente');
        },
        error: (error) => {
          alert('Error al eliminar el curso: ' + error.message);
        }
      });
    }
  }
}