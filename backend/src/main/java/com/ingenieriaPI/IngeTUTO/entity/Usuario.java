package com.ingenieriaPI.IngeTUTO.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tbl_usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @NotBlank
    @Column(name = "primer_nombre_usuario")
    private String primerNombre;

    @Column(name = "segundo_nombre_usuario")
    private String segundoNombre;

    @NotBlank
    @Column(name = "primer_apellido_usuario")
    private String primerApellido;

    @Column(name = "segundo_apellido_usuario")
    private String segundoApellido;

    @NotBlank
    @Column(name = "correo_usuario")
    private String correoUsuario;

    @Column(name = "telefono_usuario")
    private String telefonoUsuario;

    @OneToMany(mappedBy = "tutor")
    @JsonIgnore
    private List<Tutoria> tutoriaTutor;

    @OneToMany(mappedBy = "estudiante")
    @JsonIgnore
    private List<Tutoria> tutoriaEstudiante;

    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<CancelacionTutorias> cancelacionTutorias;

    @OneToMany(mappedBy = "aspirante")
    @JsonIgnore
    private List<RegistroAspirante> registroAspirantes;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "tbl_rol_x_usuario", joinColumns = @JoinColumn(name = "id_usuario"), inverseJoinColumns = @JoinColumn(name = "id_rol"))
    private Set<Rol> roles = new HashSet<>();
}
