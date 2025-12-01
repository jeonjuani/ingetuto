package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.entity.TutorXMateria;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.repository.TutorXMateriaRepository;
import com.ingenieriaPI.IngeTUTO.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TutorXMateriaService {

    private final TutorXMateriaRepository tutorXMateriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final DisponibilidadService disponibilidadService;

    public TutorXMateriaService(TutorXMateriaRepository tutorXMateriaRepository,
            UsuarioRepository usuarioRepository,
            DisponibilidadService disponibilidadService) {
        this.tutorXMateriaRepository = tutorXMateriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.disponibilidadService = disponibilidadService;
    }

    /**
     * Obtiene todas las materias asociadas a un tutor
     * 
     * @param idTutor ID del tutor
     * @return Lista de DTOs de materias del tutor
     */
    public List<com.ingenieriaPI.IngeTUTO.dto.TutorSubjectDTO> obtenerMateriasDeTutor(Integer idTutor) {
        Usuario tutor = new Usuario();
        tutor.setIdUsuario(idTutor);

        return tutorXMateriaRepository.findByTutor(tutor).stream()
                .map(txm -> new com.ingenieriaPI.IngeTUTO.dto.TutorSubjectDTO(
                        txm.getIdTutorXMateria(),
                        txm.getMateria().getId_materia(),
                        txm.getMateria().getNombre_materia(),
                        txm.getMateria().getCodigoMateria()))
                .collect(Collectors.toList());
    }

    /**
     * Elimina una asociación tutor-materia
     * Valida que la asociación pertenezca al tutor antes de eliminar
     * Si el tutor se queda sin materias, se le revoca el rol de TUTOR
     * 
     * @param idTutorXMateria ID de la asociación a eliminar
     * @param idUsuario       ID del usuario que hace la petición
     */
    @Transactional
    public void eliminarAsociacion(Integer idTutorXMateria, Integer idUsuario) {
        Usuario tutor = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        TutorXMateria asociacion = tutorXMateriaRepository.findByIdTutorXMateriaAndTutor(idTutorXMateria, tutor)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Asociación no encontrada o no pertenece a este tutor"));

        // IMPORTANTE: Verificar si le quedan materias ANTES de eliminar
        long materiasActuales = tutorXMateriaRepository.countByTutor(tutor);
        boolean esUltimaMateria = (materiasActuales == 1);

        // Eliminar la asociación tutor-materia
        tutorXMateriaRepository.delete(asociacion);
        tutorXMateriaRepository.flush();

        // Si era la última materia, eliminar el rol de TUTOR y toda su disponibilidad
        if (esUltimaMateria) {
            usuarioRepository.deleteTutorRole(tutor.getIdUsuario());
            disponibilidadService.eliminarTodasDisponibilidades(tutor.getIdUsuario());
        }
    }
}
