package com.autoskola.resourceservice.repository;

import com.autoskola.resourceservice.model.Repairs;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface RepairsRepository extends JpaRepository<Repairs, Long> {

    @EntityGraph(attributePaths = {"vehicle"})
    @Query("SELECT r FROM Repairs r")
    List<Repairs> findAllWithVehicle();

    // PAGINACIJA
    @EntityGraph(attributePaths = {"vehicle"})
    @NonNull
    Page<Repairs> findAll(@NonNull Pageable pageable);


    // CUSTOM QUERY
    @Query("SELECT r FROM Repairs r WHERE r.cost > :cost")
    List<Repairs> findExpensiveRepairs(@Param("cost") Double cost);
}