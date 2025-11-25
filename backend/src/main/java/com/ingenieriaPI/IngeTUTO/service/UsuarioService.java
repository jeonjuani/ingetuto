package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorCorreo(String correoUsuario) {
        return usuarioRepository.findByCorreoUsuario(correoUsuario);
    }

    public Usuario guardarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Integer id_usuario) {
        usuarioRepository.deleteById(id_usuario);
    }
    /**
     * Registra o devuelve un usuario autenticado desde Google OAuth2.
     *
     * @param givenName   Nombres (de Google: "given_name")
     * @param familyName  Apellidos (de Google: "family_name")
     * @param email       Correo (de Google: "email")
     * @return Usuario registrado o existente
     */
    public Usuario registrarUsuarioDesdeGoogle(String givenName, String familyName,String email) {
        // 1. Verificar dominio
        if (!email.endsWith("@udea.edu.co")) {
            throw new IllegalArgumentException("Solo se permiten vinculados a la Universidad de Antioquia");
        }

        // 2. Verificar si ya existe
        Optional<Usuario> existente = buscarPorCorreo(email);
        if (existente.isPresent()) {
            return existente.get();
        }

        Usuario nuevo = new Usuario();

        if (givenName != null) {
            String[] nombres = givenName.trim().split("\\s+", 2);
            nuevo.setPrimerNombre(nombres[0]);
            if (nombres.length > 1) {
                nuevo.setSegundoNombre(nombres[1]);
            }
        }
        if (familyName != null) {
            String[] apellidos = familyName.trim().split("\\s+", 2);
            nuevo.setPrimerApellido(apellidos[0]);
            if (apellidos.length > 1) {
                nuevo.setSegundoApellido(apellidos[1]);
            }
        }
        nuevo.setCorreoUsuario(email);
        nuevo.setTelefonoUsuario(null);
        return guardarUsuario(nuevo);
    }

}
