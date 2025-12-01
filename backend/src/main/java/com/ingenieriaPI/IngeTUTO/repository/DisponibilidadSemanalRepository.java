package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.DisponibilidadSemanal;
import com.ingenieriaPI.IngeTUTO.entity.DiaSemana;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisponibilidadSemanalRepository extends JpaRepository<DisponibilidadSemanal, Integer> {

        List<DisponibilidadSemanal> findByTutorAndActivoTrue(Usuario tutor);

        List<DisponibilidadSemanal> findByTutorAndDiaSemanaAndActivoTrue(Usuario tutor, DiaSemana diaSemana);

        Optional<DisponibilidadSemanal> findByTutorAndDiaSemanaAndHoraInicioAndActivoTrue(
                        Usuario tutor,
                        DiaSemana diaSemana,
                        LocalTime horaInicio);

        boolean existsByTutorAndDiaSemanaAndHoraInicioAndActivoTrue(
                        Usuario tutor,
                        DiaSemana diaSemana,
                        LocalTime horaInicio);

        long countByTutorAndActivoTrue(Usuario tutor);

        @Modifying
        @Query("DELETE FROM DisponibilidadSemanal ds WHERE ds.tutor = :tutor")
        void deleteByTutor(@Param("tutor") Usuario tutor);
}
