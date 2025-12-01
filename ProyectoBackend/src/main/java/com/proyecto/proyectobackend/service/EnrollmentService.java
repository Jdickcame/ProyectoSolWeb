package com.proyecto.proyectobackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.proyectobackend.dto.EnrollmentRequest;
import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.Enrollment;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.model.enums.EnrollmentStatus;
import com.proyecto.proyectobackend.repository.CourseRepository;
import com.proyecto.proyectobackend.repository.EnrollmentRepository;
import com.proyecto.proyectobackend.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public Enrollment enrollStudent(EnrollmentRequest request) {
        // 1. Obtener estudiante autenticado
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Buscar el curso
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // 3. Validar si YA está inscrito
        boolean alreadyEnrolled = enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId());
        if (alreadyEnrolled) {
            throw new RuntimeException("Ya estás inscrito en este curso");
        }

        // 4. Crear la inscripción
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .amountPaid(course.getPrice()) // Usamos el precio REAL de la BD
                .currency(course.getCurrency())
                .paymentId("PAY-" + System.currentTimeMillis()) // Simulamos un ID de pago (luego integraremos PayPal/Stripe)
                .status(EnrollmentStatus.ACTIVE)
                .enrolledAt(LocalDateTime.now())
                .progressPercentage(0)
                .build();
        
        // 5. Actualizar contador de estudiantes del curso (Opcional pero recomendado)
        course.setEnrolledStudents(course.getEnrolledStudents() + 1);
        courseRepository.save(course);

        return enrollmentRepository.save(enrollment);
    }

    public java.util.List<Enrollment> getMyEnrollments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        return enrollmentRepository.findByStudentId(student.getId());
    }

    // 2. Marcar lección como completada
    @Transactional
    public void markLessonAsComplete(Long courseId, Long lessonId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("No estás inscrito en este curso"));

        // Agregar el ID de la lección al Set de completadas
        enrollment.getCompletedLessonIds().add(lessonId);

        // Calcular nuevo progreso %
        int totalLessons = calculateTotalLessons(enrollment.getCourse());
        int completedCount = enrollment.getCompletedLessonIds().size();
        
        if (totalLessons > 0) {
            int progress = (int) ((double) completedCount / totalLessons * 100);
            enrollment.setProgressPercentage(Math.min(progress, 100));
            
            // Si llegó al 100%, marcamos fecha de completado
            if (progress >= 100 && enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(LocalDateTime.now());
                enrollment.setStatus(EnrollmentStatus.COMPLETED);
            }
        }

        enrollmentRepository.save(enrollment);
    }

    // Auxiliar para contar lecciones totales de un curso
    private int calculateTotalLessons(Course course) {
        return course.getSections().stream()
                .mapToInt(section -> section.getLessons().size())
                .sum();
    }
}