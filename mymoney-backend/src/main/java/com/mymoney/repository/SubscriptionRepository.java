package com.mymoney.repository;

import com.mymoney.model.Subscription;
import com.mymoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findAllByUserOrderByRenewalDateAsc(User user);
}
