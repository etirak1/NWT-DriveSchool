package com.autoskola.financeservice;

import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.model.User;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import com.autoskola.financeservice.repository.PaymentRepository;
import com.autoskola.financeservice.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:mysql://localhost:3306/autoskola_finance_db?createDatabaseIfNotExist=true",
        "spring.datasource.username=root",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.jpa.show-sql=true"
})
@AutoConfigureMockMvc
@ActiveProfiles("test") // Koristi 'test' profil da izbjegne DataInitializer
@Transactional // Automatski poništava promjene u bazi nakon testa (Rollback)
public class PaymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateFinanceAccountRepository accountRepository;

    private CandidateFinanceAccount testAccount;

    @BeforeEach
    void setUp() {

        paymentRepository.deleteAllInBatch();
        accountRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Kreiramo roditeljske podatke jer Payment mora imati nalog
        User user = userRepository.save(new User(null, "Ivan", "Ivić", "ivan@test.com", "123", "Kandidat", "ACTIVE", LocalDateTime.now()));

        testAccount = accountRepository.save(new CandidateFinanceAccount(
                null, user, LocalDate.now(), new BigDecimal("0.0"), 1, 1, new BigDecimal("1000.0"), null));
    }

    @Test
    void testCreatePaymentIntegration() throws Exception {
        //  Priprema JSON podataka za novu uplatu
        Payment newPayment = new Payment();
        newPayment.setAmount(new BigDecimal("350.00"));
        newPayment.setDueDate(LocalDate.now().plusDays(7));
        newPayment.setStatus("PAID");
        newPayment.setCandidateAccount(testAccount);

        // Slanje stvarnog HTTP POST zahtjeva na kontroler
        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPayment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(350.00))
                .andExpect(jsonPath("$.status").value("PAID"));

        // Verifikacija: Provjeravamo da li je podatak stvarno u bazi
        assertEquals(1, paymentRepository.count(), "U bazi bi trebala biti tačno jedna uplata.");

        Payment savedPayment = paymentRepository.findAll().get(0);
        assertEquals(new BigDecimal("350.00"), savedPayment.getAmount());
    }
}