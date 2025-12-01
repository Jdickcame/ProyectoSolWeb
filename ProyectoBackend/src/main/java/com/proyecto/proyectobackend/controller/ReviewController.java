package com.proyecto.proyectobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.CreateReviewRequest;
import com.proyecto.proyectobackend.dto.ReplyReviewRequest;
import com.proyecto.proyectobackend.model.Review;
import com.proyecto.proyectobackend.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Crear Reseña (Estudiante)
    @PostMapping("/reviews")
    public ResponseEntity<Review> createReview(@RequestBody @Valid CreateReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(request));
    }

    // Responder Reseña (Profesor)
    @PatchMapping("/reviews/{reviewId}/reply")
    public ResponseEntity<Review> replyReview(
            @PathVariable Long reviewId,
            @RequestBody @Valid ReplyReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.replyToReview(reviewId, request.getResponse()));
    }

    // Ver reseñas de un curso (Público)
    @GetMapping("/courses/{courseId}/reviews")
    public ResponseEntity<List<Review>> getCourseReviews(@PathVariable Long courseId) {
        return ResponseEntity.ok(reviewService.getCourseReviews(courseId));
    }
}