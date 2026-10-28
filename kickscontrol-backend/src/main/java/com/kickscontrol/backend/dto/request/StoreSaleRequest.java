package com.kickscontrol.backend.dto.request;

import com.kickscontrol.backend.entity.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

/** A ticket rung up at the till: the boxes on the counter and how the customer pays. */
@Getter
@Setter
public class StoreSaleRequest {

    @NotEmpty(message = "A ticket needs at least one line")
    @Valid
    private List<Line> items;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    // Cash only: what the customer handed over
    @DecimalMin(value = "0.00", message = "Cash given cannot be negative")
    private BigDecimal cashGiven;

    @Getter
    @Setter
    public static class Line {
        @NotNull(message = "Variant is required")
        private Long variantId;

        @NotNull
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
