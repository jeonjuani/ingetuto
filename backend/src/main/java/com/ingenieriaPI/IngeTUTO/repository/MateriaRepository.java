package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, Integer> {
	Optional<Materia> findByCodigoMateria(String codigoMateria);

	boolean existsByCodigoMateria(String codigoMateria);
}
