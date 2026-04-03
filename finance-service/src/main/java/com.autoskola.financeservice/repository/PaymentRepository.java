package com.autoskola.financeservice.repository;

import com.autoskola.financeservice.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    // Mora se zvati ovako jer je polje u klasi Payment "candidateAccount"
    List<Payment> findByCandidateAccount_Id(Integer id);
}