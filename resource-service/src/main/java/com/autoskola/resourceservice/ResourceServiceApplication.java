package com.autoskola.resourceservice;


import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.client.RestTemplate;
import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.model.Repairs;
import com.autoskola.resourceservice.model.User;
import com.autoskola.resourceservice.repository.VehicleRepository;
import com.autoskola.resourceservice.repository.RepairsRepository;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.repository.UserRepository;
import com.autoskola.resourceservice.service.UserClientService;
import java.time.LocalDateTime;
import java.util.List;




@SpringBootApplication
@EnableDiscoveryClient
public class ResourceServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ResourceServiceApplication.class, args);
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {return new BCryptPasswordEncoder();}

	@Bean
	@Profile("!test")
	public CommandLineRunner start(
			UserRepository userRepository,
			VehicleRepository vehicleRepository,
			InstructorRepository instructorRepository,
			RepairsRepository repairsRepository,
			BCryptPasswordEncoder passwordEncoder
	) {
		return args -> {
			// Seed korisnici — upiši samo ako ne postoje (idempotentno pri restartu)
			seedUser(userRepository, passwordEncoder, 1L, "Elma",   "Tirak",      "etirak1@etf.unsa.ba",   "ADMIN");
			seedUser(userRepository, passwordEncoder, 2L, "Elma",   "Nekić",      "enekic1@etf.unsa.ba",   "ADMIN");
			seedUser(userRepository, passwordEncoder, 3L, "Adna",   "Alihodžić",  "aalihodzic6@etf.unsa.ba","ADMIN");
			seedUser(userRepository, passwordEncoder, 4L, "Dinela", "Pešković",   "dpeskovic1@etf.unsa.ba", "ADMIN");
			seedUser(userRepository, passwordEncoder, 5L, "Emina",  "Omerović",   "eomerovic1@etf.unsa.ba", "CANDIDATE");
			seedUser(userRepository, passwordEncoder, 6L, "Tajra",  "Ljubović",   "tljubovic1@etf.unsa.ba", "INSTRUCTOR");

			// Seed vozila — upiši samo ako tabela prazna
			if (vehicleRepository.count() == 0) {
				Vehicle vehicle1 = vehicleRepository.save(new Vehicle(
						null, "Toyota", "Corolla", "E123-ABC", "ACTIVE",
						LocalDateTime.now().minusMonths(3), LocalDateTime.now().minusYears(1),
						LocalDateTime.now(), LocalDateTime.now().minusMonths(3).plusYears(1)));
				Vehicle vehicle2 = vehicleRepository.save(new Vehicle(
						null, "BMW", "X5", "F456-DEF", "IN_REPAIR",
						LocalDateTime.now().minusMonths(6), LocalDateTime.now().minusYears(2),
						LocalDateTime.now(), LocalDateTime.now().minusMonths(6).plusYears(1)));

				if (repairsRepository.count() == 0) {
					repairsRepository.save(new Repairs(null, vehicle2, LocalDateTime.now().minusDays(10), "Oil change and brake check", 150.0, null));
					repairsRepository.save(new Repairs(null, vehicle2, LocalDateTime.now().minusMonths(1), "Replaced tires", 400.0, null));
				}
			}

			// Kreiraj Instructor zapis za sve korisnike s INSTRUCTOR rolom koji ga nemaju
			userRepository.findAll().stream()
					.filter(u -> "INSTRUCTOR".equals(u.getRole()))
					.filter(u -> !instructorRepository.existsByUserId(u.getUserId()))
					.forEach(u -> instructorRepository.save(
							new Instructor(null, u.getUserId(), "AVAILABLE", null, null)));

			System.out.println("Seed završen!");
		};
	}

	private void seedUser(UserRepository repo, BCryptPasswordEncoder enc,
	                       Long id, String first, String last, String email, String role) {
		if (!repo.existsById(id)) {
			repo.save(new User(id, first, last, email, enc.encode("123456"), role, "ACTIVE", null));
		}
	}

	/**
	 * Nakon što je aplikacija potpuno pokrenuta, sinhronizuj instruktore iz user-service.
	 * Koristi ApplicationReadyEvent da se izbjegne problem startnog redosljeda servisa.
	 */
	@Bean
	@Profile("!test")
	public org.springframework.context.ApplicationListener<ApplicationReadyEvent> syncInstructors(
			UserRepository userRepository,
			InstructorRepository instructorRepository,
			UserClientService userClientService) {
		return event -> {
			try {
				List<UserDTO> instructors = userClientService.getAllInstructors();
				int synced = 0;
				for (UserDTO dto : instructors) {
					// Upiši korisnika ako ne postoji lokalno
					if (!userRepository.existsById(dto.getUserId())) {
						User u = new User();
						u.setUserId(dto.getUserId());
						u.setFirstName(dto.getFirstName());
						u.setLastName(dto.getLastName());
						u.setEmail(dto.getEmail());
						u.setRole(dto.getRole());
						u.setPasswordHash("N/A_PLACEHOLDER");
						u.setStatus("ACTIVE");
						userRepository.save(u);
					}
					// Kreiraj Instructor zapis ako ne postoji
					if (!instructorRepository.existsByUserId(dto.getUserId())) {
						instructorRepository.save(new Instructor(null, dto.getUserId(), "AVAILABLE", null, null));
						synced++;
					}
				}
				if (synced > 0) System.out.println("Sinhronizovano " + synced + " novih instruktora iz user-service.");
			} catch (Exception e) {
				System.err.println("Sync instruktora nije uspio (user-service možda nije spreman): " + e.getMessage());
			}
		};
	}
}