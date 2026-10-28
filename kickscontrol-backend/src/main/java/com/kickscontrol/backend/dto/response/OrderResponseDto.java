package com.kickscontrol.backend.dto.response;

import com.kickscontrol.backend.entity.Order;
import com.kickscontrol.backend.entity.enums.SalesChannel;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponseDto {
    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDto> items;
    private String channel;
    /** Till sales only */
    private String paymentMethod;
    private BigDecimal cashGiven;
    private BigDecimal change;
    /** Till sales only: the member of staff who rang it up */
    private String soldBy;

    public static OrderResponseDto from(Order order) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .items(order.getItems().stream().map(OrderItemResponseDto::from).toList())
                .channel(order.getChannel().name())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .cashGiven(order.getCashGiven())
                .change(order.getCashGiven() != null ? order.getCashGiven().subtract(order.getTotalAmount()) : null)
                .soldBy(order.getChannel() == SalesChannel.STORE
                        ? order.getUser().getFirstName() + " " + order.getUser().getLastName()
                        : null)
                .build();
    }

    public static OrderResponseDto summary(Order order) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .items(List.of())
                .channel(order.getChannel().name())
                .build();
    }
}
