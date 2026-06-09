package com.autoskola.trainingservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;


@Component
public class FinanceEnrollmentChecker {

    private static final Logger log = LoggerFactory.getLogger(FinanceEnrollmentChecker.class);

    @Value("${finance.service.url:http://localhost:8084}")
    private String financeServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isEnrollmentPaid(Long candidateId) {
        try {
            String url = financeServiceUrl + "/accounts/" + candidateId + "/status";
            CandidateStatusResponse status = restTemplate.getForObject(url, CandidateStatusResponse.class);
            if (status == null) return false; // nema finansijskog računa = upisnina nije plaćena
            return status.isEnrollmentEligible();
        } catch (Exception e) {
            log.warn("Finance-service nije dostupan za kandidata {}: {}", candidateId, e.getMessage());
            throw new RuntimeException("Nije moguće provjeriti status upisnine — finance-service nije dostupan. Pokušajte ponovo.");
        }
    }

    public static class CandidateStatusResponse {
        private boolean enrollmentEligible;
        private boolean examEligible;

        public boolean isEnrollmentEligible() { return enrollmentEligible; }
        public void setEnrollmentEligible(boolean v) { this.enrollmentEligible = v; }
        public boolean isExamEligible() { return examEligible; }
        public void setExamEligible(boolean v) { this.examEligible = v; }
    }
}
