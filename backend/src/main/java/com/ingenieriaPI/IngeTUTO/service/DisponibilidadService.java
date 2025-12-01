package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.dto.*;
import com.ingenieriaPI.IngeTUTO.entity.*;
import com.ingenieriaPI.IngeTUTO.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisponibilidadService {

    private final DisponibilidadSemanalRepository disponibilidadSemanalRepository;
    private final DisponibilidadMensualRepository disponibilidadMensualRepository;
    private final TutorXMateriaRepository tutorXMateriaRepository;
    private final UsuarioRepository usuarioRepository;

    public DisponibilidadService(
            DisponibilidadSemanalRepository disponibilidadSemanalRepository,
            DisponibilidadMensualRepository disponibilidadMensualRepository,
            TutorXMateriaRepository tutorXMateriaRepository,
            UsuarioRepository usuarioRepository) {
        this.disponibilidadSemanalRepository = disponibilidadSemanalRepository;
        this.disponibilidadMensualRepository = disponibilidadMensualRepository;
        this.tutorXMateriaRepository = tutorXMateriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Crea o actualiza la plantilla semanal de disponibilidad del tutor
     */
    @Transactional
    public void crearPlantillaSemanal(Integer tutorId, List<DisponibilidadSemanalDTO> bloques) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        // Validar que el tutor tenga al menos una materia asignada
        long cantidadMaterias = tutorXMateriaRepository.countByTutor(tutor);
        if (cantidadMaterias == 0) {
            throw new IllegalArgumentException("Debe tener al menos una materia asignada para crear disponibilidad");
        }

        // Validar bloques
        for (DisponibilidadSemanalDTO bloqueDTO : bloques) {
            validarBloqueHorario(bloqueDTO.getHoraInicio(), bloqueDTO.getHoraFin());
        }

        // Marcar bloques existentes como inactivos
        // Eliminar bloques existentes para evitar conflictos de clave única
        disponibilidadSemanalRepository.deleteByTutor(tutor);
        disponibilidadSemanalRepository.flush();

        // Crear nuevos bloques
        List<DisponibilidadSemanal> nuevosBloques = bloques.stream()
                .map(dto -> {
                    DisponibilidadSemanal bloque = new DisponibilidadSemanal();
                    bloque.setTutor(tutor);
                    bloque.setDiaSemana(dto.getDiaSemana());
                    bloque.setHoraInicio(dto.getHoraInicio());
                    bloque.setHoraFin(dto.getHoraFin());
                    bloque.setModalidad(dto.getModalidad());
                    bloque.setActivo(true);
                    return bloque;
                })
                .collect(Collectors.toList());

        disponibilidadSemanalRepository.saveAll(nuevosBloques);
    }

    /**
     * Obtiene la plantilla semanal activa del tutor
     */
    public List<DisponibilidadSemanalDTO> obtenerPlantillaSemanal(Integer tutorId) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        return disponibilidadSemanalRepository.findByTutorAndActivoTrue(tutor).stream()
                .map(bloque -> new DisponibilidadSemanalDTO(
                        bloque.getIdDisponibilidadSemanal(),
                        bloque.getDiaSemana(),
                        bloque.getHoraInicio(),
                        bloque.getHoraFin(),
                        bloque.getModalidad()))
                .collect(Collectors.toList());
    }

    /**
     * Genera la disponibilidad mensual a partir de la plantilla semanal
     * Valida que se haga antes de la fecha límite (28/30 del mes anterior)
     */
    @Transactional
    public GenerarDisponibilidadResponse generarDisponibilidadMensual(Integer tutorId, int mes, int anio) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        // Validar fecha límite
        LocalDate fechaLimite = calcularFechaLimiteRegistro(mes, anio);
        LocalDate hoy = LocalDate.now();

        if (hoy.isAfter(fechaLimite)) {
            throw new IllegalStateException(
                    "La fecha límite para registrar disponibilidad del mes " + mes + "/" + anio +
                            " era el " + fechaLimite
                            + ". Solo puede eliminar o modificar modalidad de bloques existentes.");
        }

        // Verificar si ya existen bloques para este mes
        LocalDate primerDia = LocalDate.of(anio, mes, 1);
        LocalDate ultimoDia = primerDia.withDayOfMonth(primerDia.lengthOfMonth());

        long bloquesExistentes = disponibilidadMensualRepository.countByTutorAndFechaBetween(tutor, primerDia,
                ultimoDia);

        if (bloquesExistentes > 0) {
            // Verificar si hay reservas activas en ese mes
            boolean hayReservas = disponibilidadMensualRepository.existsByTutorAndFechaBetweenAndEstadoIn(
                    tutor,
                    primerDia,
                    ultimoDia,
                    List.of(EstadoDisponibilidad.RESERVADO, EstadoDisponibilidad.OCUPADO));

            if (hayReservas) {
                throw new IllegalStateException(
                        "No se puede regenerar el calendario porque ya existen tutorías reservadas u ocupadas en este mes.");
            }

            // Si no hay reservas, eliminar bloques anteriores para regenerar
            disponibilidadMensualRepository.deleteByTutorAndFechaBetween(tutor, primerDia, ultimoDia);
            disponibilidadMensualRepository.flush(); // Forzar ejecución del DELETE antes de los INSERT
        }

        // Obtener plantilla semanal
        List<DisponibilidadSemanal> plantilla = disponibilidadSemanalRepository.findByTutorAndActivoTrue(tutor);

        if (plantilla.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe crear una plantilla semanal antes de generar disponibilidad mensual");
        }

        // Generar bloques para cada día del mes
        List<DisponibilidadMensual> bloquesMensuales = new ArrayList<>();

        for (LocalDate fecha = primerDia; !fecha.isAfter(ultimoDia); fecha = fecha.plusDays(1)) {
            DayOfWeek diaSemanaJava = fecha.getDayOfWeek();
            DiaSemana diaSemana = convertirDiaSemana(diaSemanaJava);

            // Buscar bloques de la plantilla para este día
            List<DisponibilidadSemanal> bloquesDelDia = plantilla.stream()
                    .filter(b -> b.getDiaSemana() == diaSemana)
                    .collect(Collectors.toList());

            // Crear bloques mensuales
            for (DisponibilidadSemanal bloqueTemplate : bloquesDelDia) {
                DisponibilidadMensual bloqueM = new DisponibilidadMensual();
                bloqueM.setTutor(tutor);
                bloqueM.setFecha(fecha);
                bloqueM.setHoraInicio(bloqueTemplate.getHoraInicio());
                bloqueM.setHoraFin(bloqueTemplate.getHoraFin());
                bloqueM.setModalidad(bloqueTemplate.getModalidad());
                bloqueM.setEstado(EstadoDisponibilidad.DISPONIBLE);
                bloqueM.setOrigen(OrigenDisponibilidad.PLANTILLA);
                bloquesMensuales.add(bloqueM);
            }
        }

        // Guardar bloques
        disponibilidadMensualRepository.saveAll(bloquesMensuales);

        return new GenerarDisponibilidadResponse(
                true,
                "Disponibilidad generada exitosamente para " + mes + "/" + anio,
                bloquesMensuales.size(),
                fechaLimite);
    }

    /**
     * Obtiene la disponibilidad mensual del tutor
     */
    public List<DisponibilidadMensualDTO> obtenerDisponibilidadMensual(Integer tutorId, int mes, int anio) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        List<DisponibilidadMensual> bloques = disponibilidadMensualRepository.findByTutorAndMesAndAnio(tutor, mes,
                anio);

        return bloques.stream()
                .map(bloque -> new DisponibilidadMensualDTO(
                        bloque.getIdDisponibilidadMensual(),
                        tutor.getIdUsuario(),
                        tutor.getPrimerNombre() + " " + tutor.getPrimerApellido(),
                        bloque.getFecha(),
                        bloque.getHoraInicio(),
                        bloque.getHoraFin(),
                        bloque.getModalidad(),
                        bloque.getEstado()))
                .collect(Collectors.toList());
    }

    /**
     * Valida y confirma la disponibilidad mensual
     */
    public ValidacionDisponibilidadResponse validarYConfirmarDisponibilidad(Integer tutorId, int mes, int anio) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        ValidacionDisponibilidadResponse response = new ValidacionDisponibilidadResponse(true);

        // Validación 1: Al menos un bloque
        long cantidadBloques = disponibilidadMensualRepository.countByTutorAndFechaBetween(
                tutor,
                LocalDate.of(anio, mes, 1),
                LocalDate.of(anio, mes, 1).withDayOfMonth(LocalDate.of(anio, mes, 1).lengthOfMonth()));

        if (cantidadBloques == 0) {
            response.setValido(false);
            response.agregarError("Debe asignar al menos un bloque horario de disponibilidad");
        }

        // Validación 2: Verificar materias asignadas
        long cantidadMaterias = tutorXMateriaRepository.countByTutor(tutor);
        if (cantidadMaterias == 0) {
            response.setValido(false);
            response.agregarError("Debe tener al menos una materia asignada para ofrecer tutorías");
        }

        // Validación 3: Advertencia de domingos
        List<DisponibilidadMensual> bloques = disponibilidadMensualRepository.findByTutorAndMesAndAnio(tutor, mes,
                anio);
        long bloquesEnDomingo = bloques.stream()
                .filter(b -> b.getFecha().getDayOfWeek() == DayOfWeek.SUNDAY)
                .count();

        if (bloquesEnDomingo > 0) {
            response.agregarAdvertencia("Tiene " + bloquesEnDomingo + " bloques en domingo. Se recomienda descanso.");
        }

        return response;
    }

    /**
     * Elimina un bloque de disponibilidad mensual
     * Valida que no tenga reservas activas
     */
    @Transactional
    public void eliminarBloqueMensual(Integer bloqueId, Integer tutorId) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        DisponibilidadMensual bloque = disponibilidadMensualRepository.findById(bloqueId)
                .orElseThrow(() -> new IllegalArgumentException("Bloque no encontrado"));

        // Verificar que el bloque pertenece al tutor
        if (!bloque.getTutor().getIdUsuario().equals(tutor.getIdUsuario())) {
            throw new IllegalArgumentException("Este bloque no pertenece al tutor");
        }

        // Verificar que no esté reservado
        if (bloque.getEstado() == EstadoDisponibilidad.RESERVADO ||
                bloque.getEstado() == EstadoDisponibilidad.OCUPADO) {
            throw new IllegalStateException("Debe cancelar la tutoría primero antes de eliminar este bloque");
        }

        disponibilidadMensualRepository.delete(bloque);
    }

    /**
     * Modifica la modalidad de un bloque mensual
     * Permitido incluso después de la fecha límite
     */
    @Transactional
    public void modificarModalidadBloque(Integer bloqueId, Integer tutorId, Modalidad nuevaModalidad) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        DisponibilidadMensual bloque = disponibilidadMensualRepository.findById(bloqueId)
                .orElseThrow(() -> new IllegalArgumentException("Bloque no encontrado"));

        // Verificar que el bloque pertenece al tutor
        if (!bloque.getTutor().getIdUsuario().equals(tutor.getIdUsuario())) {
            throw new IllegalArgumentException("Este bloque no pertenece al tutor");
        }

        // No permitir cambio si ya está reservado u ocupado
        if (bloque.getEstado() == EstadoDisponibilidad.RESERVADO ||
                bloque.getEstado() == EstadoDisponibilidad.OCUPADO) {
            throw new IllegalStateException("No puede modificar la modalidad de un bloque reservado u ocupado");
        }

        bloque.setModalidad(nuevaModalidad);
        disponibilidadMensualRepository.save(bloque);
    }

    /**
     * Obtiene bloques disponibles por materia (vista de estudiante)
     */
    public List<DisponibilidadMensualDTO> obtenerDisponibilidadPorMateria(
            Integer materiaId, LocalDate fechaInicio, LocalDate fechaFin) {

        List<DisponibilidadMensual> bloques = disponibilidadMensualRepository
                .findAvailableBlocksByMateriaAndDateRange(
                        materiaId,
                        fechaInicio,
                        fechaFin,
                        EstadoDisponibilidad.DISPONIBLE);

        return bloques.stream()
                .map(bloque -> new DisponibilidadMensualDTO(
                        bloque.getIdDisponibilidadMensual(),
                        bloque.getTutor().getIdUsuario(),
                        bloque.getTutor().getPrimerNombre() + " " + bloque.getTutor().getPrimerApellido(),
                        bloque.getFecha(),
                        bloque.getHoraInicio(),
                        bloque.getHoraFin(),
                        bloque.getModalidad(),
                        bloque.getEstado()))
                .collect(Collectors.toList());
    }

    // ========== MÉTODOS AUXILIARES ==========

    /**
     * Calcula la fecha límite para registrar disponibilidad
     * Es el último día del mes anterior al que se está registrando
     */
    private LocalDate calcularFechaLimiteRegistro(int mes, int anio) {
        LocalDate mesObjetivo = LocalDate.of(anio, mes, 1);
        LocalDate mesAnterior = mesObjetivo.minusMonths(1);
        return mesAnterior.withDayOfMonth(mesAnterior.lengthOfMonth());
    }

    /**
     * Valida que un bloque horario sea de 1 hora y esté en el rango permitido
     */
    private void validarBloqueHorario(LocalTime horaInicio, LocalTime horaFin) {
        // Validar rango de 6am a 10pm
        if (horaInicio.isBefore(LocalTime.of(6, 0)) || horaFin.isAfter(LocalTime.of(22, 0))) {
            throw new IllegalArgumentException("Los bloques deben estar entre las 6:00 y las 22:00");
        }

        // Validar que sea exactamente 1 hora
        if (!horaFin.equals(horaInicio.plusHours(1))) {
            throw new IllegalArgumentException("Los bloques deben ser de exactamente 1 hora");
        }
    }

    /**
     * Convierte DayOfWeek de Java a nuestro enum DiaSemana
     */
    private DiaSemana convertirDiaSemana(DayOfWeek dayOfWeek) {
        switch (dayOfWeek) {
            case MONDAY:
                return DiaSemana.LUNES;
            case TUESDAY:
                return DiaSemana.MARTES;
            case WEDNESDAY:
                return DiaSemana.MIERCOLES;
            case THURSDAY:
                return DiaSemana.JUEVES;
            case FRIDAY:
                return DiaSemana.VIERNES;
            case SATURDAY:
                return DiaSemana.SABADO;
            case SUNDAY:
                return DiaSemana.DOMINGO;
            default:
                throw new IllegalArgumentException("Día de semana no válido");
        }
    }

    /**
     * Elimina todas las disponibilidades de un tutor (plantillas semanales y
     * calendarios mensuales)
     * Se usa cuando un tutor es revocado o pierde todas sus materias asignadas
     */
    @Transactional
    public void eliminarTodasDisponibilidades(Integer tutorId) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor no encontrado"));

        // Eliminar todas las plantillas semanales
        disponibilidadSemanalRepository.deleteByTutor(tutor);

        // Eliminar todos los calendarios mensuales
        disponibilidadMensualRepository.deleteByTutor(tutor);

        // Forzar ejecución de los DELETE
        disponibilidadSemanalRepository.flush();
        disponibilidadMensualRepository.flush();
    }
}
