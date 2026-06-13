package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.CandidateAttendanceSummary;
import com.autoskola.trainingservice.dto.TheoryEligibilityDTO;
import com.autoskola.trainingservice.dto.TheoryPlanRequest;
import com.autoskola.trainingservice.model.*;
import com.autoskola.trainingservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TheoryPlanService {

    private final TheoryPlanRepository planRepository;
    private final TheorySessionRepository sessionRepository;
    private final TheorySessionAttendanceRepository attendanceRepository;
    private final CandidateRepository candidateRepository;
    private final TheoryLessonService theoryLessonService;
    private final FinanceEnrollmentChecker enrollmentChecker;

    private static final List<int[]> TOPIC_RANGES = Arrays.asList(
            new int[]{1,  2},  new int[]{3,  6},  new int[]{7,  10},
            new int[]{11, 15}, new int[]{16, 19}, new int[]{20, 23},
            new int[]{24, 27}, new int[]{28, 30}, new int[]{31, 34},
            new int[]{35, 37}, new int[]{38, 40}
    );

    private static final List<String> TOPIC_NAMES = Arrays.asList(
            "Uvod u teorijsku nastavu",
            "Saobraćajni znakovi",
            "Pravila saobraćaja",
            "Raskrsnice i prvenstvo prolaza",
            "Pješaci, biciklisti i javni prevoz",
            "Brzina, preticanje i zaustavljanje",
            "Vožnja u različitim uslovima",
            "Autoput, tuneli i posebne situacije",
            "Bezbjednost u saobraćaju, alkohol i umor",
            "Osnove prve pomoći",
            "Ponavljanje i priprema za ispit"
    );

    public TheoryPlanService(TheoryPlanRepository planRepository,
                             TheorySessionRepository sessionRepository,
                             TheorySessionAttendanceRepository attendanceRepository,
                             CandidateRepository candidateRepository,
                             TheoryLessonService theoryLessonService,
                             FinanceEnrollmentChecker enrollmentChecker) {
        this.planRepository = planRepository;
        this.sessionRepository = sessionRepository;
        this.attendanceRepository = attendanceRepository;
        this.candidateRepository = candidateRepository;
        this.theoryLessonService = theoryLessonService;
        this.enrollmentChecker = enrollmentChecker;
    }

    @Transactional
    public TheoryPlan createPlan(TheoryPlanRequest request) {
        List<Candidate> candidates = request.getCandidateIds().stream()
                .map(id -> candidateRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen: " + id)))
                .collect(Collectors.toList());

        List<String> notEnrolled = candidates.stream()
                .filter(c -> !enrollmentChecker.isEnrollmentPaid(c.getCandidateId()))
                .map(c -> "kandidat ID " + c.getCandidateId())
                .collect(Collectors.toList());

        if (!notEnrolled.isEmpty()) {
            throw new RuntimeException(
                "Sljedeci kandidati nisu platili upisninu (300 KM) i ne mogu biti dodani u grupu: " +
                String.join(", ", notEnrolled)
            );
        }

        List<Long> alreadyAssigned = candidates.stream()
                .filter(c -> !planRepository.findByCandidatesContainingOrderByStartDateDesc(c).isEmpty())
                .map(Candidate::getCandidateId)
                .collect(Collectors.toList());

        if (!alreadyAssigned.isEmpty()) {
            throw new RuntimeException(
                "Sljedeci kandidati vec imaju aktivan plan nastave (ID: " +
                alreadyAssigned.stream().map(String::valueOf).collect(Collectors.joining(", ")) +
                "). Uklonite ih iz selekcije."
            );
        }

        TheoryPlan plan = new TheoryPlan();
        plan.setGroupName(request.getGroupName());
        plan.setStartDate(request.getStartDate());
        plan.setDay1OfWeek(request.getDay1OfWeek());
        plan.setDay2OfWeek(request.getDay2OfWeek());
        plan.setStartTime(request.getStartTime());
        plan.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 45);
        plan.setTotalLessons(request.getTotalLessons() != null ? request.getTotalLessons() : 40);
        plan.setLessonsPerSession(request.getLessonsPerSession() != null ? request.getLessonsPerSession() : 3);
        plan.setCandidates(candidates);

        TheoryPlan saved = planRepository.save(plan);

        List<TheorySession> sessions = generateSessions(saved);
        sessionRepository.saveAll(sessions);
        saved.setSessions(sessions);

        return saved;
    }

    private List<TheorySession> generateSessions(TheoryPlan plan) {
        int total = plan.getTotalLessons();
        int perSession = plan.getLessonsPerSession();
        int numSessions = (int) Math.ceil((double) total / perSession);

        DayOfWeek day1 = DayOfWeek.valueOf(plan.getDay1OfWeek());
        DayOfWeek day2 = DayOfWeek.valueOf(plan.getDay2OfWeek());
        List<LocalDate> dates = generateDates(plan.getStartDate(), day1, day2, numSessions);

        List<TheorySession> sessions = new ArrayList<>();
        int currentLesson = 1;

        for (int i = 0; i < numSessions; i++) {
            int from = currentLesson;
            int to = (i == numSessions - 1) ? total : currentLesson + perSession - 1;

            TheorySession session = new TheorySession();
            session.setPlan(plan);
            session.setSessionNumber(i + 1);
            session.setDate(dates.get(i));
            session.setStartTime(plan.getStartTime());
            session.setDurationMinutes(plan.getDurationMinutes());
            session.setLessonFrom(from);
            session.setLessonTo(to);
            session.setTopic(getTopicForRange(from, to));
            session.setStatus("PLANIRANO");

            sessions.add(session);
            currentLesson = to + 1;
        }

        return sessions;
    }

    private List<LocalDate> generateDates(LocalDate startDate, DayOfWeek day1, DayOfWeek day2, int count) {
        List<LocalDate> dates = new ArrayList<>();

        LocalDate first1 = startDate.with(TemporalAdjusters.nextOrSame(day1));
        LocalDate first2 = startDate.with(TemporalAdjusters.nextOrSame(day2));

        LocalDate anchor1 = first1.isBefore(first2) ? first1 : first2;
        LocalDate anchor2 = first1.isBefore(first2) ? first2 : first1;

        int week = 0;
        while (dates.size() < count) {
            dates.add(anchor1.plusWeeks(week));
            if (dates.size() < count) {
                dates.add(anchor2.plusWeeks(week));
            }
            week++;
        }

        return dates;
    }

    private String getTopicForRange(int from, int to) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < TOPIC_RANGES.size(); i++) {
            int rangeFrom = TOPIC_RANGES.get(i)[0];
            int rangeTo   = TOPIC_RANGES.get(i)[1];
            if (rangeTo < from || rangeFrom > to) continue;

            int overlapFrom = Math.max(from, rangeFrom);
            int overlapTo   = Math.min(to,   rangeTo);

            if (sb.length() > 0) sb.append(" | ");
            if (overlapFrom == overlapTo) {
                sb.append("Čas ").append(overlapFrom).append(": ");
            } else {
                sb.append("Časovi ").append(overlapFrom).append("–").append(overlapTo).append(": ");
            }
            sb.append(TOPIC_NAMES.get(i));
        }
        return sb.toString();
    }

    public List<TheoryPlan> getAllPlans() {
        return planRepository.findAllByOrderByStartDateDesc();
    }

    public List<TheoryPlan> getPlansForCandidate(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));
        return planRepository.findByCandidatesContainingOrderByStartDateDesc(candidate);
    }

    public List<TheorySession> getSessionsForPlan(Long planId) {
        return sessionRepository.findByPlanIdOrderBySessionNumber(planId);
    }

    @Transactional
    public TheorySession updateSession(Long sessionId, String status, String note,
                                       List<Long> presentCandidateIds, LocalDate newDate) {
        TheorySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Termin nije pronađen"));

        // Ako se otkazuje i naveden je novi datum, premjesti termin
        if ("OTKAZANO".equals(status) && newDate != null) {
            // Novi datum mora biti nakon sljedećeg planiranog termina u grupi
            List<TheorySession> futureSessions = sessionRepository
                    .findByPlanIdOrderBySessionNumber(session.getPlan().getId())
                    .stream()
                    .filter(s -> s.getSessionNumber() > session.getSessionNumber()
                              && !s.getId().equals(sessionId)
                              && !"OTKAZANO".equals(s.getStatus()))
                    .sorted(Comparator.comparingInt(TheorySession::getSessionNumber))
                    .toList();

            if (!futureSessions.isEmpty()) {
                LocalDate nextDate = futureSessions.get(0).getDate();
                if (!newDate.isBefore(nextDate)) {
                    throw new RuntimeException(
                        "Nadoknada mora biti najmanje dan ranije od sljedećeg termina (" + nextDate + ").");
                }
            }
            session.setDate(newDate);
        }

        // Termin se može označiti održanim samo ako su svi prethodni odржani ili otkazani
        if ("ODRZANO".equals(status)) {
            boolean prethodniNisuZavrseni = sessionRepository
                    .findByPlanIdOrderBySessionNumber(session.getPlan().getId())
                    .stream()
                    .anyMatch(s -> s.getSessionNumber() < session.getSessionNumber()
                               && !"ODRZANO".equals(s.getStatus()));
            if (prethodniNisuZavrseni) {
                throw new RuntimeException(
                    "Nije moguće označiti termin održanim — prethodni termini još nisu odrzani ili otkazani.");
            }
        }

        session.setStatus(status);
        if (note != null) session.setNote(note);

        if ("ODRZANO".equals(status) && presentCandidateIds != null) {
            attendanceRepository.deleteBySessionId(sessionId);

            for (Candidate candidate : session.getPlan().getCandidates()) {
                TheorySessionAttendance attendance = new TheorySessionAttendance();
                attendance.setSession(session);
                attendance.setCandidate(candidate);
                boolean present = presentCandidateIds.contains(candidate.getCandidateId());
                attendance.setPresent(present);
                attendanceRepository.save(attendance);

                if (present) {
                    try {
                        theoryLessonService.markSessionRange(
                                candidate.getCandidateId(),
                                session.getLessonFrom(),
                                session.getLessonTo());
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        return sessionRepository.save(session);
    }

    public List<TheorySessionAttendance> getAttendanceForSession(Long sessionId) {
        return attendanceRepository.findBySessionId(sessionId);
    }

    public List<java.util.Map<String, Object>> getCandidateSessionAttendance(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen: " + candidateId));

        List<TheoryPlan> plans = planRepository.findByCandidatesContainingOrderByStartDateDesc(candidate);
        List<java.util.Map<String, Object>> result = new ArrayList<>();

        for (TheoryPlan plan : plans) {
            List<TheorySession> sessions = sessionRepository.findByPlanIdOrderBySessionNumber(plan.getId());
            for (TheorySession session : sessions) {
                if (!"ODRZANO".equals(session.getStatus())) continue;
                boolean present = attendanceRepository
                        .findBySessionAndCandidate(session.getId(), candidateId)
                        .map(a -> a.isPresent())
                        .orElse(false);
                java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                row.put("sessionNumber", session.getSessionNumber());
                row.put("date", session.getDate());
                row.put("topic", session.getTopic());
                row.put("lessonFrom", session.getLessonFrom());
                row.put("lessonTo", session.getLessonTo());
                row.put("present", present);
                row.put("groupName", plan.getGroupName());
                result.add(row);
            }
        }
        return result;
    }

    @Transactional
    public void deletePlan(Long planId) {
        TheoryPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan nije pronađen: " + planId));
        List<TheorySession> sessions = sessionRepository.findByPlanIdOrderBySessionNumber(planId);
        for (TheorySession session : sessions) {
            attendanceRepository.deleteBySessionId(session.getId());
        }
        sessionRepository.deleteAll(sessions);
        planRepository.delete(plan);
    }

    public TheoryEligibilityDTO getTheoryEligibility(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen: " + candidateId));

        List<TheoryPlan> plans = planRepository.findByCandidatesContainingOrderByStartDateDesc(candidate);
        if (plans.isEmpty()) {
            return new TheoryEligibilityDTO(false, false, 0, 0, 0.0, false);
        }

        // Uzimamo najnoviji plan
        TheoryPlan plan = plans.get(0);
        List<TheorySession> sessions = sessionRepository.findByPlanIdOrderBySessionNumber(plan.getId());

        // Nastava je završena ako nema nijedne sesije u statusu PLANIRANO
        boolean groupFinished = sessions.stream()
                .noneMatch(s -> "PLANIRANO".equals(s.getStatus()));

        long totalLessons = plan.getTotalLessons() != null ? plan.getTotalLessons() : 40L;
        long attendedLessons = attendanceRepository
                .sumAttendedLessonsByPlanAndCandidate(plan.getId(), candidateId);

        double attendancePct = totalLessons > 0
                ? Math.round((double) attendedLessons / totalLessons * 1000.0) / 10.0
                : 0.0;

        boolean eligible = attendancePct >= 60.0;

        return new TheoryEligibilityDTO(true, groupFinished, attendedLessons, totalLessons, attendancePct, eligible);
    }

    public List<CandidateAttendanceSummary> getAttendanceSummary(Long planId) {
        TheoryPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan nije pronađen"));

        List<TheorySession> sessions = sessionRepository.findByPlanIdOrderBySessionNumber(planId);
        long heldCount = sessions.stream()
                .filter(s -> "ODRZANO".equals(s.getStatus()))
                .count();
        long totalLessons = plan.getTotalLessons() != null ? plan.getTotalLessons() : 40L;

        return plan.getCandidates().stream()
                .map(c -> {
                    long attended = attendanceRepository
                            .countAttendedByPlanAndCandidate(planId, c.getCandidateId());
                    long attendedLessons = attendanceRepository
                            .sumAttendedLessonsByPlanAndCandidate(planId, c.getCandidateId());
                    return new CandidateAttendanceSummary(
                            c.getCandidateId(), attended, heldCount, attendedLessons, totalLessons);
                })
                .collect(Collectors.toList());
    }
}