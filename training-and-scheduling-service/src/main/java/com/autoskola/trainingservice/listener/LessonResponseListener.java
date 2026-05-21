package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.dto.LessonEvent;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.LessonRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
public class LessonResponseListener {

    @Autowired
    private LessonRepository lessonRepository;

    @RabbitListener(queues = "training_queue")
    public void obradiOdgovorIzFinansija(LessonEvent event, @Header("amqp_receivedRoutingKey") String routingKey) {

        Lesson lesson = lessonRepository.findById(event.getLessonId()).orElse(null);

        if (lesson == null) {
            System.out.println("Lekcija sa ID-om " + event.getLessonId() + " nije pronađena.");
            return;
        }

        if ("payment.success".equals(routingKey)) {
            lesson.setStatus("ZAKAZANO");
            System.out.println("SAGA USPJEŠNA: Čas " + lesson.getLessonId() + " je potvrđen.");
        } else {
            lesson.setStatus("OTKAZANO");
            System.out.println("SAGA ROLLBACK: Čas " + lesson.getLessonId() + " je otkazan.");
        }

        lessonRepository.save(lesson);
    }
}