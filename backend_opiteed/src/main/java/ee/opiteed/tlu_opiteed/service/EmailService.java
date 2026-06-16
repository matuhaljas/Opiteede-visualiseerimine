package ee.opiteed.tlu_opiteed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void saadaJagamisEmail(String toEmail, String sharedBy, String curriculumName, Long curriculumId, String role) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Sinuga jagati õppekava: " + curriculumName);
            message.setText(
                "Tere!\n\n" +
                sharedBy + " jagas sinuga õppekava \"" + curriculumName + "\".\n" +
                "Sinu roll: " + role + "\n\n" +
                "Õppekava avamiseks logi sisse ja mine:\n" +
                frontendUrl + "/new/" + curriculumId + "\n\n" +
                "Tervitades,\nÕpiteede Visualiseerimise tiim"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // emaili saatmise viga ei blokeeri kutsumist
        }
    }
}
