package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.DisponibilidadMensual;
import com.ingenieriaPI.IngeTUTO.entity.EstadoTutoria;
import com.ingenieriaPI.IngeTUTO.entity.Tutoria;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface TutoriaRepository extends JpaRepository<Tutoria, Integer> {

    List<Tutoria> findByEstudiante(Usuario estudiante);

    List<Tutoria> findByTutor(Usuario tutor);

    List<Tutoria> findByEstudianteAndEstadoIn(Usuario estudiante, Collection<EstadoTutoria> estados);

    List<Tutoria> findByTutorAndEstadoIn(Usuario tutor, Collection<EstadoTutoria> estados);

    boolean existsByDisponibilidadMensual(DisponibilidadMensual bloque);

    /**
     * Verifica si el estudiante tiene conflictos de horario
     */
    @Query("SELECT COUNT(t) FROM Tutoria t WHERE t.estudiante = :estudiante " +
            "AND t.fechaTutoria = :fecha AND t.horaInicio = :hora " +
            "AND t.estado IN ('RESERVADA', 'PROGRAMADA')")
    long countConflictosEstudiante(@Param("estudiante") Usuario estudiante,
            @Param("fecha") LocalDate fecha,
            @Param("hora") LocalTime hora);

    /**
     * Obtiene tutorías pendientes de confirmación (para tareas programadas)
     */
    List<Tutoria> findByEstado(EstadoTutoria estado);

    /**
     * Obtiene tutorías que requieren revisión de Bienestar
     */
    @Query("SELECT t FROM Tutoria t WHERE t.estado = 'SIN_CONFIRMAR' ORDER BY t.fechaTutoria DESC")
    List<Tutoria> findTutoriasPendientesRevision();
}
