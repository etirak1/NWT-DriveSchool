package com.autoskola.financeservice.messaging.listener;

import com.autoskola.financeservice.config.RabbitMQConfig;
import com.autoskola.financeservice.messaging.dto.LessonCompletedMessage;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class LessonFinanceListener {

    private final CandidateFinanceAccountRepository accountRepository;

    public LessonFinanceListener(CandidateFinanceAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_LESSON)
    public void handleLessonCompleted(LessonCompletedMessage msg) {
        System.out.println("[Finance] Završena lekcija " + msg.getLessonType()
                + " za kandidata: " + msg.getCandidateId());

        accountRepository.findByCandidateId(msg.getCandidateId()).ifPresentOrElse(account -> {

            BigDecimal newDebt = account.getRemainingDebt()
                    .subtract(msg.getLessonPrice())
                    .max(BigDecimal.ZERO);

            account.setRemainingDebt(newDebt);

            BigDecimal total = account.getTotalAmount();
            if (total != null && total.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal paid = total.subtract(newDebt);
                BigDecimal progress = paid.divide(total, 2, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                account.setProgressPercentage(progress);
            }

            accountRepository.save(account);
            System.out.println("[Finance] Preostali dug: " + newDebt);

        }, () -> System.out.println("[Finance] Account nije pronađen za kandidata: "
                + msg.getCandidateId()));
    }
}