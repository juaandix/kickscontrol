package com.kickscontrol.backend.entity.enums;

import java.util.List;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    /** Orders that count as a sale: paid, whether still in the warehouse, on the way or handed over. */
    public static final List<OrderStatus> SOLD = List.of(CONFIRMED, SHIPPED, DELIVERED);
}
