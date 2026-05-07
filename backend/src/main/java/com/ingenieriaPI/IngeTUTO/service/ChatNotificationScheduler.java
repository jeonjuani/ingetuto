package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.entity.Mensaje;
import com.ingenieriaPI.IngeTUTO.entity.Tutoria;
import com.ingenieriaPI.IngeTUTO.repository.MensajeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ChatNotificationScheduler {

    private final MensajeRepository mensajeRepository;
    private final EmailService emailService;

    public ChatNotificationScheduler(MensajeRepository mensajeRepository, EmailService emailService) {
        this.mensajeRepository = mensajeRepository;
        this.emailService = emailService;
    }

    /**
     * Revisa mensajes pendientes de notificar cada minuto.
     * Si han pasado 3 minutos desde el último mensaje de un tutor en una tutoría,
     * se envía un correo agrupado al estudiante.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void procesarNotificacionesPendientes() {
        // 1. Obtener todos los mensajes que no han sido notificados
        List<Mensaje> pendientes = mensajeRepository.findByNotificadoPorCorreoFalse();
        if (pendientes.isEmpty()) return;

        // 2. Agrupar por tutoría
        Map<Tutoria, List<Mensaje>> agrupadosPorTutoria = pendientes.stream()
                .collect(Collectors.groupingBy(Mensaje::getTutoria));

        LocalDateTime now = LocalDateTime.now();

        for (Map.Entry<Tutoria, List<Mensaje>> entry : agrupadosPorTutoria.entrySet()) {
            Tutoria tutoria = entry.getKey();
            List<Mensaje> msgsDeEstaTutoria = entry.getValue();

            // Filtrar solo los mensajes enviados por el tutor que AÚN NO han sido leídos
            List<Mensaje> msgsDelTutorNoLeidos = msgsDeEstaTutoria.stream()
                    .filter(m -> m.getEmisor().getIdUsuario().equals(tutoria.getTutor().getIdUsuario()))
                    .filter(m -> !m.getLeido())
                    .collect(Collectors.toList());

            if (msgsDelTutorNoLeidos.isEmpty()) {
                // Si no hay mensajes del tutor o todos ya fueron leídos en el chat, 
                // marcamos todo como notificado para no procesarlo más y seguimos.
                marcarComoNotificados(msgsDeEstaTutoria);
                continue;
            }

            // Encontrar la fecha del mensaje más reciente del tutor (de los no leídos)
            LocalDateTime fechaUltimoMensaje = msgsDelTutorNoLeidos.stream()
                    .map(Mensaje::getFechaEnvio)
                    .max(LocalDateTime::compareTo)
                    .orElse(now);

            // 3. ¿Han pasado al menos 3 minutos desde el último mensaje del tutor?
            if (fechaUltimoMensaje.isBefore(now.minusMinutes(3))) {
                // Enviar correo agrupado al estudiante solo con los mensajes que no ha visto
                emailService.enviarNotificacionMensajeEstudiante(tutoria, msgsDelTutorNoLeidos);
                
                // Marcar todos los mensajes (estudiante y tutor) de esta ráfaga como notificados
                marcarComoNotificados(msgsDeEstaTutoria);
                System.out.println("Notificación agrupada enviada para tutoría ID: " + tutoria.getIdTutoria());
            }
        }
    }

    private void marcarComoNotificados(List<Mensaje> mensajes) {
        mensajes.forEach(m -> {
            m.setNotificadoPorCorreo(true);
            mensajeRepository.save(m);
        });
    }
}
