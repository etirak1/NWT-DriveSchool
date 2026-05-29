package com.autoskola.financeservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Čuva sagaId svakog obrađenog RabbitMQ eventa.
 * Sprečava duplu obradu u slučaju ponovne isporuke poruke.
 */
@Entity
@Table(name = "processed_events")
public class ProcessedEvent {

    @Id
    @Column(name = "saga_id", nullable = false, unique = true)
    private String sagaId;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    public ProcessedEvent() {}

    public ProcessedEvent(String sagaId) {
        this.sagaId = sagaId;
        this.processedAt = LocalDateTime.now();
    }

    public String getSagaId() { return sagaId; }
    public LocalDateTime getProcessedAt() { return processedAt; }
}
