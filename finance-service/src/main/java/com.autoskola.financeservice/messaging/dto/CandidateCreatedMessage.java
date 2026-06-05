package com.autoskola.financeservice.messaging.dto;

import java.io.Serializable;

public class CandidateCreatedMessage implements Serializable {
    private Integer candidateId;
    private String  email;
    private String  firstName;
    private String  lastName;

    public CandidateCreatedMessage() {}

    public Integer getCandidateId() { return candidateId; }
    public void setCandidateId(Integer candidateId) { this.candidateId = candidateId; }
    public String getEmail()     { return email; }
    public void setEmail(String email)         { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName()  { return lastName; }
    public void setLastName(String lastName)   { this.lastName = lastName; }
}