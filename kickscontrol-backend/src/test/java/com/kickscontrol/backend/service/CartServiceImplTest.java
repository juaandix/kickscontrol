package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.AddToCartRequest;
import com.kickscontrol.backend.dto.response.CartResponseDto;
import com.kickscontrol.backend.entity.CartItem;
import com.kickscontrol.backend.entity.Product;
import com.kickscontrol.backend.entity.ProductVariant;
import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.entity.enums.UserRole;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.exception.ResourceNotFoundException;
import com.kickscontrol.backend.repository.CartItemRepository;
import com.kickscontrol.backend.repository.ProductVariantRepository;
import com.kickscontrol.backend.repository.UserRepository;
import com.kickscontrol.backend.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock CartItemRepository cartItemRepository;
    @Mock ProductVariantRepository variantRepository;
    @Mock UserRepository userRepository;

    @InjectMocks CartServiceImpl cartService;

    private static final Long USER_ID = 1L;
    private static final Long VARIANT_ID = 10L;

    private User user;
    private Product product;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L).name("Air Max 90").brand("Nike")
                .basePrice(new BigDecimal("129.99"))
                .build();
        variant = ProductVariant.builder()
                .id(VARIANT_ID).product(product)
                .sku("NK-AM90-42-WH").size("42").color("White")
                .stockQuantity(10).priceModifier(BigDecimal.ZERO)
                .isActive(true)
                .build();
        user = User.builder()
                .id(USER_ID).email("user@test.com")
                .firstName("Test").lastName("User")
                .password("encoded").role(UserRole.USER)
                .build();
    }

    // ─── getCart ─────────────────────────────────────────────────────────────

    @Test
    void getCart_noItems_returnsEmptyResponse() {
        when(cartItemRepository.findByUserId(USER_ID)).thenReturn(List.of());

        CartResponseDto result = cartService.getCart(USER_ID);

        assertThat(result.getTotalItems()).isZero();
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getItems()).isEmpty();
    }

    @Test
    void getCart_withItems_returnsMappedResponse() {
        CartItem item = cartItem(100L, 2);
        when(cartItemRepository.findByUserId(USER_ID)).thenReturn(List.of(item));

        CartResponseDto result = cartService.getCart(USER_ID);

        assertThat(result.getTotalItems()).isEqualTo(2);
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getSku()).isEqualTo("NK-AM90-42-WH");
        assertThat(result.getTotalAmount())
                .isEqualByComparingTo(new BigDecimal("259.98")); // 129.99 × 2
    }

    // ─── addItem ─────────────────────────────────────────────────────────────

    @Test
    void addItem_newItem_savesCartItem() {
        AddToCartRequest req = addToCartRequest(VARIANT_ID, 2);
        when(variantRepository.findById(VARIANT_ID)).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByUserIdAndVariantId(USER_ID, VARIANT_ID))
                .thenReturn(Optional.empty());
        when(userRepository.getReferenceById(USER_ID)).thenReturn(user);
        when(cartItemRepository.findByUserId(USER_ID)).thenReturn(List.of());

        cartService.addItem(USER_ID, req);

        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void addItem_existingItem_mergesQuantity() {
        CartItem existing = cartItem(100L, 3);
        AddToCartRequest req = addToCartRequest(VARIANT_ID, 2);
        when(variantRepository.findById(VARIANT_ID)).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByUserIdAndVariantId(USER_ID, VARIANT_ID))
                .thenReturn(Optional.of(existing));
        when(cartItemRepository.findByUserId(USER_ID)).thenReturn(List.of());

        cartService.addItem(USER_ID, req);

        assertThat(existing.getQuantity()).isEqualTo(5); // 3 + 2
        verify(cartItemRepository).save(existing);
    }

    @Test
    void addItem_insufficientStock_throwsBusinessException() {
        variant.setStockQuantity(1);
        AddToCartRequest req = addToCartRequest(VARIANT_ID, 5);
        when(variantRepository.findById(VARIANT_ID)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> cartService.addItem(USER_ID, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("1");
    }

    @Test
    void addItem_inactiveVariant_throwsResourceNotFoundException() {
        variant.setIsActive(false);
        when(variantRepository.findById(VARIANT_ID)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> cartService.addItem(USER_ID, addToCartRequest(VARIANT_ID, 1)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── updateItemQuantity ───────────────────────────────────────────────────

    @Test
    void updateItemQuantity_zeroQuantity_deletesItem() {
        CartItem item = cartItem(100L, 3);
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(item));
        when(cartItemRepository.findByUserId(USER_ID)).thenReturn(List.of());

        cartService.updateItemQuantity(USER_ID, 100L, 0);

        verify(cartItemRepository).delete(item);
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void updateItemQuantity_positiveQuantity_updatesItem() {
        CartItem item = cartItem(100L, 3);
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(item));
        when(cartItemRepository.findByUserId(USER_ID)).thenReturn(List.of());

        cartService.updateItemQuantity(USER_ID, 100L, 7);

        assertThat(item.getQuantity()).isEqualTo(7);
        verify(cartItemRepository).save(item);
    }

    @Test
    void updateItemQuantity_wrongUser_throwsResourceNotFoundException() {
        CartItem otherUserItem = CartItem.builder()
                .id(100L)
                .user(User.builder().id(99L).build())
                .variant(variant).quantity(1)
                .build();
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(otherUserItem));

        assertThatThrownBy(() -> cartService.updateItemQuantity(USER_ID, 100L, 3))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── removeItem ──────────────────────────────────────────────────────────

    @Test
    void removeItem_ownItem_deletesAndReturnsCart() {
        CartItem item = cartItem(100L, 2);
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(item));
        when(cartItemRepository.findByUserId(USER_ID)).thenReturn(List.of());

        CartResponseDto result = cartService.removeItem(USER_ID, 100L);

        verify(cartItemRepository).delete(item);
        assertThat(result.getTotalItems()).isZero();
    }

    // ─── clearCart ────────────────────────────────────────────────────────────

    @Test
    void clearCart_callsDeleteByUserId() {
        cartService.clearCart(USER_ID);
        verify(cartItemRepository).deleteByUserId(USER_ID);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private CartItem cartItem(Long id, int qty) {
        return CartItem.builder().id(id).user(user).variant(variant).quantity(qty).build();
    }

    private AddToCartRequest addToCartRequest(Long variantId, int qty) {
        AddToCartRequest r = new AddToCartRequest();
        r.setVariantId(variantId);
        r.setQuantity(qty);
        return r;
    }
}
