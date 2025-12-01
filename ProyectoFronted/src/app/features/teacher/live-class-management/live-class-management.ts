import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LiveClass } from '../../../core/models';
import { TeacherService } from '../../../core/services/teacher';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-live-class-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Footer, LoadingSpinner],
  templateUrl: './live-class-management.html',
  styleUrls: ['./live-class-management.scss']
})
export class LiveClassManagement implements OnInit {
  private fb = inject(FormBuilder);
  private teacherService = inject(TeacherService);

  liveClassForm: FormGroup;
  liveClasses = this.teacherService.liveClasses;
  myCourses = this.teacherService.myCourses;
  isLoading = this.teacherService.isLoading;
  isSaving = signal<boolean>(false);
  editingClass = signal<LiveClass | null>(null);
  today: string;

  constructor() {
    this.today = new Date().toISOString().split('T')[0];
    
    this.liveClassForm = this.fb.group({
      courseId: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      scheduledDate: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(15)]],
      meetingUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      maxAttendees: [null]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.teacherService.getMyCourses().subscribe({
      error: (error) => console.error('Error loading courses:', error)
    });

    this.teacherService.getMyLiveClasses().subscribe({
      error: (error) => console.error('Error loading classes:', error)
    });
  }

  onSubmit(): void {
    if (this.liveClassForm.invalid) {
      this.liveClassForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValue = this.liveClassForm.value;
    const selectedCourse = this.myCourses().find(c => c.id === formValue.courseId);

    const liveClassData = {
      ...formValue,
      courseName: selectedCourse?.title || '',
      scheduledDate: new Date(formValue.scheduledDate)
    };

    if (this.editingClass()) {
      // Update
      this.teacherService.updateLiveClass(this.editingClass()!.id, liveClassData).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('Clase actualizada exitosamente');
          this.resetForm();
        },
        error: (error) => {
          this.isSaving.set(false);
          alert('Error al actualizar: ' + error.message);
        }
      });
    } else {
      // Create
      this.teacherService.createLiveClass(liveClassData).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('Clase programada exitosamente');
          this.resetForm();
        },
        error: (error) => {
          this.isSaving.set(false);
          alert('Error al programar: ' + error.message);
        }
      });
    }
  }

  editClass(liveClass: LiveClass): void {
    this.editingClass.set(liveClass);
    
    const date = new Date(liveClass.scheduledDate);
    const dateString = date.toISOString().split('T')[0];

    this.liveClassForm.patchValue({
      courseId: liveClass.courseId,
      title: liveClass.title,
      description: liveClass.description || '',
      scheduledDate: dateString,
      startTime: liveClass.startTime,
      duration: liveClass.duration,
      meetingUrl: liveClass.meetingUrl,
      maxAttendees: liveClass.maxAttendees || null
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteClass(classId: string, title: string): void {
    if (confirm(`¿Eliminar la clase "${title}"?`)) {
      this.teacherService.deleteLiveClass(classId).subscribe({
        next: () => {
          alert('Clase eliminada');
        },
        error: (error) => {
          alert('Error al eliminar: ' + error.message);
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.liveClassForm.reset({
      duration: 60
    });
    this.editingClass.set(null);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isUpcoming(date: Date): boolean {
    return new Date(date) > new Date();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.liveClassForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}