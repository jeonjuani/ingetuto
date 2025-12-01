package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.DisponibilidadMensual;
import com.ingenieriaPI.IngeTUTO.entity.EstadoDisponibilidad;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisponibilidadMensualRepository extends JpaRepository<DisponibilidadMensual, Integer> {

        List<DisponibilidadMensual> findByTutorAndFechaBetween(
                        Usuario tutor,
                        LocalDate fechaInicio,
                        LocalDate fechaFin);

        List<DisponibilidadMensual> findByTutorAndFechaAndEstado(
                        Usuario tutor,
                        LocalDate fecha,
                        EstadoDisponibilidad estado);

        Optional<DisponibilidadMensual> findByTutorAndFechaAndHoraInicio(
                        Usuario tutor,
                        LocalDate fecha,
                        LocalTime horaInicio);

        long countByTutorAndFechaBetween(
                        Usuario tutor,
                        LocalDate fechaInicio,
                        LocalDate fechaFin);

        @Query("SELECT dm FROM DisponibilidadMensual dm " +
                        "JOIN dm.tutor t " +
                        "JOIN TutorXMateria tm ON tm.tutor = t " +
                        "WHERE tm.materia.id_materia = :materiaId " +
                        "AND dm.fecha BETWEEN :fechaInicio AND :fechaFin " +
                        "AND dm.estado = :estado " +
                        "ORDER BY dm.fecha, dm.horaInicio")
        List<DisponibilidadMensual> findAvailableBlocksByMateriaAndDateRange(
                        @Param("materiaId") Integer materiaId,
                        @Param("fechaInicio") LocalDate fechaInicio,
                        @Param("fechaFin") LocalDate fechaFin,
                        @Param("estado") EstadoDisponibilidad estado);

        @Query("SELECT dm FROM DisponibilidadMensual dm " +
                        "WHERE dm.tutor = :tutor " +
                        "AND MONTH(dm.fecha) = :mes " +
                        "AND YEAR(dm.fecha) = :anio")
        List<DisponibilidadMensual> findByTutorAndMesAndAnio(
                        @Param("tutor") Usuario tutor,
                        @Param("mes") int mes,
                        @Param("anio") int anio);

        @Modifying
        @Query("DELETE FROM DisponibilidadMensual dm WHERE dm.tutor = :tutor AND dm.fecha BETWEEN :fechaInicio AND :fechaFin")
        void deleteByTutorAndFechaBetween(
                        @Param("tutor") Usuario tutor,
                        @Param("fechaInicio") LocalDate fechaInicio,
                        @Param("fechaFin") LocalDate fechaFin);

        boolean existsByTutorAndFechaBetweenAndEstadoIn(
                        Usuario tutor,
                        LocalDate fechaInicio,
                        LocalDate fechaFin,
                        Collection<EstadoDisponibilidad> estados);

        @Modifying
        @Query("DELETE FROM DisponibilidadMensual dm WHERE dm.tutor = :tutor")
        void deleteByTutor(@Param("tutor") Usuario tutor);
}
