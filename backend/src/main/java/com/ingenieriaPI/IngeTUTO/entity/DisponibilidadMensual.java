package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "tbl_disponibilidad_mensual", uniqueConstraints = @UniqueConstraint(columnNames = { "tutor_id", "fecha",
        "hora_inicio" }))
@Data
public class DisponibilidadMensual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer idDisponibilidadMensual;

    @ManyToOne
    @JoinColumn(name = "tutor_id", referencedColumnName = "id_usuario", nullable = false)
    private Usuario tutor;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad", nullable = false)
    private Modalidad modalidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoDisponibilidad estado = EstadoDisponibilidad.DISPONIBLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "origen", nullable = false)
    private OrigenDisponibilidad origen = OrigenDisponibilidad.PLANTILLA;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaModificacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaModificacion = LocalDateTime.now();
    }
}
