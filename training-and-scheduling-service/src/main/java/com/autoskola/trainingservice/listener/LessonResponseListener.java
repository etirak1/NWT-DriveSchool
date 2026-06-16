package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.dto.LessonEvent;
import com.autoskola.trainingservice.model.CandidateNotification;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.CandidateNotificationRepository;
import com.autoskola.trainingservice.repository.LessonRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
public class LessonResponseListener {

    private static final Logger log = LoggerFactory.getLogger(LessonResponseListener.class);

    private final LessonRepository lessonRepository;
    private final CandidateNotificationRepository candidateNotificationRepository;

    public LessonResponseListener(LessonRepository lessonRepository,
                                  CandidateNotificationRepository candidateNotificationRepository) {
        this.lessonRepository = lessonRepository;
        this.candidateNotificationRepository = candidateNotificationRepository;
    }

    @Transactional
    @RabbitListener(queues = "training_queue")
    public void obradiOdgovorIzFinansija(LessonEvent event, @Header("amqp_receivedRoutingKey") String routingKey) {
        Lesson lesson = lessonRepository.findById(event.getLessonId()).orElse(null);

        if (lesson == null) {
            log.warn("Lekcija sa ID-om {} nije pronađena.", event.getLessonId());
            return;
        }

        if (lesson.getSagaId() == null || !lesson.getSagaId().equals(event.getSagaId())) {
            log.warn("Ignorisana poruka - sagaId se ne poklapa za čas {}. Očekivano: {}, primljeno: {}",
                    lesson.getLessonId(), lesson.getSagaId(), event.getSagaId());
            return;
        }

        if (!"PENDING".equalsIgnoreCase(lesson.getStatus())) {
            log.info("Poruka za čas {} (sagaId={}) ignorisana - već procesirano, status={}",
                    lesson.getLessonId(), event.getSagaId(), lesson.getStatus());
            return;
        }

        boolean success = "payment.success".equals(routingKey);
        if (success) {
            lesson.setStatus("ZAKAZANO");
            log.info("SAGA USPJEŠNA: Čas {} je potvrđen (sagaId={}).", lesson.getLessonId(), event.getSagaId());
        } else {
            lesson.setStatus("OTKAZANO");
            log.warn("SAGA ROLLBACK: Čas {} je otkazan (sagaId={}).", lesson.getLessonId(), event.getSagaId());
        }

        lessonRepository.save(lesson);

        if (lesson.getCandidate() != null && lesson.getCandidate().getUserId() != null) {
            Long candidateUserId = lesson.getCandidate().getUserId();
            String dateStr = lesson.getDateTime() != null
                    ? lesson.getDateTime().toLocalDate().toString()
                    : "nepoznat datum";
            String timeStr = lesson.getDateTime() != null
                    ? lesson.getDateTime().toLocalTime().toString().substring(0, 5)
                    : "";

            CandidateNotification notif = new CandidateNotification();
            notif.setCandidateUserId(candidateUserId);

            if (success) {
                notif.setType("LESSON_CONFIRMED");
                notif.setTitle("Čas potvrđen");
                notif.setBody("Vaš čas vožnje zakazan za " + dateStr + " u " + timeStr + "h je uspješno potvrđen.");
            } else {
                notif.setType("LESSON_CANCELLED");
                notif.setTitle("Čas otkazan");
                notif.setBody("Zakazivanje časa vožnje za " + dateStr + " u " + timeStr + "h nije uspjelo. Molimo pokušajte ponovo.");
            }

            candidateNotificationRepository.save(notif);
            log.info("Notifikacija poslana kandidatu (userId={}) za čas {}.", candidateUserId, lesson.getLessonId());
        }
    }
}
