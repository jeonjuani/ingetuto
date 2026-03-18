package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.dto.MensajeDTO;
import com.ingenieriaPI.IngeTUTO.entity.Mensaje;
import com.ingenieriaPI.IngeTUTO.entity.Tutoria;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.repository.MensajeRepository;
import com.ingenieriaPI.IngeTUTO.repository.TutoriaRepository;
import com.ingenieriaPI.IngeTUTO.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final TutoriaRepository tutoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public MensajeService(MensajeRepository mensajeRepository,
                          TutoriaRepository tutoriaRepository,
                          UsuarioRepository usuarioRepository) {
        this.mensajeRepository = mensajeRepository;
        this.tutoriaRepository = tutoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Envía un mensaje en el contexto de una tutoría
     */
    @Transactional
    public MensajeDTO enviarMensaje(Integer tutoriaId, Integer emisorId, String contenido) {
        // 1. Obtener tutoría
        Tutoria tutoria = tutoriaRepository.findById(tutoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Tutoría no encontrada"));

        // 2. Obtener emisor
        Usuario emisor = usuarioRepository.findById(emisorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // 3. Validar que el emisor sea el estudiante o el tutor de esa tutoría
        boolean esEstudiante = tutoria.getEstudiante().getIdUsuario().equals(emisorId);
        boolean esTutor = tutoria.getTutor().getIdUsuario().equals(emisorId);

        if (!esEstudiante && !esTutor) {
            throw new IllegalArgumentException("No tienes permiso para enviar mensajes en esta tutoría");
        }

        // 4. Crear el mensaje
        Mensaje mensaje = new Mensaje();
        mensaje.setTutoria(tutoria);
        mensaje.setEmisor(emisor);
        mensaje.setContenido(contenido);
        mensaje.setFechaEnvio(LocalDateTime.now());
        mensaje.setLeido(false);

        // 5. Guardar
        Mensaje guardado = mensajeRepository.save(mensaje);

        return convertirADTO(guardado);
    }

    /**
     * Obtiene todos los mensajes de una tutoría y marca como leídos los que no son del usuario actual
     */
    @Transactional
    public List<MensajeDTO> obtenerMensajes(Integer tutoriaId, Integer usuarioId) {
        // 1. Obtener tutoría
        Tutoria tutoria = tutoriaRepository.findById(tutoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Tutoría no encontrada"));

        // 2. Validar que el usuario sea parte de la tutoría
        boolean esEstudiante = tutoria.getEstudiante().getIdUsuario().equals(usuarioId);
        boolean esTutor = tutoria.getTutor().getIdUsuario().equals(usuarioId);

        if (!esEstudiante && !esTutor) {
            throw new IllegalArgumentException("No tienes permiso para ver los mensajes de esta tutoría");
        }

        // 3. Obtener mensajes en orden cronológico
        List<Mensaje> mensajes = mensajeRepository.findByTutoriaOrderByFechaEnvioAsc(tutoria);

        // 4. Marcar como leídos los mensajes que no envió el usuario actual
        mensajes.stream()
                .filter(m -> !m.getEmisor().getIdUsuario().equals(usuarioId) && !m.getLeido())
                .forEach(m -> {
                    m.setLeido(true);
                    m.setFechaLectura(LocalDateTime.now());
                    mensajeRepository.save(m);
                });

        return mensajes.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Cuenta los mensajes no leídos de una tutoría para un usuario
     */
    public long contarNoLeidos(Integer tutoriaId, Integer usuarioId) {
        Tutoria tutoria = tutoriaRepository.findById(tutoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Tutoría no encontrada"));

        return mensajeRepository.countByTutoriaAndEmisorIdUsuarioNotAndLeidoFalse(tutoria, usuarioId);
    }

    /**
     * Convierte entidad a DTO
     */
    private MensajeDTO convertirADTO(Mensaje mensaje) {
        MensajeDTO dto = new MensajeDTO();
        dto.setIdMensaje(mensaje.getIdMensaje());
        dto.setIdTutoria(mensaje.getTutoria().getIdTutoria());
        dto.setIdEmisor(mensaje.getEmisor().getIdUsuario());
        dto.setNombreEmisor(mensaje.getEmisor().getPrimerNombre() + " " +
                mensaje.getEmisor().getPrimerApellido());
        dto.setContenido(mensaje.getContenido());
        dto.setFechaEnvio(mensaje.getFechaEnvio());
        dto.setLeido(mensaje.getLeido());
        dto.setFechaLectura(mensaje.getFechaLectura());
        return dto;
    }
}