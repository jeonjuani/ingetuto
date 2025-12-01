package com.ingenieriaPI.IngeTUTO.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ingenieriaPI.IngeTUTO.entity.DiaSemana;
import com.ingenieriaPI.IngeTUTO.entity.Modalidad;

import java.time.LocalTime;

public class DisponibilidadSemanalDTO {
    private Integer idDisponibilidadSemanal;
    private DiaSemana diaSemana;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaInicio;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaFin;

    private Modalidad modalidad;

    public DisponibilidadSemanalDTO() {
    }

    public DisponibilidadSemanalDTO(Integer idDisponibilidadSemanal, DiaSemana diaSemana,
            LocalTime horaInicio, LocalTime horaFin, Modalidad modalidad) {
        this.idDisponibilidadSemanal = idDisponibilidadSemanal;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.modalidad = modalidad;
    }

    public Integer getIdDisponibilidadSemanal() {
        return idDisponibilidadSemanal;
    }

    public void setIdDisponibilidadSemanal(Integer idDisponibilidadSemanal) {
        this.idDisponibilidadSemanal = idDisponibilidadSemanal;
    }

    public DiaSemana getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(DiaSemana diaSemana) {
        this.diaSemana = diaSemana;
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
}
