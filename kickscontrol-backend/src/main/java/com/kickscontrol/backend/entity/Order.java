package com.kickscontrol.backend.entity;

import com.kickscontrol.backend.entity.enums.OrderStatus;
import com.kickscontrol.backend.entity.enums.PaymentMethod;
import com.kickscontrol.backend.entity.enums.SalesChannel;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_user_id", columnList = "user_id"),
    @Index(name = "idx_orders_status", columnList = "status"),
    @Index(name = "idx_orders_created_at_status", columnList = "created_at, status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ONLINE: the customer who bought it. STORE: the member of staff who rang it up at the till
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private SalesChannel channel = SalesChannel.ONLINE;

    // Till sales only; online orders are paid by card at checkout
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 10)
    private PaymentMethod paymentMethod;

    // Cash handed over at the till, to print the change on the ticket
    @Column(name = "cash_given", precision = 10, scale = 2)
    private BigDecimal cashGiven;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    // A page of orders loads its items in a few IN queries instead of one per order
    @BatchSize(size = 50)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
