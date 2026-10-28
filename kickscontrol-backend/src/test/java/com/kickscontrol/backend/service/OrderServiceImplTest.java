package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.CheckoutRequest;
import com.kickscontrol.backend.dto.request.StoreSaleRequest;
import com.kickscontrol.backend.dto.response.OrderResponseDto;
import com.kickscontrol.backend.entity.*;
import com.kickscontrol.backend.entity.enums.OrderStatus;
import com.kickscontrol.backend.entity.enums.PaymentMethod;
import com.kickscontrol.backend.entity.enums.UserRole;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.exception.InsufficientStockException;
import com.kickscontrol.backend.exception.ResourceNotFoundException;
import com.kickscontrol.backend.repository.*;
import com.kickscontrol.backend.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock OrderRepository orderRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock ProductVariantRepository variantRepository;
    @Mock UserRepository userRepository;
    @Mock CartService cartService;

    @InjectMocks OrderServiceImpl orderService;

    private User user;
    private Product product;
    private ProductVariant variant;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L).name("Air Max 90").brand("Nike")
                .basePrice(new BigDecimal("100.00"))
                .build();
        variant = ProductVariant.builder()
                .id(10L).product(product).sku("NK-TEST-001")
                .size("42").color("White").stockQuantity(5)
                .priceModifier(BigDecimal.ZERO).isActive(true)
                .build();
        user = User.builder()
                .id(1L).email("user@test.com")
                .firstName("Test").lastName("User")
                .password("encoded").role(UserRole.USER)
                .build();
        cartItem = CartItem.builder()
                .id(100L).user(user).variant(variant).quantity(2)
                .build();
    }

    // ─── checkout ────────────────────────────────────────────────────────────

    @Test
    void checkout_success_createsOrderDecrementsStockAndClearsCart() {
        // Saved order returned by repository
        OrderItem savedOrderItem = OrderItem.builder()
                .id(1L).variant(variant).quantity(2)
                .unitPrice(new BigDecimal("100.00"))
                .build();
        Order savedOrder = Order.builder()
                .id(200L).user(user).status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("200.00"))
                .shippingAddress("Calle Test 1")
                .createdAt(LocalDateTime.now())
                .build();
        savedOrderItem.setOrder(savedOrder);
        savedOrder.getItems().add(savedOrderItem);

        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));
        when(variantRepository.save(variant)).thenReturn(variant);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        CheckoutRequest req = checkoutRequest("Calle Test 1");

        OrderResponseDto result = orderService.checkout(1L, req);

        assertThat(result.getId()).isEqualTo(200L);
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        assertThat(variant.getStockQuantity()).isEqualTo(3); // 5 - 2
        verify(cartService).clearCart(1L);
        verify(orderRepository).save(any(Order.class));
        verify(variantRepository).save(variant);
    }

    @Test
    void checkout_emptyCart_throwsBusinessException() {
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.checkout(1L, checkoutRequest("Addr")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("empty");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkout_insufficientStock_throwsInsufficientStockException() {
        variant.setStockQuantity(1); // only 1 in stock, requesting 2
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> orderService.checkout(1L, checkoutRequest("Addr")))
                .isInstanceOf(InsufficientStockException.class);

        verify(orderRepository, never()).save(any());
        verify(cartService, never()).clearCart(any());
    }

    @Test
    void checkout_variantNotFound_throwsResourceNotFoundException() {
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.checkout(1L, checkoutRequest("Addr")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void checkout_clearsCartOnlyOnSuccess() {
        // Ensures clearCart is NOT called when stock check fails
        variant.setStockQuantity(0);
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> orderService.checkout(1L, checkoutRequest("Addr")))
                .isInstanceOf(InsufficientStockException.class);

        verify(cartService, never()).clearCart(any());
    }

    // ─── storeSale ───────────────────────────────────────────────────────────

    @Test
    void storeSale_byCard_isDeliveredStoreSaleRungUpByStaff() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponseDto result = orderService.storeSale(user, saleRequest(PaymentMethod.CARD, null, line(10L, 2)));

        assertThat(result.getChannel()).isEqualTo("STORE");
        assertThat(result.getStatus()).isEqualTo("DELIVERED");
        assertThat(result.getSoldBy()).isEqualTo("Test User");
        assertThat(result.getTotalAmount()).isEqualByComparingTo("200.00");
        assertThat(variant.getStockQuantity()).isEqualTo(3);
    }

    @Test
    void storeSale_inCash_returnsChange() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponseDto result = orderService.storeSale(user, saleRequest(PaymentMethod.CASH, new BigDecimal("120.00"), line(10L, 1)));

        assertThat(result.getChange()).isEqualByComparingTo("20.00");
    }

    @Test
    void storeSale_cashShortOfTotal_isRejectedAndNothingSaved() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> orderService.storeSale(user, saleRequest(PaymentMethod.CASH, new BigDecimal("50.00"), line(10L, 1))))
                .isInstanceOf(BusinessException.class);
        verify(orderRepository, never()).save(any());
    }

    @Test
    void storeSale_sameSkuScannedTwice_isOneLineWithBothUnits() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponseDto result = orderService.storeSale(user, saleRequest(PaymentMethod.CARD, null, line(10L, 1), line(10L, 2)));

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getQuantity()).isEqualTo(3);
        verify(variantRepository, times(1)).findByIdForUpdate(10L);
    }

    @Test
    void storeSale_moreUnitsThanOnTheShelf_throwsInsufficientStock() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> orderService.storeSale(user, saleRequest(PaymentMethod.CARD, null, line(10L, 6))))
                .isInstanceOf(InsufficientStockException.class);
        verify(orderRepository, never()).save(any());
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private static StoreSaleRequest.Line line(Long variantId, int quantity) {
        StoreSaleRequest.Line l = new StoreSaleRequest.Line();
        l.setVariantId(variantId);
        l.setQuantity(quantity);
        return l;
    }

    private static StoreSaleRequest saleRequest(PaymentMethod method, BigDecimal cash, StoreSaleRequest.Line... lines) {
        StoreSaleRequest r = new StoreSaleRequest();
        r.setPaymentMethod(method);
        r.setCashGiven(cash);
        r.setItems(List.of(lines));
        return r;
    }

    private CheckoutRequest checkoutRequest(String address) {
        CheckoutRequest r = new CheckoutRequest();
        r.setShippingAddress(address);
        return r;
    }
}
