package com.ingenieriaPI.IngeTUTO.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name="tbl_tutorias")
@Data
public class Tutoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_tutoria")
    private Integer id_tutoria;

    @ManyToOne
    @JoinColumn(name="id_materia",nullable = false)
    private Materia materia;

    @ManyToOne
    @JoinColumn(name="id_tutor",referencedColumnName = "id_usuario", nullable = false)
    private Usuario tutor;

    @ManyToOne
    @JoinColumn(name="id_estudiante",referencedColumnName = "id_usuario", nullable = false)
    private Usuario estudiante;

    @NotBlank
    @Column(name="nombre_tutoria")
    private String nombre_tutoria;

    @Column(name="fecha_tutoria")
    private LocalDate fecha_tutoria;

    @NotBlank
    @Column(name="link_tutoria")
    private String link_tutoria;

    @Column(name="estado")
    private String estado;

    @OneToMany(mappedBy = "tutoria")
    @JsonIgnore
    private List<CalificacionTutoria> calificaciontutoria;

    @OneToMany(mappedBy = "tutoria")
    @JsonIgnore
    private List<CancelacionTutorias> cancelacionTutorias;

}
