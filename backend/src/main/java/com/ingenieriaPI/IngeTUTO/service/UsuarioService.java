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
}
