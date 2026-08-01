package com.mymoney.controller;

import com.mymoney.model.Budget;
import com.mymoney.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(Principal principal) {
        return ResponseEntity.ok(budgetService.getAllBudgets(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget, Principal principal) {
        return ResponseEntity.ok(budgetService.createBudget(principal.getName(), budget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget, Principal principal) {
        return ResponseEntity.ok(budgetService.updateBudget(id, principal.getName(), budget));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Principal principal) {
        budgetService.deleteBudget(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/report")
    public ResponseEntity<List<Map<String, Object>>> getBudgetReport(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Principal principal
    ) {
        return ResponseEntity.ok(budgetService.getBudgetUsageReport(principal.getName(), month, year));
    }
}
