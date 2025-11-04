package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name="tbl_roles")
@Data
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_rol")
    private Integer id_rol;

    @NotBlank
    @Column(name="nombre_rol")
    private String nombre_rol;

    @NotBlank
    @Column(name="desc_rol")
    private String desc_rol;
}
