package com.ingenieriaPI.IngeTUTO.entity;

import lombok.Data;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tbl_registro_aspirante_tutor")
@Data
public class RegistroAspirante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @ManyToOne
    @JoinColumn(name = "id_aspirante", nullable = false)
    private Usuario aspirante;

    @ManyToOne
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud;

    @Column(name = "estado")
    private String estado; // "EN_REVISIÓN", "APROBADO", "DENEGADO"

    @Column(name = "historia_academica")
    private String historiaAcademica; // Path to file

    @Column(name = "archivo_soporte")
    private String archivoSoporte; // Path to file

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;
}
