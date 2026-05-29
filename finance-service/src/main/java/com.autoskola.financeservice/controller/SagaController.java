package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.dto.LessonEvent;
import com.autoskola.financeservice.model.ProcessedEvent;
import com.autoskola.financeservice.repository.ProcessedEventRepository;
import com.autoskola.financeservice.service.SagaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saga")
public class SagaController {

    private final ProcessedEventRepository processedEventRepository;
    private final SagaService sagaService;

    public SagaController(ProcessedEventRepository processedEventRepository,
                          SagaService sagaService) {
        this.processedEventRepository = processedEventRepository;
        this.sagaService = sagaService;
    }

    /**
     * TEST endpoint — simulira isti event poslan dvaput.
     * POST /api/saga/test-duplicate
     */
    @PostMapping("/test-duplicate")
    public ResponseEntity<Map<String, Object>> testDuplicate() {
        String sagaId = "TEST-SAGA-" + System.currentTimeMillis();
        LessonEvent event = new LessonEvent(999L, 1L, "ZAKAZANO", sagaId);

        String firstResult  = sagaService.processEvent(event);  // treba da bude PROCESSED
        String secondResult = sagaService.processEvent(event);  // treba da bude DUPLICATE_BLOCKED

        return ResponseEntity.ok(Map.of(
            "sagaId",       sagaId,
            "firstCall",    firstResult,
            "secondCall",   secondResult,
            "testPassed",   "PROCESSED".equals(firstResult) && "DUPLICATE_BLOCKED".equals(secondResult),
            "conclusion",   "PROCESSED".equals(firstResult) && "DUPLICATE_BLOCKED".equals(secondResult)
                            ? "OK — duplikat blokiran, sagaId postoji samo jednom u bazi."
                            : "GREŠKA — duplikat nije blokiran!"
        ));
    }

    /** Sve obrađene sagaId-ove u bazi */
    @GetMapping("/processed-events")
    public ResponseEntity<List<ProcessedEvent>> getAllProcessedEvents() {
        return ResponseEntity.ok(processedEventRepository.findAll());
    }
}
