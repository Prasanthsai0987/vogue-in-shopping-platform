package com.voguein.repository;

import com.voguein.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByPaymentRef(String paymentRef);
    Optional<Payment> findByOrderId(String orderId);
}
