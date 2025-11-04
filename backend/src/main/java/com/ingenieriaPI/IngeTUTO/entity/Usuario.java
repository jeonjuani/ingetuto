package com.ingenieriaPI.IngeTUTO.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Entity
@Table (name="tbl_usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_usuario")
    private Integer id_usuario;

    @NotBlank
    @Column(name="primer_nombre")
    private String primer_nombre;

    @Column(name="segundo_nombre")
    private String segundo_nombre;

    @NotBlank
    @Column(name="primer_apellido")
    private String primer_apellido;

    @Column(name="segundo_apellido")
    private String segundo_apellido;

    @NotBlank
    @Column(name="correo_usuario")
    private String correo_usuario;

    @Column(name="telefono_usuario")
    private String telefono_usuario;

    @OneToMany(mappedBy = "tutor")
    @JsonIgnore
    private List<Tutoria> tutoria_tutor;

    @OneToMany(mappedBy = "estudiante")
    @JsonIgnore
    private List<Tutoria> tutoria_estudiante;

    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<CancelacionTutorias> cancelacionTutorias;

    @OneToMany(mappedBy = "aspirante")
    @JsonIgnore
    private List<RegistroAspirante> registroAspirantes;

}
