package com.autoskola.financeservice.service;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.dto.PaymentDTO;
import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import com.autoskola.financeservice.repository.PaymentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.DeserializationFeature;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class FinanceService {

    private final CandidateFinanceAccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final ModelMapper modelMapper;

    public FinanceService(CandidateFinanceAccountRepository accountRepository,
                          PaymentRepository paymentRepository,
                          ModelMapper modelMapper) {
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public CandidateFinanceAccountDTO applyPatchToAccount(Integer id, JsonPatch patch) {
        try {
            // 1. Pronađi originalni nalog
            CandidateFinanceAccount account = accountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Nalog nije pronađen"));

            // 2. Pripremi ObjectMapper sa modulima za datume
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

            //  Ignoriši polja koja ne možeš da mapiraš nazad
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            // Spreči beskonačnu petlju tako što ćeš ignorisati listu plaćanja tokom patch-a
            objectMapper.addMixIn(CandidateFinanceAccount.class, IgnorePaymentsMixIn.class);

            //  Pretvori u JsonNode
            JsonNode accountJson = objectMapper.valueToTree(account);

            //  Primjeni patch
            JsonNode patchedJson = patch.apply(accountJson);

            // Pretvori nazad u entitet
            CandidateFinanceAccount updatedAccount = objectMapper.treeToValue(patchedJson, CandidateFinanceAccount.class);

            // VRATI BITNE PODATKE koje Jackson možda obriše
            updatedAccount.setId(id);
            updatedAccount.setUser(account.getUser()); // Zadrži originalnog korisnika
            if (updatedAccount.getPayments() == null) {
                updatedAccount.setPayments(account.getPayments()); // Zadrži originalne uplate
            }

            //  Spasi i vrati DTO
            return convertToDto(accountRepository.save(updatedAccount));

        } catch (Exception e) {
            // Ispiše grešku u konzolu IntelliJ-a da vidiš šta nije u redu
            e.printStackTrace();
            throw new RuntimeException("Patch failed: " + e.getMessage());
        }
    }

    // Pomoćni interfejs koji kaže Jacksonu da ignoriše uplate tokom PATCH procesa
    abstract class IgnorePaymentsMixIn {
        @com.fasterxml.jackson.annotation.JsonIgnore
        private List<com.autoskola.financeservice.model.Payment> payments;
    }


    public List<CandidateFinanceAccountDTO> getAllAccounts() {
        return accountRepository.findAll()
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
        return accountRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    public List<PaymentDTO> getPaymentsByCandidate(Integer candidateId) {
        return paymentRepository.findByCandidateAccount_Id(candidateId)
                .stream()
                .map(payment -> modelMapper.map(payment, PaymentDTO.class))
                .collect(Collectors.toList());
    }

    private CandidateFinanceAccountDTO convertToDto(CandidateFinanceAccount account) {

        CandidateFinanceAccountDTO dto =
                modelMapper.map(account, CandidateFinanceAccountDTO.class);


        List<Payment> payments =
                account.getPayments() != null ? account.getPayments() : List.of();

        BigDecimal paidAmount = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = account.getTotalAmount() != null
                ? account.getTotalAmount()
                : BigDecimal.ZERO;

        dto.setRemainingDebt(total.subtract(paidAmount));

        return dto;
    }
}