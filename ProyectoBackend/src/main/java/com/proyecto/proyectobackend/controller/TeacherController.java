package com.proyecto.proyectobackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.CourseResponse;
import com.proyecto.proyectobackend.dto.CreateCourseRequest;
import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.Enrollment;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.repository.CourseRepository;
import com.proyecto.proyectobackend.repository.EnrollmentRepository;
import com.proyecto.proyectobackend.repository.UserRepository;
import com.proyecto.proyectobackend.service.CourseService;

import jakarta.validation.Valid;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseService courseService;
    private static final double TEACHER_SHARE = 0.80;

    // Obtener cursos creados por mí (Profesor)
    @GetMapping("/my-courses")
    public ResponseEntity<List<Course>> getMyCourses() {
        User teacher = getAuthenticatedTeacher();
        return ResponseEntity.ok(courseRepository.findByTeacherId(teacher.getId()));
    }

    // Obtener reporte de ingresos
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue() {
        User teacher = getAuthenticatedTeacher();
        
        // 1. Buscar TODAS las ventas de este profesor
        List<Enrollment> mySales = enrollmentRepository.findAll().stream()
                .filter(e -> e.getCourse().getTeacher().getId().equals(teacher.getId()))
                .collect(Collectors.toList());

        // 2. Calcular Total Acumulado (Aplicando el 80%)
        Double totalRevenue = mySales.stream()
                .mapToDouble(e -> (e.getAmountPaid() != null ? e.getAmountPaid() : 0.0) * TEACHER_SHARE)
                .sum();

        // 3. Calcular Desglose Mensual (Aplicando el 80%)
        Map<String, Double> revenueMap = mySales.stream()
                .filter(e -> e.getEnrolledAt() != null && e.getAmountPaid() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getEnrolledAt().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.summingDouble(e -> e.getAmountPaid() * TEACHER_SHARE) // <--- APLICAMOS COMISIÓN AQUÍ TAMBIÉN
                ));

        // Ordenar por fecha para la gráfica
        List<Map<String, Object>> revenueByMonth = revenueMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("month", entry.getKey());
                    m.put("revenue", Math.round(entry.getValue() * 100.0) / 100.0); // Redondear a 2 decimales
                    return m;
                })
                .collect(Collectors.toList());

        // Armar respuesta
        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        response.put("revenueByMonth", revenueByMonth);
        
        // Datos extra
        response.put("totalStudents", mySales.stream().map(Enrollment::getStudent).distinct().count());
        response.put("totalCourses", courseRepository.findByTeacherId(teacher.getId()).size());
        
        return ResponseEntity.ok(response);
    }

    // Método auxiliar para obtener usuario logueado
    private User getAuthenticatedTeacher() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @PostMapping("/courses")
    public ResponseEntity<CourseResponse> createCourse(@RequestBody @Valid CreateCourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    //OBTENER CURSO POR ID (Para editar)
    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        User teacher = getAuthenticatedTeacher();
        
        // Llamamos a un nuevo método en el servicio que convierte a DTO
        return ResponseEntity.ok(courseService.getTeacherCourseById(id, teacher.getId()));
    }

    // ACTUALIZAR CURSO
    @PatchMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id, 
            @RequestBody CreateCourseRequest request
    ) {
        User teacher = getAuthenticatedTeacher();
        // Llamamos al servicio (necesitaremos agregar el método updateCourse allá)
        return ResponseEntity.ok(courseService.updateCourse(id, request, teacher.getId()));
    }

    // Ver estudiantes de un curso específico
    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<User>> getCourseStudents(@PathVariable Long courseId) {
        User teacher = getAuthenticatedTeacher();
        
        // 1. Verificar que el curso es mío
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No autorizado");
        }

        // 2. Buscar las inscripciones de ese curso
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        // 3. Extraer los usuarios (estudiantes)
        List<User> students = enrollments.stream()
                .map(Enrollment::getStudent)
                .collect(Collectors.toList());

        return ResponseEntity.ok(students);
    }
}