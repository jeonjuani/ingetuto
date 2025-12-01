package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO_BIENESTAR')")
public class AdminController {

    private final UsuarioService usuarioService;

    public AdminController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<Usuario>> getAllUsers() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<?> updateUserRoles(
            @PathVariable Integer userId,
            @RequestBody List<String> roleNames,
            org.springframework.security.core.Authentication authentication) {
        try {
            // Obtener el rol actual del usuario autenticado
            String currentUserRole = authentication.getAuthorities().stream()
                    .filter(auth -> auth.getAuthority().startsWith("ROLE_"))
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("");

            // RN: FUNCIONARIO_BIENESTAR no puede asignar rol ADMIN
            if ("FUNCIONARIO_BIENESTAR".equals(currentUserRole) && roleNames.contains("ADMIN")) {
                return ResponseEntity.status(403)
                        .body("Acceso denegado: No tienes permisos para asignar el rol de ADMIN");
            }

            Usuario updatedUser = usuarioService.actualizarRoles(userId, roleNames);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al actualizar roles: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        try {
            usuarioService.eliminarUsuario(userId);
            return ResponseEntity.ok("Usuario eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al eliminar usuario: " + e.getMessage());
        }
    }
}
