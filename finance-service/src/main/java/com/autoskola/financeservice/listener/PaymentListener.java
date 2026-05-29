package com.autoskola.financeservice.listener;

import com.autoskola.financeservice.dto.LessonEvent;
import com.autoskola.financeservice.config.RabbitMQConfig;
import com.autoskola.financeservice.service.SagaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentListener.class);

    private final SagaService sagaService;

    public PaymentListener(SagaService sagaService) {
        this.sagaService = sagaService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_FINANCE)
    public void handlePayment(LessonEvent event) {
        log.info("=== SAGA: Primljen event | lessonId={} | sagaId={} ===",
                event.getLessonId(), event.getSagaId());
        sagaService.processEvent(event);
    }
}
