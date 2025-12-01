package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.Materia;
import com.ingenieriaPI.IngeTUTO.entity.RegistroAspirante;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroAspiranteRepository extends JpaRepository<RegistroAspirante, Integer> {

    List<RegistroAspirante> findByAspirante(Usuario aspirante);

    List<RegistroAspirante> findByEstado(String estado);

    List<RegistroAspirante> findByEstadoIn(List<String> estados);

    boolean existsByAspiranteAndMateriaAndEstadoIn(Usuario aspirante, Materia materia, List<String> estados);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByAspirante(Usuario aspirante);
}
