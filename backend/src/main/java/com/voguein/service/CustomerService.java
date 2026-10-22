
package com.voguein.service;

import com.voguein.dto.RegisterCustomerRequest;
import com.voguein.model.Customer;
import com.voguein.repository.CustomerRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepo;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
            CustomerRepository customerRepo,
            PasswordEncoder passwordEncoder) {
        this.customerRepo = customerRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // Register a new customer.
    // Only name, email, and password are required.
    public Customer createCustomer(RegisterCustomerRequest request) {

        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String name = request.name().trim();
        String email = request.email().trim().toLowerCase();

        if (customerRepo.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        Customer customer = new Customer();
        customer.setName(name);
        customer.setEmail(email);
        customer.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        // Profile details are optional during signup.
        customer.setPhone(request.phone());
        customer.setShippingAddress(request.shippingAddress());
        customer.setCity(request.city());
        customer.setState(request.state());
        customer.setPincode(request.pincode());

        return customerRepo.save(customer);
    }

    // Find customer by ID.
    public Optional<Customer> getCustomer(String id) {
        return customerRepo.findById(id);
    }

    // Find customer by email.
    public Optional<Customer> getCustomerByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        return customerRepo.findByEmail(
                email.trim().toLowerCase()
        );
    }

    // Update profile as many times as needed.
    // Only non-null fields are changed.
    public Customer updateCustomer(
            String id,
            Customer updatedCustomer) {

        Customer customer = customerRepo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Customer not found")
                );

        if (updatedCustomer.getName() != null) {
            if (updatedCustomer.getName().isBlank()) {
                throw new IllegalArgumentException(
                        "Name cannot be blank"
                );
            }

            customer.setName(updatedCustomer.getName().trim());
        }

        if (updatedCustomer.getPhone() != null) {
            customer.setPhone(updatedCustomer.getPhone());
        }

        if (updatedCustomer.getShippingAddress() != null) {
            customer.setShippingAddress(
                    updatedCustomer.getShippingAddress()
            );
        }

        if (updatedCustomer.getCity() != null) {
            customer.setCity(updatedCustomer.getCity());
        }

        if (updatedCustomer.getState() != null) {
            customer.setState(updatedCustomer.getState());
        }

        if (updatedCustomer.getPincode() != null) {
            customer.setPincode(updatedCustomer.getPincode());
        }

        // Email and password cannot be changed through this method.
        return customerRepo.save(customer);
    }

    // Delete customer.
    public void deleteCustomer(String id) {
        if (!customerRepo.existsById(id)) {
            throw new IllegalArgumentException("Customer not found");
        }

        customerRepo.deleteById(id);
    }
}
