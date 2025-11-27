import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer bg-dark-theme text-white-50 py-5 mt-auto">
      <div class="container">
        <div class="row g-4">
          <!-- Columna 1: Sobre EduConect -->
          <div class="col-lg-4 col-md-6">
            <h5 class="text-gradient fw-bold mb-3">EduConect</h5>
            <p class="small">
              Tu plataforma de educación en línea. Conectamos estudiantes con 
              los mejores profesores para aprender de forma flexible y efectiva.
            </p>
            <div class="d-flex gap-3 mt-3">
              <a href="#" class="text-white-50 hover-gradient">
                <i class="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" class="text-white-50 hover-gradient">
                <i class="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" class="text-white-50 hover-gradient">
                <i class="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" class="text-white-50 hover-gradient">
                <i class="bi bi-linkedin fs-5"></i>
              </a>
            </div>
          </div>

          <!-- Columna 2: Links rápidos -->
          <div class="col-lg-2 col-md-6">
            <h6 class="text-white fw-semibold mb-3">Plataforma</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a routerLink="/courses" class="text-white-50 text-decoration-none hover-gradient">
                  Explorar Cursos
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/teachers" class="text-white-50 text-decoration-none hover-gradient">
                  Nuestros Profesores
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/about" class="text-white-50 text-decoration-none hover-gradient">
                  Sobre Nosotros
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/contact" class="text-white-50 text-decoration-none hover-gradient">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <!-- Columna 3: Para profesores -->
          <div class="col-lg-3 col-md-6">
            <h6 class="text-white fw-semibold mb-3">Para Profesores</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a routerLink="/teach" class="text-white-50 text-decoration-none hover-gradient">
                  Enseña en EduConect
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-white-50 text-decoration-none hover-gradient">
                  Recursos para Profesores
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-white-50 text-decoration-none hover-gradient">
                  Centro de Ayuda
                </a>
              </li>
            </ul>
          </div>

          <!-- Columna 4: Legal -->
          <div class="col-lg-3 col-md-6">
            <h6 class="text-white fw-semibold mb-3">Legal</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a routerLink="/terms" class="text-white-50 text-decoration-none hover-gradient">
                  Términos y Condiciones
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/privacy" class="text-white-50 text-decoration-none hover-gradient">
                  Política de Privacidad
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/cookies" class="text-white-50 text-decoration-none hover-gradient">
                  Política de Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <hr class="my-4 border-secondary opacity-25">
        <div class="row">
          <div class="col-md-6 text-center text-md-start">
            <small>© {{ currentYear }} EduConect. Todos los derechos reservados.</small>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <small>Hecho con <i class="bi bi-heart-fill text-danger"></i> para el aprendizaje</small>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid rgba(99, 102, 241, 0.2);
    }

    .hover-gradient {
      transition: all 0.3s ease;
      
      &:hover {
        color: #EC4899 !important;
      }
    }
  `]
})
export class Footer {
  currentYear = new Date().getFullYear();
}