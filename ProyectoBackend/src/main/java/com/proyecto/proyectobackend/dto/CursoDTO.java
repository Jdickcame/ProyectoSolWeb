package com.proyecto.proyectobackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.proyecto.proyectobackend.modelo.EstadoCurso;

import lombok.Data;

@Data
public class CursoDTO {
    private Long id;
    private String titulo;
    private String descripcionCorta;
    private String descripcion;
    private String categoria;
    private String nivel;
    private BigDecimal precio;
    private String urlImagen;
    private boolean tieneCertificado;
    private boolean tieneClasesEnVivo;
    private EstadoCurso estado;
    private LocalDateTime fechaCreacion;
    
    // Datos extras
    private String nombreProfesor; 
    private Double calificacion;
    private Integer estudiantesInscritos;
}