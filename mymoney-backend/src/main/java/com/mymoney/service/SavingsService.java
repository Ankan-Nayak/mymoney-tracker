package com.mymoney.service;

import com.mymoney.exception.BadRequestException;
import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.Savings;
import com.mymoney.model.User;
import com.mymoney.repository.SavingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class SavingsService {

    @Autowired
    private SavingsRepository savingsRepository;

    @Autowired
    private UserService userService;

    public List<Savings> getSavingsHistory(String username) {
        User user = userService.findByUsername(username);
        return savingsRepository.findAllByUserOrderByDateDesc(user);
    }

    public BigDecimal getTotalSavings(String username) {
        List<Savings> list = getSavingsHistory(username);
        BigDecimal total = BigDecimal.ZERO;
        for (Savings s : list) {
            if (s.getType().equalsIgnoreCase("DEPOSIT")) {
                total = total.add(s.getAmount());
            } else if (s.getType().equalsIgnoreCase("WITHDRAW")) {
                total = total.subtract(s.getAmount());
            }
        }
        return total;
    }

    public Savings addSavings(String username, Savings savings) {
        User user = userService.findByUsername(username);
        
        if (savings.getType().equalsIgnoreCase("WITHDRAW")) {
            BigDecimal currentTotal = getTotalSavings(username);
            if (currentTotal.compareTo(savings.getAmount()) < 0) {
                throw new BadRequestException("Insufficient savings balance to perform withdrawal");
            }
        }

        savings.setUser(user);
        if (savings.getDate() == null) {
            savings.setDate(LocalDate.now());
        }

        return savingsRepository.save(savings);
    }

    public void deleteSavingsRecord(Long id, String username) {
        Savings savings = savingsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Savings record not found"));
        if (!savings.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        
        // If deleting a deposit, make sure it doesn't drop overall savings below zero if they have withdrawn.
        if (savings.getType().equalsIgnoreCase("DEPOSIT")) {
            BigDecimal currentTotal = getTotalSavings(username);
            if (currentTotal.subtract(savings.getAmount()).compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Cannot delete this deposit as it would result in a negative savings balance.");
            }
        }

        savingsRepository.delete(savings);
    }
}
