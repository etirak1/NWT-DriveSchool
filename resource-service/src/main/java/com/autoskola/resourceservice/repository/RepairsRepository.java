package com.autoskola.resourceservice.repository;

import com.autoskola.resourceservice.model.Repairs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepairsRepository extends JpaRepository<Repairs, Long> {
}