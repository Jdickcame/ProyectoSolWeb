package com.proyecto.proyectobackend.dto;

import com.proyecto.proyectobackend.model.Rol;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDTOs {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegistroRequest {
        private String nombre;
        private String apellido;
        private String email;
        private String password;
        private Rol rol;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String nombre;
        private String email;
        private Rol rol;
    }
}