package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="tbl_tutor_x_materia")
@Data
public class TutorXMateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_tutor_x_materia")
    private Integer id_tutor_x_materia;

    @ManyToOne
    @JoinColumn(name="id_tutor",referencedColumnName = "id_usuario",nullable = false)
    private Usuario tutor;

    @ManyToOne
    @JoinColumn(name="id_materia", nullable = false)
    private Materia materia;
}
