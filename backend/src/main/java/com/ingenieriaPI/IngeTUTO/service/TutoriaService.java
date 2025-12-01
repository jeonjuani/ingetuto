package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.dto.ReservarTutoriaRequest;
import com.ingenieriaPI.IngeTUTO.dto.TutoriaDTO;
import com.ingenieriaPI.IngeTUTO.entity.*;
import com.ingenieriaPI.IngeTUTO.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TutoriaService {

    private final TutoriaRepository tutoriaRepository;
    private final DisponibilidadMensualRepository disponibilidadMensualRepository;
    private final UsuarioRepository usuarioRepository;
    private final MateriaRepository materiaRepository;

    public TutoriaService(
            TutoriaRepository tutoriaRepository,
            DisponibilidadMensualRepository disponibilidadMensualRepository,
            UsuarioRepository usuarioRepository,
            MateriaRepository materiaRepository) {
        this.tutoriaRepository = tutoriaRepository;
        this.disponibilidadMensualRepository = disponibilidadMensualRepository;
        this.usuarioRepository = usuarioRepository;
        this.materiaRepository = materiaRepository;
    }

    /**
     * Reserva una tutoría para un estudiante
     */
    @Transactional
    public TutoriaDTO reservarTutoria(Integer estudianteId, ReservarTutoriaRequest request) {
        // 1. Obtener estudiante
        Usuario estudiante = usuarioRepository.findById(estudianteId)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        // 2. Obtener bloque de disponibilidad
        DisponibilidadMensual bloque = disponibilidadMensualRepository.findById(request.getBloqueId())
                .orElseThrow(() -> new IllegalArgumentException("Bloque de disponibilidad no encontrado"));

        // 3. Validar que el bloque esté DISPONIBLE
        if (bloque.getEstado() != EstadoDisponibilidad.DISPONIBLE) {
            throw new IllegalStateException("Este bloque horario ya no está disponible");
        }

        // 4. Verificar conflictos de horario del estudiante
        long conflictos = tutoriaRepository.countConflictosEstudiante(
                estudiante,
                bloque.getFecha(),
                bloque.getHoraInicio());

        if (conflictos > 0) {
            throw new IllegalStateException("Ya tienes una tutoría reservada en este horario");
        }

        // 5. Crear la tutoría
        Tutoria tutoria = new Tutoria();
        tutoria.setEstudiante(estudiante);
        tutoria.setTutor(bloque.getTutor());
        Materia materia = materiaRepository.findById(request.getMateriaId())
                .orElseThrow(() -> new IllegalArgumentException("Materia no encontrada"));
        tutoria.setMateria(materia);
        tutoria.setDisponibilidadMensual(bloque);
        tutoria.setNombreTema(request.getNombreTema());
        tutoria.setFechaTutoria(bloque.getFecha());
        tutoria.setHoraInicio(bloque.getHoraInicio());
        tutoria.setHoraFin(bloque.getHoraFin());
        tutoria.setModalidad(bloque.getModalidad());
        tutoria.setEstado(EstadoTutoria.RESERVADA);

        // 6. Actualizar estado del bloque a RESERVADO
        bloque.setEstado(EstadoDisponibilidad.RESERVADO);
        disponibilidadMensualRepository.save(bloque);

        // 7. Guardar tutoría
        Tutoria tutoriaGuardada = tutoriaRepository.save(tutoria);

        // 8. Retornar DTO
        return convertirADTO(tutoriaGuardada);
    }

    /**
     * Tutor agrega link de Meet a la tutoría
     */
    @Transactional
    public void agregarLinkMeet(Integer tutoriaId, Integer tutorId, String link) {
        // 1. Obtener tutoría
        Tutoria tutoria = tutoriaRepository.findById(tutoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Tutoría no encontrada"));

        // 2. Validar que sea el tutor correcto
        if (!tutoria.getTutor().getIdUsuario().equals(tutorId)) {
            throw new IllegalArgumentException("No tienes permiso para modificar esta tutoría");
        }

        // 3. Validar estado
        if (tutoria.getEstado() != EstadoTutoria.RESERVADA) {
            throw new IllegalStateException("Solo se puede agregar link a tutorías en estado RESERVADA");
        }

        // 4. Actualizar link y estado
        tutoria.setLinkTutoria(link);
        tutoria.setEstado(EstadoTutoria.PROGRAMADA);

        tutoriaRepository.save(tutoria);
    }

    /**
     * Cancela una tutoría
     */
    @Transactional
    public void cancelarTutoria(Integer tutoriaId, Integer usuarioId, String observaciones) {
        // 1. Obtener tutoría
        Tutoria tutoria = tutoriaRepository.findById(tutoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Tutoría no encontrada"));

        // 2. Validar que sea estudiante o tutor
        boolean esEstudiante = tutoria.getEstudiante().getIdUsuario().equals(usuarioId);
        boolean esTutor = tutoria.getTutor().getIdUsuario().equals(usuarioId);

        if (!esEstudiante && !esTutor) {
            throw new IllegalArgumentException("No tienes permiso para cancelar esta tutoría");
        }

        // 3. Validar que se pueda cancelar
        if (tutoria.getEstado() != EstadoTutoria.RESERVADA &&
                tutoria.getEstado() != EstadoTutoria.PROGRAMADA) {
            throw new IllegalStateException("Esta tutoría ya no se puede cancelar");
        }

        // 4. Liberar bloque de disponibilidad
        DisponibilidadMensual bloque = tutoria.getDisponibilidadMensual();
        if (bloque != null) {
            bloque.setEstado(EstadoDisponibilidad.DISPONIBLE);
            disponibilidadMensualRepository.save(bloque);
        }

        // 5. Actualizar tutoría
        tutoria.setEstado(EstadoTutoria.CANCELADA);
        tutoria.setObservaciones(observaciones);

        tutoriaRepository.save(tutoria);
    }

    /**
     * Estudiante confirma asistencia
     */
    @Transactional
    public void confirmarAsistenciaEstudiante(Integer tutoriaId, Integer estudianteId) {
        // 1. Obtener tutoría
        Tutoria tutoria = tutoriaRepository.findById(tutoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Tutoría no encontrada"));

        // 2. Validar que sea el estudiante correcto
        if (!tutoria.getEstudiante().getIdUsuario().equals(estudianteId)) {
            throw new IllegalArgumentException("No tienes permiso para confirmar esta tutoría");
        }

        // 3. Validar estado (debe ser PROGRAMADA)
        if (tutoria.getEstado() != EstadoTutoria.PROGRAMADA) {
            throw new IllegalStateException("Solo se puede confirmar asistencia a tutorías programadas");
        }

        // 4. Marcar confirmación del estudiante
        tutoria.setConfirmacionEstudiante(true);
        tutoria.setFechaConfirmacionEstudiante(LocalDateTime.now());

        // 5. Si ambos confirmaron, cambiar estado a REALIZADA
        if (Boolean.TRUE.equals(tutoria.getConfirmacionTutor())) {
            tutoria.setEstado(EstadoTutoria.REALIZADA);
        }

        tutoriaRepository.save(tutoria);
    }

    /**
     * Tutor confirma asistencia
     */
    @Transactional
    public void confirmarAsistenciaTutor(Integer tutoriaId, Integer tutorId) {
        // 1. Obtener tutoría
        Tutoria tutoria = tutoriaRepository.findById(tutoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Tutoría no encontrada"));

        // 2. Validar que sea el tutor correcto
        if (!tutoria.getTutor().getIdUsuario().equals(tutorId)) {
            throw new IllegalArgumentException("No tienes permiso para confirmar esta tutoría");
        }

        // 3. Validar estado (debe ser PROGRAMADA)
        if (tutoria.getEstado() != EstadoTutoria.PROGRAMADA) {
            throw new IllegalStateException("Solo se puede confirmar asistencia a tutorías programadas");
        }

        // 4. Marcar confirmación del tutor
        tutoria.setConfirmacionTutor(true);
        tutoria.setFechaConfirmacionTutor(LocalDateTime.now());

        // 5. Si ambos confirmaron, cambiar estado a REALIZADA
        if (Boolean.TRUE.equals(tutoria.getConfirmacionEstudiante())) {
            tutoria.setEstado(EstadoTutoria.REALIZADA);
        }

        tutoriaRepository.save(tutoria);
    }

    /**
     * Obtiene las tutorías de un estudiante
     */
    public List<TutoriaDTO> obtenerTutoriasEstudiante(Integer estudianteId, List<EstadoTutoria> estados) {
        Usuario estudiante = usuarioRepository.findById(estudianteId)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        List<Tutoria> tutorias;
        if (estados == null || estados.isEmpty()) {
            tutorias = tutoriaRepository.findByEstudiante(estudiante);
        } else {
            tutorias = tutoriaRepository.findByEstudianteAndEstadoIn(estudiante, estados);
        }

        return tutorias.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene las tutorías de un tutor
     */
    public List<TutoriaDTO> obtenerTutoriasTutor(Integer tutorId, List<EstadoTutoria> estados) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        List<Tutoria> tutorias;
        if (estados == null || estados.isEmpty()) {
            tutorias = tutoriaRepository.findByTutor(tutor);
        } else {
            tutorias = tutoriaRepository.findByTutorAndEstadoIn(tutor, estados);
        }

        return tutorias.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad Tutoria a DTO
     */
    private TutoriaDTO convertirADTO(Tutoria tutoria) {
        TutoriaDTO dto = new TutoriaDTO();
        dto.setIdTutoria(tutoria.getIdTutoria());
        dto.setIdEstudiante(tutoria.getEstudiante().getIdUsuario());
        dto.setNombreEstudiante(tutoria.getEstudiante().getPrimerNombre() + " " +
                tutoria.getEstudiante().getPrimerApellido());
        dto.setTelefonoEstudiante(tutoria.getEstudiante().getTelefonoUsuario());
        dto.setIdTutor(tutoria.getTutor().getIdUsuario());
        dto.setNombreTutor(tutoria.getTutor().getPrimerNombre() + " " +
                tutoria.getTutor().getPrimerApellido());
        dto.setTelefonoTutor(tutoria.getTutor().getTelefonoUsuario());
        dto.setIdMateria(tutoria.getMateria().getId_materia());
        dto.setNombreMateria(tutoria.getMateria().getNombre_materia());
        dto.setNombreTema(tutoria.getNombreTema());
        dto.setFechaTutoria(tutoria.getFechaTutoria());
        dto.setHoraInicio(tutoria.getHoraInicio());
        dto.setHoraFin(tutoria.getHoraFin());
        dto.setModalidad(tutoria.getModalidad());
        dto.setLinkTutoria(tutoria.getLinkTutoria());
        dto.setEstado(tutoria.getEstado());
        dto.setArchivoSoporte(tutoria.getArchivoSoporte());
        dto.setObservaciones(tutoria.getObservaciones());
        dto.setFechaSolicitud(tutoria.getFechaSolicitud());
        dto.setConfirmacionEstudiante(tutoria.getConfirmacionEstudiante());
        dto.setConfirmacionTutor(tutoria.getConfirmacionTutor());
        dto.setFechaConfirmacionEstudiante(tutoria.getFechaConfirmacionEstudiante());
        dto.setFechaConfirmacionTutor(tutoria.getFechaConfirmacionTutor());
        return dto;
    }
}
