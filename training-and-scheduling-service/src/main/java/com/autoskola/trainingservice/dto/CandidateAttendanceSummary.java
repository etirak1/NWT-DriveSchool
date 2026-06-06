package com.autoskola.trainingservice.dto;

public class CandidateAttendanceSummary {

    private Long candidateId;
    private long attended;
    private long heldSessions;
    private double attendancePct;
    private boolean eligible; // true if attendancePct >= 60

    public CandidateAttendanceSummary(Long candidateId, long attended, long heldSessions) {
        this.candidateId = candidateId;
        this.attended = attended;
        this.heldSessions = heldSessions;
        this.attendancePct = heldSessions > 0 ? Math.round((double) attended / heldSessions * 1000.0) / 10.0 : 0.0;
        this.eligible = this.attendancePct >= 60.0;
    }

    public Long getCandidateId() { return candidateId; }
    public long getAttended() { return attended; }
    public long getHeldSessions() { return heldSessions; }
    public double getAttendancePct() { return attendancePct; }
    public boolean isEligible() { return eligible; }
}
