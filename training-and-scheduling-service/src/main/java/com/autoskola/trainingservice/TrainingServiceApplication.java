package com.autoskola.trainingservice;

import com.autoskola.trainingservice.client.UserClient;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.dto.UserPageResponse;
import com.autoskola.trainingservice.model.*;
import com.autoskola.trainingservice.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.web.client.RestTemplate;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class TrainingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrainingServiceApplication.class, args);
    }



    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    @Profile("!test")
    public CommandLineRunner initData(
            UserClient userClient,
            UserRepository userRepository,
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
            userRepository.deleteAll();

            // 1. Unos pravila obuke
            TrainingRule bCategory = ruleRepository.save(new TrainingRule(
                    null, 30, 35, 45, new BigDecimal("1200.00")));

            Instructor instructor1 = null;
            Candidate candidate1 = null;
            Candidate candidate2 = null;
            Candidate candidate3 = null;

            System.out.println(">>> Pokrećem sinhronizaciju sa User Service-om...");

            try {
                UserPageResponse response = userClient.getAllUsers();
                List<UserDTO> remoteUsers = response.getContent();

                if (remoteUsers != null) {

                    for (UserDTO ru : remoteUsers) {

                        userRepository.save(new User(ru.getUserId(), ru.getFirstName(), ru.getLastName(), ru.getRole()));

                        if ("INSTRUCTOR".equals(ru.getRole())) {
                            Instructor i = instructorRepository.save(new Instructor(null, ru.getUserId()));
                            if (instructor1 == null) instructor1 = i;
                        }
                    }


                    if (instructor1 != null) {
                        for (UserDTO ru : remoteUsers) {
                            if ("CANDIDATE".equals(ru.getRole())) {
                                Candidate c = candidateRepository.save(new Candidate(
                                        null, ru.getUserId(), LocalDate.now().minusDays(10),
                                        new BigDecimal("15.0"), instructor1, bCategory));

                                if (candidate1 == null) candidate1 = c;
                                else if (candidate2 == null) candidate2 = c;
                                else if (candidate3 == null) candidate3 = c;
                            }
                        }
                    } else {
                        System.err.println(">>> Upozorenje: Nije pronađen nijedan instruktor u User Service-u. Kandidati neće biti kreirani.");
                    }
                }
                System.out.println(">>> Sinhronizacija uspješna! ID-evi su usklađeni.");
            } catch (Exception e) {
                System.err.println(">>> Greška pri sinhronizaciji: " + e.getMessage());
            }

            if (candidate1 != null && instructor1 != null) {
                lessonRepository.save(new Lesson(null, candidate1, instructor1, 1L,
                        LocalDateTime.now().plusDays(2).withHour(10).withMinute(0), 45, "ZAKAZANO", "Vježba kretanja na uzbrdici"));

                if (candidate3 != null) {
                    lessonRepository.save(new Lesson(null, candidate3, instructor1, 1L,
                            LocalDateTime.now().plusDays(3).withHour(11).withMinute(0), 45, "ODRAĐENO", "Gradska vožnja"));
                }

                phaseRepository.save(new TrainingPhase(null, candidate1, "TEORIJSKI DIO", "U TOKU", null));


                feedbackRepository.save(new Feedback(null, candidate1, instructor1, 5, "Odličan instruktor!", LocalDate.now()));
            }

            System.out.println(">>> Podaci su uspješno sinhronizovani i uneseni!");
        };
    }
}