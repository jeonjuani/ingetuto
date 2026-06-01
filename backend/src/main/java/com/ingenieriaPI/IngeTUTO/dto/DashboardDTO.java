package com.ingenieriaPI.IngeTUTO.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DashboardDTO {

    // Resumen
    private Long totalTutorias;
    private Long totalRealizadas;
    private Long totalCanceladas;
    private Double tasaCancelacion;
    private Long totalTutoresActivos;
    private Long totalEstudiantesSolicitantes;

    // Tiempo
    private List<TutoriasPorMesDTO> tutoriasPorMes;
    private Double crecimientoMensual;

    // Rankings
    private List<RankingDTO> topTutores;
    private List<RankingDTO> topMaterias;
    private List<RankingDTO> topEstudiantes;

    // Estado
    private Map<String, Long> distribucionEstados;

    // Calidad
    private Double tasaConfirmacion;
    private Map<String, Long> modalidadDistribucion;

}