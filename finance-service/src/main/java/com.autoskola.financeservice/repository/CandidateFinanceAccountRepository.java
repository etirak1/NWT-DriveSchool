package com.autoskola.financeservice.repository;

import com.autoskola.financeservice.model.CandidateFinanceAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CandidateFinanceAccountRepository extends JpaRepository<CandidateFinanceAccount, Integer> {


    @Query("SELECT DISTINCT a FROM CandidateFinanceAccount a " +
            "LEFT JOIN FETCH a.payments " +
            "LEFT JOIN FETCH a.user")
    List<CandidateFinanceAccount> findAllWithPayments();
}