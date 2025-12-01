import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANTE: Agregado para ngModel
import { TeacherService } from '../../../core/services/teacher';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { User } from '../../../core/models';
import { MessageService } from '../../../core/services/message';

@Component({
  selector: 'app-teacher-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner, FormsModule], // <--- Agregado FormsModule
  templateUrl: './my-courses.html',
  styleUrls: ['./my-courses.scss']
})
export class MyCourses implements OnInit {
  public teacherService = inject(TeacherService); // Public para usar en HTML
  private messageService = inject(MessageService);

  myCourses = this.teacherService.myCourses;
  isLoading = this.teacherService.isLoading;
  
  // Estado local para acciones
  isSending = signal<boolean>(false); // <--- Nuevo: Para el spinner de enviar mensaje

  // Variables para el modal de LISTA DE ESTUDIANTES
  showStudentsModal = signal<boolean>(false);
  selectedCourseStudents = signal<User[]>([]);
  selectedCourseTitle = signal<string>('');

  // Variables para el modal de REDACTAR MENSAJE
  showComposeModal = signal<boolean>(false);
  selectedStudentForMessage: User | null = null;
  messageContent = '';

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.teacherService.getMyCourses().subscribe({
      error: (error) => console.error('Error loading courses:', error)
    });
  }

  // --- GESTIÓN DE CURSOS ---

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
          // La lista se actualiza automáticamente gracias a los signals del servicio
        },
        error: (error) => {
          alert('Error al eliminar el curso: ' + error.message);
        }
      });
    }
  }

  // --- GESTIÓN DE ESTUDIANTES (Modal 1) ---

  viewStudents(courseId: string, courseTitle: string): void {
    this.selectedCourseTitle.set(courseTitle);
    this.showStudentsModal.set(true);
    
    this.teacherService.getCourseStudents(courseId).subscribe({
      next: (students) => this.selectedCourseStudents.set(students),
      error: () => alert('Error al cargar estudiantes')
    });
  }

  closeModal(): void {
    this.showStudentsModal.set(false);
    this.selectedCourseStudents.set([]);
  }

  // --- MENSAJERÍA INTERNA (Modal 2) ---

  openMessageForm(student: User): void {
    // Cerramos el modal de lista temporalmente o lo dejamos atrás (usando z-index en CSS)
    // Por ahora, solo abrimos el de composición
    this.selectedStudentForMessage = student;
    this.messageContent = ''; 
    this.showComposeModal.set(true); 
  }

  closeComposeModal(): void {
    this.showComposeModal.set(false);
    this.selectedStudentForMessage = null;
  }

  sendMessage(): void {
    if (!this.selectedStudentForMessage || !this.messageContent.trim()) return;

    this.isSending.set(true); // Usamos estado local, no el del servicio general
    const subject = `Mensaje del curso: ${this.selectedCourseTitle()}`;
    
    this.messageService.sendMessage(
        this.selectedStudentForMessage.id, 
        this.messageContent, 
        subject
    ).subscribe({
        next: () => {
            this.isSending.set(false);
            alert('Mensaje enviado correctamente');
            this.closeComposeModal();
        },
        error: () => {
            this.isSending.set(false);
            alert('Error al enviar mensaje');
        }
    });
  }

  // Utilitario para mailto (Opción B si falla la mensajería interna)
  getMailToLink(email: string): string {
    const subject = `Consulta sobre el curso: ${this.selectedCourseTitle()}`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }
}