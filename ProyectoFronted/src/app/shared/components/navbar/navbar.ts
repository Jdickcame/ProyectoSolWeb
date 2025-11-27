import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark-theme sticky-top">
      <div class="container-fluid px-4">
        <!-- Logo -->
        <a class="navbar-brand" routerLink="/home">
          <span class="text-gradient fw-bold fs-4">EduConect</span>
        </a>

        <!-- Toggle button para móvil -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Contenido del navbar -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <!-- Links de navegación -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/home" routerLinkActive="active">
                <i class="bi bi-house-door me-1"></i>Inicio
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/courses" routerLinkActive="active">
                <i class="bi bi-book me-1"></i>Explorar Cursos
              </a>
            </li>
            @if (isAuthenticated()) {
              @if (isTeacher()) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/teacher/dashboard" routerLinkActive="active">
                    <i class="bi bi-easel me-1"></i>Mis Cursos
                  </a>
                </li>
              }
            }
          </ul>

          <!-- Acciones del lado derecho -->
          <div class="d-flex align-items-center gap-3">
            @if (!isAuthenticated()) {
              <!-- Usuario NO autenticado -->
              <a routerLink="/auth/login" class="btn btn-outline-light btn-sm">
                Iniciar Sesión
              </a>
              <a routerLink="/auth/register" class="btn btn-gradient btn-sm">
                Registrarse
              </a>
            } @else {
              <!-- Usuario autenticado -->
              <div class="dropdown">
                <button 
                  class="btn btn-link text-white text-decoration-none dropdown-toggle d-flex align-items-center gap-2" 
                  type="button" 
                  data-bs-toggle="dropdown">
                  <img 
                    [src]="userAvatar()" 
                    [alt]="fullName()"
                    class="rounded-circle"
                    width="32"
                    height="32">
                  <span class="d-none d-md-inline">{{ fullName() }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  @if (isStudent()) {
                    <li>
                      <a class="dropdown-item" routerLink="/student/dashboard">
                        <i class="bi bi-speedometer2 me-2"></i>Mi Dashboard
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" routerLink="/student/my-courses">
                        <i class="bi bi-collection me-2"></i>Mis Cursos
                      </a>
                    </li>
                  }
                  @if (isTeacher()) {
                    <li>
                      <a class="dropdown-item" routerLink="/teacher/dashboard">
                        <i class="bi bi-speedometer2 me-2"></i>Mi Dashboard
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" routerLink="/teacher/my-courses">
                        <i class="bi bi-collection me-2"></i>Mis Cursos
                      </a>
                    </li>
                  }
                  @if (isAdmin()) {
                    <li>
                      <a class="dropdown-item" routerLink="/admin/dashboard">
                        <i class="bi bi-shield-check me-2"></i>Panel Admin
                      </a>
                    </li>
                  }
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" routerLink="/profile">
                      <i class="bi bi-person me-2"></i>Mi Perfil
                    </a>
                  </li>
                  <li>
                    <button class="dropdown-item" (click)="logout()">
                      <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      background-color: rgba(11, 18, 32, 0.95) !important;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.8) !important;
      transition: color 0.2s;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      
      &:hover {
        color: #EC4899 !important;
      }
      
      &.active {
        color: #6366F1 !important;
        background: rgba(99, 102, 241, 0.1);
      }
    }

    .dropdown-menu {
      background: #1E293B;
      border: 1px solid rgba(99, 102, 241, 0.2);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }

    .dropdown-item {
      color: rgba(255, 255, 255, 0.9);
      transition: all 0.2s;
      
      &:hover {
        background: rgba(99, 102, 241, 0.2);
        color: #EC4899;
      }
    }

    .dropdown-divider {
      border-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals del AuthService
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isStudent = this.authService.isStudent;
  readonly isTeacher = this.authService.isTeacher;
  readonly isAdmin = this.authService.isAdmin;
  readonly fullName = this.authService.fullName;
  readonly userAvatar = this.authService.userAvatar;

  logout(): void {
    this.authService.logout();
  }
}