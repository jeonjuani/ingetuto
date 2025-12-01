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

    @Autowired
    private com.ingenieriaPI.IngeTUTO.repository.RolRepository rolRepository;

    @Autowired
    private com.ingenieriaPI.IngeTUTO.repository.TutorXMateriaRepository tutorXMateriaRepository;

    @Autowired
    private com.ingenieriaPI.IngeTUTO.repository.RegistroAspiranteRepository registroAspiranteRepository;

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorCorreo(String correoUsuario) {
        return usuarioRepository.findByCorreoUsuario(correoUsuario);
    }

    public Usuario guardarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    /**
     * Elimina un usuario y todos sus registros relacionados
     * Orden de eliminación:
     * 1. Asociaciones tutor-materia (tbl_tutor_x_materia)
     * 2. Solicitudes de tutor (tbl_registro_aspirante)
     * 3. Roles del usuario (tbl_rol_x_usuario)
     * 4. Usuario (tbl_usuarios)
     * 
     * @param id_usuario ID del usuario a eliminar
     */
    @org.springframework.transaction.annotation.Transactional
    public void eliminarUsuario(Integer id_usuario) {
        // Verificar que el usuario existe
        Usuario usuario = usuarioRepository.findById(id_usuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // 1. Eliminar asociaciones tutor-materia
        tutorXMateriaRepository.deleteByTutor(usuario);

        // 2. Eliminar solicitudes de tutor (registro aspirante)
        registroAspiranteRepository.deleteByAspirante(usuario);

        // 3. Limpiar roles (la tabla intermedia tbl_rol_x_usuario)
        usuario.getRoles().clear();
        usuarioRepository.save(usuario);

        // 4. Finalmente eliminar el usuario
        usuarioRepository.deleteById(id_usuario);
    }

    public Usuario actualizarRoles(Integer userId, List<String> roleNames) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Limpiar roles existentes
        usuario.getRoles().clear();

        // Agregar nuevos roles
        for (String roleName : roleNames) {
            com.ingenieriaPI.IngeTUTO.entity.Rol rol = rolRepository.findByNombre(roleName)
                    .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado: " + roleName));
            usuario.getRoles().add(rol);
        }

        return usuarioRepository.save(usuario);
    }

    /**
     * Registra o devuelve un usuario autenticado desde Google OAuth2.
     *
     * @param givenName  Nombres (de Google: "given_name")
     * @param familyName Apellidos (de Google: "family_name")
     * @param email      Correo (de Google: "email")
     * @return Usuario registrado o existente
     */
    public Usuario registrarUsuarioDesdeGoogle(String givenName, String familyName, String email) {
        // Normalizar el correo: minúsculas y sin espacios
        String emailNormalizado = email.trim().toLowerCase();

        // 1. Verificar dominio
        if (!emailNormalizado.endsWith("@udea.edu.co")) {
            throw new IllegalArgumentException("Solo se permiten vinculados a la Universidad de Antioquia");
        }

        // 2. Verificar si ya existe
        Optional<Usuario> existente = buscarPorCorreo(emailNormalizado);
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
        nuevo.setCorreoUsuario(emailNormalizado);
        nuevo.setTelefonoUsuario(null);

        return guardarUsuario(nuevo);
    }

    /**
     * Actualiza el número de teléfono de un usuario
     * 
     * @param userId      ID del usuario
     * @param phoneNumber Número de teléfono (10 dígitos)
     * @return Usuario actualizado
     */
    public Usuario updatePhoneNumber(Integer userId, String phoneNumber) {
        // Validar que el teléfono no sea nulo o vacío
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de teléfono no puede estar vacío");
        }

        // Validar formato: solo números y 10 dígitos
        String cleanPhone = phoneNumber.trim().replaceAll("[^0-9]", "");
        if (cleanPhone.length() != 10) {
            throw new IllegalArgumentException("El número de teléfono debe tener exactamente 10 dígitos");
        }

        // Buscar usuario
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Actualizar teléfono
        usuario.setTelefonoUsuario(cleanPhone);

        return usuarioRepository.save(usuario);
    }

}
