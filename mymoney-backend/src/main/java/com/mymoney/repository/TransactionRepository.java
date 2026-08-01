package com.mymoney.repository;

import com.mymoney.model.Transaction;
import com.mymoney.model.TransactionType;
import com.mymoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findAllByUserAndDeletedFalseOrderByDateDescTimeDesc(User user);
    
    List<Transaction> findAllByUserAndDeletedTrueOrderByDateDescTimeDesc(User user);
    
    List<Transaction> findAllByUserAndTypeAndDeletedFalse(User user, TransactionType type);
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.deleted = false AND t.date BETWEEN :startDate AND :endDate ORDER BY t.date DESC, t.time DESC")
    List<Transaction> findAllByUserAndDateBetween(
        @Param("user") User user, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.deleted = false")
    java.math.BigDecimal sumAmountByUserAndType(@Param("user") User user, @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.deleted = false AND t.date = :date")
    java.math.BigDecimal sumAmountByUserAndTypeAndDate(@Param("user") User user, @Param("type") TransactionType type, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.deleted = false AND t.date BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumAmountByUserAndTypeAndDateBetween(
        @Param("user") User user, 
        @Param("type") TransactionType type, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );
}
