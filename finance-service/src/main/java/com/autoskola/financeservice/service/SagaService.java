package com.autoskola.financeservice.service;

import com.autoskola.financeservice.dto.LessonEvent;
import com.autoskola.financeservice.model.ProcessedEvent;
import com.autoskola.financeservice.repository.ProcessedEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SagaService {

    private static final Logger log = LoggerFactory.getLogger(SagaService.class);

    private final ProcessedEventRepository processedEventRepository;
    private final RabbitTemplate rabbitTemplate;

    public SagaService(ProcessedEventRepository processedEventRepository,
                       RabbitTemplate rabbitTemplate) {
        this.processedEventRepository = processedEventRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public String processEvent(LessonEvent event) {
        if (event.getSagaId() == null) {
            log.warn("SAGA: Event nema sagaId — odbačen.");
            return "SKIPPED_NO_SAGA_ID";
        }

        if (processedEventRepository.existsBySagaId(event.getSagaId())) {
            log.warn("SAGA: DUPLIKAT — sagaId={} već obrađen. Odbačen.", event.getSagaId());
            return "DUPLICATE_BLOCKED";
        }

        log.info("SAGA: Obrađujem event lessonId={} sagaId={}", event.getLessonId(), event.getSagaId());
        event.setStatus("SUCCESS");
        rabbitTemplate.convertAndSend("skola_exchange", "payment.success", event);

        processedEventRepository.save(new ProcessedEvent(event.getSagaId()));
        log.info("SAGA: sagaId={} sačuvan.", event.getSagaId());
        return "PROCESSED";
    }
}
