package com.mymoney.controller;

import com.mymoney.model.Subscription;
import com.mymoney.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<List<Subscription>> getSubscriptions(Principal principal) {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<Subscription> createSubscription(@RequestBody Subscription subscription, Principal principal) {
        return ResponseEntity.ok(subscriptionService.createSubscription(principal.getName(), subscription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscription> updateSubscription(
            @PathVariable Long id,
            @RequestBody Subscription subscription,
            Principal principal
    ) {
        return ResponseEntity.ok(subscriptionService.updateSubscription(id, principal.getName(), subscription));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubscription(@PathVariable Long id, Principal principal) {
        subscriptionService.deleteSubscription(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
