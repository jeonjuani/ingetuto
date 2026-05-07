package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.dto.MensajeDTO;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.repository.UsuarioRepository;
import com.ingenieriaPI.IngeTUTO.service.MensajeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin(origins = "${frontend.url}")
public class MensajeController {

    private final MensajeService mensajeService;
    private final UsuarioRepository usuarioRepository;

    public MensajeController(MensajeService mensajeService,
                             UsuarioRepository usuarioRepository) {
        this.mensajeService = mensajeService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Enviar un mensaje en una tutoría
     */
    @PostMapping("/{tutoriaId}")
    public ResponseEntity<?> enviarMensaje(
            @PathVariable Integer tutoriaId,
            @RequestBody String contenido,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
            }

            Usuario usuario = usuarioRepository.findByCorreoUsuario(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            MensajeDTO dto = mensajeService.enviarMensaje(tutoriaId, usuario.getIdUsuario(), contenido);
            return ResponseEntity.ok(dto);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno: " + e.getMessage());
        }
    }

    /**
     * Obtener mensajes de una tutoría (y marcarlos como leídos)
     */
    @GetMapping("/{tutoriaId}")
    public ResponseEntity<?> obtenerMensajes(
            @PathVariable Integer tutoriaId,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
            }

            Usuario usuario = usuarioRepository.findByCorreoUsuario(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            List<MensajeDTO> mensajes = mensajeService.obtenerMensajes(tutoriaId, usuario.getIdUsuario());
            return ResponseEntity.ok(mensajes);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno: " + e.getMessage());
        }
    }

    /**
     * Contar mensajes no leídos de una tutoría
     */
    @GetMapping("/{tutoriaId}/no-leidos")
    public ResponseEntity<?> contarNoLeidos(
            @PathVariable Integer tutoriaId,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
            }

            Usuario usuario = usuarioRepository.findByCorreoUsuario(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            long count = mensajeService.contarNoLeidos(tutoriaId, usuario.getIdUsuario());
            return ResponseEntity.ok(count);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno: " + e.getMessage());
        }
    }
}