package com.proyecto.proyectobackend.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.proyecto.proyectobackend.model.enums.Role;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data // Lombok: Genera Getters, Setters, toString, etc.
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Usaremos Long (número) para MySQL. El frontend lo recibirá como number.

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // Hash encriptado

    @Column(nullable = false)
    private String name;

    private String surname;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String avatar;
    private String phoneNumber;
    
    @Column(columnDefinition = "TEXT")
    private String biography; // Para profesores

    @Builder.Default
    private boolean isActive = true; // Para "banning" de admins
    
    // Campos específicos de Profesor (Social Links simplificado como JSON o String)
    // Nota: Para algo rápido, lo guardaremos como String, en el futuro puedes hacer una @Embeddable
    private String linkedinUrl;
    private String websiteUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}