
package com.voguein.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, Object> uploadProductImage(
            MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select an image.");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.matches("image/(jpeg|png|webp)")) {
            throw new IllegalArgumentException(
                    "Only JPG, PNG, and WebP images are allowed.");
        }

        // Limit the upload to 5 MB.
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 5 MB.");
        }

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "voguein/products",
                        "resource_type", "image",
                        "allowed_formats",
                        new String[]{"jpg", "jpeg", "png", "webp"}
                )
        );

        return Map.of(
                "url", result.get("secure_url"),
                "publicId", result.get("public_id")
        );
    }
}
