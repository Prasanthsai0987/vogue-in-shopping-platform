
package com.voguein.controller;

import com.voguein.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/uploads")
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    public ImageUploadController(
            CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping(
            value = "/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        try {
            return ResponseEntity.ok(
                    cloudinaryService.uploadProductImage(file)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        } catch (IOException e) {
            return ResponseEntity.status(
                    HttpStatus.BAD_GATEWAY
            ).body(Map.of(
                    "error", "Image upload failed. Please try again."
            ));
        }
    }
}
