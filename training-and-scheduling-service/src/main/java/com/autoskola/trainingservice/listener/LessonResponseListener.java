package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.dto.LessonEvent;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.LessonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
public class LessonResponseListener {

    private static final Logger log = LoggerFactory.getLogger(LessonResponseListener.class);

    private final LessonRepository lessonRepository;

    public LessonResponseListener(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

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

        if ("payment.success".equals(routingKey)) {
            lesson.setStatus("ZAKAZANO");
            log.info("SAGA USPJEŠNA: Čas {} je potvrđen (sagaId={}).", lesson.getLessonId(), event.getSagaId());
        } else {
            lesson.setStatus("OTKAZANO");
            log.warn("SAGA ROLLBACK: Čas {} je otkazan (sagaId={}).", lesson.getLessonId(), event.getSagaId());
        }

        lessonRepository.save(lesson);
    }
}