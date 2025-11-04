package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="tbl_registro_aspirante_tutor")
@Data
public class RegistroAspirante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_solicitud")
    private Integer id_solicitud;

    @ManyToOne
    @JoinColumn(name="id_aspirante",referencedColumnName = "id_usuario",nullable = false)
    private Usuario aspirante;

    @ManyToOne
    @JoinColumn(name="id_materia",nullable = false)
    private Materia materia;

    @Column(name="fecha_solicitud")
    private LocalDate fecha_solicitud;

    @Column(name="estado")
    private String estado;

    @Column(name="historia_academica")
    private String historia_academica;

    @Column(name="archivo_soporte")
    private String archivo_soporte;

    @Column(name="observacion")
    private String observacion;

}

