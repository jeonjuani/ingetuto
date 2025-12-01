package com.ingenieriaPI.IngeTUTO.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class BloquesSinModalidadDTO {
    private Integer idBloque;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;

    public BloquesSinModalidadDTO() {
    }

    public BloquesSinModalidadDTO(Integer idBloque, LocalDate fecha, LocalTime horaInicio, LocalTime horaFin) {
        this.idBloque = idBloque;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    public Integer getIdBloque() {
        return idBloque;
    }

    public void setIdBloque(Integer idBloque) {
        this.idBloque = idBloque;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }
}
