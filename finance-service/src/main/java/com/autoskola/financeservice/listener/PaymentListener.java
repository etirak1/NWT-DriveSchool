package com.autoskola.financeservice.listener;

import com.autoskola.financeservice.dto.LessonEvent;
import com.autoskola.financeservice.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PaymentListener {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_LESSON)
    public void handlePayment(LessonEvent event) {
        System.out.println("Finance-service: Primljen zahtjev za plaćanje časa: " + event.getLessonId()
                + " (sagaId=" + event.getSagaId() + ")");

        try {
            boolean success = true;

            if (success) {
                event.setStatus("SUCCESS");
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "payment.success", event);
            } else {
                throw new Exception("Nedovoljno sredstava");
            }
        } catch (Exception e) {
            event.setStatus("FAILED");
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "payment.failed", event);
        }
    }
}