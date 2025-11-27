import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevenuePeriod } from '../../../core/models';
import { AuthService } from '../../../core/services/auth';
import { TeacherService } from '../../../core/services/teacher';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private teacherService = inject(TeacherService);
  private authService = inject(AuthService);

  myCourses = this.teacherService.myCourses;
  liveClasses = this.teacherService.liveClasses;
  revenue = this.teacherService.revenue;
  totalCourses = this.teacherService.totalCourses;
  totalStudents = this.teacherService.totalStudents;
  
  fullName = this.authService.fullName;
  isLoadingCourses = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoadingCourses.set(true);

    this.teacherService.getMyCourses().subscribe({
      next: () => {
        this.isLoadingCourses.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoadingCourses.set(false);
      }
    });

    this.teacherService.getMyLiveClasses().subscribe({
      error: (error) => console.error('Error loading live classes:', error)
    });

    this.teacherService.getRevenue(RevenuePeriod.LAST_30_DAYS).subscribe({
      error: (error) => console.error('Error loading revenue:', error)
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PUBLISHED': 'Publicado',
      'PENDING': 'Pendiente',
      'DRAFT': 'Borrador',
      'REJECTED': 'Rechazado'
    };
    return labels[status] || status;
  }

  getBarHeight(revenue: number): number {
    const maxRevenue = Math.max(...(this.revenue()?.revenueByMonth.map(m => m.revenue) || [1]));
    return (revenue / maxRevenue) * 100;
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[parseInt(monthNum) - 1];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }
}