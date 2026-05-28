package com.autoskola.userservice.service;

import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.model.User;
import com.autoskola.userservice.repository.AnnouncementRepository;
import com.autoskola.userservice.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDataInitializer {

    private final UserRepository userRepository;
    private final AnnouncementRepository announcementRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public UserDataInitializer(UserRepository userRepository,
                               AnnouncementRepository announcementRepository,
                               BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.announcementRepository = announcementRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void init() {
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=0").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE announcements").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE users").executeUpdate();
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=1").executeUpdate();

        // ID 1
        User admin = userRepository.save(new User(null, "Elma", "Tirak",
                "etirak1@etf.unsa.ba", passwordEncoder.encode("123456"), "ADMIN", "ACTIVE", null));
        // ID 2
        userRepository.save(new User(null, "Elma", "Nekić",
                "enekic1@etf.unsa.ba", passwordEncoder.encode("123456"), "ADMIN", "ACTIVE", null));
        // ID 3
        userRepository.save(new User(null, "Adna", "Alihodžić",
                "aalihodzic6@etf.unsa.ba", passwordEncoder.encode("123456"), "ADMIN", "ACTIVE", null));
        // ID 4
        userRepository.save(new User(null, "Dinela", "Pešković",
                "dpeskovic1@etf.unsa.ba", passwordEncoder.encode("123456"), "ADMIN", "ACTIVE", null));
        // ID 5
        userRepository.save(new User(null, "Emina", "Omerović",
                "eomerovic1@etf.unsa.ba", passwordEncoder.encode("123456"), "CANDIDATE", "ACTIVE", null));
        // ID 6
        userRepository.save(new User(null, "Tajra", "Ljubović",
                "tljubovic1@etf.unsa.ba", passwordEncoder.encode("123456"), "INSTRUCTOR", "ACTIVE", null));

        // ID 7
        userRepository.save(new User(null, "Emina", "Torlak",
                "etorlak1@etf.unsa.ba", passwordEncoder.encode("123456"), "CANDIDATE", "ACTIVE", null));

        // ID 8
            userRepository.save(new User(null, "Berina", "Komar",
                "bkomar1@etf.unsa.ba", passwordEncoder.encode("123456"), "INSTRUCTOR", "ACTIVE", null));

        // ID 9
        userRepository.save(new User(null, "Amna", "Krnić",
                "akrnic1@etf.unsa.ba", passwordEncoder.encode("123456"), "CANDIDATE", "ACTIVE", null));


        announcementRepository.save(new Announcement(null, "Novi termini",
                "Novi termini za teoretski ispit su objavljeni.", admin.getUserId(), null, null));
        announcementRepository.save(new Announcement(null, "Praznici",
                "Auto-škola ne radi za nadolazeće praznike.", admin.getUserId(), null, null));

        System.out.println("User service: podaci uneseni, ID-evi 1-9");
    }
}