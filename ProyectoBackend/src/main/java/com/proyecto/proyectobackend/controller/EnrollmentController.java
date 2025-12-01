package com.proyecto.proyectobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.EnrollmentRequest;
import com.proyecto.proyectobackend.model.Enrollment;
import com.proyecto.proyectobackend.service.EnrollmentService;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // Inscribirse a un curso
    @PostMapping
    public ResponseEntity<Enrollment> enroll(@RequestBody @Valid EnrollmentRequest request) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(request));
    }
}