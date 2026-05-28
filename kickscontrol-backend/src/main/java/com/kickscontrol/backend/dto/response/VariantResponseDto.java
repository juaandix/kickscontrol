package com.kickscontrol.backend.dto.response;

import com.kickscontrol.backend.entity.ProductVariant;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class VariantResponseDto {
    private Long id;
    private String size;
    private String color;
    private String sku;
    private Integer stockQuantity;
    private BigDecimal priceModifier;
    private String imageUrl;
    private Boolean isActive;

    public static VariantResponseDto from(ProductVariant v) {
        return VariantResponseDto.builder()
                .id(v.getId())
                .size(v.getSize())
                .color(v.getColor())
                .sku(v.getSku())
                .stockQuantity(v.getStockQuantity())
                .priceModifier(v.getPriceModifier())
                .imageUrl(v.getImageUrl())
                .isActive(v.getIsActive())
                .build();
    }
}
