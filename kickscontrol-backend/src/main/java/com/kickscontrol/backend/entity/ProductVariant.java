package com.kickscontrol.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "product_variants",
    uniqueConstraints = @UniqueConstraint(columnNames = "sku")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "price_modifier", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal priceModifier = BigDecimal.ZERO;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Optimistic locking — protección contra race conditions en el checkout
    @Version
    private Long version;
}
