import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course, CourseCategory, CourseLevel, CourseStatus } from '../../../core/models';
import { TeacherService } from '../../../core/services/teacher';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { MediaService } from '../../../core/services/media';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar, Footer, LoadingSpinner],
  templateUrl: './course-form.html',
  styleUrls: ['./course-form.scss']
})
export class CourseForm implements OnInit {
  private fb = inject(FormBuilder);
  public teacherService = inject(TeacherService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mediaService = inject(MediaService);

  courseForm: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isUploading = signal<boolean>(false);
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
        // Inicializar con una sección vacía para cursos nuevos
        this.addObjective();
        this.addRequirement();
        this.addSection();
      }
    });
  }

  loadCourse(courseId: string): void {
    this.isLoading.set(true);
    
    // 1. IMPORTANTE: Limpiar los arrays antes de llenarlos
    this.learningObjectives.clear();
    this.requirements.clear();
    this.sections.clear();

    this.teacherService.getCourseById(courseId).subscribe({
      next: (course: any) => { 
        console.log('📦 DATOS RECIBIDOS:', course); // Debug

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

        // Cargar objetivos
        course.learningObjectives?.forEach((obj: string) => {
          this.learningObjectives.push(this.fb.control(obj));
        });

        // Cargar requisitos
        course.requirements?.forEach((req: string) => {
          this.requirements.push(this.fb.control(req));
        });

        // --- CORRECCIÓN DE CARGA DE SECCIONES ---
        // Buscamos en 'sections' (nuevo backend) o 'syllabus.sections' (viejo)
        const sectionsData = course.sections || course.syllabus?.sections || [];

        if (sectionsData.length > 0) {
          sectionsData.forEach((section: any) => {
            const sectionGroup = this.fb.group({
              title: [section.title, Validators.required],
              description: [section.description || ''],
              lessons: this.fb.array([])
            });

            if (section.lessons) {
              section.lessons.forEach((lesson: any) => {
                const lessonGroup = this.fb.group({
                  title: [lesson.title, Validators.required],
                  duration: [lesson.duration || 0, Validators.required],
                  type: [lesson.type || 'VIDEO'],
                  videoUrl: [lesson.videoUrl || ''], // <--- Cargamos la URL del video
                  resources: this.fb.array([])
                });

                // Cargar recursos de la lección si existen
                if (lesson.resources) {
                  lesson.resources.forEach((res: any) => {
                    (lessonGroup.get('resources') as FormArray).push(
                      this.fb.group({
                        title: [res.title, Validators.required],
                        url: [res.url, Validators.required]
                      })
                    );
                  });
                }

                (sectionGroup.get('lessons') as FormArray).push(lessonGroup);
              });
            }
            this.sections.push(sectionGroup);
          });
        } else {
          // Si está vacío, agregamos una sección por defecto
          this.addSection();
        }
        // ------------------------------------------

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

  // Subir imagen de portada del curso
  onThumbnailSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadAndSetValue(file, this.courseForm.get('thumbnail'));
    }
  }

  // Subir video de una lección específica
  onLessonVideoSelected(event: any, sectionIndex: number, lessonIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      // Buscamos el control 'videoUrl' dentro de la lección específica
      const control = this.getLessons(sectionIndex).at(lessonIndex).get('videoUrl');
      this.uploadAndSetValue(file, control);
    }
  }

  // Subir archivo de recurso (PDF, Doc, etc)
  onResourceFileSelected(event: any, sectionIndex: number, lessonIndex: number, resourceIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      const control = this.getResources(sectionIndex, lessonIndex).at(resourceIndex).get('url');
      this.uploadAndSetValue(file, control);
    }
  }

  // Lógica reutilizable de subida
  private uploadAndSetValue(file: File, control: any): void {
    this.isUploading.set(true); // Activar spinner de carga
    
    this.mediaService.uploadFile(file).subscribe({
      next: (response) => {
        // El backend devuelve { url: "..." }
        control?.setValue(response.url);
        control?.markAsDirty();
        this.isUploading.set(false);
      },
      error: (error) => {
        console.error('Error subiendo archivo:', error);
        alert('Error al subir el archivo. Revisa que no pese más de 10MB.');
        this.isUploading.set(false);
      }
    });
  }
  
  // Getters para el HTML
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
  
  // Métodos de Recursos (Nuevos)
  getResources(sectionIndex: number, lessonIndex: number): FormArray {
    return this.getLessons(sectionIndex).at(lessonIndex).get('resources') as FormArray;
  }

  // Métodos de Agregar/Eliminar
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
      title: ['', Validators.required],
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
      title: ['', Validators.required],
      duration: [0, Validators.required], // Default 0
      type: ['VIDEO'],
      videoUrl: [''],
      resources: this.fb.array([])
    }));
  }

  removeLesson(sectionIndex: number, lessonIndex: number): void {
    const lessons = this.getLessons(sectionIndex);
    lessons.removeAt(lessonIndex);
  }

  addResource(sectionIndex: number, lessonIndex: number): void {
    const resources = this.getResources(sectionIndex, lessonIndex);
    resources.push(this.fb.group({
      title: ['', Validators.required],
      url: ['', Validators.required]
    }));
  }

  removeResource(sectionIndex: number, lessonIndex: number, resourceIndex: number): void {
    this.getResources(sectionIndex, lessonIndex).removeAt(resourceIndex);
  }

  // Guardado
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
          alert('Curso creado exitosamente.');
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

  // Preparar datos para el backend
  private prepareCourseData(status: CourseStatus): any {
    const formValue = this.courseForm.value;

    // Transformar la estructura del formulario al formato del DTO
    const sections = formValue.sections.map((section: any, index: number) => ({
      title: section.title,
      description: section.description,
      order: index + 1,
      lessons: section.lessons.map((lesson: any, lessonIndex: number) => ({
        title: lesson.title,
        duration: lesson.duration,
        order: lessonIndex + 1,
        type: 'VIDEO',
        videoUrl: lesson.videoUrl,
        // Mapear recursos si los hay
        resources: lesson.resources?.map((res: any) => ({
            title: res.title,
            url: res.url
        })) || []
      }))
    }));

    return {
      ...formValue,
      status,
      sections, // Enviamos 'sections' directamente
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