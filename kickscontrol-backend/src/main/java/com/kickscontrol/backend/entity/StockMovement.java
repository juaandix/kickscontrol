package com.kickscontrol.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** One manual change to a variant's stock. Sales are not logged here: they live in order_items. */
@Entity
@Table(name = "stock_movements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // Nullable: the movement outlives the staff account that made it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Integer delta;

    // Stored as the shop-floor label (RECEPCIÓN, MERMA…), see StockMovementReason
    @Column(nullable = false, length = 20)
    private String reason;

    @Column(name = "stock_after", nullable = false)
    private Integer stockAfter;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
