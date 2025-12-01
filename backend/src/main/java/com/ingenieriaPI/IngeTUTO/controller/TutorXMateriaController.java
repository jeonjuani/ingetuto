package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.entity.TutorXMateria;
import com.ingenieriaPI.IngeTUTO.service.TutorXMateriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor-subjects")
@PreAuthorize("hasAuthority('TUTOR')")
public class TutorXMateriaController {

    private final TutorXMateriaService tutorXMateriaService;
    private final com.ingenieriaPI.IngeTUTO.service.UsuarioService usuarioService;

    public TutorXMateriaController(TutorXMateriaService tutorXMateriaService,
            com.ingenieriaPI.IngeTUTO.service.UsuarioService usuarioService) {
        this.tutorXMateriaService = tutorXMateriaService;
        this.usuarioService = usuarioService;
    }

    /**
     * Obtiene las materias asignadas al tutor autenticado
     */
    @GetMapping("/my-subjects")
    public ResponseEntity<List<com.ingenieriaPI.IngeTUTO.dto.TutorSubjectDTO>> obtenerMisMaterias(
            Authentication authentication) {
        String correo = authentication.getName();

        com.ingenieriaPI.IngeTUTO.entity.Usuario usuario = usuarioService.buscarPorCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        List<com.ingenieriaPI.IngeTUTO.dto.TutorSubjectDTO> materias = tutorXMateriaService
                .obtenerMateriasDeTutor(usuario.getIdUsuario());

        return ResponseEntity.ok(materias);
    }

    /**
     * Elimina una asociación tutor-materia
     * Valida que la asociación pertenezca al tutor autenticado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarAsociacion(
            @PathVariable Integer id,
            Authentication authentication) {
        String correo = authentication.getName();
        com.ingenieriaPI.IngeTUTO.entity.Usuario usuario = usuarioService.buscarPorCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        tutorXMateriaService.eliminarAsociacion(id, usuario.getIdUsuario());
        return ResponseEntity.ok(Map.of("mensaje", "Materia eliminada exitosamente"));
    }
}
