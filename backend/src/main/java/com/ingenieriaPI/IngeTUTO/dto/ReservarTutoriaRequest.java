package com.ingenieriaPI.IngeTUTO.dto;

public class ReservarTutoriaRequest {
    private Integer bloqueId;
    private Integer materiaId;
    private String nombreTema;

    // Constructors
    public ReservarTutoriaRequest() {
    }

    public ReservarTutoriaRequest(Integer bloqueId, Integer materiaId, String nombreTema) {
        this.bloqueId = bloqueId;
        this.materiaId = materiaId;
        this.nombreTema = nombreTema;
    }

    // Getters and Setters
    public Integer getBloqueId() {
        return bloqueId;
    }

    public void setBloqueId(Integer bloqueId) {
        this.bloqueId = bloqueId;
    }

    public Integer getMateriaId() {
        return materiaId;
    }

    public void setMateriaId(Integer materiaId) {
        this.materiaId = materiaId;
    }

    public String getNombreTema() {
        return nombreTema;
    }

    public void setNombreTema(String nombreTema) {
        this.nombreTema = nombreTema;
    }
}
