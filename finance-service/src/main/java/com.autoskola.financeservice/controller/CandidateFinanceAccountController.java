package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.service.FinanceService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/accounts")
public class CandidateFinanceAccountController {

    private final FinanceService financeService;

    public CandidateFinanceAccountController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/test-validation")
    public String test(@jakarta.validation.Valid @RequestBody com.autoskola.financeservice.model.CandidateFinanceAccount account) {
        return "Podaci su validni!";
    }

    @GetMapping
    public List<CandidateFinanceAccountDTO> getAll() {
        return financeService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public CandidateFinanceAccountDTO getById(@PathVariable Integer id) {
        return financeService.getAccountById(id);
    }

    @GetMapping("/{id}/debt")
    public BigDecimal getRemainingDebt(@PathVariable Integer id) {
        return financeService.getAccountById(id).getRemainingDebt();
    }
}