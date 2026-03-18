package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.Mensaje;
import com.ingenieriaPI.IngeTUTO.entity.Tutoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Integer> {

    // Obtener todos los mensajes de una tutoría en orden cronológico
    List<Mensaje> findByTutoriaOrderByFechaEnvioAsc(Tutoria tutoria);

    // Contar mensajes no leídos de una tutoría para un usuario específico
    long countByTutoriaAndEmisorIdUsuarioNotAndLeidoFalse(Tutoria tutoria, Integer idUsuario);
}