import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { MessageService } from '../../../core/services/message';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  public messageService = inject(MessageService);

  // Signals del AuthService
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isStudent = this.authService.isStudent;
  readonly isTeacher = this.authService.isTeacher;
  readonly isAdmin = this.authService.isAdmin;
  readonly fullName = this.authService.fullName;
  readonly userAvatar = this.authService.userAvatar;

  ngOnInit(): void {
    // Si el usuario está logueado, pedimos la cuenta
    if (this.authService.isAuthenticated()) {
      this.messageService.refreshUnreadCount();
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}