package com.proyecto.proyectobackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.proyecto.proyectobackend.dto.AuthResponse;
import com.proyecto.proyectobackend.dto.LoginRequest;
import com.proyecto.proyectobackend.dto.RegisterRequest;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // 1. Validar si el email ya existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // 2. Crear el usuario
        var user = User.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Encriptar password
                .role(request.getRole())
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .build();

        // 3. Guardar en BD
        userRepository.save(user);

        // 4. Generar Token
        var jwtToken = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), java.util.Collections.emptyList()
        ));

        // 5. Devolver respuesta
        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Autenticar con Spring Security (esto verifica user y password automáticamente)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Buscar usuario en BD (si llegamos aquí, la autenticación fue exitosa)
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // 3. Generar Token
        var jwtToken = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), java.util.Collections.emptyList()
        ));

        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }
}
