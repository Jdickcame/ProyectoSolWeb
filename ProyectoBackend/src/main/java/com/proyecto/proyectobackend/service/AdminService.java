package com.proyecto.proyectobackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.Enrollment;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.model.enums.CourseStatus;
import com.proyecto.proyectobackend.repository.CourseRepository;
import com.proyecto.proyectobackend.repository.EnrollmentRepository;
import com.proyecto.proyectobackend.repository.UserRepository;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    // 1. Gestión de Usuarios
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Invertir estado (Si está activo lo desactiva, y viceversa)
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    // 2. Moderación de Cursos
    public List<Course> getPendingCourses() {
        return courseRepository.findByStatus(CourseStatus.PENDING);
    }

    @Transactional
    public Course approveCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        course.setStatus(CourseStatus.PUBLISHED);
        return courseRepository.save(course);
    }

    @Transactional
    public Course rejectCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        course.setStatus(CourseStatus.REJECTED);
        return courseRepository.save(course);
    }

    // 3. Estadísticas Globales
    public Map<String, Object> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalEnrollments", enrollmentRepository.count());
        
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();

        // 1. Total Histórico
        Double totalRevenue = allEnrollments.stream()
                .mapToDouble(e -> e.getAmountPaid() != null ? e.getAmountPaid() : 0.0)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        // 2. Ingresos por Mes (Dinámico)
        // Agrupamos por "YYYY-MM" y sumamos
        Map<String, Double> revenueMap = allEnrollments.stream()
                .filter(e -> e.getEnrolledAt() != null && e.getAmountPaid() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getEnrolledAt().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.summingDouble(Enrollment::getAmountPaid)
                ));

        // Convertimos el mapa a la lista ordenada que espera el frontend
        List<Map<String, Object>> revenueByMonth = revenueMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // Ordenar por fecha
                .map(entry -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("month", entry.getKey());
                    m.put("revenue", entry.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        stats.put("revenueByMonth", revenueByMonth);
        
        return stats;
    }

    // Obtener TODOS los cursos (para la tabla de gestión)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }
}