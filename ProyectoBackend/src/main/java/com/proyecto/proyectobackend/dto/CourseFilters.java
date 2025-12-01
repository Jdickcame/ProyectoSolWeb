package com.proyecto.proyectobackend.dto;

import com.proyecto.proyectobackend.model.enums.CourseCategory;
import com.proyecto.proyectobackend.model.enums.CourseLevel;
import com.proyecto.proyectobackend.model.enums.CourseStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseFilters {
    private CourseCategory category;
    private CourseLevel level;
    private Double minPrice;
    private Double maxPrice;
    private String searchQuery;
    private CourseStatus status;
    private Boolean hasLiveClasses;
}
