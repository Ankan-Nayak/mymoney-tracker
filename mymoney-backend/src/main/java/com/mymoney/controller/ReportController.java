package com.mymoney.controller;

import com.mymoney.model.Transaction;
import com.mymoney.model.TransactionType;
import com.mymoney.service.TransactionService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(Principal principal) {
        String username = principal.getName();
        List<Transaction> transactions = transactionService.getActiveTransactions(username);

        // 1. Expense Distribution
        Map<String, BigDecimal> expenseByCategory = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        Transaction::getMainCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        // 2. Income Distribution
        Map<String, BigDecimal> incomeByCategory = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .collect(Collectors.groupingBy(
                        Transaction::getMainCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        // 3. Monthly Comparison (Last 6 Months)
        List<Map<String, Object>> monthlyComparison = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            int m = monthDate.getMonthValue();
            int y = monthDate.getYear();

            BigDecimal inc = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME && t.getDate().getMonthValue() == m && t.getDate().getYear() == y)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal exp = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE && t.getDate().getMonthValue() == m && t.getDate().getYear() == y)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> record = new HashMap<>();
            record.put("month", monthDate.getMonth().toString() + " " + y);
            record.put("income", inc);
            record.put("expenses", exp);
            monthlyComparison.add(record);
        }

        // Response payload
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("expenseByCategory", expenseByCategory);
        analytics.put("incomeByCategory", incomeByCategory);
        analytics.put("monthlyComparison", monthlyComparison);

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/export/csv")
    public void exportToCSV(Principal principal, HttpServletResponse response) throws IOException {
        String username = principal.getName();
        List<Transaction> transactions = transactionService.getActiveTransactions(username);

        String filename = "mymoney_transactions_" + LocalDate.now() + ".csv";
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

        PrintWriter writer = response.getWriter();
        // Write header
        writer.println("ID,Date,Time,Type,Category,Subcategory,CustomCategory,Amount,Currency,Merchant,PaymentMethod,Description,Tags,Status");

        for (Transaction t : transactions) {
            writer.println(String.format("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s",
                    t.getId(),
                    t.getDate(),
                    t.getTime(),
                    t.getType(),
                    escapeCsv(t.getMainCategory()),
                    escapeCsv(t.getSubcategory()),
                    escapeCsv(t.getCustomCategory()),
                    t.getAmount(),
                    t.getCurrency(),
                    escapeCsv(t.getMerchant()),
                    escapeCsv(t.getPaymentMethod()),
                    escapeCsv(t.getDescription()),
                    escapeCsv(t.getTags()),
                    t.isDeleted() ? "Deleted" : "Active"
            ));
        }
        writer.flush();
        writer.close();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        String clean = value.replace("\"", "\"\"");
        if (clean.contains(",") || clean.contains("\"") || clean.contains("\n")) {
            return "\"" + clean + "\"";
        }
        return clean;
    }
}
