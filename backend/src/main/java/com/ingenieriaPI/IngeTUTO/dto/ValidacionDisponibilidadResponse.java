package com.ingenieriaPI.IngeTUTO.dto;

import java.util.ArrayList;
import java.util.List;

public class ValidacionDisponibilidadResponse {
    private boolean valido;
    private List<String> errores;
    private List<String> advertencias;
    private List<BloquesSinModalidadDTO> bloquesSinModalidad;

    public ValidacionDisponibilidadResponse() {
        this.errores = new ArrayList<>();
        this.advertencias = new ArrayList<>();
        this.bloquesSinModalidad = new ArrayList<>();
    }

    public ValidacionDisponibilidadResponse(boolean valido) {
        this();
        this.valido = valido;
    }

    public boolean isValido() {
        return valido;
    }

    public void setValido(boolean valido) {
        this.valido = valido;
    }

    public List<String> getErrores() {
        return errores;
    }

    public void setErrores(List<String> errores) {
        this.errores = errores;
    }

    public List<String> getAdvertencias() {
        return advertencias;
    }

    public void setAdvertencias(List<String> advertencias) {
        this.advertencias = advertencias;
    }

    public List<BloquesSinModalidadDTO> getBloquesSinModalidad() {
        return bloquesSinModalidad;
    }

    public void setBloquesSinModalidad(List<BloquesSinModalidadDTO> bloquesSinModalidad) {
        this.bloquesSinModalidad = bloquesSinModalidad;
    }

    public void agregarError(String error) {
        this.errores.add(error);
    }

    public void agregarAdvertencia(String advertencia) {
        this.advertencias.add(advertencia);
    }
}
