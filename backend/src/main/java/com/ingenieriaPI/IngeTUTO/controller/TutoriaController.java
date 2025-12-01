package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.dto.ActualizarLinkRequest;
import com.ingenieriaPI.IngeTUTO.dto.CancelarTutoriaRequest;
import com.ingenieriaPI.IngeTUTO.dto.ReservarTutoriaRequest;
import com.ingenieriaPI.IngeTUTO.dto.TutoriaDTO;
import com.ingenieriaPI.IngeTUTO.entity.EstadoTutoria;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.repository.UsuarioRepository;
import com.ingenieriaPI.IngeTUTO.service.TutoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tutorias")
@CrossOrigin(origins = "http://localhost:5173")
public class TutoriaController {

    private final TutoriaService tutoriaService;
    private final UsuarioRepository usuarioRepository;

    public TutoriaController(TutoriaService tutoriaService, UsuarioRepository usuarioRepository) {
        this.tutoriaService = tutoriaService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Reservar una tutoría
     */
    @PostMapping("/reservar")
    public ResponseEntity<?> reservarTutoria(
            @RequestBody ReservarTutoriaRequest request,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Usuario no autenticado");
            }

            // Obtener usuario por email (que viene en authentication.getName())
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreoUsuario(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con email: " + email));

            Integer estudianteId = usuario.getIdUsuario();
            TutoriaDTO tutoria = tutoriaService.reservarTutoria(estudianteId, request);
            return ResponseEntity.ok(tutoria);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body("Error al obtener ID del usuario: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Error en los datos: " + e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Conflicto: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }

    /**
     * Agregar link de Meet (solo tutor)
     */
    @PutMapping("/{id}/link")
    public ResponseEntity<Void> agregarLink(
            @PathVariable Integer id,
            @RequestBody ActualizarLinkRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreoUsuario(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            Integer tutorId = usuario.getIdUsuario();
            tutoriaService.agregarLinkMeet(id, tutorId, request.getLinkTutoria());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Cancelar tutoría
     */
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarTutoria(
            @PathVariable Integer id,
            @RequestBody CancelarTutoriaRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreoUsuario(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            Integer usuarioId = usuario.getIdUsuario();
            tutoriaService.cancelarTutoria(id, usuarioId, request.getObservaciones());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Obtener tutorías del estudiante
     */
    @GetMapping("/estudiante")
    public ResponseEntity<List<TutoriaDTO>> misTutorias(
            @RequestParam(required = false) List<String> estados,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreoUsuario(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            Integer estudianteId = usuario.getIdUsuario();

            List<EstadoTutoria> estadosEnum = null;
            if (estados != null && !estados.isEmpty()) {
                estadosEnum = estados.stream()
                        .map(EstadoTutoria::valueOf)
                        .collect(Collectors.toList());
            }

            List<TutoriaDTO> tutorias = tutoriaService.obtenerTutoriasEstudiante(estudianteId, estadosEnum);
            return ResponseEntity.ok(tutorias);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtener tutorías del tutor
     */
    @GetMapping("/tutor")
    public ResponseEntity<List<TutoriaDTO>> tutoriasAsignadas(
            @RequestParam(required = false) List<String> estados,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreoUsuario(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            Integer tutorId = usuario.getIdUsuario();

            List<EstadoTutoria> estadosEnum = null;
            if (estados != null && !estados.isEmpty()) {
                estadosEnum = estados.stream()
                        .map(EstadoTutoria::valueOf)
                        .collect(Collectors.toList());
            }

            List<TutoriaDTO> tutorias = tutoriaService.obtenerTutoriasTutor(tutorId, estadosEnum);
            return ResponseEntity.ok(tutorias);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Estudiante confirma asistencia
     */
    @PutMapping("/{id}/confirmar-estudiante")
    public ResponseEntity<Void> confirmarAsistenciaEstudiante(
            @PathVariable Integer id,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreoUsuario(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            Integer estudianteId = usuario.getIdUsuario();
            tutoriaService.confirmarAsistenciaEstudiante(id, estudianteId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Tutor confirma asistencia
     */
    @PutMapping("/{id}/confirmar-tutor")
    public ResponseEntity<Void> confirmarAsistenciaTutor(
            @PathVariable Integer id,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreoUsuario(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            Integer tutorId = usuario.getIdUsuario();
            tutoriaService.confirmarAsistenciaTutor(id, tutorId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}
