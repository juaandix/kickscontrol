package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.CheckoutRequest;
import com.kickscontrol.backend.dto.request.StoreSaleRequest;
import com.kickscontrol.backend.dto.response.OrderResponseDto;
import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    OrderResponseDto checkout(Long userId, CheckoutRequest request);
    OrderResponseDto storeSale(User staff, StoreSaleRequest request);
    List<OrderResponseDto> getStoreSalesSince(LocalDateTime since);
    Page<OrderResponseDto> getUserOrders(Long userId, Pageable pageable);
    OrderResponseDto getUserOrderById(Long userId, Long orderId);
    Page<OrderResponseDto> getAllOrders(OrderStatus status, Pageable pageable);
    OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus);
}
