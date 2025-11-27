import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rating-stars d-inline-flex align-items-center gap-1">
      @for (star of stars; track $index) {
        <i 
          class="bi star-icon"
          [class.bi-star-fill]="star === 'full'"
          [class.bi-star-half]="star === 'half'"
          [class.bi-star]="star === 'empty'"
          [class.interactive]="interactive"
          [class.text-warning]="star !== 'empty'"
          [class.text-muted]="star === 'empty'"
          (click)="onStarClick($index)"
          (mouseenter)="onStarHover($index)"
          (mouseleave)="onStarLeave()">
        </i>
      }
      @if (showValue) {
        <span class="ms-2 text-muted small">({{ rating.toFixed(1) }})</span>
      }
    </div>
  `,
  styles: [`
    .star-icon {
      font-size: 1rem;
      transition: all 0.2s ease;
      
      &.interactive {
        cursor: pointer;
        
        &:hover {
          transform: scale(1.2);
        }
      }
    }
  `]
})
export class RatingStars {
  @Input() rating: number = 0;
  @Input() interactive: boolean = false;
  @Input() showValue: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars: ('full' | 'half' | 'empty')[] = [];
  hoverRating: number = 0;

  ngOnInit() {
    this.updateStars();
  }

  ngOnChanges() {
    this.updateStars();
  }

  private updateStars() {
    const displayRating = this.hoverRating || this.rating;
    this.stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (displayRating >= i) {
        this.stars.push('full');
      } else if (displayRating >= i - 0.5) {
        this.stars.push('half');
      } else {
        this.stars.push('empty');
      }
    }
  }

  onStarClick(index: number) {
    if (this.interactive) {
      this.rating = index + 1;
      this.ratingChange.emit(this.rating);
      this.updateStars();
    }
  }

  onStarHover(index: number) {
    if (this.interactive) {
      this.hoverRating = index + 1;
      this.updateStars();
    }
  }

  onStarLeave() {
    if (this.interactive) {
      this.hoverRating = 0;
      this.updateStars();
    }
  }
}