package com.ingenieriaPI.IngeTUTO.dto;

import java.time.LocalDate;

public class GenerarDisponibilidadResponse {
    private boolean exito;
    private String mensaje;
    private Integer bloquesGenerados;
    private LocalDate fechaLimiteRegistro;

    public GenerarDisponibilidadResponse() {
    }

    public GenerarDisponibilidadResponse(boolean exito, String mensaje, Integer bloquesGenerados,
            LocalDate fechaLimiteRegistro) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.bloquesGenerados = bloquesGenerados;
        this.fechaLimiteRegistro = fechaLimiteRegistro;
    }

    public boolean isExito() {
        return exito;
    }

    public void setExito(boolean exito) {
        this.exito = exito;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Integer getBloquesGenerados() {
        return bloquesGenerados;
    }

    public void setBloquesGenerados(Integer bloquesGenerados) {
        this.bloquesGenerados = bloquesGenerados;
    }

    public LocalDate getFechaLimiteRegistro() {
        return fechaLimiteRegistro;
    }

    public void setFechaLimiteRegistro(LocalDate fechaLimiteRegistro) {
        this.fechaLimiteRegistro = fechaLimiteRegistro;
    }
}
