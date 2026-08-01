package com.mymoney.service;

import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.Subscription;
import com.mymoney.model.User;
import com.mymoney.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserService userService;

    public List<Subscription> getAllSubscriptions(String username) {
        User user = userService.findByUsername(username);
        return subscriptionRepository.findAllByUserOrderByRenewalDateAsc(user);
    }

    public Subscription createSubscription(String username, Subscription subscription) {
        User user = userService.findByUsername(username);
        subscription.setUser(user);
        return subscriptionRepository.save(subscription);
    }

    public Subscription updateSubscription(Long id, String username, Subscription details) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (!sub.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        sub.setName(details.getName());
        sub.setCost(details.getCost());
        sub.setBillingCycle(details.getBillingCycle());
        sub.setRenewalDate(details.getRenewalDate());
        sub.setNotes(details.getNotes());
        return subscriptionRepository.save(sub);
    }

    public void deleteSubscription(Long id, String username) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (!sub.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        subscriptionRepository.delete(sub);
    }
}
