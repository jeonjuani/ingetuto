package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.entity.Materia;
import com.ingenieriaPI.IngeTUTO.service.MateriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    private final MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }

    /**
     * Listar todas las materias
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO_BIENESTAR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<List<Materia>> listarMaterias() {
        return ResponseEntity.ok(materiaService.listarMaterias());
    }

    /**
     * Obtener materia por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO_BIENESTAR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<?> obtenerMateria(@PathVariable Integer id) {
        Optional<Materia> materia = materiaService.obtenerMateriaPorId(id);
        if (materia.isPresent()) {
            return ResponseEntity.ok(materia.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Materia no encontrada con ID: " + id);
    }

    /**
     * Crear nueva materia
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO_BIENESTAR')")
    public ResponseEntity<?> crearMateria(@Valid @RequestBody Materia materia) {
        try {
            Materia nuevaMateria = materiaService.crearMateria(materia);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaMateria);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear materia: " + e.getMessage());
        }
    }

    /**
     * Actualizar materia existente
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO_BIENESTAR')")
    public ResponseEntity<?> actualizarMateria(
            @PathVariable Integer id,
            @Valid @RequestBody Materia materia) {
        try {
            Materia materiaActualizada = materiaService.actualizarMateria(id, materia);
            return ResponseEntity.ok(materiaActualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar materia: " + e.getMessage());
        }
    }

    /**
     * Eliminar materia
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO_BIENESTAR')")
    public ResponseEntity<?> eliminarMateria(@PathVariable Integer id) {
        try {
            materiaService.eliminarMateria(id);
            return ResponseEntity.ok("Materia eliminada correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar materia: " + e.getMessage());
        }
    }

    /**
     * Verificar si un código de materia ya existe
     */
    @GetMapping("/verificar-codigo/{codigo}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO_BIENESTAR')")
    public ResponseEntity<?> verificarCodigo(@PathVariable String codigo) {
        boolean existe = materiaService.verificarCodigoExistente(codigo);
        if (existe) {
            Optional<Materia> materia = materiaService.obtenerMateriaPorCodigo(codigo);
            String nombreMateria = materia.map(Materia::getNombre_materia).orElse("desconocida");
            return ResponseEntity.ok(new CodigoVerificacionResponse(
                    true,
                    "El código ya está registrado para la materia: " + nombreMateria,
                    nombreMateria));
        }
        return ResponseEntity.ok(new CodigoVerificacionResponse(
                false,
                "El código está disponible",
                null));
    }

    /**
     * Clase interna para la respuesta de verificación de código
     */
    private static class CodigoVerificacionResponse {
        public boolean existe;
        public String mensaje;
        public String nombreMateria;

        public CodigoVerificacionResponse(boolean existe, String mensaje, String nombreMateria) {
            this.existe = existe;
            this.mensaje = mensaje;
            this.nombreMateria = nombreMateria;
        }
    }
}
