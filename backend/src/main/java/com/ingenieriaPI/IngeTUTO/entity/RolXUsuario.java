package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="tbl_rol_x_usuario")
@Data
public class RolXUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_rol_x_usuario")
    private Integer id_rol_x_usuario;

    @ManyToOne
    @JoinColumn(name="id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name="id_rol", nullable = false)
    private Rol rol;
}
