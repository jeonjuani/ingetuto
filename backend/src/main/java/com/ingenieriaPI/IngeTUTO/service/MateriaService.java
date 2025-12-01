package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.entity.Materia;
import com.ingenieriaPI.IngeTUTO.repository.MateriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MateriaService {

    private final MateriaRepository materiaRepository;

    public MateriaService(MateriaRepository materiaRepository) {
        this.materiaRepository = materiaRepository;
    }

    /**
     * Lista todas las materias
     */
    public List<Materia> listarMaterias() {
        return materiaRepository.findAll();
    }

    /**
     * Obtiene una materia por su ID
     */
    public Optional<Materia> obtenerMateriaPorId(Integer id) {
        return materiaRepository.findById(id);
    }

    /**
     * Crea una nueva materia
     * Valida que el código no exista previamente
     */
    @Transactional
    public Materia crearMateria(Materia materia) {
        // Validar que el código no exista
        if (materiaRepository.existsByCodigoMateria(materia.getCodigoMateria())) {
            // Obtener la materia existente para mostrar su nombre
            Optional<Materia> materiaExistente = materiaRepository.findByCodigoMateria(materia.getCodigoMateria());
            String nombreExistente = materiaExistente.map(Materia::getNombre_materia).orElse("desconocida");
            throw new IllegalArgumentException(
                    "El código " + materia.getCodigoMateria() +
                            " ya ha sido registrado para la materia: " + nombreExistente);
        }

        return materiaRepository.save(materia);
    }

    /**
     * Actualiza una materia existente
     * Valida que el código no esté siendo usado por otra materia
     */
    @Transactional
    public Materia actualizarMateria(Integer id, Materia materiaActualizada) {
        Materia materiaExistente = materiaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Materia no encontrada con ID: " + id));

        // Si se está cambiando el código, verificar que no exista en otra materia
        if (!materiaExistente.getCodigoMateria().equals(materiaActualizada.getCodigoMateria())) {
            if (materiaRepository.existsByCodigoMateria(materiaActualizada.getCodigoMateria())) {
                Optional<Materia> otraMateria = materiaRepository
                        .findByCodigoMateria(materiaActualizada.getCodigoMateria());
                String nombreOtraMateria = otraMateria.map(Materia::getNombre_materia).orElse("desconocida");
                throw new IllegalArgumentException(
                        "El código " + materiaActualizada.getCodigoMateria() +
                                " ya ha sido registrado para la materia: " + nombreOtraMateria);
            }
        }

        materiaExistente.setNombre_materia(materiaActualizada.getNombre_materia());
        materiaExistente.setCodigoMateria(materiaActualizada.getCodigoMateria());

        return materiaRepository.save(materiaExistente);
    }

    /**
     * Elimina una materia por su ID
     */
    @Transactional
    public void eliminarMateria(Integer id) {
        if (!materiaRepository.existsById(id)) {
            throw new IllegalArgumentException("Materia no encontrada con ID: " + id);
        }
        materiaRepository.deleteById(id);
    }

    /**
     * Verifica si existe una materia con el código dado
     */
    public boolean verificarCodigoExistente(String codigo) {
        return materiaRepository.existsByCodigoMateria(codigo);
    }

    /**
     * Obtiene una materia por su código
     */
    public Optional<Materia> obtenerMateriaPorCodigo(String codigo) {
        return materiaRepository.findByCodigoMateria(codigo);
    }
}
