package com.ingenieriaPI.IngeTUTO.repository;

import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByCorreoUsuario(String correoUsuario);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM tbl_rol_x_usuario WHERE id_usuario = :idUsuario AND id_rol = (SELECT id_rol FROM tbl_roles WHERE nombre_rol = 'TUTOR')", nativeQuery = true)
    void deleteTutorRole(@org.springframework.data.repository.query.Param("idUsuario") Integer idUsuario);
}
