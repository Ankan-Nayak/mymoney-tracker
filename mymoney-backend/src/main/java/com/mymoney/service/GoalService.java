package com.mymoney.service;

import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.Goal;
import com.mymoney.model.User;
import com.mymoney.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserService userService;

    public List<Goal> getAllGoals(String username) {
        User user = userService.findByUsername(username);
        return goalRepository.findAllByUser(user);
    }

    public Goal createGoal(String username, Goal goal) {
        User user = userService.findByUsername(username);
        goal.setUser(user);
        if (goal.getCurrentSavedAmount() == null) {
            goal.setCurrentSavedAmount(BigDecimal.ZERO);
        }
        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, String username, Goal details) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        if (!goal.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        goal.setName(details.getName());
        goal.setTargetAmount(details.getTargetAmount());
        goal.setCurrentSavedAmount(details.getCurrentSavedAmount());
        goal.setTargetDate(details.getTargetDate());
        goal.setNotes(details.getNotes());
        return goalRepository.save(goal);
    }

    public Goal addFundsToGoal(Long id, String username, BigDecimal amount) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        if (!goal.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        goal.setCurrentSavedAmount(goal.getCurrentSavedAmount().add(amount));
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id, String username) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        if (!goal.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        goalRepository.delete(goal);
    }

    public List<Map<String, Object>> getGoalsWithProgress(String username) {
        List<Goal> goals = getAllGoals(username);
        return goals.stream().map(g -> {
            BigDecimal progress = BigDecimal.ZERO;
            if (g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
                progress = g.getCurrentSavedAmount().multiply(new BigDecimal(100))
                        .divide(g.getTargetAmount(), 2, RoundingMode.HALF_UP);
            }
            Map<String, Object> map = new HashMap<>();
            map.put("id", g.getId());
            map.put("name", g.getName());
            map.put("targetAmount", g.getTargetAmount());
            map.put("currentSavedAmount", g.getCurrentSavedAmount());
            map.put("targetDate", g.getTargetDate() != null ? g.getTargetDate().toString() : "");
            map.put("notes", g.getNotes() != null ? g.getNotes() : "");
            map.put("progressPercentage", progress);
            map.put("completed", g.getCurrentSavedAmount().compareTo(g.getTargetAmount()) >= 0);
            return map;
        }).collect(Collectors.toList());
    }
}
