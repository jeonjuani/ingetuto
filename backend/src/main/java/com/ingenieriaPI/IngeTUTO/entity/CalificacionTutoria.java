package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="tbl_calificacion_tutorias")
@Data
public class CalificacionTutoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_calificacion")
    private Integer id_calificacion;

    @ManyToOne
    @JoinColumn(name="id_tutoria",nullable = false)
    private Tutoria tutoria;

    @NotNull
    @Column(name="puntuacion")
    private Integer puntuacion;

    @Column(name="fecha_calificacion")
    private LocalDate fecha_calificacion;

    @Column(name="comentario")
    private String comentario;



}
