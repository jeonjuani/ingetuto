package com.ingenieriaPI.IngeTUTO.dto;

public class CancelarTutoriaRequest {
    private String observaciones;

    // Constructors
    public CancelarTutoriaRequest() {
    }

    public CancelarTutoriaRequest(String observaciones) {
        this.observaciones = observaciones;
    }

    // Getters and Setters
    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
