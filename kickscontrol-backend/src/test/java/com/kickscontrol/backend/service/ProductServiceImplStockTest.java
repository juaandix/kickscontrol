package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.StockAdjustmentDto;
import com.kickscontrol.backend.dto.response.VariantResponseDto;
import com.kickscontrol.backend.entity.*;
import com.kickscontrol.backend.entity.enums.UserRole;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.exception.ResourceNotFoundException;
import com.kickscontrol.backend.repository.*;
import com.kickscontrol.backend.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplStockTest {

    @Mock ProductRepository productRepository;
    @Mock ProductVariantRepository variantRepository;
    @Mock StockMovementRepository movementRepository;

    @InjectMocks ProductServiceImpl productService;

    private ProductVariant variant;
    private User shiftLeader;

    @BeforeEach
    void setUp() {
        Product product = Product.builder().id(1L).name("Air Max 90").brand("Nike").basePrice(new BigDecimal("129.99")).build();
        variant = ProductVariant.builder()
                .id(10L).product(product).sku("NK-AM90-42-WB")
                .size("42").color("White/Black").stockQuantity(4)
                .priceModifier(BigDecimal.ZERO).isActive(true)
                .build();
        shiftLeader = User.builder()
                .id(2L).email("sl@test.com").firstName("Juan").lastName("García")
                .password("encoded").role(UserRole.SHIFT_LEADER)
                .build();
    }

    private static StockAdjustmentDto adjustment(int delta, String reason) {
        StockAdjustmentDto dto = new StockAdjustmentDto();
        dto.setDelta(delta);
        dto.setReason(reason);
        return dto;
    }

    @Test
    void adjustStock_updatesStockAndLogsMovementWithAuthor() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));
        when(variantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VariantResponseDto result = productService.adjustStock(10L, adjustment(6, "RECEPCIÓN"), shiftLeader);

        assertThat(result.getStockQuantity()).isEqualTo(10);
        ArgumentCaptor<StockMovement> logged = ArgumentCaptor.forClass(StockMovement.class);
        verify(movementRepository).save(logged.capture());
        assertThat(logged.getValue().getDelta()).isEqualTo(6);
        assertThat(logged.getValue().getReason()).isEqualTo("RECEPCIÓN");
        assertThat(logged.getValue().getStockAfter()).isEqualTo(10);
        assertThat(logged.getValue().getUser()).isSameAs(shiftLeader);
    }

    @Test
    void adjustStock_recordsShrinkageAsNegativeMovement() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));
        when(variantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.adjustStock(10L, adjustment(-1, "MERMA"), shiftLeader);

        ArgumentCaptor<StockMovement> logged = ArgumentCaptor.forClass(StockMovement.class);
        verify(movementRepository).save(logged.capture());
        assertThat(logged.getValue().getDelta()).isEqualTo(-1);
        assertThat(logged.getValue().getStockAfter()).isEqualTo(3);
    }

    @Test
    void adjustStock_rejectsShrinkageThatAddsUnits() {
        assertThatThrownBy(() -> productService.adjustStock(10L, adjustment(2, "MERMA"), shiftLeader))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(movementRepository);
        verify(variantRepository, never()).save(any());
    }

    @Test
    void adjustStock_rejectsReceptionThatRemovesUnits() {
        assertThatThrownBy(() -> productService.adjustStock(10L, adjustment(-2, "RECEPCIÓN"), shiftLeader))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(movementRepository);
    }

    @Test
    void adjustStock_rejectsUnknownReason() {
        assertThatThrownBy(() -> productService.adjustStock(10L, adjustment(1, "REGALO"), shiftLeader))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(movementRepository);
    }

    @Test
    void adjustStock_rejectsNegativeResultWithoutLogging() {
        when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> productService.adjustStock(10L, adjustment(-5, "AJUSTE"), shiftLeader))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(movementRepository);
        verify(variantRepository, never()).save(any());
    }

    @Test
    void getStockMovements_throwsForUnknownVariant() {
        when(variantRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> productService.getStockMovements(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
