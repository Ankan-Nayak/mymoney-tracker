package com.mymoney.repository;

import com.mymoney.model.Bill;
import com.mymoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findAllByUserOrderByDueDateAsc(User user);
    List<Bill> findAllByUserAndPaidOrderByDueDateAsc(User user, boolean paid);
}
