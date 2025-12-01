package com.proyecto.proyectobackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.proyectobackend.dto.CreateReviewRequest;
import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.Review;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.repository.CourseRepository;
import com.proyecto.proyectobackend.repository.EnrollmentRepository;
import com.proyecto.proyectobackend.repository.ReviewRepository;
import com.proyecto.proyectobackend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    // 1. Estudiante crea una reseña
    @Transactional
    public Review createReview(CreateReviewRequest request) {
        User student = getAuthenticatedUser();
        
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Validar: ¿Compró el curso?
        boolean hasEnrolled = enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId());
        if (!hasEnrolled) {
            throw new RuntimeException("Debes estar inscrito para calificar este curso");
        }

        // Validar: ¿Ya dejó reseña antes? (Opcional, para evitar spam)
        // ... (Podrías implementar existsByStudentIdAndCourseId en ReviewRepository)

        Review review = Review.builder()
                .course(course)
                .student(student)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVerifiedPurchase(true)
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        // ACTUALIZAR PROMEDIO DEL CURSO
        updateCourseRating(course);

        return savedReview;
    }

    // 2. Profesor responde a una reseña
    @Transactional
    public Review replyToReview(Long reviewId, String responseText) {
        User teacher = getAuthenticatedUser();
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));

        // Validar que sea el dueño del curso
        if (!review.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No puedes responder reseñas de cursos ajenos");
        }

        review.setTeacherResponse(responseText);
        review.setTeacherResponseAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    // 3. Obtener reseñas de un curso
    public List<Review> getCourseReviews(Long courseId) {
        return reviewRepository.findByCourseId(courseId);
    }

    // --- Auxiliares ---

    private void updateCourseRating(Course course) {
        List<Review> reviews = reviewRepository.findByCourseId(course.getId());
        
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        
        int totalReviews = reviews.size();

        course.setRating(Math.round(average * 10.0) / 10.0); // Redondear a 1 decimal (ej: 4.5)
        course.setTotalReviews(totalReviews);
        
        courseRepository.save(course);
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}