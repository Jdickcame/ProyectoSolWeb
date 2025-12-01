import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models';

export const routes: Routes = [
  // PUBLIC ROUTES
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/public/landing/landing').then(m => m.Landing)
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/public/course-catalog/course-catalog').then(m => m.CourseCatalog)
  },
  {
    path: 'courses/:id',
    loadComponent: () => import('./features/public/course-detail/course-detail').then(m => m.CourseDetail)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/public/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/public/auth/register/register').then(m => m.Register)
  },

  // STUDENT ROUTES
  {
    path: 'student/dashboard',
    loadComponent: () => import('./features/student/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])]
  },
  {
    path: 'student/my-courses',
    loadComponent: () => import('./features/student/my-courses/my-courses').then(m => m.MyCourses),
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])]
  },
  {
    path: 'student/course-viewer/:id',
    loadComponent: () => import('./features/student/course-viewer/course-viewer').then(m => m.CourseViewer),
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])]
  },

  // TEACHER ROUTES
  {
    path: 'teacher/dashboard',
    loadComponent: () => import('./features/teacher/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])]
  },
  {
    path: 'teacher/my-courses',
    loadComponent: () => import('./features/teacher/my-courses/my-courses').then(m => m.MyCourses),
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])]
  },
  {
    path: 'teacher/course-form',
    loadComponent: () => import('./features/teacher/course-form/course-form').then(m => m.CourseForm),
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])]
  },
  {
    path: 'teacher/course-form/:id',
    loadComponent: () => import('./features/teacher/course-form/course-form').then(m => m.CourseForm),
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])]
  },
  {
    path: 'teacher/live-class-management',
    loadComponent: () => import('./features/teacher/live-class-management/live-class-management').then(m => m.LiveClassManagement),
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])]
  },
  {
    path: 'teacher/analytics',
    loadComponent: () => import('./features/teacher/analytics/analytics').then(m => m.Analytics),
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])]
  },
  {
    path: 'teacher/messages',
    loadComponent: () => import('./features/teacher/messages/messages')
      .then(m => m.Messages),
    canActivate: [authGuard, roleGuard]
  },

  // ADMIN ROUTES
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])]
  },
  {
    path: 'admin/user-management',
    loadComponent: () => import('./features/admin/user-management/user-management').then(m => m.UserManagement),
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])]
  },
  {
    path: 'admin/course-management',
    loadComponent: () => import('./features/admin/course-management/course-management').then(m => m.CourseManagement),
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])]
  },
  {
    path: 'admin/courses',
    loadComponent: () => import('./features/admin/course-management/course-management')
      .then(m => m.CourseManagement),
    canActivate: [authGuard, roleGuard]
  },

  // RUTA DEL ESTUDIANTE (Para el botón "Ver Contenido")
  {
    path: 'student/course/:id',
    loadComponent: () => import('./features/student/course-viewer/course-viewer')
      .then(m => m.CourseViewer),
    canActivate: [authGuard]
  },

  {
    path: 'student/messages',
    loadComponent: () => import('./features/student/messages/messages')
      .then(m => m.Messages),
    canActivate: [authGuard] // Solo usuarios logueados
  },

  // PROFILE
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },

  // FALLBACK
  {
    path: '**',
    redirectTo: '/home'
  }
];