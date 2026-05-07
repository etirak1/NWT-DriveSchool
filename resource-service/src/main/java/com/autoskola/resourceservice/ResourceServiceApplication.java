package com.autoskola.resourceservice;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.web.client.RestTemplate;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.model.Repairs;
import com.autoskola.resourceservice.model.User;
import com.autoskola.resourceservice.repository.VehicleRepository;
import com.autoskola.resourceservice.repository.RepairsRepository;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.repository.UserRepository;
import java.time.LocalDateTime;




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
	@Profile("!test")
	public CommandLineRunner start(
			UserRepository userRepository,
			VehicleRepository vehicleRepository,
			InstructorRepository instructorRepository,
			RepairsRepository repairsRepository
	) {
		return args -> {

			repairsRepository.deleteAll();
			instructorRepository.deleteAll();
			vehicleRepository.deleteAll();
			userRepository.deleteAll();

			User admin = userRepository.save(new User(null, "Azra", "Trako", "atrako1@etf.unsa.ba", "123456", "Instruktor", "ACTIVE", null));
			userRepository.save(new User(null, "Ajla", "Nekić", "anekic1@etf.unsa.ba", "123456", "Instruktor", "ACTIVE", null));
			userRepository.save(new User(null, "Adna", "Hodzić", "ahodzic6@etf.unsa.ba", "123456", "Administrator", "ACTIVE", null));
			userRepository.save(new User(null, "Dina", "Nešković", "dneskovic1@etf.unsa.ba", "123456", "Kandidat", "ACTIVE", null));
			Vehicle vehicle1 = vehicleRepository.save(
					new Vehicle(null, "Toyota", "Corolla", "E123-ABC", "ACTIVE",
							LocalDateTime.now().minusMonths(3), LocalDateTime.now().minusYears(1), null));
			Vehicle vehicle2 = vehicleRepository.save(
					new Vehicle(null, "BMW", "X5", "F456-DEF", "IN_REPAIR",
							LocalDateTime.now().minusMonths(6), LocalDateTime.now().minusYears(2), null));

			Instructor instructor = instructorRepository.save(
					new Instructor(null, admin.getUserId(), "Available Mon-Fri 9-17", null));

			repairsRepository.save(
					new Repairs(null, vehicle2, LocalDateTime.now().minusDays(10), "Oil change and brake check", 150.0, null));
			repairsRepository.save(
					new Repairs(null, vehicle2, LocalDateTime.now().minusMonths(1), "Replaced tires", 400.0, null));

			System.out.println("Sve podaci su uneseni!");
		};
	}
}