package com.ingenieriaPI.IngeTUTO.dto;

import lombok.Data;

@Data
public class TutoriasPorMesDTO {

    private Integer anio;
    private Integer mes;
    private Long cantidad;

    public TutoriasPorMesDTO(Integer anio,
                             Integer mes,
                             Long cantidad) {
        this.anio = anio;
        this.mes = mes;
        this.cantidad = cantidad;
    }

}