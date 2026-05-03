package com.autoskola.financeservice.config;
import com.autoskola.financeservice.model.*;
import com.autoskola.financeservice.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
@Profile("!test")
public class DataInitializer {

    @Bean
    public CommandLineRunner start(
            UserRepository userRepository,
            CandidateFinanceAccountRepository accountRepository,
            PaymentRepository paymentRepository
    ) {
        return args -> {
            paymentRepository.deleteAllInBatch();
            accountRepository.deleteAllInBatch();
            userRepository.deleteAllInBatch();

            User user1 = userRepository.save(new User(null, "Marko", "Marković", "marko@email.com", "123456", "Kandidat", "ACTIVE", LocalDateTime.now()));
            User user2 = userRepository.save(new User(null, "Dina", "Nešković", "dneskovic1@etf.unsa.ba", "123456", "Kandidat", "ACTIVE", LocalDateTime.now()));

            CandidateFinanceAccount account1 = accountRepository.save(new CandidateFinanceAccount(
                    null, user1, LocalDate.now().minusMonths(2), new BigDecimal("45.00"), 101, 1, new BigDecimal("1200.00"), null));

            CandidateFinanceAccount account2 = accountRepository.save(new CandidateFinanceAccount(
                    null, user2, LocalDate.now().minusMonths(1), new BigDecimal("10.00"), 102, 2, new BigDecimal("1500.00"), null));

            paymentRepository.save(new Payment(null, new BigDecimal("400.00"), LocalDate.now().minusMonths(1), "PAID", LocalDate.now().minusMonths(1).plusDays(2), account1));
            paymentRepository.save(new Payment(null, new BigDecimal("500.00"), LocalDate.now().minusDays(5), "PAID", LocalDate.now().minusDays(4), account2));

            System.out.println("Svi finansijski podaci su uspješno uneseni!");
        };
    }
}