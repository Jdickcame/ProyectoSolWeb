import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevenuePeriod } from '../../../core/models';
import { TeacherService } from '../../../core/services/teacher';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer, LoadingSpinner],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss']
})
export class Analytics implements OnInit {
  private teacherService = inject(TeacherService);

  revenue = this.teacherService.revenue;
  myCourses = this.teacherService.myCourses;
  isLoading = signal<boolean>(false);
  selectedPeriod = signal<RevenuePeriod>(RevenuePeriod.LAST_30_DAYS);

  periods = [
    { value: RevenuePeriod.LAST_7_DAYS, label: 'Últimos 7 días' },
    { value: RevenuePeriod.LAST_30_DAYS, label: 'Últimos 30 días' },
    { value: RevenuePeriod.LAST_90_DAYS, label: 'Últimos 90 días' },
    { value: RevenuePeriod.LAST_YEAR, label: 'Último año' },
    { value: RevenuePeriod.ALL_TIME, label: 'Todo el tiempo' },
  ];

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);

    this.teacherService.getRevenue(this.selectedPeriod()).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading revenue:', error);
        this.isLoading.set(false);
      }
    });

    this.teacherService.getMyCourses().subscribe({
      error: (error) => console.error('Error loading courses:', error)
    });
  }

  changePeriod(period: RevenuePeriod): void {
    this.selectedPeriod.set(period);
    this.loadAnalytics();
  }

  getBarHeight(revenue: number): number {
    if (!this.revenue() || this.revenue()!.revenueByMonth.length === 0) {
      return 0;
    }
    const maxRevenue = Math.max(...this.revenue()!.revenueByMonth.map(m => m.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }

  getPercentage(revenue: number): number {
    if (!this.revenue() || this.revenue()!.totalRevenue === 0) {
      return 0;
    }
    return (revenue / this.revenue()!.totalRevenue) * 100;
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[parseInt(monthNum) - 1];
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'PROGRAMMING': 'Programación',
      'DESIGN': 'Diseño',
      'BUSINESS': 'Negocios',
      'MARKETING': 'Marketing',
    };
    return categories[category] || category;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PUBLISHED': 'Publicado',
      'PENDING': 'Pendiente',
      'DRAFT': 'Borrador',
    };
    return labels[status] || status;
  }
}