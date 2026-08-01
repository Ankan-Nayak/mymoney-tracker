package com.mymoney.controller;

import com.mymoney.model.*;
import com.mymoney.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private SavingsService savingsService;

    @Autowired
    private BillService billService;

    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardData(Principal principal) {
        String username = principal.getName();
        LocalDate today = LocalDate.now();

        // 1. Transactions and basic sums
        List<Transaction> activeTx = transactionService.getActiveTransactions(username);
        BigDecimal totalIncome = transactionService.getTotalIncome(username);
        BigDecimal totalExpenses = transactionService.getTotalExpenses(username);
        BigDecimal currentBalance = totalIncome.subtract(totalExpenses);

        // 2. Savings metrics
        BigDecimal totalSavings = savingsService.getTotalSavings(username);

        // 3. Timeframe expenses
        BigDecimal todayExpenses = activeTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getDate().isEqual(today))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate oneWeekAgo = today.minusDays(7);
        BigDecimal weeklyExpenses = activeTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && !t.getDate().isBefore(oneWeekAgo) && !t.getDate().isAfter(today))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthlyExpenses = activeTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getDate().getMonthValue() == today.getMonthValue() && t.getDate().getYear() == today.getYear())
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Budget limits and usage
        List<Map<String, Object>> budgetReports = budgetService.getBudgetUsageReport(username, today.getMonthValue(), today.getYear());
        BigDecimal totalBudgetLimit = budgetReports.stream()
                .filter(b -> b.get("category").toString().equalsIgnoreCase("ALL"))
                .map(b -> (BigDecimal) b.get("limitAmount"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingBudget = BigDecimal.ZERO;
        if (totalBudgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            remainingBudget = totalBudgetLimit.subtract(monthlyExpenses);
        }

        // 5. Goals
        List<Map<String, Object>> goals = goalService.getGoalsWithProgress(username);

        // 6. Bills and Subscriptions due
        List<Bill> pendingBills = billService.getBillsByPaidStatus(username, false);
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(username);

        // 7. Recent Transactions (limit to 5)
        List<Transaction> recentTx = activeTx.stream().limit(5).toList();

        // Build result
        Map<String, Object> data = new HashMap<>();
        data.put("currentBalance", currentBalance);
        data.put("totalIncome", totalIncome);
        data.put("totalExpenses", totalExpenses);
        data.put("totalSavings", totalSavings);
        data.put("remainingBudget", remainingBudget);
        data.put("todayExpenses", todayExpenses);
        data.put("weeklyExpenses", weeklyExpenses);
        data.put("monthlyExpenses", monthlyExpenses);
        data.put("recentTransactions", recentTx);
        data.put("activeGoals", goals);
        data.put("upcomingBills", pendingBills);
        data.put("upcomingSubscriptions", subscriptions);
        data.put("budgetReports", budgetReports);

        return ResponseEntity.ok(data);
    }
}
