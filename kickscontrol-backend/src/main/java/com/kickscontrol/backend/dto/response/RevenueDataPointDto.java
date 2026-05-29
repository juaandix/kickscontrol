package com.kickscontrol.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class RevenueDataPointDto {
    private String date;
    private BigDecimal revenue;
    private Long orders;
}
