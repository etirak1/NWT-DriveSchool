package com.autoskola.userservice.service;

import com.autoskola.userservice.model.User;
import com.autoskola.userservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicijalizuje samo admin/instruktor korisnike koji su neophodni za rad sistema.
 * Nikad ne briše postojeće podatke — idempotentno.
 */
@Component
public class UserDataInitializer {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserDataInitializer(UserRepository userRepository,
                               BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void init() {
        // Kreiraj samo ako ne postoji — idempotentno, ne brise nicta
        ensureUser("etirak1@etf.unsa.ba",   "Elma",    "Tirak",      "ADMIN");
        ensureUser("enekic1@etf.unsa.ba",   "Elma",    "Nekic",      "ADMIN");
        ensureUser("aalihodzic6@etf.unsa.ba","Adna",    "Alihodzic",  "ADMIN");
        ensureUser("dpeskovic1@etf.unsa.ba", "Dinela",  "Peskovic",   "ADMIN");
        ensureUser("tljubovic1@etf.unsa.ba", "Tajra",   "Ljubovic",   "INSTRUCTOR");
        ensureUser("bkomar1@etf.unsa.ba",    "Berina",  "Komar",      "INSTRUCTOR");

        System.out.println("User service: inicijalizacija zavrsena (postojeci podaci sacuvani).");
    }

    private void ensureUser(String email, String firstName, String lastName, String role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            userRepository.save(new User(null, firstName, lastName,
                    email, passwordEncoder.encode("123456"), role, "ACTIVE", null));
            System.out.println("  Kreiran korisnik: " + email);
        }
    }
}
