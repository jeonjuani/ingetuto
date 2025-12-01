package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.TutorXMateria;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorXMateriaRepository extends JpaRepository<TutorXMateria, Integer> {
    boolean existsByTutorAndMateria(Usuario tutor, Materia materia);

    List<TutorXMateria> findByTutor(Usuario tutor);

    Optional<TutorXMateria> findByIdTutorXMateriaAndTutor(Integer id, Usuario tutor);

    long countByTutor(Usuario tutor);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByTutor(Usuario tutor);
}
