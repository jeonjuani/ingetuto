package com.ingenieriaPI.IngeTUTO.dto;

import com.ingenieriaPI.IngeTUTO.entity.EstadoTutoria;
import com.ingenieriaPI.IngeTUTO.entity.Modalidad;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class TutoriaDTO {
    private Integer idTutoria;
    private Integer idEstudiante;
    private String nombreEstudiante;
    private String telefonoEstudiante;
    private Integer idTutor;
    private String nombreTutor;
    private String telefonoTutor;
    private Integer idMateria;
    private String nombreMateria;
    private String nombreTema;
    private LocalDate fechaTutoria;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Modalidad modalidad;
    private String linkTutoria;
    private EstadoTutoria estado;
    private String archivoSoporte;
    private String observaciones;
    private LocalDateTime fechaSolicitud;
    private Boolean confirmacionEstudiante;
    private Boolean confirmacionTutor;
    private LocalDateTime fechaConfirmacionEstudiante;
    private LocalDateTime fechaConfirmacionTutor;

    // Constructor vacío
    public TutoriaDTO() {
    }

    // Constructor completo
    public TutoriaDTO(Integer idTutoria, Integer idEstudiante, String nombreEstudiante,
            Integer idTutor, String nombreTutor, Integer idMateria, String nombreMateria,
            String nombreTema, LocalDate fechaTutoria, LocalTime horaInicio, LocalTime horaFin,
            Modalidad modalidad, String linkTutoria, EstadoTutoria estado,
            String archivoSoporte, String observaciones, LocalDateTime fechaSolicitud,
            Boolean confirmacionEstudiante, Boolean confirmacionTutor,
            LocalDateTime fechaConfirmacionEstudiante, LocalDateTime fechaConfirmacionTutor) {
        this.idTutoria = idTutoria;
        this.idEstudiante = idEstudiante;
        this.nombreEstudiante = nombreEstudiante;
        this.idTutor = idTutor;
        this.nombreTutor = nombreTutor;
        this.idMateria = idMateria;
        this.nombreMateria = nombreMateria;
        this.nombreTema = nombreTema;
        this.fechaTutoria = fechaTutoria;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.modalidad = modalidad;
        this.linkTutoria = linkTutoria;
        this.estado = estado;
        this.archivoSoporte = archivoSoporte;
        this.observaciones = observaciones;
        this.fechaSolicitud = fechaSolicitud;
        this.confirmacionEstudiante = confirmacionEstudiante;
        this.confirmacionTutor = confirmacionTutor;
        this.fechaConfirmacionEstudiante = fechaConfirmacionEstudiante;
        this.fechaConfirmacionTutor = fechaConfirmacionTutor;
    }

    // Getters and Setters
    public Integer getIdTutoria() {
        return idTutoria;
    }

    public void setIdTutoria(Integer idTutoria) {
        this.idTutoria = idTutoria;
    }

    public Integer getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(Integer idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getNombreEstudiante() {
        return nombreEstudiante;
    }

    public void setNombreEstudiante(String nombreEstudiante) {
        this.nombreEstudiante = nombreEstudiante;
    }

    public String getTelefonoEstudiante() {
        return telefonoEstudiante;
    }

    public void setTelefonoEstudiante(String telefonoEstudiante) {
        this.telefonoEstudiante = telefonoEstudiante;
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

    public String getTelefonoTutor() {
        return telefonoTutor;
    }

    public void setTelefonoTutor(String telefonoTutor) {
        this.telefonoTutor = telefonoTutor;
    }

    public Integer getIdMateria() {
        return idMateria;
    }

    public void setIdMateria(Integer idMateria) {
        this.idMateria = idMateria;
    }

    public String getNombreMateria() {
        return nombreMateria;
    }

    public void setNombreMateria(String nombreMateria) {
        this.nombreMateria = nombreMateria;
    }

    public String getNombreTema() {
        return nombreTema;
    }

    public void setNombreTema(String nombreTema) {
        this.nombreTema = nombreTema;
    }

    public LocalDate getFechaTutoria() {
        return fechaTutoria;
    }

    public void setFechaTutoria(LocalDate fechaTutoria) {
        this.fechaTutoria = fechaTutoria;
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

    public String getLinkTutoria() {
        return linkTutoria;
    }

    public void setLinkTutoria(String linkTutoria) {
        this.linkTutoria = linkTutoria;
    }

    public EstadoTutoria getEstado() {
        return estado;
    }

    public void setEstado(EstadoTutoria estado) {
        this.estado = estado;
    }

    public String getArchivoSoporte() {
        return archivoSoporte;
    }

    public void setArchivoSoporte(String archivoSoporte) {
        this.archivoSoporte = archivoSoporte;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public Boolean getConfirmacionEstudiante() {
        return confirmacionEstudiante;
    }

    public void setConfirmacionEstudiante(Boolean confirmacionEstudiante) {
        this.confirmacionEstudiante = confirmacionEstudiante;
    }

    public Boolean getConfirmacionTutor() {
        return confirmacionTutor;
    }

    public void setConfirmacionTutor(Boolean confirmacionTutor) {
        this.confirmacionTutor = confirmacionTutor;
    }

    public LocalDateTime getFechaConfirmacionEstudiante() {
        return fechaConfirmacionEstudiante;
    }

    public void setFechaConfirmacionEstudiante(LocalDateTime fechaConfirmacionEstudiante) {
        this.fechaConfirmacionEstudiante = fechaConfirmacionEstudiante;
    }

    public LocalDateTime getFechaConfirmacionTutor() {
        return fechaConfirmacionTutor;
    }

    public void setFechaConfirmacionTutor(LocalDateTime fechaConfirmacionTutor) {
        this.fechaConfirmacionTutor = fechaConfirmacionTutor;
    }
}
