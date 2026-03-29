package com.autoskola.userservice;

import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.model.User;
import com.autoskola.userservice.repository.AnnouncementRepository;
import com.autoskola.userservice.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class UserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

	@Bean
	CommandLineRunner start(UserRepository userRepository,
	                        AnnouncementRepository announcementRepository) {
		return args -> {
			announcementRepository.deleteAll();
			userRepository.deleteAll();

			User admin = userRepository.save(new User(null, "Elma", "Tirak", "etirak1@etf.unsa.ba", "123456", "ADMIN", "ACTIVE", null));

			userRepository.save(new User(null, "Elma", "Nekić", "enekic1@etf.unsa.ba", "123456", "ADMIN", "ACTIVE", null));
			userRepository.save(new User(null, "Adna", "Alihodžić", "aalihodzic6@etf.unsa.ba", "123456", "ADMIN", "ACTIVE", null));
			userRepository.save(new User(null, "Dinela", "Pešković", "dpeskovic1@etf.unsa.ba", "123456", "ADMIN", "ACTIVE", null));

			announcementRepository.save(new Announcement(null, "Novi termini", "Novi termini za teoretski ispit su objavljeni.", admin.getUserId(), null, null));
			announcementRepository.save(new Announcement(null, "Praznici", "Auto-škola ne radi za nadolazeće praznike.", admin.getUserId(), null, null));

			System.out.println("Svi podaci (korisnici i objave) su uspješno uneseni!");
		};
	}
}