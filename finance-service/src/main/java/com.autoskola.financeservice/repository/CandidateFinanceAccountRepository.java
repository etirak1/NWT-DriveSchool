package com.autoskola.financeservice.repository;

import com.autoskola.financeservice.model.CandidateFinanceAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateFinanceAccountRepository extends JpaRepository<CandidateFinanceAccount, Integer> {
}