package com.mymoney.controller;

import com.mymoney.model.Savings;
import com.mymoney.service.SavingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/savings")
public class SavingsController {

    @Autowired
    private SavingsService savingsService;

    @GetMapping
    public ResponseEntity<List<Savings>> getSavingsHistory(Principal principal) {
        return ResponseEntity.ok(savingsService.getSavingsHistory(principal.getName()));
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getTotalSavings(Principal principal) {
        BigDecimal total = savingsService.getTotalSavings(principal.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("totalSavings", total);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Savings> addSavings(@RequestBody Savings savings, Principal principal) {
        return ResponseEntity.ok(savingsService.addSavings(principal.getName(), savings));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSavingsRecord(@PathVariable Long id, Principal principal) {
        savingsService.deleteSavingsRecord(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
