package com.autoskola.financeservice.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

public class LessonEvent implements Serializable {

    private UUID       sagaId;
    private Integer    lessonId;
    private Integer    candidateId;
    private String     lessonType;
    private BigDecimal price;
    private String     status;

    public LessonEvent() {}

    public UUID getSagaId()             { return sagaId; }
    public void setSagaId(UUID sagaId)                  { this.sagaId = sagaId; }

    public Integer getLessonId()        { return lessonId; }
    public void setLessonId(Integer lessonId)           { this.lessonId = lessonId; }

    public Integer getCandidateId()     { return candidateId; }
    public void setCandidateId(Integer candidateId)     { this.candidateId = candidateId; }

    public String getLessonType()       { return lessonType; }
    public void setLessonType(String lessonType)        { this.lessonType = lessonType; }

    public BigDecimal getPrice()        { return price; }
    public void setPrice(BigDecimal price)              { this.price = price; }

    public String getStatus()           { return status; }
    public void setStatus(String status)                { this.status = status; }
}