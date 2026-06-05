package com.autoskola.financeservice.repository;

import com.autoskola.financeservice.model.CandidateFinanceAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CandidateFinanceAccountRepository
        extends JpaRepository<CandidateFinanceAccount, Integer> {

    @EntityGraph(attributePaths = {"user", "payments"})
    @Query("SELECT a FROM CandidateFinanceAccount a")
    List<CandidateFinanceAccount> findAllWithPayments();

    @EntityGraph(attributePaths = {"user", "payments"})
    @Query("SELECT a FROM CandidateFinanceAccount a")
    Page<CandidateFinanceAccount> findAllWithPayments(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "payments"})
    Optional<CandidateFinanceAccount> findById(Integer id);

    // NOVO — za listener
    Optional<CandidateFinanceAccount> findByCandidateId(Integer candidateId);

    boolean existsByCandidateId(Integer candidateId);
}