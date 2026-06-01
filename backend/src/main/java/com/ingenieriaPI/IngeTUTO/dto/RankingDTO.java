package com.ingenieriaPI.IngeTUTO.dto;

import lombok.Data;

@Data
public class RankingDTO {

    private String nombre;
    private Long cantidad;

    public RankingDTO(String nombre, Long cantidad) {
        this.nombre = nombre;
        this.cantidad = cantidad;
    }

    // getters setters
}