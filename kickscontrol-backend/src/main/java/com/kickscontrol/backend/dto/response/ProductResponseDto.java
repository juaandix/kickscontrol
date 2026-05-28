package com.kickscontrol.backend.dto.response;

import com.kickscontrol.backend.entity.Product;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class ProductResponseDto {
    private Long id;
    private String name;
    private String brand;
    private String description;
    private String gender;
    private String category;
    private BigDecimal basePrice;
    private String imageUrl;
    private Boolean isActive;
    private List<VariantResponseDto> variants;
    private Integer totalStock;

    public static ProductResponseDto from(Product p) {
        List<VariantResponseDto> variants = p.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(VariantResponseDto::from)
                .toList();

        int totalStock = variants.stream()
                .mapToInt(VariantResponseDto::getStockQuantity)
                .sum();

        return ProductResponseDto.builder()
                .id(p.getId())
                .name(p.getName())
                .brand(p.getBrand())
                .description(p.getDescription())
                .gender(p.getGender())
                .category(p.getCategory())
                .basePrice(p.getBasePrice())
                .imageUrl(p.getImageUrl())
                .isActive(p.getIsActive())
                .variants(variants)
                .totalStock(totalStock)
                .build();
    }

    public static ProductResponseDto summary(Product p) {
        int totalStock = p.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .mapToInt(v -> v.getStockQuantity())
                .sum();

        return ProductResponseDto.builder()
                .id(p.getId())
                .name(p.getName())
                .brand(p.getBrand())
                .description(p.getDescription())
                .gender(p.getGender())
                .category(p.getCategory())
                .basePrice(p.getBasePrice())
                .imageUrl(p.getImageUrl())
                .isActive(p.getIsActive())
                .variants(List.of())
                .totalStock(totalStock)
                .build();
    }
}
