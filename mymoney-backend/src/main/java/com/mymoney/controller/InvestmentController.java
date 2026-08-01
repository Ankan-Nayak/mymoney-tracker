package com.mymoney.controller;

import com.mymoney.model.Investment;
import com.mymoney.service.InvestmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    @Autowired
    private InvestmentService investmentService;

    @GetMapping
    public ResponseEntity<List<Investment>> getInvestments(Principal principal) {
        return ResponseEntity.ok(investmentService.getAllInvestments(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<Investment> createInvestment(@RequestBody Investment investment, Principal principal) {
        return ResponseEntity.ok(investmentService.createInvestment(principal.getName(), investment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investment> updateInvestment(@PathVariable Long id, @RequestBody Investment investment, Principal principal) {
        return ResponseEntity.ok(investmentService.updateInvestment(id, principal.getName(), investment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvestment(@PathVariable Long id, Principal principal) {
        investmentService.deleteInvestment(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
