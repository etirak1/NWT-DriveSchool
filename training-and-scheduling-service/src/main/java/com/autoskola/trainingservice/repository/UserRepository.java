package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
