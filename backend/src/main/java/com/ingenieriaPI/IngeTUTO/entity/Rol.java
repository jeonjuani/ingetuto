package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tbl_roles")
@Data
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre_rol", unique = true, nullable = false)
    private String nombre;

    @Column(name = "desc_rol")
    private String descripcion;
}
