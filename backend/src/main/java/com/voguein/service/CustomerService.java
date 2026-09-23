package com.voguein.service;

import com.voguein.model.Customer;
import com.voguein.model.CustomerLoginRequest;
import com.voguein.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepo;

    public CustomerService(CustomerRepository customerRepo) {
        this.customerRepo = customerRepo;
    }

    // Create new customer
    public Customer createCustomer(Customer customer) {

        if (customerRepo.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        return customerRepo.save(customer);
    }

    // Get customer by ID
    public Optional<Customer> getCustomer(String id) {
        return customerRepo.findById(id);
    }

    // Get customer by email
    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepo.findByEmail(email);
    }

    // Update existing customer
    public Customer updateCustomer(String id, Customer updatedCustomer) {

        Customer customer = customerRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found: " + id)
                );

        customer.setName(updatedCustomer.getName());
        customer.setEmail(updatedCustomer.getEmail());
        customer.setPhone(updatedCustomer.getPhone());
        customer.setShippingAddress(updatedCustomer.getShippingAddress());
        customer.setCity(updatedCustomer.getCity());
        customer.setState(updatedCustomer.getState());
        customer.setPincode(updatedCustomer.getPincode());

        return customerRepo.save(customer);
    }

    // Delete customer
    public void deleteCustomer(String id) {

        if (!customerRepo.existsById(id)) {
            throw new RuntimeException(
                    "Customer not found: " + id
            );
        }

        customerRepo.deleteById(id);
    }

    @PostMapping("/login")
    public ResponseEntity<Customer> login(
            @RequestBody CustomerLoginRequest request) {

        return customerRepo
                .findByEmailAndPasskey(
                        request.getEmail(),
                        request.getPasskey()
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public Optional<Customer> loginCustomer(String email, String passkey) {
        return customerRepo.findByEmailAndPasskey(email, passkey);
    }

}