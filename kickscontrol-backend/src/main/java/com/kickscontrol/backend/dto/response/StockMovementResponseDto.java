package com.kickscontrol.backend.dto.response;

import com.kickscontrol.backend.entity.StockMovement;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StockMovementResponseDto {
    private Long id;
    private Integer delta;
    private String reason;
    private Integer stockAfter;
    /** Who made the change; null when that account no longer exists */
    private String userName;
    private LocalDateTime createdAt;

    public static StockMovementResponseDto from(StockMovement m) {
        return StockMovementResponseDto.builder()
                .id(m.getId())
                .delta(m.getDelta())
                .reason(m.getReason())
                .stockAfter(m.getStockAfter())
                .userName(m.getUser() != null ? m.getUser().getFirstName() + " " + m.getUser().getLastName() : null)
                .createdAt(m.getCreatedAt())
                .build();
    }
}
