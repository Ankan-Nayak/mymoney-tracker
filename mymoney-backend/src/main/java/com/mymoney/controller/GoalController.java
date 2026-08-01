package com.mymoney.controller;

import com.mymoney.model.Goal;
import com.mymoney.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals(Principal principal) {
        return ResponseEntity.ok(goalService.getAllGoals(principal.getName()));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<Map<String, Object>>> getGoalsProgress(Principal principal) {
        return ResponseEntity.ok(goalService.getGoalsWithProgress(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal, Principal principal) {
        return ResponseEntity.ok(goalService.createGoal(principal.getName(), goal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goal, Principal principal) {
        return ResponseEntity.ok(goalService.updateGoal(id, principal.getName(), goal));
    }

    @PostMapping("/{id}/add-funds")
    public ResponseEntity<Goal> addFunds(@PathVariable Long id, @RequestParam BigDecimal amount, Principal principal) {
        return ResponseEntity.ok(goalService.addFundsToGoal(id, principal.getName(), amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, Principal principal) {
        goalService.deleteGoal(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
