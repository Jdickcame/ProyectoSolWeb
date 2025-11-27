import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course } from '../../../core/models';
import { CourseService } from '../../../core/services/course';
import { StudentService } from '../../../core/services/student';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

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