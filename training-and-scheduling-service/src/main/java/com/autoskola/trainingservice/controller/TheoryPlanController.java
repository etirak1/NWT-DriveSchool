package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.CandidateAttendanceSummary;
import com.autoskola.trainingservice.dto.TheoryEligibilityDTO;
import com.autoskola.trainingservice.dto.TheoryPlanRequest;
import com.autoskola.trainingservice.model.*;
import com.autoskola.trainingservice.service.TheoryPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/theory-plans")
public class TheoryPlanController {

    private final TheoryPlanService theoryPlanService;

    public TheoryPlanController(TheoryPlanService theoryPlanService) {
        this.theoryPlanService = theoryPlanService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<TheoryPlan>> getAllPlans() {
        return ResponseEntity.ok(theoryPlanService.getAllPlans());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheoryPlan> createPlan(@RequestBody TheoryPlanRequest request) {
        return ResponseEntity.ok(theoryPlanService.createPlan(request));
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<List<TheoryPlan>> getPlansForCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(theoryPlanService.getPlansForCandidate(candidateId));
    }

    @GetMapping("/{planId}/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<List<TheorySession>> getSessions(@PathVariable Long planId) {
        return ResponseEntity.ok(theoryPlanService.getSessionsForPlan(planId));
    }

    @PatchMapping("/sessions/{sessionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheorySession> updateSession(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body) {

        String status = (String) body.get("status");
        String note = (String) body.get("note");

        @SuppressWarnings("unchecked")
        List<Integer> rawIds = (List<Integer>) body.get("presentCandidateIds");
        List<Long> presentIds = rawIds != null
                ? rawIds.stream().map(Long::valueOf).toList()
                : null;

        return ResponseEntity.ok(
                theoryPlanService.updateSession(sessionId, status, note, presentIds)
        );
    }

    @DeleteMapping("/{planId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        theoryPlanService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/candidate/{candidateId}/session-attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<List<Map<String, Object>>> getCandidateSessionAttendance(
            @PathVariable Long candidateId) {
        return ResponseEntity.ok(theoryPlanService.getCandidateSessionAttendance(candidateId));
    }

    @GetMapping("/candidate/{candidateId}/theory-eligibility")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<TheoryEligibilityDTO> getTheoryEligibility(
            @PathVariable Long candidateId) {
        return ResponseEntity.ok(theoryPlanService.getTheoryEligibility(candidateId));
    }

    @GetMapping("/sessions/{sessionId}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<TheorySessionAttendance>> getAttendance(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(theoryPlanService.getAttendanceForSession(sessionId));
    }

    @GetMapping("/{planId}/attendance-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<CandidateAttendanceSummary>> getAttendanceSummary(
            @PathVariable Long planId) {
        return ResponseEntity.ok(theoryPlanService.getAttendanceSummary(planId));
    }
}