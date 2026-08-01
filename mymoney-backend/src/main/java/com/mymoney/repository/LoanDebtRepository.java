package com.mymoney.repository;

import com.mymoney.model.LoanDebt;
import com.mymoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoanDebtRepository extends JpaRepository<LoanDebt, Long> {
    List<LoanDebt> findAllByUserOrderByLoanDateDesc(User user);
    List<LoanDebt> findAllByUserAndCompletedOrderByLoanDateDesc(User user, boolean completed);
}
