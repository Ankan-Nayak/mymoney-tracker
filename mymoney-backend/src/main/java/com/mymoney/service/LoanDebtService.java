package com.mymoney.service;

import com.mymoney.exception.BadRequestException;
import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.LoanDebt;
import com.mymoney.model.User;
import com.mymoney.repository.LoanDebtRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class LoanDebtService {

    @Autowired
    private LoanDebtRepository loanDebtRepository;

    @Autowired
    private UserService userService;

    public List<LoanDebt> getAllLoans(String username) {
        User user = userService.findByUsername(username);
        return loanDebtRepository.findAllByUserOrderByLoanDateDesc(user);
    }

    public List<LoanDebt> getLoansByStatus(String username, boolean completed) {
        User user = userService.findByUsername(username);
        return loanDebtRepository.findAllByUserAndCompletedOrderByLoanDateDesc(user, completed);
    }

    public LoanDebt createLoan(String username, LoanDebt loan) {
        User user = userService.findByUsername(username);
        loan.setUser(user);
        if (loan.getAmountPaid() == null) {
            loan.setAmountPaid(BigDecimal.ZERO);
        }
        if (loan.getLoanDate() == null) {
            loan.setLoanDate(LocalDate.now());
        }
        // Auto-complete if already paid off
        loan.setCompleted(loan.getAmountPaid().compareTo(loan.getAmount()) >= 0);
        return loanDebtRepository.save(loan);
    }

    public LoanDebt updateLoan(Long id, String username, LoanDebt details) {
        LoanDebt loan = loanDebtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan record not found"));
        if (!loan.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        loan.setPersonName(details.getPersonName());
        loan.setAmount(details.getAmount());
        loan.setAmountPaid(details.getAmountPaid());
        loan.setDueDate(details.getDueDate());
        loan.setType(details.getType());
        loan.setNotes(details.getNotes());
        
        loan.setCompleted(loan.getAmountPaid().compareTo(loan.getAmount()) >= 0);
        return loanDebtRepository.save(loan);
    }

    public LoanDebt recordPayment(Long id, String username, BigDecimal paymentAmount) {
        LoanDebt loan = loanDebtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan record not found"));
        if (!loan.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }

        BigDecimal remaining = loan.getAmount().subtract(loan.getAmountPaid());
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }
        if (paymentAmount.compareTo(remaining) > 0) {
            throw new BadRequestException("Payment amount exceeds remaining due amount: " + remaining);
        }

        loan.setAmountPaid(loan.getAmountPaid().add(paymentAmount));
        loan.setCompleted(loan.getAmountPaid().compareTo(loan.getAmount()) >= 0);
        return loanDebtRepository.save(loan);
    }

    public void deleteLoan(Long id, String username) {
        LoanDebt loan = loanDebtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan record not found"));
        if (!loan.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        loanDebtRepository.delete(loan);
    }
}
