
package com.voguein.dto;

import com.voguein.model.Customer;

public record CustomerResponse(
        String id,
        String name,
        String email,
        String phone,
        String shippingAddress,
        String city,
        String state,
        String pincode
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getShippingAddress(),
                customer.getCity(),
                customer.getState(),
                customer.getPincode()
        );
    }
}
