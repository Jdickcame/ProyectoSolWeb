package com.proyecto.proyectobackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.service.AdminService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // --- Usuarios ---
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.toggleUserStatus(userId));
    }

    // --- Cursos ---
    @GetMapping("/courses/pending")
    public ResponseEntity<List<Course>> getPendingCourses() {
        return ResponseEntity.ok(adminService.getPendingCourses());
    }

    @PatchMapping("/courses/{courseId}/approve")
    public ResponseEntity<Course> approveCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(adminService.approveCourse(courseId));
    }

    @PatchMapping("/courses/{courseId}/reject")
    public ResponseEntity<Course> rejectCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(adminService.rejectCourse(courseId));
    }

    // --- Dashboard ---
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getGlobalStats());
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(adminService.getAllCourses());
    }
}