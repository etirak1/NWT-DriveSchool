package com.autoskola.trainingservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Provjerava je li kandidat platio upisninu (300 KM) pozivom finance-service.
 * Ako finance-service nije dostupan, provjera se preskace (fail-open).
 */
@Component
public class FinanceEnrollmentChecker {

    private static final Logger log = LoggerFactory.getLogger(FinanceEnrollmentChecker.class);

    @Value("${finance.service.url:http://localhost:8084}")
    private String financeServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * @return true ako je upisnina placena ILI ako finance-service nije dostupan
     */
    public boolean isEnrollmentPaid(Long candidateId) {
        try {
            String url = financeServiceUrl + "/accounts/" + candidateId + "/status";
            CandidateStatusResponse status = restTemplate.getForObject(url, CandidateStatusResponse.class);
            if (status == null) return true; // fail-open
            return status.isEnrollmentEligible();
        } catch (Exception e) {
            log.warn("Finance-service nije dostupan, provjera upisnine preskocena za kandidata {}: {}", candidateId, e.getMessage());
            return true; // fail-open: ako finance-service nije dostupan, ne blokiramo
        }
    }

    /** Minimalni DTO koji nam treba iz finance-service odgovora */
    public static class CandidateStatusResponse {
        private boolean enrollmentEligible;
        private boolean examEligible;

        public boolean isEnrollmentEligible() { return enrollmentEligible; }
        public void setEnrollmentEligible(boolean v) { this.enrollmentEligible = v; }
        public boolean isExamEligible() { return examEligible; }
        public void setExamEligible(boolean v) { this.examEligible = v; }
    }
}
