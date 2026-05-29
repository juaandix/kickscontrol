package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.AddToCartRequest;
import com.kickscontrol.backend.dto.response.CartResponseDto;

public interface CartService {
    CartResponseDto getCart(Long userId);
    CartResponseDto addItem(Long userId, AddToCartRequest request);
    CartResponseDto updateItemQuantity(Long userId, Long itemId, Integer quantity);
    CartResponseDto removeItem(Long userId, Long itemId);
    void clearCart(Long userId);
}
