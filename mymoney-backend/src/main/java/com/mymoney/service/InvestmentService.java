package com.mymoney.service;

import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.Investment;
import com.mymoney.model.User;
import com.mymoney.repository.InvestmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private UserService userService;

    public List<Investment> getAllInvestments(String username) {
        User user = userService.findByUsername(username);
        return investmentRepository.findAllByUser(user);
    }

    public Investment createInvestment(String username, Investment investment) {
        User user = userService.findByUsername(username);
        investment.setUser(user);
        return investmentRepository.save(investment);
    }

    public Investment updateInvestment(Long id, String username, Investment details) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found"));
        if (!investment.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        investment.setName(details.getName());
        investment.setType(details.getType());
        investment.setInvestedAmount(details.getInvestedAmount());
        investment.setCurrentValue(details.getCurrentValue());
        investment.setNotes(details.getNotes());
        return investmentRepository.save(investment);
    }

    public void deleteInvestment(Long id, String username) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found"));
        if (!investment.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        investmentRepository.delete(investment);
    }
}
