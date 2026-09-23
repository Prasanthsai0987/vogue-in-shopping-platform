package com.voguein.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Customers")
public class Customer {

    @Id
    private String id;

    private String name;
    private String email;
    private String phone;
    private String shippingAddress;
    private String city;
    private String state;
    private String pincode;
    private String passkey;


    public Customer() {
    }

    public Customer(String name,
                    String email,
                    String phone,
                    String shippingAddress,
                    String city,
                    String state,
                    String pincode) {

        this.name = name;
        this.email = email;
        this.phone = phone;
        this.shippingAddress = shippingAddress;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
    public String getPasskey() {
        return passkey;
    }

    public void setPasskey(String passkey) {
        this.passkey=passkey ;
    }
}