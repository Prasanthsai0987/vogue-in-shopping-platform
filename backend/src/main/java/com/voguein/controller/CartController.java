package com.voguein.controller;

import com.voguein.model.Cart;
import com.voguein.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:3000",
                "https://vogue-in-shopping-platform-ef8y54uvj-prasanthsai0987s-projects.vercel.app"
        },
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        },
        allowedHeaders = "*"
)
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }


    // =====================================================
    // GET CART
    // GET /api/cart/{customerId}
    // =====================================================

    @GetMapping("/{customerId}")
    public ResponseEntity<Cart> getCart(
            @PathVariable String customerId) {

        return ResponseEntity.ok(
                service.getCart(customerId)
        );
    }


    // =====================================================
    // ADD ITEM
    // POST /api/cart/{customerId}/items
    // =====================================================

    @PostMapping("/{customerId}/items")
    public ResponseEntity<Cart> addItem(
            @PathVariable String customerId,
            @RequestBody CartItemRequest request) {

        System.out.println("=================================");
        System.out.println("ADD TO CART REQUEST RECEIVED");
        System.out.println("Customer ID : " + customerId);
        System.out.println("Product ID  : " + request.getProductId());
        System.out.println("Quantity    : " + request.getQty());
        System.out.println("Size        : " + request.getSize());
        System.out.println("=================================");

        Cart cart = service.addItem(
                customerId,
                request.getProductId(),
                request.getQty(),
                request.getSize()
        );

        System.out.println("CART SAVED:");
        System.out.println("Cart ID     : " + cart.getId());
        System.out.println("Customer ID : " + cart.getCustomerId());
        System.out.println("Items       : " + cart.getItems().size());

        return ResponseEntity.ok(cart);
    }

    // =====================================================
    // UPDATE ITEM
    // PUT /api/cart/{customerId}/items/{productId}
    // =====================================================

    @PutMapping("/{customerId}/items/{productId}")
    public ResponseEntity<Cart> updateItem(
            @PathVariable String customerId,
            @PathVariable String productId,
            @RequestBody CartItemRequest request) {

        return ResponseEntity.ok(
                service.updateItem(
                        customerId,
                        productId,
                        request.getQty(),
                        request.getSize()
                )
        );
    }


    // =====================================================
    // REMOVE ITEM
    // DELETE /api/cart/{customerId}/items/{productId}
    // =====================================================

    @DeleteMapping("/{customerId}/items/{productId}")
    public ResponseEntity<Cart> removeItem(
            @PathVariable String customerId,
            @PathVariable String productId,
            @RequestParam(required = false) String size) {

        return ResponseEntity.ok(
                service.removeItem(
                        customerId,
                        productId,
                        size
                )
        );
    }


    // =====================================================
    // CLEAR CART
    // DELETE /api/cart/{customerId}
    // =====================================================

    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> clearCart(
            @PathVariable String customerId) {

        service.clearCart(customerId);

        return ResponseEntity.noContent().build();
    }


    // =====================================================
    // REQUEST CLASS
    // =====================================================

    public static class CartItemRequest {

        private String productId;
        private Integer qty;
        private String size;

        public CartItemRequest() {
        }

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public Integer getQty() {
            return qty;
        }

        public void setQty(Integer qty) {
            this.qty = qty;
        }

        public String getSize() {
            return size;
        }

        public void setSize(String size) {
            this.size = size;
        }
    }
}