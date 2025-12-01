package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.dto.*;
import com.ingenieriaPI.IngeTUTO.entity.Modalidad;
import com.ingenieriaPI.IngeTUTO.service.DisponibilidadService;
import com.ingenieriaPI.IngeTUTO.service.UsuarioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disponibilidad")
public class DisponibilidadController {

    private final DisponibilidadService disponibilidadService;
    private final UsuarioService usuarioService;

    public DisponibilidadController(DisponibilidadService disponibilidadService,
            UsuarioService usuarioService) {
        this.disponibilidadService = disponibilidadService;
        this.usuarioService = usuarioService;
    }

    // ========== ENDPOINTS PARA TUTORES ==========

    /**
     * Crea o actualiza la plantilla semanal de disponibilidad
     */
    @PostMapping("/plantilla-semanal")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<?> crearPlantillaSemanal(
            @RequestBody List<DisponibilidadSemanalDTO> bloques,
            Authentication authentication) {
        try {
            String correo = authentication.getName();
            var usuario = usuarioService.buscarPorCorreo(correo)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            disponibilidadService.crearPlantillaSemanal(usuario.getIdUsuario(), bloques);
            return ResponseEntity.ok(Map.of("mensaje", "Plantilla semanal creada exitosamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtiene la plantilla semanal del tutor autenticado
     */
    @GetMapping("/plantilla-semanal")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<?> obtenerPlantillaSemanal(Authentication authentication) {
        try {
            String correo = authentication.getName();
            var usuario = usuarioService.buscarPorCorreo(correo)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            List<DisponibilidadSemanalDTO> plantilla = disponibilidadService
                    .obtenerPlantillaSemanal(usuario.getIdUsuario());
            return ResponseEntity.ok(plantilla);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Genera la disponibilidad mensual a partir de la plantilla semanal
     */
    @PostMapping("/generar-mensual")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<?> generarDisponibilidadMensual(
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        try {
            String correo = authentication.getName();
            var usuario = usuarioService.buscarPorCorreo(correo)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            int mes = request.get("mes");
            int anio = request.get("anio");

            GenerarDisponibilidadResponse response = disponibilidadService
                    .generarDisponibilidadMensual(usuario.getIdUsuario(), mes, anio);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtiene la disponibilidad mensual del tutor
     */
    @GetMapping("/mensual/{mes}/{anio}")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<?> obtenerDisponibilidadMensual(
            @PathVariable int mes,
            @PathVariable int anio,
            Authentication authentication) {
        try {
            String correo = authentication.getName();
            var usuario = usuarioService.buscarPorCorreo(correo)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            List<DisponibilidadMensualDTO> disponibilidad = disponibilidadService
                    .obtenerDisponibilidadMensual(usuario.getIdUsuario(), mes, anio);
            return ResponseEntity.ok(disponibilidad);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Valida y confirma la disponibilidad mensual
     */
    @PostMapping("/validar-confirmar")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<?> validarYConfirmarDisponibilidad(
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        try {
            String correo = authentication.getName();
            var usuario = usuarioService.buscarPorCorreo(correo)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            int mes = request.get("mes");
            int anio = request.get("anio");

            ValidacionDisponibilidadResponse response = disponibilidadService
                    .validarYConfirmarDisponibilidad(usuario.getIdUsuario(), mes, anio);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Elimina un bloque de disponibilidad mensual
     */
    @DeleteMapping("/bloque/{bloqueId}")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<?> eliminarBloqueMensual(
            @PathVariable Integer bloqueId,
            Authentication authentication) {
        try {
            String correo = authentication.getName();
            var usuario = usuarioService.buscarPorCorreo(correo)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            disponibilidadService.eliminarBloqueMensual(bloqueId, usuario.getIdUsuario());
            return ResponseEntity.ok(Map.of("mensaje", "Bloque eliminado exitosamente"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Modifica la modalidad de un bloque mensual
     */
    @PatchMapping("/bloque/{bloqueId}/modalidad")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<?> modificarModalidadBloque(
            @PathVariable Integer bloqueId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String correo = authentication.getName();
            var usuario = usuarioService.buscarPorCorreo(correo)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            Modalidad nuevaModalidad = Modalidad.valueOf(request.get("modalidad"));
            disponibilidadService.modificarModalidadBloque(bloqueId, usuario.getIdUsuario(), nuevaModalidad);
            return ResponseEntity.ok(Map.of("mensaje", "Modalidad actualizada exitosamente"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== ENDPOINTS PARA ESTUDIANTES ==========

    /**
     * Obtiene bloques disponibles por materia (vista de estudiante)
     */
    @GetMapping("/por-materia/{materiaId}")
    @PreAuthorize("hasAuthority('ESTUDIANTE') or hasAuthority('TUTOR')")
    public ResponseEntity<?> obtenerDisponibilidadPorMateria(
            @PathVariable Integer materiaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        try {
            List<DisponibilidadMensualDTO> disponibilidad = disponibilidadService
                    .obtenerDisponibilidadPorMateria(materiaId, fechaInicio, fechaFin);
            return ResponseEntity.ok(disponibilidad);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener disponibilidad: " + e.getMessage()));
        }
    }

    // ========== MANEJO DE EXCEPCIONES ==========

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
