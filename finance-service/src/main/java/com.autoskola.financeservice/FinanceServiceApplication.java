package com.autoskola.financeservice;

import com.autoskola.financeservice.model.User;
import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.UserRepository;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import com.autoskola.financeservice.repository.PaymentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class FinanceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceServiceApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CommandLineRunner start(
            UserRepository userRepository,
            CandidateFinanceAccountRepository accountRepository,
            PaymentRepository paymentRepository
    ) {
        return args -> {

            // 1. BRISANJE (Redoslijed je ključan zbog Foreign Key-a)
            paymentRepository.deleteAllInBatch();
            accountRepository.deleteAllInBatch();
            userRepository.deleteAllInBatch();

            // 2. UNOS KORISNIKA (User)
            // id, firstName, lastName, email, password, role, status, dateCreated
            User user1 = userRepository.save(new User(null, "Marko", "Marković", "marko@email.com", "123456", "Kandidat", "ACTIVE", LocalDateTime.now()));
            User user2 = userRepository.save(new User(null, "Dina", "Nešković", "dneskovic1@etf.unsa.ba", "123456", "Kandidat", "ACTIVE", LocalDateTime.now()));

            // 3. UNOS NALOGA KANDIDATA (CandidateFinanceAccount)
            // id, user, enrollmentDate, progressPercentage, assignedInstructorId, ruleId, totalAmount, payments(null)
            CandidateFinanceAccount account1 = accountRepository.save(new CandidateFinanceAccount(
                    null, user1, LocalDate.now().minusMonths(2), new BigDecimal("45.00"), 101, 1, new BigDecimal("1200.00"), null));

            CandidateFinanceAccount account2 = accountRepository.save(new CandidateFinanceAccount(
                    null, user2, LocalDate.now().minusMonths(1), new BigDecimal("10.00"), 102, 2, new BigDecimal("1500.00"), null));

            // 4. UNOS UPLATA (Payment)
            // paymentId, amount, dueDate, status, datePaid, candidateAccount
            paymentRepository.save(new Payment(null, new BigDecimal("400.00"), LocalDate.now().minusMonths(1), "PAID", LocalDate.now().minusMonths(1).plusDays(2), account1));
            paymentRepository.save(new Payment(null, new BigDecimal("400.00"), LocalDate.now(), "PENDING", null, account1));
            paymentRepository.save(new Payment(null, new BigDecimal("500.00"), LocalDate.now().minusDays(5), "PAID", LocalDate.now().minusDays(4), account2));

            System.out.println("Svi finansijski podaci su uspješno uneseni!");
        };
    }
}