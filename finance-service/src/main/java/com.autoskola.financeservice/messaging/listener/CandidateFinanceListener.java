package com.autoskola.financeservice.messaging.listener;

import com.autoskola.financeservice.config.RabbitMQConfig;
import com.autoskola.financeservice.messaging.dto.CandidateCreatedMessage;
import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class CandidateFinanceListener {

    private final CandidateFinanceAccountRepository accountRepository;

    public CandidateFinanceListener(CandidateFinanceAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_CANDIDATE)
    public void handleCandidateCreated(CandidateCreatedMessage msg) {
        System.out.println("[Finance] Novi kandidat: " + msg.getEmail());

        if (accountRepository.existsByCandidateId(msg.getCandidateId())) {
            System.out.println("[Finance] Account već postoji, preskačem.");
            return;
        }

        CandidateFinanceAccount account = new CandidateFinanceAccount();
        account.setCandidateId(msg.getCandidateId());
        account.setEnrollmentDate(LocalDate.now());
        account.setTotalAmount(new BigDecimal("1500.00"));
        account.setRemainingDebt(new BigDecimal("1500.00"));
        account.setProgressPercentage(BigDecimal.ZERO);

        accountRepository.save(account);
        System.out.println("[Finance] Kreiran account za kandidata ID: " + msg.getCandidateId());
    }
}

