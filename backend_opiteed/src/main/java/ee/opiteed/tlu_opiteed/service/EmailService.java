package ee.opiteed.tlu_opiteed.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
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
            log.info("Email saadetud edukalt aadressile: {}", toEmail);
        } catch (Exception e) {
            log.error("Emaili saatmine ebaõnnestus aadressile {}: {}", toEmail, e.getMessage());
        }
    }
}
