package com.autoskola.financeservice.messaging.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class LessonCompletedMessage implements Serializable {
    private Integer    candidateId;
    private Integer    lessonId;
    private String     lessonType;
    private BigDecimal lessonPrice;

    public LessonCompletedMessage() {}

    public Integer getCandidateId()   { return candidateId; }
    public void setCandidateId(Integer candidateId) { this.candidateId = candidateId; }
    public Integer getLessonId()      { return lessonId; }
    public void setLessonId(Integer lessonId)       { this.lessonId = lessonId; }
    public String getLessonType()     { return lessonType; }
    public void setLessonType(String lessonType)    { this.lessonType = lessonType; }
    public BigDecimal getLessonPrice(){ return lessonPrice; }
    public void setLessonPrice(BigDecimal lessonPrice) { this.lessonPrice = lessonPrice; }
}