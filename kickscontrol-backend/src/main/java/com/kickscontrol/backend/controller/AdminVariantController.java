package com.kickscontrol.backend.controller;

import com.kickscontrol.backend.dto.request.StockAdjustmentDto;
import com.kickscontrol.backend.dto.request.VariantRequestDto;
import com.kickscontrol.backend.dto.response.ApiResponse;
import com.kickscontrol.backend.dto.response.StockMovementResponseDto;
import com.kickscontrol.backend.dto.response.VariantResponseDto;
import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/variants")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SHIFT_LEADER')")
@Tag(name = "Admin - Variants", description = "SKU-level variant management")
@SecurityRequirement(name = "bearerAuth")
public class AdminVariantController {

    private final ProductService productService;

    @PutMapping("/{id}")
    @Operation(summary = "Update a variant's size, color, SKU, price modifier or image")
    public ResponseEntity<ApiResponse<VariantResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody VariantRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Variant updated", productService.updateVariant(id, dto)));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Adjust stock with a reason (RECEPCIÓN, DEVOLUCIÓN, AJUSTE, MERMA); the change is logged")
    public ResponseEntity<ApiResponse<VariantResponseDto>> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustmentDto dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Stock adjusted", productService.adjustStock(id, dto, user)));
    }

    @GetMapping("/{id}/movements")
    @Operation(summary = "The last 20 logged stock changes of a variant, newest first")
    public ResponseEntity<ApiResponse<List<StockMovementResponseDto>>> movements(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getStockMovements(id)));
    }
}
