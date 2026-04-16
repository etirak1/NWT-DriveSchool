package com.autoskola.resourceservice.repository;

import com.autoskola.resourceservice.model.Repairs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairsRepository extends JpaRepository<Repairs, Long> {
    @Query("SELECT r FROM Repairs r JOIN FETCH r.vehicle")
    List<Repairs> findAllWithVehicle();
}