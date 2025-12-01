package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tbl_permisos")
@Data
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    private Integer idPermiso;

    @Column(name = "nombre_permiso", unique = true, nullable = false)
    private String nombre;

    @Column(name = "descripcion_permiso")
    private String descripcion;
}
