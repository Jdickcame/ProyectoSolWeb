package com.proyecto.proyectobackend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.proyecto.proyectobackend.dto.AuthDTOs.AuthResponse;
import com.proyecto.proyectobackend.dto.AuthDTOs.LoginRequest;
import com.proyecto.proyectobackend.dto.AuthDTOs.RegistroRequest;
import com.proyecto.proyectobackend.model.Rol;
import com.proyecto.proyectobackend.model.Usuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtServicio jwtServicio;
    private final AuthenticationManager authenticationManager;

    public AuthResponse registrar(RegistroRequest request) {
        var usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol() != null ? request.getRol() : Rol.ESTUDIANTE)
                .build();
        
        usuarioRepositorio.save(usuario);
        var jwtToken = jwtServicio.generarToken(usuario);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var usuario = usuarioRepositorio.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtServicio.generarToken(usuario);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .build();
    }
}