package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.dto.CandidateStatusDTO;
import com.autoskola.financeservice.service.FinanceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.github.fge.jsonpatch.JsonPatch;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/accounts")
public class CandidateFinanceAccountController {

    private final FinanceService financeService;

    public CandidateFinanceAccountController(FinanceService financeService) {
        this.financeService = financeService;
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

    @GetMapping("/{candidateId}/status")
    public ResponseEntity<CandidateStatusDTO> getStatus(@PathVariable Integer candidateId) {
        return ResponseEntity.ok(financeService.getStatus(candidateId));
    }

    @PostMapping("/ensure/{candidateId}")
    public ResponseEntity<CandidateStatusDTO> ensureAccount(@PathVariable Integer candidateId) {
        return ResponseEntity.ok(financeService.getOrCreateByCandidateId(candidateId));
    }

    @PostMapping("/{candidateId}/pay")
    public ResponseEntity<CandidateStatusDTO> recordPayment(
            @PathVariable Integer candidateId,
            @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(financeService.recordPayment(candidateId, req.getAmount()));
    }

    @GetMapping("/{candidateId}/payments")
    public ResponseEntity<?> getPayments(@PathVariable Integer candidateId) {
        return ResponseEntity.ok(financeService.getPaymentsByCandidate(candidateId));
    }

    @PatchMapping(path = "/{id}", consumes = "application/json-patch+json")
    public CandidateFinanceAccountDTO patchAccount(@PathVariable Integer id, @RequestBody JsonPatch patch) {
        return financeService.applyPatchToAccount(id, patch);
    }

    public static class PaymentRequest {
        private BigDecimal amount;
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }
}
