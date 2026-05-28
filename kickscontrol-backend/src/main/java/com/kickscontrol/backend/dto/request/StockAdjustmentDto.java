package com.kickscontrol.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockAdjustmentDto {

    @NotNull(message = "Quantity delta is required")
    private Integer delta;

    @NotBlank(message = "Reason is required")
    private String reason;
}
