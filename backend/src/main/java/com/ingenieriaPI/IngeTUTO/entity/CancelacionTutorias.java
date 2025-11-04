package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="tbl_cancelacion_tutorias")
@Data
public class CancelacionTutorias {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_cancelacion")
    private Integer id_cancelacion;

    @ManyToOne
    @JoinColumn(name="id_tutoria",nullable = false)
    private Tutoria tutoria;

    @ManyToOne
    @JoinColumn(name="id_accionante",referencedColumnName = "id_usuario",nullable = false)
    private Usuario usuario;

    @Column(name="motivo_cancelacion")
    private String motivo_cancelacion;
}
