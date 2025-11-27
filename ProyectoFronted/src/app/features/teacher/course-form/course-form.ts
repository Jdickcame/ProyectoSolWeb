import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { TeacherService } from '../../../core/services/teacher';
import { CourseCategory, CourseLevel, CourseStatus, Course } from '../../../core/models';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar, Footer, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="course-form-page bg-light min-vh-100 py-5">
      <div class="container">
        <!-- Header -->
        <div class="mb-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <a routerLink="/teacher/my-courses" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left"></i>
            </a>
            <div>
              <h2 class="fw-bold mb-1">{{ isEditMode() ? 'Editar Curso' : 'Crear Nuevo Curso' }}</h2>
              <p class="text-muted mb-0">{{ isEditMode() ? 'Actualiza la información de tu curso' : 'Completa la información de tu curso' }}</p>
            </div>
          </div>
        </div>

        @if (isLoading()) {
          <div class="text-center py-5">
            <app-loading-spinner [size]="60" message="Cargando..."></app-loading-spinner>
          </div>
        } @else {
          <form [formGroup]="courseForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <!-- Main Content -->
              <div class="col-lg-8">
                <!-- Step 1: Basic Information -->
                <div class="card-modern p-4 mb-4">
                  <h5 class="fw-bold mb-4">
                    <span class="badge bg-gradient me-2">1</span>
                    Información Básica
                  </h5>

                  <!-- Title -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Título del Curso *</label>
                    <input 
                      type="text"
                      class="form-control"
                      formControlName="title"
                      placeholder="Ej: Curso Completo de Angular"
                      [class.is-invalid]="isFieldInvalid('title')">
                    @if (isFieldInvalid('title')) {
                      <div class="invalid-feedback">El título es obligatorio</div>
                    }
                  </div>

                  <!-- Short Description -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Descripción Corta *</label>
                    <input 
                      type="text"
                      class="form-control"
                      formControlName="shortDescription"
                      placeholder="Descripción breve que aparecerá en las tarjetas"
                      maxlength="150"
                      [class.is-invalid]="isFieldInvalid('shortDescription')">
                    <small class="text-muted">{{ courseForm.get('shortDescription')?.value?.length || 0 }}/150 caracteres</small>
                    @if (isFieldInvalid('shortDescription')) {
                      <div class="invalid-feedback">La descripción corta es obligatoria</div>
                    }
                  </div>

                  <!-- Description -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Descripción Completa *</label>
                    <textarea 
                      class="form-control"
                      formControlName="description"
                      rows="6"
                      placeholder="Describe detalladamente de qué trata tu curso..."
                      [class.is-invalid]="isFieldInvalid('description')">
                    </textarea>
                    @if (isFieldInvalid('description')) {
                      <div class="invalid-feedback">La descripción es obligatoria</div>
                    }
                  </div>

                  <!-- Category & Level -->
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Categoría *</label>
                      <select 
                        class="form-select"
                        formControlName="category"
                        [class.is-invalid]="isFieldInvalid('category')">
                        <option value="">Selecciona una categoría</option>
                        @for (cat of categories; track cat.value) {
                          <option [value]="cat.value">{{ cat.label }}</option>
                        }
                      </select>
                      @if (isFieldInvalid('category')) {
                        <div class="invalid-feedback">La categoría es obligatoria</div>
                      }
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Nivel *</label>
                      <select 
                        class="form-select"
                        formControlName="level"
                        [class.is-invalid]="isFieldInvalid('level')">
                        <option value="">Selecciona un nivel</option>
                        @for (level of levels; track level.value) {
                          <option [value]="level.value">{{ level.label }}</option>
                        }
                      </select>
                      @if (isFieldInvalid('level')) {
                        <div class="invalid-feedback">El nivel es obligatorio</div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Step 2: Learning Objectives -->
                <div class="card-modern p-4 mb-4">
                  <h5 class="fw-bold mb-4">
                    <span class="badge bg-gradient me-2">2</span>
                    Objetivos de Aprendizaje
                  </h5>

                  <div formArrayName="learningObjectives">
                    @for (objective of learningObjectives.controls; track $index) {
                      <div class="input-group mb-3">
                        <span class="input-group-text">
                          <i class="bi bi-check-circle"></i>
                        </span>
                        <input 
                          type="text"
                          class="form-control"
                          [formControlName]="$index"
                          placeholder="Ej: Aprenderás a crear aplicaciones web modernas">
                        <button 
                          type="button"
                          class="btn btn-outline-danger"
                          (click)="removeObjective($index)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    }
                  </div>

                  <button 
                    type="button"
                    class="btn btn-outline-primary btn-sm"
                    (click)="addObjective()">
                    <i class="bi bi-plus-circle me-2"></i>
                    Agregar Objetivo
                  </button>
                </div>

                <!-- Step 3: Requirements -->
                <div class="card-modern p-4 mb-4">
                  <h5 class="fw-bold mb-4">
                    <span class="badge bg-gradient me-2">3</span>
                    Requisitos Previos
                  </h5>

                  <div formArrayName="requirements">
                    @for (req of requirements.controls; track $index) {
                      <div class="input-group mb-3">
                        <span class="input-group-text">
                          <i class="bi bi-dot"></i>
                        </span>
                        <input 
                          type="text"
                          class="form-control"
                          [formControlName]="$index"
                          placeholder="Ej: Conocimientos básicos de HTML y CSS">
                        <button 
                          type="button"
                          class="btn btn-outline-danger"
                          (click)="removeRequirement($index)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    }
                  </div>

                  <button 
                    type="button"
                    class="btn btn-outline-primary btn-sm"
                    (click)="addRequirement()">
                    <i class="bi bi-plus-circle me-2"></i>
                    Agregar Requisito
                  </button>
                </div>

                <!-- Step 4: Course Content (Syllabus) -->
                <div class="card-modern p-4 mb-4">
                  <h5 class="fw-bold mb-4">
                    <span class="badge bg-gradient me-2">4</span>
                    Contenido del Curso
                  </h5>

                  <div formArrayName="sections">
                    @for (section of sections.controls; track $index) {
                      <div class="section-card card bg-light mb-3" [formGroupName]="$index">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="fw-bold mb-0">Sección {{ $index + 1 }}</h6>
                            <button 
                              type="button"
                              class="btn btn-sm btn-outline-danger"
                              (click)="removeSection($index)">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>

                          <!-- Section Title -->
                          <div class="mb-3">
                            <input 
                              type="text"
                              class="form-control"
                              formControlName="title"
                              placeholder="Título de la sección">
                          </div>

                          <!-- Section Description -->
                          <div class="mb-3">
                            <textarea 
                              class="form-control"
                              formControlName="description"
                              rows="2"
                              placeholder="Descripción de la sección (opcional)">
                            </textarea>
                          </div>

                          <!-- Lessons -->
                          <div formArrayName="lessons">
                            <label class="form-label small fw-semibold">Lecciones:</label>
                            @for (lesson of getLessons($index).controls; track $index; let lessonIndex = $index) {
                              <div class="input-group input-group-sm mb-2" [formGroupName]="lessonIndex">
                                <span class="input-group-text">
                                  <i class="bi bi-play-circle"></i>
                                </span>
                                <input 
                                  type="text"
                                  class="form-control"
                                  formControlName="title"
                                  placeholder="Título de la lección">
                                <input 
                                  type="number"
                                  class="form-control"
                                  formControlName="duration"
                                  placeholder="Min"
                                  style="max-width: 80px;">
                                <button 
                                  type="button"
                                  class="btn btn-outline-danger"
                                  (click)="removeLesson($index, lessonIndex)">
                                  <i class="bi bi-x"></i>
                                </button>
                              </div>
                            }
                          </div>

                          <button 
                            type="button"
                            class="btn btn-outline-secondary btn-sm mt-2"
                            (click)="addLesson($index)">
                            <i class="bi bi-plus me-1"></i>
                            Agregar Lección
                          </button>
                        </div>
                      </div>
                    }
                  </div>

                  <button 
                    type="button"
                    class="btn btn-outline-primary"
                    (click)="addSection()">
                    <i class="bi bi-plus-circle me-2"></i>
                    Agregar Sección
                  </button>
                </div>
              </div>

              <!-- Sidebar -->
              <div class="col-lg-4">
                <!-- Pricing & Settings -->
                <div class="card-modern p-4 mb-4 sticky-top" style="top: 100px;">
                  <h5 class="fw-bold mb-4">Configuración</h5>

                  <!-- Price -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Precio (USD) *</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        type="number"
                        class="form-control"
                        formControlName="price"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        [class.is-invalid]="isFieldInvalid('price')">
                    </div>
                    <small class="text-muted">Usa 0 para cursos gratuitos</small>
                    @if (isFieldInvalid('price')) {
                      <div class="invalid-feedback d-block">El precio es obligatorio</div>
                    }
                  </div>

                  <!-- Thumbnail URL -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">URL de Imagen</label>
                    <input 
                      type="url"
                      class="form-control"
                      formControlName="thumbnail"
                      placeholder="https://ejemplo.com/imagen.jpg">
                    <small class="text-muted">URL de la imagen del curso</small>
                  </div>

                  <!-- Preview -->
                  @if (courseForm.get('thumbnail')?.value) {
                    <div class="mb-3">
                      <img 
                        [src]="courseForm.get('thumbnail')?.value" 
                        class="img-fluid rounded"
                        alt="Preview"
                        (error)="onImageError($event)">
                    </div>
                  }

                  <!-- Has Certificate -->
                  <div class="mb-3">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="hasCertificate"
                        formControlName="hasCertificate">
                      <label class="form-check-label" for="hasCertificate">
                        Incluye certificado
                      </label>
                    </div>
                  </div>

                  <!-- Has Live Classes -->
                  <div class="mb-4">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="hasLiveClasses"
                        formControlName="hasLiveClasses">
                      <label class="form-check-label" for="hasLiveClasses">
                        Incluye clases en vivo
                      </label>
                    </div>
                  </div>

                  <hr>

                  <!-- Actions -->
                  <div class="d-grid gap-2">
                    @if (isEditMode()) {
                      <button 
                        type="submit"
                        class="btn btn-gradient"
                        [disabled]="isSaving() || courseForm.invalid">
                        @if (isSaving()) {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                          Guardando...
                        } @else {
                          <i class="bi bi-check-circle me-2"></i>
                          Actualizar Curso
                        }
                      </button>
                    } @else {
                      <button 
                        type="submit"
                        class="btn btn-gradient"
                        [disabled]="isSaving() || courseForm.invalid">
                        @if (isSaving()) {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                          Creando...
                        } @else {
                          <i class="bi bi-send me-2"></i>
                          Publicar Curso
                        }
                      </button>
                      
                      <button 
                        type="button"
                        class="btn btn-outline-secondary"
                        (click)="saveDraft()"
                        [disabled]="isSaving()">
                        <i class="bi bi-save me-2"></i>
                        Guardar Borrador
                      </button>
                    }

                    <a routerLink="/teacher/my-courses" class="btn btn-outline-danger">
                      Cancelar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </form>
        }
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .section-card {
      border-left: 4px solid;
      border-image: linear-gradient(135deg, #6366F1 0%, #EC4899 100%) 1;
    }

    .sticky-top {
      position: sticky;
    }
  `]
})
export class CourseForm implements OnInit {
  private fb = inject(FormBuilder);
  private teacherService = inject(TeacherService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  courseForm: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  courseId: string | null = null;

  categories = [
    { value: CourseCategory.PROGRAMMING, label: 'Programación' },
    { value: CourseCategory.DESIGN, label: 'Diseño' },
    { value: CourseCategory.BUSINESS, label: 'Negocios' },
    { value: CourseCategory.MARKETING, label: 'Marketing' },
    { value: CourseCategory.LANGUAGES, label: 'Idiomas' },
    { value: CourseCategory.DATA_SCIENCE, label: 'Ciencia de Datos' },
    { value: CourseCategory.PERSONAL_DEVELOPMENT, label: 'Desarrollo Personal' },
    { value: CourseCategory.PHOTOGRAPHY, label: 'Fotografía' },
    { value: CourseCategory.MUSIC, label: 'Música' },
  ];

  levels = [
    { value: CourseLevel.BEGINNER, label: 'Principiante' },
    { value: CourseLevel.INTERMEDIATE, label: 'Intermedio' },
    { value: CourseLevel.ADVANCED, label: 'Avanzado' },
    { value: CourseLevel.ALL_LEVELS, label: 'Todos los niveles' },
  ];

  constructor() {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      shortDescription: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      level: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      thumbnail: [''],
      hasCertificate: [false],
      hasLiveClasses: [false],
      learningObjectives: this.fb.array([]),
      requirements: this.fb.array([]),
      sections: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = params['id'];
      if (this.courseId) {
        this.isEditMode.set(true);
        this.loadCourse(this.courseId);
      } else {
        // Initialize with default sections for new course
        this.addObjective();
        this.addRequirement();
        this.addSection();
      }
    });
  }

  loadCourse(courseId: string): void {
    this.isLoading.set(true);
    this.teacherService.getCourseById(courseId).subscribe({
      next: (course: Course) => {
        this.courseForm.patchValue({
          title: course.title,
          shortDescription: course.shortDescription,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          thumbnail: course.thumbnail,
          hasCertificate: course.hasCertificate,
          hasLiveClasses: course.hasLiveClasses
        });

        // Load objectives
        if (course.learningObjectives) {
          course.learningObjectives.forEach((obj: string) => {
            this.learningObjectives.push(this.fb.control(obj));
          });
        }

        // Load requirements
        if (course.requirements) {
          course.requirements.forEach((req: string) => {
            this.requirements.push(this.fb.control(req));
          });
        }

        // Load syllabus
        if (course.syllabus?.sections) {
          course.syllabus.sections.forEach((section: any) => {
            const sectionGroup = this.fb.group({
              title: [section.title],
              description: [section.description || ''],
              lessons: this.fb.array([])
            });

            if (section.lessons) {
              section.lessons.forEach((lesson: any) => {
                (sectionGroup.get('lessons') as FormArray).push(
                  this.fb.group({
                    title: [lesson.title],
                    duration: [lesson.duration]
                  })
                );
              });
            }

            this.sections.push(sectionGroup);
          });
        }

        this.isLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Error loading course:', error);
        this.isLoading.set(false);
        alert('Error al cargar el curso');
        this.router.navigate(['/teacher/my-courses']);
      }
    });
  }

  get learningObjectives(): FormArray {
    return this.courseForm.get('learningObjectives') as FormArray;
  }

  get requirements(): FormArray {
    return this.courseForm.get('requirements') as FormArray;
  }

  get sections(): FormArray {
    return this.courseForm.get('sections') as FormArray;
  }

  getLessons(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('lessons') as FormArray;
  }

  addObjective(): void {
    this.learningObjectives.push(this.fb.control(''));
  }

  removeObjective(index: number): void {
    this.learningObjectives.removeAt(index);
  }

  addRequirement(): void {
    this.requirements.push(this.fb.control(''));
  }

  removeRequirement(index: number): void {
    this.requirements.removeAt(index);
  }

  addSection(): void {
    const section = this.fb.group({
      title: [''],
      description: [''],
      lessons: this.fb.array([])
    });
    this.sections.push(section);
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  addLesson(sectionIndex: number): void {
    const lessons = this.getLessons(sectionIndex);
    lessons.push(this.fb.group({
      title: [''],
      duration: [0]
    }));
  }

  removeLesson(sectionIndex: number, lessonIndex: number): void {
    const lessons = this.getLessons(sectionIndex);
    lessons.removeAt(lessonIndex);
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.isSaving.set(true);

    const courseData = this.prepareCourseData(CourseStatus.PENDING);

    if (this.isEditMode()) {
      this.teacherService.updateCourse(this.courseId!, courseData).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('Curso actualizado exitosamente');
          this.router.navigate(['/teacher/my-courses']);
        },
        error: (error) => {
          this.isSaving.set(false);
          alert('Error al actualizar: ' + error.message);
        }
      });
    } else {
      this.teacherService.createCourse(courseData).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('Curso creado exitosamente. Está pendiente de aprobación.');
          this.router.navigate(['/teacher/my-courses']);
        },
        error: (error) => {
          this.isSaving.set(false);
          alert('Error al crear: ' + error.message);
        }
      });
    }
  }

  saveDraft(): void {
    this.isSaving.set(true);

    const courseData = this.prepareCourseData(CourseStatus.DRAFT);

    this.teacherService.createCourse(courseData).subscribe({
      next: () => {
        this.isSaving.set(false);
        alert('Borrador guardado exitosamente');
        this.router.navigate(['/teacher/my-courses']);
      },
      error: (error) => {
        this.isSaving.set(false);
        alert('Error al guardar borrador: ' + error.message);
      }
    });
  }

  private prepareCourseData(status: CourseStatus): any {
    const formValue = this.courseForm.value;

    // Build syllabus
    const syllabus = {
      sections: formValue.sections.map((section: any, index: number) => ({
        id: `section-${index + 1}`,
        title: section.title,
        description: section.description,
        order: index + 1,
        lessons: section.lessons.map((lesson: any, lessonIndex: number) => ({
          id: `lesson-${index + 1}-${lessonIndex + 1}`,
          title: lesson.title,
          duration: lesson.duration,
          order: lessonIndex + 1,
          type: 'VIDEO' as any
        }))
      }))
    };

    return {
      ...formValue,
      status,
      syllabus,
      currency: 'USD'
    };
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}