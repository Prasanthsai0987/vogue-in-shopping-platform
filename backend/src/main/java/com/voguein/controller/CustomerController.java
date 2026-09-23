package com.voguein.controller;

import com.voguein.model.Customer;
import com.voguein.service.CustomerService;
import com.voguein.model.CustomerLoginRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:3000"
        },
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Customer> create(
            @RequestBody Customer customer) {

        return ResponseEntity.ok(
                service.createCustomer(customer)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<Customer> login(
            @RequestBody CustomerLoginRequest request) {

        return service.loginCustomer(
                        request.getEmail(),
                        request.getPasskey()
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> get(
            @PathVariable String id) {

        return service.getCustomer(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Customer> getByEmail(
            @PathVariable String email) {

        return service.getCustomerByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(
            @PathVariable String id,
            @RequestBody Customer customer) {

        return ResponseEntity.ok(
                service.updateCustomer(id, customer)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        service.deleteCustomer(id);

        return ResponseEntity.noContent().build();
    }
}