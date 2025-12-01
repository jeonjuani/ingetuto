package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Integer> {
    Optional<Permiso> findByNombre(String nombre);
}
