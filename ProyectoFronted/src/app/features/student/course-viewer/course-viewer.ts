import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { StudentService } from '../../../core/services/student';
import { CourseService } from '../../../core/services/course';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, LoadingSpinner],
  template: `
    <app-navbar></app-navbar>

    <div class="course-viewer-page">
      @if (isLoading()) {
        <div class="d-flex align-items-center justify-content-center" style="height: calc(100vh - 70px);">
          <app-loading-spinner [size]="60" message="Cargando curso..."></app-loading-spinner>
        </div>
      } @else if (course()) {
        <div class="viewer-container">
          <!-- Sidebar -->
          <div class="sidebar" [class.collapsed]="sidebarCollapsed()">
            <div class="sidebar-header">
              <h6 class="fw-bold mb-0">{{ course()!.title }}</h6>
              <button 
                class="btn btn-sm btn-link text-white"
                (click)="toggleSidebar()">
                <i class="bi" [class.bi-chevron-left]="!sidebarCollapsed()" [class.bi-chevron-right]="sidebarCollapsed()"></i>
              </button>
            </div>

            <div class="sidebar-content">
              <!-- Progress -->
              <div class="p-3 border-bottom">
                <div class="d-flex justify-content-between mb-2">
                  <small>Progreso del curso</small>
                  <small class="fw-bold">{{ courseProgress() }}%</small>
                </div>
                <div class="progress" style="height: 8px;">
                  <div 
                    class="progress-bar bg-gradient" 
                    [style.width.%]="courseProgress()">
                  </div>
                </div>
              </div>

              <!-- Course Content -->
              <div class="content-list">
                @if (course()!.syllabus && course()!.syllabus.sections) {
                  @for (section of course()!.syllabus.sections; track section.id; let sectionIndex = $index) {
                    <div class="section-item">
                      <div 
                        class="section-header"
                        (click)="toggleSection(sectionIndex)">
                        <div class="d-flex align-items-center gap-2">
                          <i class="bi" [class.bi-chevron-right]="!expandedSections().includes(sectionIndex)" [class.bi-chevron-down]="expandedSections().includes(sectionIndex)"></i>
                          <strong>{{ section.title }}</strong>
                        </div>
                        <small class="text-muted">
                          {{ getCompletedLessons(sectionIndex) }}/{{ section.lessons?.length || 0 }}
                        </small>
                      </div>

                      @if (expandedSections().includes(sectionIndex) && section.lessons) {
                        <div class="lessons-list">
                          @for (lesson of section.lessons; track lesson.id; let lessonIndex = $index) {
                            <div 
                              class="lesson-item"
                              [class.active]="isCurrentLesson(sectionIndex, lessonIndex)"
                              [class.completed]="isLessonCompleted(sectionIndex, lessonIndex)"
                              (click)="selectLesson(sectionIndex, lessonIndex)">
                              <div class="d-flex align-items-center gap-2">
                                @if (isLessonCompleted(sectionIndex, lessonIndex)) {
                                  <i class="bi bi-check-circle-fill text-success"></i>
                                } @else {
                                  <i class="bi bi-play-circle"></i>
                                }
                                <span>{{ lesson.title }}</span>
                              </div>
                              <small class="text-muted">{{ lesson.duration }} min</small>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="main-content">
            @if (currentLesson()) {
              <!-- Video Player -->
              <div class="video-container">
                @if (currentLesson()!.videoUrl) {
                  <iframe
                    [src]="getVideoUrl()"
                    frameborder="0"
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                  </iframe>
                } @else {
                  <div class="placeholder-video bg-dark text-white d-flex align-items-center justify-content-center">
                    <div class="text-center">
                      <i class="bi bi-play-circle display-1 mb-3"></i>
                      <p>Video no disponible</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Lesson Info -->
              <div class="lesson-info p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="flex-grow-1">
                    <h4 class="fw-bold mb-2">{{ currentLesson()!.title }}</h4>
                    @if (currentLesson()!.description) {
                      <p class="text-muted">{{ currentLesson()!.description }}</p>
                    }
                  </div>
                  <div class="d-flex gap-2">
                    @if (!isLessonCompleted(currentSectionIndex(), currentLessonIndex())) {
                      <button 
                        class="btn btn-success"
                        (click)="markAsCompleted()">
                        <i class="bi bi-check-circle me-2"></i>
                        Marcar como Completada
                      </button>
                    } @else {
                      <button class="btn btn-outline-success" disabled>
                        <i class="bi bi-check-circle-fill me-2"></i>
                        Completada
                      </button>
                    }
                  </div>
                </div>

                <!-- Navigation -->
                <div class="d-flex justify-content-between align-items-center">
                  <button 
                    class="btn btn-outline-primary"
                    [disabled]="!hasPreviousLesson()"
                    (click)="previousLesson()">
                    <i class="bi bi-chevron-left me-2"></i>
                    Anterior
                  </button>

                  <div class="text-center">
                    <small class="text-muted">
                      Lección {{ currentLessonIndex() + 1 }} de {{ getTotalLessons() }}
                    </small>
                  </div>

                  <button 
                    class="btn btn-gradient"
                    [disabled]="!hasNextLesson()"
                    (click)="nextLesson()">
                    Siguiente
                    <i class="bi bi-chevron-right ms-2"></i>
                  </button>
                </div>
              </div>

              <!-- Tabs: Resources, Notes, Comments -->
              <div class="lesson-tabs">
                <ul class="nav nav-tabs px-4">
                  <li class="nav-item">
                    <button 
                      class="nav-link"
                      [class.active]="activeTab() === 'resources'"
                      (click)="activeTab.set('resources')">
                      <i class="bi bi-file-earmark me-2"></i>
                      Recursos
                    </button>
                  </li>
                  <li class="nav-item">
                    <button 
                      class="nav-link"
                      [class.active]="activeTab() === 'notes'"
                      (click)="activeTab.set('notes')">
                      <i class="bi bi-journal-text me-2"></i>
                      Mis Notas
                    </button>
                  </li>
                  <li class="nav-item">
                    <button 
                      class="nav-link"
                      [class.active]="activeTab() === 'qna'"
                      (click)="activeTab.set('qna')">
                      <i class="bi bi-chat-dots me-2"></i>
                      Preguntas
                    </button>
                  </li>
                </ul>

                <div class="tab-content p-4">
                  @if (activeTab() === 'resources') {
                    <div class="resources-tab">
                      <h6 class="fw-bold mb-3">Recursos de la Lección</h6>
                      @if (currentLesson()!.resources && currentLesson()!.resources.length > 0) {
                        <div class="list-group">
                          @for (resource of currentLesson()!.resources; track $index) {
                            <a 
                              [href]="resource.url" 
                              target="_blank"
                              class="list-group-item list-group-item-action">
                              <i class="bi bi-file-earmark-pdf me-2"></i>
                              {{ resource.title }}
                            </a>
                          }
                        </div>
                      } @else {
                        <p class="text-muted">No hay recursos disponibles para esta lección</p>
                      }
                    </div>
                  }

                  @if (activeTab() === 'notes') {
                    <div class="notes-tab">
                      <h6 class="fw-bold mb-3">Tus Notas Personales</h6>
                      <textarea 
                        class="form-control mb-3"
                        rows="5"
                        placeholder="Escribe tus notas aquí..."
                        [(ngModel)]="lessonNotes">
                      </textarea>
                      <button class="btn btn-gradient" (click)="saveNotes()">
                        <i class="bi bi-save me-2"></i>
                        Guardar Notas
                      </button>
                    </div>
                  }

                  @if (activeTab() === 'qna') {
                    <div class="qna-tab">
                      <h6 class="fw-bold mb-3">Preguntas y Respuestas</h6>
                      <p class="text-muted">Funcionalidad de Q&A próximamente...</p>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="d-flex align-items-center justify-content-center h-100">
                <div class="text-center text-muted">
                  <i class="bi bi-play-circle display-1"></i>
                  <p class="mt-3">Selecciona una lección para comenzar</p>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="d-flex align-items-center justify-content-center" style="height: calc(100vh - 70px);">
          <div class="text-center">
            <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
            <h4 class="mt-4">Curso no encontrado</h4>
            <p class="text-muted">No tienes acceso a este curso</p>
            <a routerLink="/student/my-courses" class="btn btn-gradient mt-3">
              Ver Mis Cursos
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .course-viewer-page {
      height: calc(100vh - 70px);
      overflow: hidden;
    }

    .viewer-container {
      display: flex;
      height: 100%;
    }

    .sidebar {
      width: 350px;
      background: #1E293B;
      color: white;
      overflow-y: auto;
      transition: width 0.3s ease;
      
      &.collapsed {
        width: 0;
        overflow: hidden;
      }
    }

    .sidebar-header {
      padding: 1rem 1.5rem;
      background: #0F172A;
      display: flex;
      justify-content: between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-content {
      height: calc(100% - 60px);
      overflow-y: auto;
    }

    .section-header {
      padding: 1rem 1.5rem;
      cursor: pointer;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .lesson-item {
      padding: 0.75rem 2rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      &.active {
        background: rgba(99, 102, 241, 0.2);
        border-left: 3px solid #6366F1;
      }
      
      &.completed {
        opacity: 0.7;
      }
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      background: #F8F9FA;
    }

    .video-container {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #000;
      
      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }

    .placeholder-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .lesson-info {
      background: white;
      border-bottom: 1px solid #dee2e6;
    }

    .lesson-tabs {
      background: white;
      
      .nav-tabs {
        border-bottom: 1px solid #dee2e6;
        
        .nav-link {
          border: none;
          color: #6c757d;
          
          &.active {
            color: #6366F1;
            border-bottom: 2px solid #6366F1;
          }
        }
      }
    }
  `]
})
export class CourseViewer implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private sanitizer = inject(DomSanitizer);

  course = signal<Course | null>(null);
  currentLesson = signal<any>(null);
  currentSectionIndex = signal<number>(0);
  currentLessonIndex = signal<number>(0);
  
  isLoading = signal<boolean>(false);
  sidebarCollapsed = signal<boolean>(false);
  expandedSections = signal<number[]>([0]);
  completedLessons = signal<Set<string>>(new Set());
  courseProgress = signal<number>(0);
  activeTab = signal<'resources' | 'notes' | 'qna'>('resources');
  lessonNotes: string = '';

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
        this.isLoading.set(false);
        
        if (course.syllabus?.sections?.[0]?.lessons?.[0]) {
          this.selectLesson(0, 0);
        }
        
        this.loadProgress(courseId);
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading.set(false);
        this.course.set(null);
      }
    });
  }

  loadProgress(courseId: string): void {
    // TODO: Cargar progreso real del backend
    this.courseProgress.set(Math.floor(Math.random() * 100));
  }

  selectLesson(sectionIndex: number, lessonIndex: number): void {
    const section = this.course()?.syllabus?.sections?.[sectionIndex];
    if (!section?.lessons) return;
    
    const lesson = section.lessons[lessonIndex];
    this.currentLesson.set(lesson);
    this.currentSectionIndex.set(sectionIndex);
    this.currentLessonIndex.set(lessonIndex);
    
    if (!this.expandedSections().includes(sectionIndex)) {
      this.expandedSections.update(sections => [...sections, sectionIndex]);
    }
  }

  toggleSection(index: number): void {
    this.expandedSections.update(sections => {
      if (sections.includes(index)) {
        return sections.filter(s => s !== index);
      } else {
        return [...sections, index];
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  isCurrentLesson(sectionIndex: number, lessonIndex: number): boolean {
    return this.currentSectionIndex() === sectionIndex && 
           this.currentLessonIndex() === lessonIndex;
  }

  isLessonCompleted(sectionIndex: number, lessonIndex: number): boolean {
    const key = `${sectionIndex}-${lessonIndex}`;
    return this.completedLessons().has(key);
  }

  markAsCompleted(): void {
    const key = `${this.currentSectionIndex()}-${this.currentLessonIndex()}`;
    this.completedLessons.update(lessons => {
      const newSet = new Set(lessons);
      newSet.add(key);
      return newSet;
    });
    
    this.updateProgress();
  }

  updateProgress(): void {
    const total = this.getTotalLessons();
    const completed = this.completedLessons().size;
    this.courseProgress.set(Math.round((completed / total) * 100));
  }

  getCompletedLessons(sectionIndex: number): number {
    const section = this.course()?.syllabus?.sections?.[sectionIndex];
    if (!section?.lessons) return 0;
    
    return section.lessons.filter((_, lessonIndex) => 
      this.isLessonCompleted(sectionIndex, lessonIndex)
    ).length;
  }

  getTotalLessons(): number {
    let total = 0;
    this.course()?.syllabus?.sections?.forEach(section => {
      total += section.lessons?.length || 0;
    });
    return total;
  }

  hasPreviousLesson(): boolean {
    if (this.currentLessonIndex() > 0) return true;
    return this.currentSectionIndex() > 0;
  }

  hasNextLesson(): boolean {
    const section = this.course()?.syllabus?.sections?.[this.currentSectionIndex()];
    if (!section?.lessons) return false;
    
    if (this.currentLessonIndex() < section.lessons.length - 1) return true;
    
    const sections = this.course()?.syllabus?.sections;
    return this.currentSectionIndex() < (sections?.length || 0) - 1;
  }

  previousLesson(): void {
    if (this.currentLessonIndex() > 0) {
      this.selectLesson(this.currentSectionIndex(), this.currentLessonIndex() - 1);
    } else if (this.currentSectionIndex() > 0) {
      const prevSection = this.course()?.syllabus?.sections?.[this.currentSectionIndex() - 1];
      if (prevSection?.lessons) {
        this.selectLesson(this.currentSectionIndex() - 1, prevSection.lessons.length - 1);
      }
    }
  }

  nextLesson(): void {
    const section = this.course()?.syllabus?.sections?.[this.currentSectionIndex()];
    if (!section?.lessons) return;
    
    if (this.currentLessonIndex() < section.lessons.length - 1) {
      this.selectLesson(this.currentSectionIndex(), this.currentLessonIndex() + 1);
    } else {
      const sections = this.course()?.syllabus?.sections;
      if (this.currentSectionIndex() < (sections?.length || 0) - 1) {
        this.selectLesson(this.currentSectionIndex() + 1, 0);
      }
    }
  }

  getVideoUrl(): SafeResourceUrl {
    const url = this.currentLesson()?.videoUrl || '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  saveNotes(): void {
    console.log('Saving notes:', this.lessonNotes);
    alert('Notas guardadas (funcionalidad pendiente de backend)');
  }
}