package com.autoskola.financeservice.listener;

import com.autoskola.financeservice.dto.LessonEvent;
import com.autoskola.financeservice.model.ProcessedEvent;
import com.autoskola.financeservice.repository.ProcessedEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentListenerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private ProcessedEventRepository processedEventRepository;

    @InjectMocks
    private PaymentListener paymentListener;

    private LessonEvent event;

    @BeforeEach
    void setUp() {
        event = new LessonEvent(1L, 5L, "ZAKAZANO", "test-saga-uuid-123");
    }

    @Test
    void shouldProcessEventFirstTime() {
        // sagaId ne postoji u bazi → treba da se obradi
        when(processedEventRepository.existsBySagaId("test-saga-uuid-123")).thenReturn(false);

        paymentListener.handlePayment(event);

        // Provjeri da je payment.success poslan
        verify(rabbitTemplate, times(1))
            .convertAndSend(anyString(), eq("payment.success"), any(LessonEvent.class));

        // Provjeri da je sagaId sačuvan
        verify(processedEventRepository, times(1)).save(any(ProcessedEvent.class));
    }

    @Test
    void shouldSkipDuplicateEvent() {
        // sagaId već postoji u bazi → duplikat, preskoči
        when(processedEventRepository.existsBySagaId("test-saga-uuid-123")).thenReturn(true);

        paymentListener.handlePayment(event);

        // NE smije poslati nikakvu poruku
        verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any());

        // NE smije opet sačuvati sagaId
        verify(processedEventRepository, never()).save(any());
    }

    @Test
    void shouldSkipEventWithNullSagaId() {
        // Event bez sagaId (stare poruke bez idempotency keya)
        event.setSagaId(null);

        paymentListener.handlePayment(event);

        verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any());
        verify(processedEventRepository, never()).save(any());
    }
}
