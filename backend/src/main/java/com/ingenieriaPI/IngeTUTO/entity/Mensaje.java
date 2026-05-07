package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name="tbl_mensajes")
@Data
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_mensaje")
    private Integer idMensaje;

    @ManyToOne
    @JoinColumn(name="id_tutoria", nullable=false)
    private Tutoria tutoria;

    @ManyToOne
    @JoinColumn(name="id_emisor", nullable=false)
    private Usuario emisor;

    @Column(name="contenido", nullable=false, columnDefinition="TEXT")
    private String contenido;

    @Column(name="fecha_envio", nullable=false)
    private LocalDateTime fechaEnvio;

    @Column(name="leido", nullable=false)
    private Boolean leido = false;

    @Column(name="fecha_lectura")
    private LocalDateTime fechaLectura;

    @Column(name="notificado_por_correo", nullable=false)
    private Boolean notificadoPorCorreo = false;
}