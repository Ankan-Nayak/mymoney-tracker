package com.mymoney.service;

import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.Budget;
import com.mymoney.model.Transaction;
import com.mymoney.model.TransactionType;
import com.mymoney.model.User;
import com.mymoney.repository.BudgetRepository;
import com.mymoney.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserService userService;

    public List<Budget> getAllBudgets(String username) {
        User user = userService.findByUsername(username);
        return budgetRepository.findAllByUser(user);
    }

    public Budget createBudget(String username, Budget budget) {
        User user = userService.findByUsername(username);
        budget.setUser(user);
        
        if (budget.getMonth() == null) {
            budget.setMonth(LocalDate.now().getMonthValue());
        }
        if (budget.getYear() == null) {
            budget.setYear(LocalDate.now().getYear());
        }

        // Avoid duplicates for same category in the same month/year
        budgetRepository.findByUserAndCategoryAndMonthAndYear(user, budget.getCategory(), budget.getMonth(), budget.getYear())
                .ifPresent(existing -> budget.setId(existing.getId()));

        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, String username, Budget details) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        if (!budget.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        budget.setAmount(details.getAmount());
        budget.setCategory(details.getCategory());
        budget.setType(details.getType());
        if (details.getMonth() != null) budget.setMonth(details.getMonth());
        if (details.getYear() != null) budget.setYear(details.getYear());
        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id, String username) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        if (!budget.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        budgetRepository.delete(budget);
    }

    public List<Map<String, Object>> getBudgetUsageReport(String username, Integer month, Integer year) {
        User user = userService.findByUsername(username);
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();

        List<Budget> budgets = budgetRepository.findAllByUserAndMonthAndYear(user, month, year);
        List<Transaction> transactions = transactionRepository.findAllByUserAndDeletedFalseOrderByDateDescTimeDesc(user);

        // Filter transactions for this month/year
        final int targetMonth = month;
        final int targetYear = year;
        List<Transaction> monthExpenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .filter(t -> t.getDate().getMonthValue() == targetMonth && t.getDate().getYear() == targetYear)
                .toList();

        List<Map<String, Object>> usageList = new ArrayList<>();

        for (Budget budget : budgets) {
            BigDecimal limit = budget.getAmount();
            BigDecimal spent = BigDecimal.ZERO;

            if (budget.getCategory().equalsIgnoreCase("ALL")) {
                spent = monthExpenses.stream()
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            } else {
                spent = monthExpenses.stream()
                        .filter(t -> t.getMainCategory().equalsIgnoreCase(budget.getCategory()))
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }

            BigDecimal remaining = limit.subtract(spent);
            BigDecimal percentUsed = BigDecimal.ZERO;
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                percentUsed = spent.multiply(new BigDecimal(100)).divide(limit, 2, RoundingMode.HALF_UP);
            }

            Map<String, Object> usage = new HashMap<>();
            usage.put("id", budget.getId());
            usage.put("category", budget.getCategory());
            usage.put("type", budget.getType());
            usage.put("limitAmount", limit);
            usage.put("spentAmount", spent);
            usage.put("remainingAmount", remaining);
            usage.put("percentageUsed", percentUsed);
            usage.put("isAlertNearing", percentUsed.compareTo(new BigDecimal(85)) >= 0 && percentUsed.compareTo(new BigDecimal(100)) < 0);
            usage.put("isExceeded", spent.compareTo(limit) > 0);

            usageList.add(usage);
        }

        return usageList;
    }
}
