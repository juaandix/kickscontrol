package com.kickscontrol.backend.service.impl;

import com.kickscontrol.backend.dto.request.AddToCartRequest;
import com.kickscontrol.backend.dto.response.CartItemResponseDto;
import com.kickscontrol.backend.dto.response.CartResponseDto;
import com.kickscontrol.backend.entity.CartItem;
import com.kickscontrol.backend.entity.ProductVariant;
import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.exception.ResourceNotFoundException;
import com.kickscontrol.backend.repository.CartItemRepository;
import com.kickscontrol.backend.repository.ProductVariantRepository;
import com.kickscontrol.backend.repository.UserRepository;
import com.kickscontrol.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponseDto getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        return buildCartResponse(items);
    }

    @Override
    @Transactional
    public CartResponseDto addItem(Long userId, AddToCartRequest request) {
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", request.getVariantId()));

        validateStock(variant, request.getQuantity());

        cartItemRepository.findByUserIdAndVariantId(userId, variant.getId())
                .ifPresentOrElse(
                        existing -> {
                            int newQty = existing.getQuantity() + request.getQuantity();
                            validateStock(variant, newQty);
                            existing.setQuantity(newQty);
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            User user = userRepository.getReferenceById(userId);
                            CartItem item = CartItem.builder()
                                    .user(user)
                                    .variant(variant)
                                    .quantity(request.getQuantity())
                                    .build();
                            cartItemRepository.save(item);
                        }
                );

        return getCart(userId);
    }

    @Override
    @Transactional
    public CartResponseDto updateItemQuantity(Long userId, Long itemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            validateStock(item.getVariant(), quantity);
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(userId);
    }

    @Override
    @Transactional
    public CartResponseDto removeItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));
        cartItemRepository.delete(item);
        return getCart(userId);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private void validateStock(ProductVariant variant, int requestedQty) {
        if (variant.getStockQuantity() < requestedQty) {
            throw new BusinessException(
                    String.format("Only %d units available for SKU '%s'",
                            variant.getStockQuantity(), variant.getSku())
            );
        }
    }

    private CartResponseDto buildCartResponse(List<CartItem> items) {
        List<CartItemResponseDto> dtos = items.stream()
                .map(CartItemResponseDto::from)
                .toList();

        BigDecimal total = dtos.stream()
                .map(CartItemResponseDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = dtos.stream()
                .mapToInt(CartItemResponseDto::getQuantity)
                .sum();

        return CartResponseDto.builder()
                .items(dtos)
                .totalItems(totalItems)
                .totalAmount(total)
                .build();
    }
}
