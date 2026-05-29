package com.kickscontrol.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TopSellerDto {
    private Long productId;
    private String productName;
    private String brand;
    private Long unitsSold;
    private BigDecimal revenue;
}
