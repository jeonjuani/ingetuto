package com.ingenieriaPI.IngeTUTO.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "tbl_materias")
@Data
public class Materia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_materia")
    private Integer id_materia;

    @NotBlank
    @Column(name = "nombre_materia")
    private String nombre_materia;

    @NotBlank
    @Column(name = "codigo_materia", unique = true)
    private String codigoMateria;

    @OneToMany(mappedBy = "materia")
    @JsonIgnore
    private List<Tutoria> tutorias;

    @OneToMany(mappedBy = "materia")
    @JsonIgnore
    private List<RegistroAspirante> registroAspirantes;
}
