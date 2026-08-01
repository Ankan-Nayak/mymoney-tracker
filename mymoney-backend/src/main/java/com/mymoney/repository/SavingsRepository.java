package com.mymoney.repository;

import com.mymoney.model.Savings;
import com.mymoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, Long> {
    List<Savings> findAllByUserOrderByDateDesc(User user);
}
