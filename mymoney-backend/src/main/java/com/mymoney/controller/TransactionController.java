package com.mymoney.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mymoney.model.Transaction;
import com.mymoney.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(Principal principal) {
        return ResponseEntity.ok(transactionService.getActiveTransactions(principal.getName()));
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<Transaction>> getDeletedTransactions(Principal principal) {
        return ResponseEntity.ok(transactionService.getDeletedTransactions(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(transactionService.getTransactionById(id, principal.getName()));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Transaction> createTransaction(
            @RequestPart("transaction") String transactionJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Principal principal
    ) throws IOException {
        Transaction transaction = objectMapper.readValue(transactionJson, Transaction.class);
        Transaction saved = transactionService.createTransaction(principal.getName(), transaction, file);
        return ResponseEntity.ok(saved);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable Long id,
            @RequestPart("transaction") String transactionJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Principal principal
    ) throws IOException {
        Transaction details = objectMapper.readValue(transactionJson, Transaction.class);
        Transaction updated = transactionService.updateTransaction(id, principal.getName(), details, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDeleteTransaction(@PathVariable Long id, Principal principal) {
        transactionService.softDeleteTransaction(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Transaction> restoreTransaction(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(transactionService.restoreTransaction(id, principal.getName()));
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<?> hardDeleteTransaction(@PathVariable Long id, Principal principal) {
        transactionService.hardDeleteTransaction(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Transaction>> filterTransactions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String customCategory,
            @RequestParam(required = false) String merchant,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            Principal principal
    ) {
        List<Transaction> result = transactionService.filterTransactions(
                principal.getName(), category, subcategory, customCategory, merchant,
                minAmount, maxAmount, paymentMethod, startDate, endDate, currency, tag, search
        );
        return ResponseEntity.ok(result);
    }
}
