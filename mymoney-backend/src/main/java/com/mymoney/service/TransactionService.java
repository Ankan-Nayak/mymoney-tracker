package com.mymoney.service;

import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.Transaction;
import com.mymoney.model.TransactionType;
import com.mymoney.model.User;
import com.mymoney.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserService userService;

    @Value("${mymoney.upload.dir}")
    private String uploadDir;

    public List<Transaction> getActiveTransactions(String username) {
        User user = userService.findByUsername(username);
        return transactionRepository.findAllByUserAndDeletedFalseOrderByDateDescTimeDesc(user);
    }

    public List<Transaction> getDeletedTransactions(String username) {
        User user = userService.findByUsername(username);
        return transactionRepository.findAllByUserAndDeletedTrueOrderByDateDescTimeDesc(user);
    }

    public Transaction getTransactionById(Long id, String username) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id " + id));
        if (!transaction.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized access to transaction");
        }
        return transaction;
    }

    public Transaction createTransaction(String username, Transaction transaction, MultipartFile file) throws IOException {
        User user = userService.findByUsername(username);
        transaction.setUser(user);
        
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }
        if (transaction.getTime() == null) {
            transaction.setTime(LocalTime.now());
        }
        if (transaction.getCurrency() == null) {
            transaction.setCurrency(user.getCurrency());
        }

        if (file != null && !file.isEmpty()) {
            String receiptPath = saveReceiptFile(file);
            transaction.setReceiptImage(receiptPath);
        }

        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, String username, Transaction updatedDetails, MultipartFile file) throws IOException {
        Transaction transaction = getTransactionById(id, username);

        transaction.setAmount(updatedDetails.getAmount());
        transaction.setType(updatedDetails.getType());
        transaction.setMainCategory(updatedDetails.getMainCategory());
        transaction.setSubcategory(updatedDetails.getSubcategory());
        transaction.setCustomCategory(updatedDetails.getCustomCategory());
        transaction.setDescription(updatedDetails.getDescription());
        transaction.setNotes(updatedDetails.getNotes());
        transaction.setMerchant(updatedDetails.getMerchant());
        transaction.setPaymentMethod(updatedDetails.getPaymentMethod());
        transaction.setCurrency(updatedDetails.getCurrency());
        transaction.setTags(updatedDetails.getTags());

        if (updatedDetails.getDate() != null) {
            transaction.setDate(updatedDetails.getDate());
        }
        if (updatedDetails.getTime() != null) {
            transaction.setTime(updatedDetails.getTime());
        }

        if (file != null && !file.isEmpty()) {
            String receiptPath = saveReceiptFile(file);
            transaction.setReceiptImage(receiptPath);
        }

        return transactionRepository.save(transaction);
    }

    public void softDeleteTransaction(Long id, String username) {
        Transaction transaction = getTransactionById(id, username);
        transaction.setDeleted(true);
        transactionRepository.save(transaction);
    }

    public Transaction restoreTransaction(Long id, String username) {
        Transaction transaction = getTransactionById(id, username);
        transaction.setDeleted(false);
        return transactionRepository.save(transaction);
    }

    public void hardDeleteTransaction(Long id, String username) {
        Transaction transaction = getTransactionById(id, username);
        transactionRepository.delete(transaction);
    }

    private String saveReceiptFile(MultipartFile file) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());

        return "/uploads/" + fileName;
    }

    // Advanced search and filters
    public List<Transaction> filterTransactions(
            String username,
            String category,
            String subcategory,
            String customCategory,
            String merchant,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            String paymentMethod,
            LocalDate startDate,
            LocalDate endDate,
            String currency,
            String tag,
            String search
    ) {
        List<Transaction> list = getActiveTransactions(username);

        return list.stream()
                .filter(t -> category == null || t.getMainCategory().equalsIgnoreCase(category))
                .filter(t -> subcategory == null || (t.getSubcategory() != null && t.getSubcategory().equalsIgnoreCase(subcategory)))
                .filter(t -> customCategory == null || (t.getCustomCategory() != null && t.getCustomCategory().toLowerCase().contains(customCategory.toLowerCase())))
                .filter(t -> merchant == null || (t.getMerchant() != null && t.getMerchant().toLowerCase().contains(merchant.toLowerCase())))
                .filter(t -> minAmount == null || t.getAmount().compareTo(minAmount) >= 0)
                .filter(t -> maxAmount == null || t.getAmount().compareTo(maxAmount) <= 0)
                .filter(t -> paymentMethod == null || (t.getPaymentMethod() != null && t.getPaymentMethod().equalsIgnoreCase(paymentMethod)))
                .filter(t -> startDate == null || !t.getDate().isBefore(startDate))
                .filter(t -> endDate == null || !t.getDate().isAfter(endDate))
                .filter(t -> currency == null || t.getCurrency().equalsIgnoreCase(currency))
                .filter(t -> tag == null || (t.getTags() != null && t.getTags().toLowerCase().contains(tag.toLowerCase())))
                .filter(t -> search == null || (
                        (t.getDescription() != null && t.getDescription().toLowerCase().contains(search.toLowerCase())) ||
                        (t.getMerchant() != null && t.getMerchant().toLowerCase().contains(search.toLowerCase())) ||
                        (t.getNotes() != null && t.getNotes().toLowerCase().contains(search.toLowerCase())) ||
                        (t.getMainCategory().toLowerCase().contains(search.toLowerCase()))
                ))
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalIncome(String username) {
        User user = userService.findByUsername(username);
        return transactionRepository.sumAmountByUserAndType(user, TransactionType.INCOME);
    }

    public BigDecimal getTotalExpenses(String username) {
        User user = userService.findByUsername(username);
        return transactionRepository.sumAmountByUserAndType(user, TransactionType.EXPENSE);
    }
}
