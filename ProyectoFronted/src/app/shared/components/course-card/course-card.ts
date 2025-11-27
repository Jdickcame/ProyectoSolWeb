import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.scss']
})
export class CourseCard {
  @Input() course!: Course;

  getLevelText(level: string): string {
    const levels: { [key: string]: string } = {
      'BEGINNER': 'Principiante',
      'INTERMEDIATE': 'Intermedio',
      'ADVANCED': 'Avanzado',
      'ALL_LEVELS': 'Todos los niveles'
    };
    return levels[level] || level;
  }

  getCategoryText(category: string): string {
    const categories: { [key: string]: string } = {
      'PROGRAMMING': 'Programación',
      'DESIGN': 'Diseño',
      'BUSINESS': 'Negocios',
      'MARKETING': 'Marketing',
      'LANGUAGES': 'Idiomas',
      'DATA_SCIENCE': 'Ciencia de Datos',
      'PERSONAL_DEVELOPMENT': 'Desarrollo Personal',
      'PHOTOGRAPHY': 'Fotografía',
      'MUSIC': 'Música',
      'OTHER': 'Otro'
    };
    return categories[category] || category;
  }
}