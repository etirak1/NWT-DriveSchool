package com.autoskola.trainingservice;

import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.autoskola.trainingservice.repository.CandidateRepository;

@SpringBootTest
@Transactional
class CandidateNPlusOneTest {

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private CandidateRepository candidateRepository;

    @Test
    void testNPlusOne() {

        SessionFactory sessionFactory =
                entityManagerFactory.unwrap(SessionFactory.class);

        Statistics stats = sessionFactory.getStatistics();
        stats.clear();

        candidateRepository.findAll().forEach(c -> {
            c.getAssignedInstructor().getInstructorId();
            c.getRule().getRuleId();
        });

        System.out.println("BROJ QUERY-ja: " + stats.getPrepareStatementCount());
    }
}