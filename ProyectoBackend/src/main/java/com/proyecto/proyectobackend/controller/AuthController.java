package com.proyecto.proyectobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.AuthResponse;
import com.proyecto.proyectobackend.dto.LoginRequest;
import com.proyecto.proyectobackend.dto.RegisterRequest;
import com.proyecto.proyectobackend.service.AuthService;

@RestController
@RequestMapping("/api/auth") // La ruta base será /api/auth (por el context-path en properties)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    // Endpoint simple para validar token desde el frontend (al recargar página)
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken() {
        // Si la petición llega aquí, el token ya pasó el filtro de seguridad, así que es válido.
        return ResponseEntity.ok(true);
    }
}