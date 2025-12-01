package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.entity.RegistroAspirante;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.service.FileStorageService;
import com.ingenieriaPI.IngeTUTO.service.RegistroAspiranteService;
import com.ingenieriaPI.IngeTUTO.service.UsuarioService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor-requests")
public class RegistroAspiranteController {

    private final RegistroAspiranteService registroAspiranteService;
    private final FileStorageService fileStorageService;
    private final UsuarioService usuarioService;

    public RegistroAspiranteController(RegistroAspiranteService registroAspiranteService,
            FileStorageService fileStorageService,
            UsuarioService usuarioService) {
        this.registroAspiranteService = registroAspiranteService;
        this.fileStorageService = fileStorageService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> crearSolicitud(
            @RequestParam("idMateria") Integer idMateria,
            @RequestParam("historiaAcademica") MultipartFile historiaAcademica,
            @RequestParam("archivoSoporte") MultipartFile archivoSoporte,
            Authentication authentication) {

        try {
            Usuario currentUser = usuarioService.buscarPorCorreo(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            RegistroAspirante solicitud = registroAspiranteService.crearSolicitud(
                    currentUser.getIdUsuario(), idMateria, historiaAcademica, archivoSoporte);
            return ResponseEntity.ok(solicitud);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar la solicitud: " + e.getMessage());
        }
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<List<RegistroAspirante>> obtenerMisSolicitudes(Authentication authentication) {
        Usuario currentUser = usuarioService.buscarPorCorreo(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return ResponseEntity.ok(registroAspiranteService.obtenerMisSolicitudes(currentUser.getIdUsuario()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('FUNCIONARIO_BIENESTAR')")
    public ResponseEntity<List<RegistroAspirante>> obtenerSolicitudesPendientes() {
        return ResponseEntity.ok(registroAspiranteService.obtenerSolicitudesPendientes());
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('FUNCIONARIO_BIENESTAR')")
    public ResponseEntity<List<RegistroAspirante>> obtenerHistorialSolicitudes() {
        return ResponseEntity.ok(registroAspiranteService.obtenerHistorialSolicitudes());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('FUNCIONARIO_BIENESTAR')")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        try {
            String nuevoEstado = payload.get("estado");
            String observacion = payload.get("observacion");
            RegistroAspirante solicitud = registroAspiranteService.actualizarEstadoSolicitud(id, nuevoEstado,
                    observacion);
            return ResponseEntity.ok(solicitud);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/download/{fileName:.+}")
    @PreAuthorize("hasRole('FUNCIONARIO_BIENESTAR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Fallback to default content type
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
