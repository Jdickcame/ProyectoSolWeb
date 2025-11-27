import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course, CourseCategory, CourseLevel, CourseStatus } from '../../../core/models';
import { TeacherService } from '../../../core/services/teacher';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar, Footer, LoadingSpinner],
  templateUrl: './course-form.html',
  styleUrls: ['./course-form.scss']
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