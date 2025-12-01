package com.proyecto.proyectobackend.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.Enrollment;
import com.proyecto.proyectobackend.model.LiveClass;
import com.proyecto.proyectobackend.service.CertificateService;
import com.proyecto.proyectobackend.service.EnrollmentService;
import com.proyecto.proyectobackend.service.LiveClassService;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final EnrollmentService enrollmentService;
    private final CertificateService certificateService;
    private final LiveClassService liveClassService;

    // Obtener cursos inscritos (Devolvemos solo la data del curso para la lista)
    @GetMapping("/enrolled-courses")
    public ResponseEntity<List<Course>> getEnrolledCourses() {
        List<Enrollment> enrollments = enrollmentService.getMyEnrollments();
        
        // Extraemos solo los cursos de las inscripciones
        List<Course> courses = enrollments.stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(courses);
    }
    
    // Obtener el progreso específico de un curso
    @GetMapping("/courses/{courseId}/progress")
    public ResponseEntity<Enrollment> getCourseProgress(@PathVariable Long courseId) {
        // Reusamos el método getMyEnrollments y filtramos (o podrías crear uno específico en el service)
        Enrollment enrollment = enrollmentService.getMyEnrollments().stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Curso no encontrado en tus inscripciones"));
                
        return ResponseEntity.ok(enrollment);
    }

    // Marcar lección como completada
    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<Void> completeLesson(
            @PathVariable Long courseId, 
            @PathVariable Long lessonId
    ) {
        enrollmentService.markLessonAsComplete(courseId, lessonId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/courses/{courseId}/certificate")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long courseId) {
        
        // 1. Buscar la inscripción
        Enrollment enrollment = enrollmentService.getMyEnrollments().stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No estás inscrito en este curso"));

        // 2. Verificar que esté completado (100%)
        if (enrollment.getProgressPercentage() < 100) {
            throw new RuntimeException("Debes completar el curso al 100% para obtener el certificado.");
        }

        // 3. Generar PDF
        byte[] pdfContent = certificateService.generateCertificate(enrollment);

        // 4. Devolver como archivo descargable
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificado.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }

    @GetMapping("/upcoming-classes")
    public ResponseEntity<List<LiveClass>> getUpcomingClasses() {
        return ResponseEntity.ok(liveClassService.getStudentUpcomingClasses());
    }

    @GetMapping("/courses/{courseId}/is-enrolled")
    public ResponseEntity<Map<String, Boolean>> checkEnrollmentStatus(@PathVariable Long courseId) {
        boolean isEnrolled = false;
        try {
            // Reutilizamos la lógica del servicio. Si lanza excepción es que no existe.
            // Pero mejor aún, creamos un método seguro en el repositorio.
            // Para hacerlo rápido y seguro:
            var enrollments = enrollmentService.getMyEnrollments();
            isEnrolled = enrollments.stream()
                    .anyMatch(e -> e.getCourse().getId().equals(courseId));
        } catch (Exception e) {
            isEnrolled = false;
        }

        return ResponseEntity.ok(Collections.singletonMap("enrolled", isEnrolled));
    }

    // Historial completo de inscripciones (con progreso)
    @GetMapping("/enrollments")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments() {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments());
    }
}