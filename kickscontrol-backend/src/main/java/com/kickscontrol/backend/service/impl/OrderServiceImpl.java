package com.kickscontrol.backend.service.impl;

import com.kickscontrol.backend.dto.request.CheckoutRequest;
import com.kickscontrol.backend.dto.response.OrderResponseDto;
import com.kickscontrol.backend.entity.*;
import com.kickscontrol.backend.entity.enums.OrderStatus;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.exception.InsufficientStockException;
import com.kickscontrol.backend.exception.ResourceNotFoundException;
import com.kickscontrol.backend.repository.*;
import com.kickscontrol.backend.service.CartService;
import com.kickscontrol.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    /**
     * Checkout transaccional con defensa en 3 capas contra race conditions:
     *
     * Capa 1 — @Version en ProductVariant (Optimistic Lock, ya activo desde Sprint 1)
     *   Hibernate detecta conflictos en memoria. Si dos transacciones leen version=5
     *   y ambas intentan escribir version=6, la segunda lanza OptimisticLockingFailureException.
     *
     * Capa 2 — SELECT FOR UPDATE (Pessimistic Lock, en findByIdForUpdate)
     *   Bloquea la fila de variant en BD durante toda la transacción. Garantía absoluta
     *   de que nadie más puede leer ni escribir esa fila hasta que hagamos commit.
     *
     * Capa 3 — CHECK (stock_quantity >= 0) en PostgreSQL
     *   Safety net de base de datos. Aunque un bug bypasara las capas 1 y 2,
     *   la BD rechazaría el UPDATE con un ConstraintViolationException.
     */
    @Override
    @Transactional
    public OrderResponseDto checkout(Long userId, CheckoutRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // Capa 2: adquirimos lock pesimista sobre cada variante antes de tocar el stock
        for (CartItem cartItem : cartItems) {
            ProductVariant variant = variantRepository
                    .findByIdForUpdate(cartItem.getVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", cartItem.getVariant().getId()));

            int requested = cartItem.getQuantity();

            // Capa 1 + validación explícita: si el stock no alcanza, rollback total
            if (variant.getStockQuantity() < requested) {
                throw new InsufficientStockException(
                        variant.getSku(), requested, variant.getStockQuantity()
                );
            }

            // Descontar stock — Capa 3 (CHECK >= 0) actúa como red de seguridad en la BD
            variant.setStockQuantity(variant.getStockQuantity() - requested);
            variantRepository.save(variant);

            // Snapshot del precio en el momento de compra
            BigDecimal unitPrice = variant.getProduct().getBasePrice()
                    .add(variant.getPriceModifier());

            OrderItem orderItem = OrderItem.builder()
                    .variant(variant)
                    .quantity(requested)
                    .unitPrice(unitPrice)
                    .build();

            orderItems.add(orderItem);
            total = total.add(unitPrice.multiply(BigDecimal.valueOf(requested)));
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(total)
                .shippingAddress(request.getShippingAddress())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Order saved = orderRepository.save(order);

        // Vaciar carrito tras checkout exitoso
        cartService.clearCart(userId);

        log.info("Checkout completed — orderId: {}, userId: {}, total: {}, items: {}",
                saved.getId(), userId, total, orderItems.size());

        return OrderResponseDto.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponseDto> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderResponseDto::summary);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getUserOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return OrderResponseDto.from(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponseDto> getAllOrders(OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                    .map(OrderResponseDto::summary);
        }
        return orderRepository.findAll(pageable).map(OrderResponseDto::summary);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        order.setStatus(newStatus);
        return OrderResponseDto.summary(orderRepository.save(order));
    }
}
