package com.autoskola.trainingservice.client;

import com.autoskola.trainingservice.dto.CandidateFinanceStatusDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "finance-service")
public interface FinanceClient {

    @GetMapping("/accounts/{candidateId}/status")
    CandidateFinanceStatusDTO getFinanceStatus(@PathVariable("candidateId") Long candidateId);
}
