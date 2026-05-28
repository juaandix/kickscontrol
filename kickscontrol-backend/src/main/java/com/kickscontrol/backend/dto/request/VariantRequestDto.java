package com.kickscontrol.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class VariantRequestDto {

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Color is required")
    private String color;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stockQuantity;

    private BigDecimal priceModifier = BigDecimal.ZERO;

    private String imageUrl;
}
