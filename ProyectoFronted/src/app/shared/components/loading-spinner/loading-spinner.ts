import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class.fullscreen]="fullscreen">
      <div class="spinner-wrapper">
        <div class="spinner-gradient" [style.width.px]="size" [style.height.px]="size"></div>
        @if (message) {
          <p class="loading-message mt-3 mb-0">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      
      &.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(11, 18, 32, 0.9);
        z-index: 9999;
      }
    }

    .spinner-wrapper {
      text-align: center;
    }

    .loading-message {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }
  `]
})
export class LoadingSpinner {
  @Input() size: number = 40;
  @Input() message: string = '';
  @Input() fullscreen: boolean = false;
}