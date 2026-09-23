package com.voguein.repository;

import com.voguein.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByEmailAndPasskey(String email, String passkey);

}