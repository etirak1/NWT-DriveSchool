package com.autoskola.financeservice.service;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.dto.CandidateStatusDTO;
import com.autoskola.financeservice.dto.ObligationDTO;
import com.autoskola.financeservice.dto.PaymentDTO;
import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Obligation;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import com.autoskola.financeservice.repository.ObligationRepository;
import com.autoskola.financeservice.repository.PaymentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class FinanceService {

    private static final BigDecimal ENROLLMENT_AMOUNT    = new BigDecimal("300.00");
    private static final BigDecimal INSTALLMENT_AMOUNT   = new BigDecimal("400.00");
    private static final BigDecimal TOTAL_AMOUNT         = new BigDecimal("1900.00");

    private final CandidateFinanceAccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final ObligationRepository obligationRepository;
    private final ModelMapper modelMapper;

    public FinanceService(CandidateFinanceAccountRepository accountRepository,
                          PaymentRepository paymentRepository,
                          ObligationRepository obligationRepository,
                          ModelMapper modelMapper) {
        this.accountRepository    = accountRepository;
        this.paymentRepository    = paymentRepository;
        this.obligationRepository = obligationRepository;
        this.modelMapper          = modelMapper;
    }

    // ─── CREATE / ENSURE ────────────────────────────────────────────────────────

    @Transactional
    public CandidateStatusDTO getOrCreateByCandidateId(Integer candidateId) {
        CandidateFinanceAccount account = accountRepository.findByCandidateId(candidateId)
                .orElseGet(() -> {
                    CandidateFinanceAccount a = new CandidateFinanceAccount();
                    a.setCandidateId(candidateId);
                    a.setEnrollmentDate(LocalDate.now());
                    a.setTotalAmount(TOTAL_AMOUNT);
                    a.setRemainingDebt(TOTAL_AMOUNT);
                    a.setProgressPercentage(BigDecimal.ZERO);
                    return accountRepository.save(a);
                });

        List<Obligation> obligations = getOrCreateObligations(account);
        return buildStatus(candidateId, obligations);
    }

    // ─── STATUS ─────────────────────────────────────────────────────────────────

    @Transactional
    public CandidateStatusDTO getStatus(Integer candidateId) {
        CandidateFinanceAccount account = accountRepository.findByCandidateId(candidateId)
                .orElseThrow(() -> new RuntimeException("Racun nije pronadjen za kandidata: " + candidateId));
        // getOrCreateObligations ce kreirati obligations i primijeniti stare uplate ako obligations jos ne postoje
        List<Obligation> obligations = getOrCreateObligations(account);
        return buildStatus(candidateId, obligations);
    }

    // ─── RECORD PAYMENT ─────────────────────────────────────────────────────────

    @Transactional
    public CandidateStatusDTO recordPayment(Integer candidateId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Iznos uplate mora biti pozitivan broj.");
        }

        CandidateFinanceAccount account = accountRepository.findByCandidateId(candidateId)
                .orElseThrow(() -> new RuntimeException("Racun nije pronadjen za kandidata: " + candidateId));

        List<Obligation> obligations = getOrCreateObligations(account);

        // Distribute payment in order: upisnina → rata1 → rata2 → rata3 → rata4
        BigDecimal remaining = amount;
        for (Obligation obligation : obligations) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal needed = obligation.getRemainingAmount();
            if (needed.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal toApply = remaining.min(needed);
            obligation.setPaidAmount(obligation.getPaidAmount().add(toApply));
            remaining = remaining.subtract(toApply);
        }
        obligationRepository.saveAll(obligations);

        // Audit trail — record the raw payment
        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setStatus("PAID");
        payment.setDatePaid(LocalDate.now());
        payment.setDueDate(LocalDate.now());
        payment.setCandidateAccount(account);
        paymentRepository.save(payment);

        // Update remainingDebt on account
        BigDecimal totalPaid = obligations.stream()
                .map(Obligation::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        account.setRemainingDebt(TOTAL_AMOUNT.subtract(totalPaid).max(BigDecimal.ZERO));
        accountRepository.save(account);

        return buildStatus(candidateId, obligations);
    }

    // ─── READ ────────────────────────────────────────────────────────────────────

    public List<CandidateFinanceAccountDTO> getAllAccounts() {
        return accountRepository.findAllWithPayments()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CandidateFinanceAccountDTO getAccountById(Integer id) {
        CandidateFinanceAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return convertToDto(account);
    }

    public Page<CandidateFinanceAccountDTO> getAllAccountsPaginated(Pageable pageable) {
        return accountRepository.findAll(pageable).map(this::convertToDto);
    }

    public List<PaymentDTO> getPaymentsByCandidate(Integer candidateId) {
        return paymentRepository.findByCandidateAccount_CandidateIdOrderByDatePaidDesc(candidateId)
                .stream()
                .map(p -> modelMapper.map(p, PaymentDTO.class))
                .collect(Collectors.toList());
    }

    // ─── PATCH ──────────────────────────────────────────────────────────────────

    @Transactional
    public CandidateFinanceAccountDTO applyPatchToAccount(Integer id, JsonPatch patch) {
        try {
            CandidateFinanceAccount account = accountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Nalog nije pronađen"));

            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            objectMapper.addMixIn(CandidateFinanceAccount.class, IgnorePaymentsMixIn.class);

            JsonNode accountJson   = objectMapper.valueToTree(account);
            JsonNode patchedJson   = patch.apply(accountJson);
            CandidateFinanceAccount updatedAccount = objectMapper.treeToValue(patchedJson, CandidateFinanceAccount.class);

            updatedAccount.setId(id);
            updatedAccount.setUser(account.getUser());
            if (updatedAccount.getPayments() == null) updatedAccount.setPayments(account.getPayments());

            return convertToDto(accountRepository.save(updatedAccount));
        } catch (Exception e) {
            throw new RuntimeException("Patch failed: " + e.getMessage());
        }
    }

    abstract static class IgnorePaymentsMixIn {
        @com.fasterxml.jackson.annotation.JsonIgnore
        private List<com.autoskola.financeservice.model.Payment> payments;
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────────

    private List<Obligation> getOrCreateObligations(CandidateFinanceAccount account) {
        if (obligationRepository.existsByAccount_CandidateId(account.getCandidateId())) {
            return obligationRepository.findByAccountOrderByOrderIndex(account);
        }
        // Kreiraj obligations i odmah primijeni sve vec evidentirane uplate (migracija starih podataka)
        List<Obligation> obligations = createObligationsForAccount(account);
        migrateExistingPayments(account, obligations);
        return obligations;
    }

    private void migrateExistingPayments(CandidateFinanceAccount account, List<Obligation> obligations) {
        List<Payment> existing = paymentRepository
                .findByCandidateAccount_CandidateIdOrderByDatePaidDesc(account.getCandidateId());
        if (existing.isEmpty()) return;

        // Primijeni kronoloski (najstarija prva)
        java.util.Collections.reverse(existing);
        for (Payment payment : existing) {
            BigDecimal remaining = payment.getAmount();
            for (Obligation ob : obligations) {
                if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
                BigDecimal needed = ob.getRemainingAmount();
                if (needed.compareTo(BigDecimal.ZERO) <= 0) continue;
                BigDecimal toApply = remaining.min(needed);
                ob.setPaidAmount(ob.getPaidAmount().add(toApply));
                remaining = remaining.subtract(toApply);
            }
        }
        obligationRepository.saveAll(obligations);

        BigDecimal totalPaid = obligations.stream()
                .map(Obligation::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        account.setRemainingDebt(TOTAL_AMOUNT.subtract(totalPaid).max(BigDecimal.ZERO));
        accountRepository.save(account);
    }

    private List<Obligation> createObligationsForAccount(CandidateFinanceAccount account) {
        List<Obligation> obligations = new ArrayList<>();

        Obligation enrollment = new Obligation();
        enrollment.setAccount(account);
        enrollment.setOrderIndex(0);
        enrollment.setLabel("Upisnina");
        enrollment.setType("ENROLLMENT");
        enrollment.setTotalAmount(ENROLLMENT_AMOUNT);
        enrollment.setPaidAmount(BigDecimal.ZERO);
        obligations.add(enrollment);

        for (int i = 1; i <= 4; i++) {
            Obligation installment = new Obligation();
            installment.setAccount(account);
            installment.setOrderIndex(i);
            installment.setLabel(i + ". rata");
            installment.setType("INSTALLMENT");
            installment.setTotalAmount(INSTALLMENT_AMOUNT);
            installment.setPaidAmount(BigDecimal.ZERO);
            obligations.add(installment);
        }

        return obligationRepository.saveAll(obligations);
    }

    private CandidateStatusDTO buildStatus(Integer candidateId, List<Obligation> obligations) {
        BigDecimal totalPaid = obligations.stream()
                .map(Obligation::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = obligations.stream()
                .map(Obligation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = total.subtract(totalPaid).max(BigDecimal.ZERO);

        boolean enrollmentEligible = !obligations.isEmpty() && obligations.get(0).isFullyPaid();
        boolean examEligible       = remaining.compareTo(BigDecimal.ZERO) == 0 && total.compareTo(BigDecimal.ZERO) > 0;

        List<ObligationDTO> dtos = obligations.stream().map(o -> {
            ObligationDTO dto = new ObligationDTO();
            dto.setId(o.getId());
            dto.setOrderIndex(o.getOrderIndex());
            dto.setLabel(o.getLabel());
            dto.setType(o.getType());
            dto.setTotalAmount(o.getTotalAmount());
            dto.setPaidAmount(o.getPaidAmount());
            dto.setRemainingAmount(o.getRemainingAmount());
            dto.setFullyPaid(o.isFullyPaid());
            return dto;
        }).collect(Collectors.toList());

        CandidateStatusDTO status = new CandidateStatusDTO();
        status.setCandidateId(candidateId);
        status.setEnrollmentEligible(enrollmentEligible);
        status.setExamEligible(examEligible);
        status.setTotalAmount(total);
        status.setPaidAmount(totalPaid);
        status.setRemainingDebt(remaining);
        status.setObligations(dtos);
        return status;
    }

    private CandidateFinanceAccountDTO convertToDto(CandidateFinanceAccount account) {
        // Rucno gradimo DTO — izbjegavamo ModelMapper beskonacnu petlju
        // (Obligation.account → CandidateFinanceAccount.obligations → Obligation ...)
        // Uvijek ucitavamo iz repo-a da izbjegnemo LazyInitializationException
        // (obligations nije u @EntityGraph jer Hibernate ne moze fetcha dvije List kolekcije odjednom)
        List<Obligation> obligations = obligationRepository.findByAccountOrderByOrderIndex(account);

        List<ObligationDTO> obligationDTOs = obligations.stream().map(o -> {
            ObligationDTO odto = new ObligationDTO();
            odto.setId(o.getId());
            odto.setOrderIndex(o.getOrderIndex());
            odto.setLabel(o.getLabel());
            odto.setType(o.getType());
            odto.setTotalAmount(o.getTotalAmount());
            odto.setPaidAmount(o.getPaidAmount());
            odto.setRemainingAmount(o.getRemainingAmount());
            odto.setFullyPaid(o.isFullyPaid());
            return odto;
        }).collect(Collectors.toList());

        BigDecimal totalPaid = obligations.stream()
                .map(Obligation::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingDebt = TOTAL_AMOUNT.subtract(totalPaid).max(BigDecimal.ZERO);

        boolean enrollmentEligible = !obligationDTOs.isEmpty() && obligationDTOs.get(0).isFullyPaid();
        boolean examEligible = remainingDebt.compareTo(BigDecimal.ZERO) == 0 && !obligationDTOs.isEmpty();

        // Mapiramo user DTO ako postoji
        com.autoskola.financeservice.dto.UserDTO userDTO = null;
        if (account.getUser() != null) {
            userDTO = modelMapper.map(account.getUser(), com.autoskola.financeservice.dto.UserDTO.class);
        }

        // Mapiramo payments ako postoje
        List<com.autoskola.financeservice.dto.PaymentDTO> paymentDTOs = null;
        if (account.getPayments() != null) {
            paymentDTOs = account.getPayments().stream()
                    .map(p -> modelMapper.map(p, com.autoskola.financeservice.dto.PaymentDTO.class))
                    .collect(Collectors.toList());
        }

        CandidateFinanceAccountDTO dto = new CandidateFinanceAccountDTO();
        dto.setId(account.getId());
        dto.setUser(userDTO);
        dto.setEnrollmentDate(account.getEnrollmentDate());
        dto.setProgressPercentage(account.getProgressPercentage());
        dto.setTotalAmount(TOTAL_AMOUNT);
        dto.setRemainingDebt(remainingDebt);
        dto.setPayments(paymentDTOs);
        dto.setCandidateId(account.getCandidateId());
        dto.setObligations(obligationDTOs);
        dto.setEnrollmentEligible(enrollmentEligible);
        dto.setExamEligible(examEligible);

        return dto;
    }
}
