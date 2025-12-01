import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course, CourseLesson } from '../../../core/models';
import { CourseService } from '../../../core/services/course';
import { StudentService } from '../../../core/services/student';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-course-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, LoadingSpinner],
  templateUrl: './course-viewer.html',
  styleUrls: ['./course-viewer.scss']
})
export class CourseViewer implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private sanitizer = inject(DomSanitizer);

  public authService = inject(AuthService); // Hacer público para usar en computed

  // 1. Es profesor dueño del curso (Computed Signal)
  isCourseOwner = computed(() => {
      const user = this.authService.currentUser();
      const course = this.course();

      if (!user || !course) return false;
      
      // Verificamos si el rol es TEACHER Y si el ID coincide
      return user.role === 'TEACHER' && String(user.id) === String(course.teacherId);
  });

  // 2. Es solo estudiante (Para mostrar el progreso)
  isOnlyStudent = computed(() => {
      const user = this.authService.currentUser();
      if (!user) return false;

      // Si es TEACHER o ADMIN, no es SOLO estudiante.
      return user.role === 'STUDENT'; 
  });

  // Datos Principales
  course = signal<Course | null>(null);
  currentLesson = signal<CourseLesson | null>(null);
  
  // Estado UI
  isLoading = signal<boolean>(true);
  sidebarCollapsed = signal<boolean>(false);
  expandedSections = signal<Set<string>>(new Set()); // Usamos IDs de secciones en lugar de indices
  activeTab = signal<'resources' | 'notes' | 'qna'>('resources');
  lessonNotes: string = '';

  // Estado de Progreso Real
  completedLessonIds = signal<Set<string>>(new Set());
  courseProgress = signal<number>(0);

  // Computed: URL Segura para video
  safeVideoUrl = computed(() => {
    const lesson = this.currentLesson();
    if (!lesson || !lesson.videoUrl) return null;
    
    let url = lesson.videoUrl;
    // Conversión simple para YouTube embed si es necesario
    if (url.includes('youtube.com/watch?v=')) {
      url = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('/').pop();
        url = `https://www.youtube.com/embed/${videoId}`;
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = params['id'];
      if (courseId) {
        this.loadCourse(courseId);
      }
    });
  }

  loadCourse(courseId: string): void {
    this.isLoading.set(true);
    
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.course.set(course);
        
        // @ts-ignore
        const sections = course.sections || course.syllabus?.sections || [];

        if (sections.length > 0) {
            // 1. Expandir la primera sección visualmente
            const firstSectionId = sections[0].id;
            this.expandedSections.update(s => s.add(firstSectionId));
            
            // 2. Seleccionar la primera lección si existe
            if (sections[0].lessons && sections[0].lessons.length > 0) {
                this.selectLesson(sections[0].lessons[0]);
            }
        }
        // ----------------------------------------
        
        this.loadProgress(courseId);
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadProgress(courseId: string): void {
    this.studentService.getCourseProgress(courseId).subscribe({
        next: (progData) => {
            this.courseProgress.set(progData.progressPercentage);
            this.completedLessonIds.set(new Set(progData.completedLessons));
            this.isLoading.set(false);
        },
        error: (err) => {
            // Silenciamos el error en consola si es un 400 (Bad Request)
            // Esto pasa cuando el profesor ve su propio curso
            if (err.status !== 400) {
                console.warn('Error cargando progreso', err);
            }
            this.isLoading.set(false);
        }
    });
  }

  selectLesson(lesson: CourseLesson): void {
    this.currentLesson.set(lesson);
    // Asegurar que la sección de esta lección esté expandida
    // (Esto requeriría buscar la sección padre, pero por ahora lo dejamos simple)
  }

  toggleSection(sectionId: string): void {
    this.expandedSections.update(sections => {
      const newSet = new Set(sections);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }

  isSectionExpanded(sectionId: string): boolean {
      return this.expandedSections().has(sectionId);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  isCurrentLesson(lessonId: string): boolean {
    return this.currentLesson()?.id === lessonId;
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessonIds().has(lessonId);
  }

  markAsCompleted(): void {
    const lesson = this.currentLesson();
    const course = this.course();
    
    if (!lesson || !course) return;

    // Optimistic Update: Marcar visualmente de inmediato
    this.completedLessonIds.update(ids => {
        const newSet = new Set(ids);
        newSet.add(lesson.id);
        return newSet;
    });

    // Llamada al Backend
    this.studentService.completeLesson(course.id, lesson.id).subscribe({
        next: () => {
            // Recargar progreso real para sincronizar porcentaje
            this.loadProgress(course.id); 
        },
        error: (err) => {
            console.error('Error al guardar progreso', err);
            // Revertir si falla (opcional)
        }
    });
  }

  // --- Navegación Anterior / Siguiente ---
  // Nota: Esta lógica requiere aplanar el array de lecciones para ser eficiente
  
  private getAllLessonsFlattened(): CourseLesson[] {
      const course = this.course();
      const sections = course?.sections || course?.syllabus?.sections || [];
      
      return sections.flatMap(s => s.lessons || []);
  }

  // 2. Calcular si hay anterior
  hasPreviousLesson(): boolean {
      const all = this.getAllLessonsFlattened();
      const currentId = this.currentLesson()?.id;
      const index = all.findIndex(l => l.id === currentId);
      return index > 0; // Si el índice es mayor a 0, hay alguien atrás
  }

  // 3. Calcular si hay siguiente
  hasNextLesson(): boolean {
      const all = this.getAllLessonsFlattened();
      const currentId = this.currentLesson()?.id;
      const index = all.findIndex(l => l.id === currentId);
      // Si existe y NO es el último
      return index !== -1 && index < all.length - 1;
  }

  // 4. Ir atrás
  previousLesson(): void {
      const all = this.getAllLessonsFlattened();
      const currentId = this.currentLesson()?.id;
      const index = all.findIndex(l => l.id === currentId);
      if (index > 0) {
          this.selectLesson(all[index - 1]);
      }
  }

  // 5. Ir adelante
  nextLesson(): void {
      const all = this.getAllLessonsFlattened();
      const currentId = this.currentLesson()?.id;
      const index = all.findIndex(l => l.id === currentId);
      if (index !== -1 && index < all.length - 1) {
          this.selectLesson(all[index + 1]);
      }
  }

  saveNotes(): void {
    console.log('Saving notes:', this.lessonNotes);
    alert('Funcionalidad de notas guardadas localmente (Backend pendiente)');
  }
}