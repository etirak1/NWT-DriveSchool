package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.service.FinanceService;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.github.fge.jsonpatch.JsonPatch;


import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateFinanceAccountController {

    private final FinanceService financeService;

    public CandidateFinanceAccountController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/test-validation")
    public String test(@jakarta.validation.Valid @RequestBody com.autoskola.financeservice.model.CandidateFinanceAccount account) {
        return "Podaci su validni!";
    }

    @PatchMapping(path = "/{id}", consumes = "application/json-patch+json")
    public CandidateFinanceAccountDTO patchAccount(@PathVariable Integer id, @RequestBody JsonPatch patch) {
        return financeService.applyPatchToAccount(id, patch);
    }

    @GetMapping
    public List<CandidateFinanceAccountDTO> getAll() {
        return financeService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public CandidateFinanceAccountDTO getById(@PathVariable Integer id) {
        return financeService.getAccountById(id);
    }


    @GetMapping("/paginated")
    public Page<CandidateFinanceAccountDTO> getAllPaginated(
            @PageableDefault(size = 10, sort = "enrollmentDate") Pageable pageable) {
        return financeService.getAllAccountsPaginated(pageable);
    }

    @GetMapping("/{id}/debt")
    public BigDecimal getRemainingDebt(@PathVariable Integer id) {
        return financeService.getAccountById(id).getRemainingDebt();
    }
}