package com.ingenieriaPI.IngeTUTO.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "tbl_tutorias")
public class Tutoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tutoria")
    private Integer idTutoria;

    @ManyToOne
    @JoinColumn(name = "id_estudiante", referencedColumnName = "id_usuario", nullable = false)
    private Usuario estudiante;

    @ManyToOne
    @JoinColumn(name = "id_tutor", referencedColumnName = "id_usuario", nullable = false)
    private Usuario tutor;

    @ManyToOne
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @ManyToOne
    @JoinColumn(name = "id_disponibilidad_mensual")
    private DisponibilidadMensual disponibilidadMensual;

    @Column(name = "nombre_tema", length = 255)
    private String nombreTema;

    @Column(name = "fecha_tutoria", nullable = false)
    private LocalDate fechaTutoria;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad", length = 20, nullable = false)
    private Modalidad modalidad;

    @Column(name = "link_tutoria", length = 500)
    private String linkTutoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 30, nullable = false, columnDefinition = "estado_tutoria")
    private EstadoTutoria estado;

    @Column(name = "archivo_soporte", length = 500)
    private String archivoSoporte;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "confirmacion_estudiante")
    private Boolean confirmacionEstudiante = false;

    @Column(name = "confirmacion_tutor")
    private Boolean confirmacionTutor = false;

    @Column(name = "fecha_confirmacion_estudiante")
    private LocalDateTime fechaConfirmacionEstudiante;

    @Column(name = "fecha_confirmacion_tutor")
    private LocalDateTime fechaConfirmacionTutor;

    @ManyToOne
    @JoinColumn(name = "revisado_por_bienestar", referencedColumnName = "id_usuario")
    private Usuario revisadoPorBienestar;

    @Column(name = "fecha_revision_bienestar")
    private LocalDateTime fechaRevisionBienestar;

    // Constructors
    public Tutoria() {
        this.fechaSolicitud = LocalDateTime.now();
        this.confirmacionEstudiante = false;
        this.confirmacionTutor = false;
    }

    // Getters and Setters
    public Integer getIdTutoria() {
        return idTutoria;
    }

    public void setIdTutoria(Integer idTutoria) {
        this.idTutoria = idTutoria;
    }

    public Usuario getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Usuario estudiante) {
        this.estudiante = estudiante;
    }

    public Usuario getTutor() {
        return tutor;
    }

    public void setTutor(Usuario tutor) {
        this.tutor = tutor;
    }

    public Materia getMateria() {
        return materia;
    }

    public void setMateria(Materia materia) {
        this.materia = materia;
    }

    public DisponibilidadMensual getDisponibilidadMensual() {
        return disponibilidadMensual;
    }

    public void setDisponibilidadMensual(DisponibilidadMensual disponibilidadMensual) {
        this.disponibilidadMensual = disponibilidadMensual;
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

    public Usuario getRevisadoPorBienestar() {
        return revisadoPorBienestar;
    }

    public void setRevisadoPorBienestar(Usuario revisadoPorBienestar) {
        this.revisadoPorBienestar = revisadoPorBienestar;
    }

    public LocalDateTime getFechaRevisionBienestar() {
        return fechaRevisionBienestar;
    }

    public void setFechaRevisionBienestar(LocalDateTime fechaRevisionBienestar) {
        this.fechaRevisionBienestar = fechaRevisionBienestar;
    }
}
