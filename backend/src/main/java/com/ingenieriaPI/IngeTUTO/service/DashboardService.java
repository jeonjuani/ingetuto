package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.dto.DashboardDTO;
import com.ingenieriaPI.IngeTUTO.dto.RankingDTO;
import com.ingenieriaPI.IngeTUTO.dto.TutoriasPorMesDTO;
import com.ingenieriaPI.IngeTUTO.entity.EstadoTutoria;
import com.ingenieriaPI.IngeTUTO.repository.TutoriaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TutoriaRepository tutoriaRepository;

    public DashboardService(TutoriaRepository tutoriaRepository) {
        this.tutoriaRepository = tutoriaRepository;
    }

    public DashboardDTO obtenerDashboard() {

        DashboardDTO dto = new DashboardDTO();

        Long total = tutoriaRepository.countTotalTutorias();

        Long realizadas =
                tutoriaRepository.countByEstado(
                        EstadoTutoria.REALIZADA);
        Long programadas = tutoriaRepository.countByEstado(
                EstadoTutoria.PROGRAMADA);
        double tasaConfirmacion = 0.0;

        if ((realizadas + programadas) > 0) {
            tasaConfirmacion =
                    (realizadas * 100.0)
                            / (realizadas + programadas);
        }

        Long canceladas =
                tutoriaRepository.countByEstado(
                        EstadoTutoria.CANCELADA);

        dto.setTotalTutorias(total);
        dto.setTotalRealizadas(realizadas);
        dto.setTotalCanceladas(canceladas);
        dto.setTasaConfirmacion(tasaConfirmacion);
        dto.setTasaCancelacion(
                total == 0
                        ? 0.0
                        : (canceladas * 100.0 / total)
        );

        dto.setTotalTutoresActivos(
                tutoriaRepository.countTutoresActivos()
        );

        dto.setTotalEstudiantesSolicitantes(
                tutoriaRepository.countEstudiantesSolicitantes()
        );

        Map<String, Long> estados =
                tutoriaRepository.distribucionEstados()
                        .stream()
                        .collect(Collectors.toMap(
                                r -> r[0].toString(),
                                r -> (Long) r[1]
                        ));

        dto.setDistribucionEstados(estados);

        Map<String, Long> modalidades =
                tutoriaRepository.distribucionModalidad()
                        .stream()
                        .collect(Collectors.toMap(
                                r -> r[0].toString(),
                                r -> (Long) r[1]
                        ));

        dto.setModalidadDistribucion(modalidades);

        Pageable top5 = PageRequest.of(0, 5);
        dto.setTopTutores(
                tutoriaRepository.topTutores(top5)
                        .stream()
                        .map(r -> new RankingDTO(
                                (String) r[0],
                                (Long) r[1]))
                        .toList()
        );
        dto.setTopEstudiantes(
                tutoriaRepository.topEstudiantes(top5)
                        .stream()
                        .map(r -> new RankingDTO(
                                (String) r[0],
                                (Long) r[1]))
                        .toList()
        );
        dto.setTopMaterias(
                tutoriaRepository.topMaterias(top5)
                        .stream()
                        .map(r -> new RankingDTO(
                                (String) r[0],
                                (Long) r[1]))
                        .toList()
        );
        LocalDate inicio = LocalDate.now().minusMonths(6);

        dto.setTutoriasPorMes(
                tutoriaRepository.obtenerTutoriasPorMes(inicio)
                        .stream()
                        .map(r -> new TutoriasPorMesDTO(
                                ((Number) r[0]).intValue(),
                                ((Number) r[1]).intValue(),
                                ((Number) r[2]).longValue()
                        ))
                        .toList()
        );
        return dto;

    }
}