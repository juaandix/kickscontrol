package com.kickscontrol.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderStatusCountDto {
    private String status;
    private Long count;
}
