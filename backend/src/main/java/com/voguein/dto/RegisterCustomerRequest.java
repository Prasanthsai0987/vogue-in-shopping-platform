
package com.voguein.dto;

public record RegisterCustomerRequest(
        String name,
        String email,
        String password,
        String phone,
        String shippingAddress,
        String city,
        String state,
        String pincode
) {}
