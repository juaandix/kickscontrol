package com.kickscontrol.backend.dto.response;

import com.kickscontrol.backend.entity.CartItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CartItemResponseDto {
    private Long id;
    private Long variantId;
    private String sku;
    private String size;
    private String color;
    private String productName;
    private String productBrand;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private Integer availableStock;

    public static CartItemResponseDto from(CartItem item) {
        var variant = item.getVariant();
        var product = variant.getProduct();
        BigDecimal unitPrice = product.getBasePrice().add(variant.getPriceModifier());
        return CartItemResponseDto.builder()
                .id(item.getId())
                .variantId(variant.getId())
                .sku(variant.getSku())
                .size(variant.getSize())
                .color(variant.getColor())
                .productName(product.getName())
                .productBrand(product.getBrand())
                .imageUrl(variant.getImageUrl() != null ? variant.getImageUrl() : product.getImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                .availableStock(variant.getStockQuantity())
                .build();
    }
}
