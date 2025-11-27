import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-stars.html',
  styleUrls: ['./rating-stars.scss']
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