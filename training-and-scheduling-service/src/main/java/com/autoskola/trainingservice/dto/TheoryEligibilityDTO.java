package com.autoskola.trainingservice.dto;

public class TheoryEligibilityDTO {

    private boolean hasGroup;
    private boolean groupFinished;
    private long attendedLessons;
    private long totalLessons;
    private double attendancePct;
    private boolean eligible;

    public TheoryEligibilityDTO() {}

    public TheoryEligibilityDTO(boolean hasGroup, boolean groupFinished,
                                long attendedLessons, long totalLessons,
                                double attendancePct, boolean eligible) {
        this.hasGroup = hasGroup;
        this.groupFinished = groupFinished;
        this.attendedLessons = attendedLessons;
        this.totalLessons = totalLessons;
        this.attendancePct = attendancePct;
        this.eligible = eligible;
    }

    public boolean isHasGroup()        { return hasGroup; }
    public boolean isGroupFinished()   { return groupFinished; }
    public long getAttendedLessons()   { return attendedLessons; }
    public long getTotalLessons()      { return totalLessons; }
    public double getAttendancePct()   { return attendancePct; }
    public boolean isEligible()        { return eligible; }

    public void setHasGroup(boolean hasGroup)            { this.hasGroup = hasGroup; }
    public void setGroupFinished(boolean groupFinished)  { this.groupFinished = groupFinished; }
    public void setAttendedLessons(long attendedLessons) { this.attendedLessons = attendedLessons; }
    public void setTotalLessons(long totalLessons)       { this.totalLessons = totalLessons; }
    public void setAttendancePct(double attendancePct)   { this.attendancePct = attendancePct; }
    public void setEligible(boolean eligible)            { this.eligible = eligible; }
}
