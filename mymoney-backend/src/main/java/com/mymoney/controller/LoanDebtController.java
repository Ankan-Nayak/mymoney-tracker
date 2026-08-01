package com.mymoney.controller;

import com.mymoney.model.LoanDebt;
import com.mymoney.service.LoanDebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanDebtController {

    @Autowired
    private LoanDebtService loanDebtService;

    @GetMapping
    public ResponseEntity<List<LoanDebt>> getLoans(Principal principal) {
        return ResponseEntity.ok(loanDebtService.getAllLoans(principal.getName()));
    }

    @GetMapping("/status")
    public ResponseEntity<List<LoanDebt>> getLoansByStatus(
            @RequestParam boolean completed,
            Principal principal
    ) {
        return ResponseEntity.ok(loanDebtService.getLoansByStatus(principal.getName(), completed));
    }

    @PostMapping
    public ResponseEntity<LoanDebt> createLoan(@RequestBody LoanDebt loan, Principal principal) {
        return ResponseEntity.ok(loanDebtService.createLoan(principal.getName(), loan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanDebt> updateLoan(
            @PathVariable Long id,
            @RequestBody LoanDebt loan,
            Principal principal
    ) {
        return ResponseEntity.ok(loanDebtService.updateLoan(id, principal.getName(), loan));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<LoanDebt> recordPayment(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            Principal principal
    ) {
        return ResponseEntity.ok(loanDebtService.recordPayment(id, principal.getName(), amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLoan(@PathVariable Long id, Principal principal) {
        loanDebtService.deleteLoan(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
