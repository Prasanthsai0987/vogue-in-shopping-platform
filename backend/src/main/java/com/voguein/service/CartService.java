package com.voguein.service;

import com.voguein.model.Cart;
import com.voguein.model.CartItem;
import com.voguein.repository.CartRepository;
import com.voguein.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;

    public CartService(
            CartRepository cartRepo,
            ProductRepository productRepo) {

        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
    }


    // =====================================================
    // GET CART
    // GET /api/cart/{customerId}
    // =====================================================

    public Cart getCart(String customerId) {

        return cartRepo.findByCustomerId(customerId)
                .orElseGet(() -> {

                    Cart cart = new Cart(customerId);

                    return cartRepo.save(cart);
                });
    }


    // =====================================================
    // ADD ITEM TO CART
    // POST /api/cart/{customerId}/items
    // =====================================================

    public Cart addItem(
            String customerId,
            String productId,
            Integer qty,
            String size) {

        System.out.println("========== CART SERVICE ==========");
        System.out.println("Customer ID : " + customerId);
        System.out.println("Product ID  : " + productId);
        System.out.println("Quantity    : " + qty);
        System.out.println("Size        : " + size);


        // =====================================================
        // VALIDATE QUANTITY
        // =====================================================

        if (qty == null || qty <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }


        // =====================================================
        // VALIDATE PRODUCT
        // =====================================================

        productRepo.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found: " + productId
                        )
                );


        System.out.println(
                "PRODUCT EXISTS: " + productId
        );


        // =====================================================
        // FIND EXISTING CART
        // =====================================================

        Cart cart =
                cartRepo.findByCustomerId(customerId)
                        .orElseGet(() -> {

                            System.out.println(
                                    "NO CART FOUND - CREATING NEW CART"
                            );

                            return new Cart(customerId);
                        });


        System.out.println(
                "CART BEFORE SAVE ID: " +
                        cart.getId()
        );


        // =====================================================
        // CHECK EXISTING ITEM
        // =====================================================

        for (CartItem item : cart.getItems()) {

            if (
                    item.getProductId().equals(productId)
                            &&
                            equalsSize(item.getSize(), size)
            ) {

                item.setQty(
                        item.getQty() + qty
                );


                Cart savedCart =
                        cartRepo.save(cart);


                System.out.println(
                        "EXISTING ITEM UPDATED"
                );

                System.out.println(
                        "SAVED CART ID: " +
                                savedCart.getId()
                );


                return savedCart;
            }
        }


        // =====================================================
        // ADD NEW ITEM
        // =====================================================

        CartItem newItem =
                new CartItem(
                        productId,
                        qty,
                        size
                );


        cart.getItems().add(newItem);


        System.out.println(
                "NEW ITEM ADDED TO CART OBJECT"
        );


        // =====================================================
        // SAVE TO MONGODB
        // =====================================================

        Cart savedCart =
                cartRepo.save(cart);


        System.out.println(
                "================================="
        );

        System.out.println(
                "CART SUCCESSFULLY SAVED"
        );

        System.out.println(
                "Mongo Cart ID : " +
                        savedCart.getId()
        );

        System.out.println(
                "Customer ID   : " +
                        savedCart.getCustomerId()
        );

        System.out.println(
                "Number Items  : " +
                        savedCart.getItems().size()
        );

        System.out.println(
                "=================================");


        return savedCart;
    }


    // =====================================================
    // UPDATE CART ITEM
    // PUT /api/cart/{customerId}/items/{productId}
    // =====================================================

    public Cart updateItem(
            String customerId,
            String productId,
            Integer qty,
            String size) {

        if (qty == null || qty <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }

        Cart cart = cartRepo.findByCustomerId(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        for (CartItem item : cart.getItems()) {

            if (item.getProductId().equals(productId)
                    && equalsSize(item.getSize(), size)) {

                item.setQty(qty);

                return cartRepo.save(cart);
            }
        }

        throw new RuntimeException(
                "Cart item not found"
        );
    }


    // =====================================================
    // REMOVE ITEM
    // DELETE /api/cart/{customerId}/items/{productId}
    // =====================================================

    public Cart removeItem(
            String customerId,
            String productId,
            String size) {

        Cart cart = cartRepo.findByCustomerId(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        boolean removed = cart.getItems().removeIf(
                item ->
                        item.getProductId().equals(productId)
                                && equalsSize(item.getSize(), size)
        );

        if (!removed) {
            throw new RuntimeException(
                    "Cart item not found"
            );
        }

        return cartRepo.save(cart);
    }


    // =====================================================
    // CLEAR CART
    // DELETE /api/cart/{customerId}
    // =====================================================

    public void clearCart(String customerId) {

        Cart cart = cartRepo.findByCustomerId(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        cart.getItems().clear();

        cartRepo.save(cart);
    }


    // =====================================================
    // SIZE COMPARISON
    // =====================================================

    private boolean equalsSize(String size1, String size2) {

        if (size1 == null && size2 == null) {
            return true;
        }

        if (size1 == null || size2 == null) {
            return false;
        }

        return size1.equalsIgnoreCase(size2);
    }
}