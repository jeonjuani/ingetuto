package com.ingenieriaPI.IngeTUTO.service;

import com.ingenieriaPI.IngeTUTO.entity.Tutoria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ClassPathResource;
import jakarta.mail.internet.MimeMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void enviarConfirmacionReserva(Tutoria tutoria) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String fecha = tutoria.getFechaTutoria().format(dateFormatter);
        String horaInicio = tutoria.getHoraInicio().format(timeFormatter);
        String horaFin = tutoria.getHoraFin().format(timeFormatter);
        String materia = tutoria.getMateria().getNombre_materia();
        String tema = tutoria.getNombreTema();
        String modalidad = tutoria.getModalidad().toString();

        String tutorNombre = tutoria.getTutor().getPrimerNombre() + " " + tutoria.getTutor().getPrimerApellido();
        String estudianteNombre = tutoria.getEstudiante().getPrimerNombre() + " "
                + tutoria.getEstudiante().getPrimerApellido();

        try {
            // Email para el Estudiante
            MimeMessage messageEstudiante = mailSender.createMimeMessage();
            MimeMessageHelper helperEstudiante = new MimeMessageHelper(messageEstudiante, true, "UTF-8");
            
            helperEstudiante.setTo(tutoria.getEstudiante().getCorreoUsuario());
            helperEstudiante.setSubject("Confirmación de Reserva de Tutoría - IngeTUTO");
            
            String htmlEstudiante = "<html><body>"
                    + "<p>Hola <strong>" + tutoria.getEstudiante().getPrimerNombre() + "</strong>,</p>"
                    + "<p>Has reservado exitosamente una tutoría.</p>"
                    + "<h3>Detalles de la tutoría:</h3>"
                    + "<ul>"
                    + "<li><strong>Materia:</strong> " + materia + "</li>"
                    + "<li><strong>Tema:</strong> " + tema + "</li>"
                    + "<li><strong>Fecha:</strong> " + fecha + "</li>"
                    + "<li><strong>Horario:</strong> " + horaInicio + " - " + horaFin + "</li>"
                    + "<li><strong>Modalidad:</strong> " + modalidad + "</li>"
                    + "<li><strong>Tutor:</strong> " + tutorNombre + "</li>"
                    + "</ul>"
                    + "<p>Por favor, asegúrate de asistir a la hora acordada. ¡Mucho éxito en tu estudio!</p>"
                    + "<br>"
                    + "<p>Atentamente,<br>"
                    + "<strong>IngeTUTO - Bienestar Ingeniería UdeA</strong></p>"
                    + "<img src='cid:logoIngeTUTO' alt='IngeTUTO Logo' style='width: 150px; height: auto;' />"
                    + "</body></html>";
            
            helperEstudiante.setText(htmlEstudiante, true);
            helperEstudiante.addInline("logoIngeTUTO", new ClassPathResource("static/images/logoIngeTUTO.png"));

            // Email para el Tutor
            MimeMessage messageTutor = mailSender.createMimeMessage();
            MimeMessageHelper helperTutor = new MimeMessageHelper(messageTutor, true, "UTF-8");
            
            helperTutor.setTo(tutoria.getTutor().getCorreoUsuario());
            helperTutor.setSubject("Nueva Tutoría Reservada - IngeTUTO");
            
            String htmlTutor = "<html><body>"
                    + "<p>Hola <strong>" + tutoria.getTutor().getPrimerNombre() + "</strong>,</p>"
                    + "<p>Un estudiante ha reservado uno de tus bloques de disponibilidad.</p>"
                    + "<h3>Detalles de la tutoría:</h3>"
                    + "<ul>"
                    + "<li><strong>Estudiante:</strong> " + estudianteNombre + " (" + tutoria.getEstudiante().getCorreoUsuario() + ")</li>"
                    + "<li><strong>Materia:</strong> " + materia + "</li>"
                    + "<li><strong>Tema:</strong> " + tema + "</li>"
                    + "<li><strong>Fecha:</strong> " + fecha + "</li>"
                    + "<li><strong>Horario:</strong> " + horaInicio + " - " + horaFin + "</li>"
                    + "<li><strong>Modalidad:</strong> " + modalidad + "</li>"
                    + "</ul>"
                    + "<p>Por favor, prepárate para la sesión. Recuerda agregar el enlace en la plataforma si la tutoría es VIRTUAL.</p>"
                    + "<br>"
                    + "<p>Atentamente,<br>"
                    + "<strong>IngeTUTO - Bienestar Ingeniería UdeA</strong></p>"
                    + "<img src='cid:logoIngeTUTO' alt='IngeTUTO Logo' style='width: 150px; height: auto;' />"
                    + "</body></html>";
            
            helperTutor.setText(htmlTutor, true);
            helperTutor.addInline("logoIngeTUTO", new ClassPathResource("static/images/logoIngeTUTO.png"));

            mailSender.send(messageEstudiante);
            mailSender.send(messageTutor);
            System.out.println("Correos de confirmación enviados exitosamente.");
        } catch (Exception e) {
            System.err.println("Error enviando correos de confirmación: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void enviarConfirmacionCancelacion(Tutoria tutoria, String canceladoPor, String motivo) {
        // ... (existing code remains same, I'll just add the new method after it)
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String fecha = tutoria.getFechaTutoria().format(dateFormatter);
        String horaInicio = tutoria.getHoraInicio().format(timeFormatter);
        String materia = tutoria.getMateria().getNombre_materia();

        String estudianteNombre = tutoria.getEstudiante().getPrimerNombre() + " " + tutoria.getEstudiante().getPrimerApellido();
        String tutorNombre = tutoria.getTutor().getPrimerNombre() + " " + tutoria.getTutor().getPrimerApellido();

        String mensajeComunHtml = "<p>La tutoría programada ha sido <strong>CANCELADA</strong>.</p>"
                + "<h3>Detalles de la tutoría cancelada:</h3>"
                + "<ul>"
                + "<li><strong>Materia:</strong> " + materia + "</li>"
                + "<li><strong>Fecha:</strong> " + fecha + " a las " + horaInicio + "</li>"
                + "<li><strong>Cancelada por:</strong> " + canceladoPor + "</li>"
                + "<li><strong>Motivo de cancelación:</strong> " + (motivo != null && !motivo.isBlank() ? motivo : "No especificado") + "</li>"
                + "</ul>"
                + "<p>Si consideras que esto es un error, por favor comunícate con Bienestar de Ingeniería.</p>"
                + "<br>"
                + "<p>Atentamente,<br>"
                + "<strong>IngeTUTO - Bienestar Ingeniería UdeA</strong></p>"
                + "<img src='cid:logoIngeTUTO' alt='IngeTUTO Logo' style='width: 150px; height: auto;' />";

        try {
            MimeMessage messageEstudiante = mailSender.createMimeMessage();
            MimeMessageHelper helperEstudiante = new MimeMessageHelper(messageEstudiante, true, "UTF-8");
            helperEstudiante.setTo(tutoria.getEstudiante().getCorreoUsuario());
            helperEstudiante.setSubject("Tutoría Cancelada - IngeTUTO");
            String htmlEstudiante = "<html><body><p>Hola <strong>" + tutoria.getEstudiante().getPrimerNombre() + "</strong>,</p>" + mensajeComunHtml + "</body></html>";
            helperEstudiante.setText(htmlEstudiante, true);
            helperEstudiante.addInline("logoIngeTUTO", new ClassPathResource("static/images/logoIngeTUTO.png"));

            MimeMessage messageTutor = mailSender.createMimeMessage();
            MimeMessageHelper helperTutor = new MimeMessageHelper(messageTutor, true, "UTF-8");
            helperTutor.setTo(tutoria.getTutor().getCorreoUsuario());
            helperTutor.setSubject("Tutoría Cancelada - IngeTUTO");
            String htmlTutor = "<html><body><p>Hola <strong>" + tutoria.getTutor().getPrimerNombre() + "</strong>,</p>" + mensajeComunHtml + "</body></html>";
            helperTutor.setText(htmlTutor, true);
            helperTutor.addInline("logoIngeTUTO", new ClassPathResource("static/images/logoIngeTUTO.png"));

            mailSender.send(messageEstudiante);
            mailSender.send(messageTutor);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Async
    public void enviarNotificacionMensajeEstudiante(Tutoria tutoria, java.util.List<com.ingenieriaPI.IngeTUTO.entity.Mensaje> mensajes) {
        if (mensajes == null || mensajes.isEmpty()) return;

        String tutorNombre = tutoria.getTutor().getPrimerNombre() + " " + tutoria.getTutor().getPrimerApellido();
        String materia = tutoria.getMateria().getNombre_materia();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(tutoria.getEstudiante().getCorreoUsuario());
            helper.setSubject("Nuevos mensajes de tu tutor en IngeTUTO");

            StringBuilder mensajesHtml = new StringBuilder();
            for (com.ingenieriaPI.IngeTUTO.entity.Mensaje msg : mensajes) {
                mensajesHtml.append("<div style='background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px; margin: 10px 0; font-style: italic; color: #334155;'>")
                            .append("\"").append(msg.getContenido()).append("\"")
                            .append("</div>");
            }

            String html = "<html><body>"
                    + "<p>Hola <strong>" + tutoria.getEstudiante().getPrimerNombre() + "</strong>,</p>"
                    + "<p>Tu tutor <strong>" + tutorNombre + "</strong> te ha enviado nuevos mensajes en el chat de la tutoría de <strong>" + materia + "</strong>:</p>"
                    + mensajesHtml.toString()
                    + "<p>Puedes entrar a la plataforma para responder y continuar con la tutoría.</p>"
                    + "<br>"
                    + "<p>Atentamente,<br>"
                    + "<strong>IngeTUTO - Bienestar Ingeniería UdeA</strong></p>"
                    + "<img src='cid:logoIngeTUTO' alt='IngeTUTO Logo' style='width: 150px; height: auto;' />"
                    + "</body></html>";

            helper.setText(html, true);
            helper.addInline("logoIngeTUTO", new ClassPathResource("static/images/logoIngeTUTO.png"));

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error enviando notificación de mensajes agrupados: " + e.getMessage());
        }
    }
}
