package com.autoskola.trainingservice.dto;

public class CandidateAttendanceSummary {

    private Long candidateId;
    private long attended;         // sessions attended
    private long heldSessions;     // total sessions held
    private long attendedLessons;  // lessons covered in attended sessions
    private long totalLessons;     // plan's total lessons
    private double attendancePct;  // lesson-based percentage
    private boolean eligible;

    private static final double MIN_ATTENDANCE_PCT = 60.0;

    public CandidateAttendanceSummary(Long candidateId, long attended, long heldSessions,
                                      long attendedLessons, long totalLessons) {
        this.candidateId = candidateId;
        this.attended = attended;
        this.heldSessions = heldSessions;
        this.attendedLessons = attendedLessons;
        this.totalLessons = totalLessons;
        this.attendancePct = totalLessons > 0
                ? Math.round((double) attendedLessons / totalLessons * 1000.0) / 10.0
                : 0.0;
        this.eligible = this.attendancePct >= MIN_ATTENDANCE_PCT;
    }

    public Long getCandidateId() { return candidateId; }
    public long getAttended() { return attended; }
    public long getHeldSessions() { return heldSessions; }
    public long getAttendedLessons() { return attendedLessons; }
    public long getTotalLessons() { return totalLessons; }
    public double getAttendancePct() { return attendancePct; }
    public boolean isEligible() { return eligible; }
}
