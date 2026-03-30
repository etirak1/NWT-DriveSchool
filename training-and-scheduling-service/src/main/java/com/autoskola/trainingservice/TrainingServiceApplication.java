package com.autoskola.trainingservice;

import com.autoskola.trainingservice.model.*;
import com.autoskola.trainingservice.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class TrainingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrainingServiceApplication.class, args);
    }

    // Neophodno za komunikaciju sa drugim servisima
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CommandLineRunner initData(
            TrainingRuleRepository ruleRepository,
            InstructorRepository instructorRepository,
            CandidateRepository candidateRepository,
            LessonRepository lessonRepository,
            TrainingPhaseRepository phaseRepository,
            FeedbackRepository feedbackRepository
    ) {
        return args -> {
            // Čišćenje starih podataka (obrnutim redoslijedom zbog FK ograničenja)
            feedbackRepository.deleteAll();
            phaseRepository.deleteAll();
            lessonRepository.deleteAll();
            candidateRepository.deleteAll();
            instructorRepository.deleteAll();
            ruleRepository.deleteAll();

            // 1. Unos pravila obuke (npr. B Kategorija)
            TrainingRule bCategory = ruleRepository.save(new TrainingRule(
                    null, 30, 35, 45, new BigDecimal("1200.00")));

            // 2. Unos instruktora
            Instructor instructor1 = instructorRepository.save(new Instructor(
                    null, 1L, "Dostupan Pon-Pet 08:00-16:00", LocalDateTime.now()));

            // 3. Unos kandidata
            Candidate candidate1 = candidateRepository.save(new Candidate(
                    null, 4L, LocalDate.now().minusDays(10), new BigDecimal("15.0"), instructor1, bCategory));

            // 4. Unos jednog zakazanog časa vožnje
            lessonRepository.save(new Lesson(
                    null,
                    candidate1,
                    instructor1,
                    1L,
                    LocalDateTime.now().plusDays(2).withHour(10).withMinute(0),
                    45,
                    "ZAKAZANO",
                    "Vježba kretanja na uzbrdici"
            ));

            // 5. Unos faze obuke (npr. Teorijski dio je u toku)
            phaseRepository.save(new TrainingPhase(
                    null, candidate1, "TEORIJSKI_DIO", "U_TOKU", null));

            // 6. Unos jednog feedbacka (Kandidat ocjenjuje instruktora)
            feedbackRepository.save(new Feedback(
                    null, candidate1, instructor1, 5, "Odličan instruktor, jako strpljiv.", LocalDate.now()));

            System.out.println(">>> Training and Scheduling Service: Podaci su uspješno uneseni u bazu!");
        };
    }
}