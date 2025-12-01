package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.entity.Materia;
import com.ingenieriaPI.IngeTUTO.entity.RegistroAspirante;
import com.ingenieriaPI.IngeTUTO.entity.Rol;
import com.ingenieriaPI.IngeTUTO.entity.TutorXMateria;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.repository.MateriaRepository;
import com.ingenieriaPI.IngeTUTO.repository.RegistroAspiranteRepository;
import com.ingenieriaPI.IngeTUTO.repository.RolRepository;
import com.ingenieriaPI.IngeTUTO.repository.TutorXMateriaRepository;
import com.ingenieriaPI.IngeTUTO.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class RegistroAspiranteService {

    private final RegistroAspiranteRepository registroAspiranteRepository;
    private final FileStorageService fileStorageService;
    private final UsuarioRepository usuarioRepository;
    private final MateriaRepository materiaRepository;
    private final RolRepository rolRepository;
    private final TutorXMateriaRepository tutorXMateriaRepository;

    public RegistroAspiranteService(RegistroAspiranteRepository registroAspiranteRepository,
                                    FileStorageService fileStorageService,
                                    UsuarioRepository usuarioRepository,
                                    MateriaRepository materiaRepository,
                                    RolRepository rolRepository,
                                    TutorXMateriaRepository tutorXMateriaRepository) {
        this.registroAspiranteRepository = registroAspiranteRepository;
        this.fileStorageService = fileStorageService;
        this.usuarioRepository = usuarioRepository;
        this.materiaRepository = materiaRepository;
        this.rolRepository = rolRepository;
        this.tutorXMateriaRepository = tutorXMateriaRepository;
    }

    @Transactional
    public RegistroAspirante crearSolicitud(Integer idUsuario, Integer idMateria,
                                            MultipartFile historiaAcademica,
                                            MultipartFile archivoSoporte) {

        Usuario aspirante = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Materia materia = materiaRepository.findById(idMateria)
                .orElseThrow(() -> new IllegalArgumentException("Materia no encontrada"));

        // Validar si ya existe una solicitud activa (En revisión o Aprobada)
        List<String> estadosActivos = Arrays.asList("EN_REVISIÓN", "APROBADO");
        if (registroAspiranteRepository.existsByAspiranteAndMateriaAndEstadoIn(aspirante, materia, estadosActivos)) {
            throw new IllegalArgumentException("Ya tienes una solicitud activa o aprobada para esta materia.");
        }

        String historiaPath = fileStorageService.storeFile(historiaAcademica);
        String soportePath = fileStorageService.storeFile(archivoSoporte);

        RegistroAspirante solicitud = new RegistroAspirante();
        solicitud.setAspirante(aspirante);
        solicitud.setMateria(materia);
        solicitud.setFechaSolicitud(LocalDate.now());
        solicitud.setEstado("EN_REVISIÓN");
        solicitud.setHistoriaAcademica(historiaPath);
        solicitud.setArchivoSoporte(soportePath);

        return registroAspiranteRepository.save(solicitud);
    }

    public List<RegistroAspirante> obtenerMisSolicitudes(Integer idUsuario) {
        Usuario aspirante = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return registroAspiranteRepository.findByAspirante(aspirante);
    }

    public List<RegistroAspirante> obtenerSolicitudesPendientes() {
        return registroAspiranteRepository.findByEstado("EN_REVISIÓN");
    }

    // ✅ Método que faltaba y rompió todo
    public List<RegistroAspirante> obtenerHistorialSolicitudes() {
        List<String> estadosHistorial = Arrays.asList("APROBADO", "DENEGADO", "REVOCADO");
        return registroAspiranteRepository.findByEstadoIn(estadosHistorial);
    }

    @Transactional
    public RegistroAspirante actualizarEstadoSolicitud(Integer idSolicitud, String nuevoEstado, String observacion) {

        RegistroAspirante solicitud = registroAspiranteRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (!"EN_REVISIÓN".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Solo se pueden revisar solicitudes en estado EN_REVISIÓN");
        }

        // Si el estado pasa a APROBADO → asignamos rol y asignamos tutor-materia
        if ("APROBADO".equals(nuevoEstado)) {

            Usuario aspirante = solicitud.getAspirante();

            // Buscar rol TUTOR
            Rol rolTutor = rolRepository.findByNombre("TUTOR")
                    .orElseThrow(() -> new IllegalStateException("Rol TUTOR no encontrado en el sistema"));

            // Asignar rol si no lo tiene
            if (!aspirante.getRoles().contains(rolTutor)) {
                aspirante.getRoles().add(rolTutor);
                usuarioRepository.save(aspirante);
            }

            // Registrar relación tutor–materia
            TutorXMateria relacion = new TutorXMateria();
            relacion.setTutor(aspirante);
            relacion.setMateria(solicitud.getMateria());
            tutorXMateriaRepository.save(relacion);
        }

        solicitud.setEstado(nuevoEstado);
        solicitud.setObservacion(observacion);

        return registroAspiranteRepository.save(solicitud);
    }

}
