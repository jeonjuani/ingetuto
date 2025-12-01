package com.ingenieriaPI.IngeTUTO.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ingenieriaPI.IngeTUTO.entity.EstadoDisponibilidad;
import com.ingenieriaPI.IngeTUTO.entity.Modalidad;

import java.time.LocalDate;
import java.time.LocalTime;

public class DisponibilidadMensualDTO {
    private Integer idDisponibilidadMensual;
    private Integer idTutor;
    private String nombreTutor;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaInicio;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaFin;

    private Modalidad modalidad;
    private EstadoDisponibilidad estado;

    public DisponibilidadMensualDTO() {
    }

    public DisponibilidadMensualDTO(Integer idDisponibilidadMensual, Integer idTutor, String nombreTutor,
            LocalDate fecha, LocalTime horaInicio, LocalTime horaFin,
            Modalidad modalidad, EstadoDisponibilidad estado) {
        this.idDisponibilidadMensual = idDisponibilidadMensual;
        this.idTutor = idTutor;
        this.nombreTutor = nombreTutor;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.modalidad = modalidad;
        this.estado = estado;
    }

    public Integer getIdDisponibilidadMensual() {
        return idDisponibilidadMensual;
    }

    public void setIdDisponibilidadMensual(Integer idDisponibilidadMensual) {
        this.idDisponibilidadMensual = idDisponibilidadMensual;
    }

    public Integer getIdTutor() {
        return idTutor;
    }

    public void setIdTutor(Integer idTutor) {
        this.idTutor = idTutor;
    }

    public String getNombreTutor() {
        return nombreTutor;
    }

    public void setNombreTutor(String nombreTutor) {
        this.nombreTutor = nombreTutor;
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

    public Modalidad getModalidad() {
        return modalidad;
    }

    public void setModalidad(Modalidad modalidad) {
        this.modalidad = modalidad;
    }

    public EstadoDisponibilidad getEstado() {
        return estado;
    }

    public void setEstado(EstadoDisponibilidad estado) {
        this.estado = estado;
    }
}
