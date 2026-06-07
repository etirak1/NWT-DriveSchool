package com.autoskola.financeservice.repository;

import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Obligation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObligationRepository extends JpaRepository<Obligation, Integer> {

    List<Obligation> findByAccount_CandidateIdOrderByOrderIndex(Integer candidateId);

    List<Obligation> findByAccountOrderByOrderIndex(CandidateFinanceAccount account);

    boolean existsByAccount_CandidateId(Integer candidateId);

    List<Obligation> findByAccount_IdInOrderByAccount_IdAscOrderIndexAsc(List<Integer> accountIds);
}
