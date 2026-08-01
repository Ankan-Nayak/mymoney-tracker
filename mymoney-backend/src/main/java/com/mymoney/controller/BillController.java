package com.mymoney.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mymoney.model.Bill;
import com.mymoney.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<Bill>> getBills(Principal principal) {
        return ResponseEntity.ok(billService.getAllBills(principal.getName()));
    }

    @GetMapping("/status")
    public ResponseEntity<List<Bill>> getBillsByStatus(@RequestParam boolean paid, Principal principal) {
        return ResponseEntity.ok(billService.getBillsByPaidStatus(principal.getName(), paid));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Bill> createBill(
            @RequestPart("bill") String billJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Principal principal
    ) throws IOException {
        Bill bill = objectMapper.readValue(billJson, Bill.class);
        return ResponseEntity.ok(billService.createBill(principal.getName(), bill, file));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Bill> updateBill(
            @PathVariable Long id,
            @RequestPart("bill") String billJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Principal principal
    ) throws IOException {
        Bill bill = objectMapper.readValue(billJson, Bill.class);
        return ResponseEntity.ok(billService.updateBill(id, principal.getName(), bill, file));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Bill> markBillAsPaid(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(billService.markAsPaid(id, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Long id, Principal principal) {
        billService.deleteBill(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
