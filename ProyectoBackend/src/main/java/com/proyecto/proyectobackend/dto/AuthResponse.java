package com.proyecto.proyectobackend.dto;

import com.proyecto.proyectobackend.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private User user; // Devolveremos los datos del usuario para el frontend
}
