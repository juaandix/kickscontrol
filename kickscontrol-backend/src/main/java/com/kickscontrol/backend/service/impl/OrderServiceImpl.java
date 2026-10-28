package com.kickscontrol.backend.service.impl;

import com.kickscontrol.backend.dto.request.CheckoutRequest;
import com.kickscontrol.backend.dto.request.StoreSaleRequest;
import com.kickscontrol.backend.dto.response.OrderResponseDto;
import com.kickscontrol.backend.entity.*;
import com.kickscontrol.backend.entity.enums.OrderStatus;
import com.kickscontrol.backend.entity.enums.PaymentMethod;
import com.kickscontrol.backend.entity.enums.SalesChannel;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

        List<OrderItem> orderItems = takeFromShelf(cartItems.stream()
                .map(ci -> new Line(ci.getVariant().getId(), ci.getQuantity()))
                .toList());
        BigDecimal total = totalOf(orderItems);

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

    /**
     * Venta en caja: mismo stock y misma defensa en 3 capas que el checkout online,
     * pero se cobra y se entrega en el mostrador, así que nace DELIVERED.
     */
    @Override
    @Transactional
    public OrderResponseDto storeSale(User staff, StoreSaleRequest request) {
        // El mismo SKU escaneado dos veces es una sola línea con las cantidades sumadas
        Map<Long, Integer> lines = new LinkedHashMap<>();
        for (StoreSaleRequest.Line line : request.getItems()) {
            lines.merge(line.getVariantId(), line.getQuantity(), Integer::sum);
        }

        List<OrderItem> orderItems = takeFromShelf(lines.entrySet().stream()
                .map(e -> new Line(e.getKey(), e.getValue()))
                .toList());
        BigDecimal total = totalOf(orderItems);

        BigDecimal cashGiven = null;
        if (request.getPaymentMethod() == PaymentMethod.CASH) {
            cashGiven = request.getCashGiven();
            if (cashGiven == null || cashGiven.compareTo(total) < 0) {
                throw new BusinessException(String.format("Cash given (%s) does not cover the total (%s)", cashGiven, total));
            }
        }

        Order order = Order.builder()
                .user(staff)
                .channel(SalesChannel.STORE)
                .status(OrderStatus.DELIVERED)
                .paymentMethod(request.getPaymentMethod())
                .cashGiven(cashGiven)
                .totalAmount(total)
                .build();
        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Order saved = orderRepository.save(order);
        log.info("Store sale — orderId: {}, staff: {}, total: {}, payment: {}, lines: {}",
                saved.getId(), staff.getEmail(), total, request.getPaymentMethod(), orderItems.size());
        return OrderResponseDto.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getStoreSalesSince(LocalDateTime since) {
        return orderRepository.findByChannelAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(SalesChannel.STORE, since)
                .stream()
                .map(OrderResponseDto::from)
                .toList();
    }

    private record Line(Long variantId, int quantity) {}

    /**
     * Bloquea cada variante (Capa 2), comprueba que hay unidades suficientes (Capa 1 + validación
     * explícita), las descuenta y congela el precio. Si falta stock de una línea, rollback total.
     */
    private List<OrderItem> takeFromShelf(List<Line> lines) {
        List<OrderItem> items = new ArrayList<>();
        for (Line line : lines) {
            ProductVariant variant = variantRepository.findByIdForUpdate(line.variantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", line.variantId()));

            if (variant.getStockQuantity() < line.quantity()) {
                throw new InsufficientStockException(variant.getSku(), line.quantity(), variant.getStockQuantity());
            }

            // Capa 3 (CHECK stock_quantity >= 0) actúa como red de seguridad en la BD
            variant.setStockQuantity(variant.getStockQuantity() - line.quantity());
            variantRepository.save(variant);

            // Snapshot del precio en el momento de la venta
            BigDecimal unitPrice = variant.getProduct().getBasePrice().add(variant.getPriceModifier());
            items.add(OrderItem.builder()
                    .variant(variant)
                    .quantity(line.quantity())
                    .unitPrice(unitPrice)
                    .build());
        }
        return items;
    }

    private static BigDecimal totalOf(List<OrderItem> items) {
        return items.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
                    .map(OrderResponseDto::from);
        }
        // The backoffice list shows what each order holds; items are batch-fetched (see Order.items)
        return orderRepository.findAll(pageable).map(OrderResponseDto::from);
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
