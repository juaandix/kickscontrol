package com.kickscontrol.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CartResponseDto {
    private List<CartItemResponseDto> items;
    private Integer totalItems;
    private BigDecimal totalAmount;
}
