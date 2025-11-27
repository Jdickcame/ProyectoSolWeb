import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { TeacherService } from '../../../core/services/teacher';
import { LiveClass } from '../../../core/models';

@Component({
  selector: 'app-live-class-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="live-class-page bg-light min-vh-100 py-5">
      <div class="container">
        <!-- Header -->
        <div class="mb-4">
          <h2 class="fw-bold mb-2">Gestión de Clases en Vivo</h2>
          <p class="text-muted">Programa y gestiona tus clases en vivo</p>
        </div>

        <div class="row">
          <!-- Form to Create/Edit -->
          <div class="col-lg-5 mb-4">
            <div class="card-modern p-4">
              <h5 class="fw-bold mb-4">
                {{ editingClass() ? 'Editar Clase' : 'Programar Nueva Clase' }}
              </h5>

              <form [formGroup]="liveClassForm" (ngSubmit)="onSubmit()">
                <!-- Course Selection -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Curso *</label>
                  <select 
                    class="form-select"
                    formControlName="courseId"
                    [class.is-invalid]="isFieldInvalid('courseId')">
                    <option value="">Selecciona un curso</option>
                    @for (course of myCourses(); track course.id) {
                      <option [value]="course.id">{{ course.title }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('courseId')) {
                    <div class="invalid-feedback">Selecciona un curso</div>
                  }
                </div>

                <!-- Title -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Título de la Clase *</label>
                  <input 
                    type="text"
                    class="form-control"
                    formControlName="title"
                    placeholder="Ej: Introducción a Angular Signals"
                    [class.is-invalid]="isFieldInvalid('title')">
                  @if (isFieldInvalid('title')) {
                    <div class="invalid-feedback">El título es obligatorio</div>
                  }
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Descripción</label>
                  <textarea 
                    class="form-control"
                    formControlName="description"
                    rows="3"
                    placeholder="Describe brevemente el contenido de la clase...">
                  </textarea>
                </div>

                <!-- Date -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Fecha *</label>
                  <input 
                    type="date"
                    class="form-control"
                    formControlName="scheduledDate"
                    [min]="today"
                    [class.is-invalid]="isFieldInvalid('scheduledDate')">
                  @if (isFieldInvalid('scheduledDate')) {
                    <div class="invalid-feedback">La fecha es obligatoria</div>
                  }
                </div>

                <!-- Time & Duration -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Hora Inicio *</label>
                    <input 
                      type="time"
                      class="form-control"
                      formControlName="startTime"
                      [class.is-invalid]="isFieldInvalid('startTime')">
                    @if (isFieldInvalid('startTime')) {
                      <div class="invalid-feedback">Hora obligatoria</div>
                    }
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Duración (min) *</label>
                    <input 
                      type="number"
                      class="form-control"
                      formControlName="duration"
                      placeholder="60"
                      min="15"
                      step="15"
                      [class.is-invalid]="isFieldInvalid('duration')">
                    @if (isFieldInvalid('duration')) {
                      <div class="invalid-feedback">Duración obligatoria</div>
                    }
                  </div>
                </div>

                <!-- Meeting URL -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">URL de la Reunión *</label>
                  <input 
                    type="url"
                    class="form-control"
                    formControlName="meetingUrl"
                    placeholder="https://zoom.us/j/123456789"
                    [class.is-invalid]="isFieldInvalid('meetingUrl')">
                  <small class="text-muted">
                    Zoom, Google Meet, Teams, etc.
                  </small>
                  @if (isFieldInvalid('meetingUrl')) {
                    <div class="invalid-feedback">URL obligatoria</div>
                  }
                </div>

                <!-- Max Participants -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Participantes Máximos</label>
                  <input 
                    type="number"
                    class="form-control"
                    formControlName="maxAttendees"
                    placeholder="100"
                    min="1">
                  <small class="text-muted">Opcional - límite de participantes</small>
                </div>

                <!-- Actions -->
                <div class="d-grid gap-2">
                  <button 
                    type="submit"
                    class="btn btn-gradient"
                    [disabled]="isSaving() || liveClassForm.invalid">
                    @if (isSaving()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Guardando...
                    } @else if (editingClass()) {
                      <i class="bi bi-check-circle me-2"></i>
                      Actualizar Clase
                    } @else {
                      <i class="bi bi-calendar-plus me-2"></i>
                      Programar Clase
                    }
                  </button>

                  @if (editingClass()) {
                    <button 
                      type="button"
                      class="btn btn-outline-secondary"
                      (click)="cancelEdit()">
                      Cancelar Edición
                    </button>
                  }
                </div>
              </form>
            </div>

            <!-- Quick Links -->
            <div class="card-modern p-3 mt-3">
              <h6 class="fw-semibold mb-3">Links Rápidos</h6>
              <div class="d-grid gap-2">
                <a href="https://zoom.us" target="_blank" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-camera-video me-2"></i>Crear Zoom Meeting
                </a>
                <a href="https://meet.google.com" target="_blank" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-google me-2"></i>Crear Google Meet
                </a>
              </div>
            </div>
          </div>

          <!-- List of Classes -->
          <div class="col-lg-7">
            <div class="card-modern p-4">
              <h5 class="fw-bold mb-4">Clases Programadas</h5>

              @if (isLoading()) {
                <div class="text-center py-5">
                  <app-loading-spinner [size]="50"></app-loading-spinner>
                </div>
              } @else if (liveClasses().length > 0) {
                <div class="list-group list-group-flush">
                  @for (liveClass of liveClasses(); track liveClass.id) {
                    <div class="list-group-item px-0 py-3">
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                          <h6 class="fw-bold mb-1">{{ liveClass.title }}</h6>
                          <p class="text-muted small mb-2">{{ liveClass.courseName }}</p>
                          
                          <div class="d-flex flex-wrap gap-3 small text-muted mb-2">
                            <div>
                              <i class="bi bi-calendar3 me-1"></i>
                              {{ formatDate(liveClass.scheduledDate) }}
                            </div>
                            <div>
                              <i class="bi bi-clock me-1"></i>
                              {{ liveClass.startTime }} ({{ liveClass.duration }} min)
                            </div>
                            @if (liveClass.maxAttendees) {
                              <div>
                                <i class="bi bi-people me-1"></i>
                                Max: {{ liveClass.maxAttendees }}
                              </div>
                            }
                          </div>

                          @if (liveClass.description) {
                            <p class="small text-muted mb-2">{{ liveClass.description }}</p>
                          }

                          <!-- Status Badge -->
                          @if (isUpcoming(liveClass.scheduledDate)) {
                            <span class="badge bg-success">Próxima</span>
                          } @else {
                            <span class="badge bg-secondary">Pasada</span>
                          }
                        </div>

                        <div class="ms-3">
                          <div class="btn-group-vertical btn-group-sm">
                            <a 
                              [href]="liveClass.meetingUrl" 
                              target="_blank"
                              class="btn btn-outline-primary"
                              title="Unirse">
                              <i class="bi bi-camera-video"></i>
                            </a>
                            <button 
                              class="btn btn-outline-secondary"
                              (click)="editClass(liveClass)"
                              title="Editar">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button 
                              class="btn btn-outline-danger"
                              (click)="deleteClass(liveClass.id, liveClass.title)"
                              title="Eliminar">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-5">
                  <i class="bi bi-calendar-x display-3 text-muted"></i>
                  <h5 class="mt-4 text-muted">No hay clases programadas</h5>
                  <p class="text-muted">Crea tu primera clase en vivo</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .list-group-item {
      border-left: 4px solid transparent;
      transition: all 0.3s ease;
      
      &:hover {
        border-left-color: #6366F1;
        background-color: rgba(99, 102, 241, 0.05);
      }
    }
  `]
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