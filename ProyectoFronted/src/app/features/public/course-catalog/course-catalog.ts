import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Course, CourseCategory, CourseLevel, CourseSortOption } from '../../../core/models';
import { CourseService } from '../../../core/services/course';
import { CourseCard } from '../../../shared/components/course-card/course-card'; 
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer, CourseCard, LoadingSpinner],
  templateUrl: './course-catalog.html',
  styleUrls: ['./course-catalog.scss']
})
export class CourseCatalog implements OnInit {
  private courseService = inject(CourseService);

  // Signals
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(false);
  totalCourses = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  // Filtros
  searchQuery: string = '';
  selectedCategory: CourseCategory | null = null;
  selectedLevel: CourseLevel | null = null;
  sortBy: CourseSortOption = CourseSortOption.MOST_POPULAR;
  onlyFree: boolean = false;
  hasLiveClasses: boolean = false;

  private searchTimeout: any;

  // Opciones para Selects
  categories = [
    { value: CourseCategory.PROGRAMMING, label: 'Programación' },
    { value: CourseCategory.DESIGN, label: 'Diseño' },
    { value: CourseCategory.BUSINESS, label: 'Negocios' },
    { value: CourseCategory.MARKETING, label: 'Marketing' },
    { value: CourseCategory.LANGUAGES, label: 'Idiomas' },
    { value: CourseCategory.DATA_SCIENCE, label: 'Ciencia de Datos' },
    { value: CourseCategory.PERSONAL_DEVELOPMENT, label: 'Desarrollo Personal' },
  ];

  levels = [
    { value: CourseLevel.BEGINNER, label: 'Principiante' },
    { value: CourseLevel.INTERMEDIATE, label: 'Intermedio' },
    { value: CourseLevel.ADVANCED, label: 'Avanzado' },
    { value: CourseLevel.ALL_LEVELS, label: 'Todos los niveles' },
  ];

  sortOptions = [
    { value: CourseSortOption.MOST_POPULAR, label: 'Más populares' },
    { value: CourseSortOption.HIGHEST_RATED, label: 'Mejor valorados' },
    { value: CourseSortOption.NEWEST, label: 'Más recientes' },
    { value: CourseSortOption.PRICE_LOW_TO_HIGH, label: 'Precio: bajo a alto' },
    { value: CourseSortOption.PRICE_HIGH_TO_LOW, label: 'Precio: alto a bajo' },
  ];

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);

    const filters = {
      category: this.selectedCategory || undefined,
      level: this.selectedLevel || undefined,
      searchQuery: this.searchQuery || undefined,
      sortBy: this.sortBy,
      minPrice: this.onlyFree ? 0 : undefined,
      maxPrice: this.onlyFree ? 0 : undefined,
      hasLiveClasses: this.hasLiveClasses || undefined,
      page: this.currentPage(),
      pageSize: 12,
    };

    this.courseService.getCourses(filters).subscribe({
      next: (response: any) => {
        // --- CORRECCIÓN DE COMPATIBILIDAD (Backend Array vs Objeto Paginado) ---
        let coursesList: Course[] = [];
        let total = 0;
        let pages = 1;

        if (Array.isArray(response)) {
          // Caso: Backend envía lista simple [c1, c2]
          coursesList = response;
          total = response.length;
          pages = 1;
        } else if (response && response.courses) {
          // Caso: Backend envía objeto paginado { courses: [...], total: 10 }
          coursesList = response.courses;
          total = response.total || coursesList.length;
          pages = response.totalPages || 1;
        }

        // Actualizamos las signals
        this.courses.set(coursesList);
        this.totalCourses.set(total);
        this.totalPages.set(pages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.courses.set([]); // Limpiamos la lista para evitar errores en HTML
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadCourses(); // Llamamos directamente a loadCourses
    }, 500);
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadCourses();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.selectedLevel = null;
    this.sortBy = CourseSortOption.MOST_POPULAR;
    this.onlyFree = false;
    this.hasLiveClasses = false;
    this.currentPage.set(1);
    this.loadCourses();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCourses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }
}