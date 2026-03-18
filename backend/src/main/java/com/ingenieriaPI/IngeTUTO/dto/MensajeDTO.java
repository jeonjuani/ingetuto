package com.ingenieriaPI.IngeTUTO.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MensajeDTO {
    private Integer idMensaje;
    private Integer idTutoria;
    private Integer idEmisor;
    private String nombreEmisor;
    private String contenido;
    private LocalDateTime fechaEnvio;
    private Boolean leido;
    private LocalDateTime fechaLectura;
}