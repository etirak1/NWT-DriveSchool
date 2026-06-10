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

        if ("payment.success".equals(routingKey)) {
            lesson.setStatus("ZAKAZANO");
            log.info("SAGA USPJEŠNA: Čas {} je potvrđen.", lesson.getLessonId());
        } else {
            lesson.setStatus("OTKAZANO");
            log.warn("SAGA ROLLBACK: Čas {} je otkazan.", lesson.getLessonId());
        }

        lessonRepository.save(lesson);
    }
}
