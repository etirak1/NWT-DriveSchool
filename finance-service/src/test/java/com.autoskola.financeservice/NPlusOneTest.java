package com.autoskola.financeservice;

import com.autoskola.financeservice.model.*;
import com.autoskola.financeservice.repository.*;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach; // VAŽNO: JUnit 5 anotacija
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;


@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:mysql://localhost:3306/autoskola_finance_db?createDatabaseIfNotExist=true",
        "spring.datasource.username=root",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect"
})

@Transactional
@ActiveProfiles("test")
public class NPlusOneTest {

    @Autowired
    private CandidateFinanceAccountRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void setupData() {

        paymentRepository.deleteAll();
        repository.deleteAll();
        userRepository.deleteAll();


        User user = new User(null, "Test", "Test", "test@test.com", "123", "Kandidat", "ACTIVE", LocalDateTime.now());
        user = userRepository.save(user);


        CandidateFinanceAccount account = new CandidateFinanceAccount(
                null, user, LocalDate.now(), new BigDecimal("50.0"), 1, 1, new BigDecimal("1200.0"), new ArrayList<>()
        );
        account = repository.save(account);


        Payment p1 = new Payment(null, new BigDecimal("100.0"), LocalDate.now(), "PAID", LocalDate.now(), account);
        Payment p2 = new Payment(null, new BigDecimal("200.0"), LocalDate.now(), "PENDING", null, account);
        paymentRepository.save(p1);
        paymentRepository.save(p2);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    void testNPlusOneProblemSolution() {
        Session session = entityManager.unwrap(Session.class);
        Statistics stats = session.getSessionFactory().getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        repository.findAllWithPayments();

        assertEquals(1, stats.getPrepareStatementCount(), "Trebao bi biti samo 1 SQL upit!");
    }
}