package com.kickscontrol.backend.controller;

import com.kickscontrol.backend.dto.request.ProductRequestDto;
import com.kickscontrol.backend.dto.request.StockAdjustmentDto;
import com.kickscontrol.backend.dto.request.VariantRequestDto;
import com.kickscontrol.backend.dto.response.ApiResponse;
import com.kickscontrol.backend.dto.response.ProductResponseDto;
import com.kickscontrol.backend.dto.response.VariantResponseDto;
import com.kickscontrol.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SHIFT_LEADER')")
@Tag(name = "Admin - Inventory", description = "Product and variant management for store managers")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List all products including inactive (admin view)")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> listAll() {
        // Reutiliza el servicio sin filtros para vista admin completa
        var page = productService.findAll(null, null, null, null, null, null, null,
                org.springframework.data.domain.PageRequest.of(0, 500));
        return ResponseEntity.ok(ApiResponse.ok(page.getContent()));
    }

    @PostMapping
    @Operation(summary = "Create a new product with optional initial variants")
    public ResponseEntity<ApiResponse<ProductResponseDto>> create(@Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created", productService.create(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product base data")
    public ResponseEntity<ApiResponse<ProductResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated", productService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a product (sets isActive = false)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated", null));
    }

    @PostMapping("/{id}/variants")
    @Operation(summary = "Add a new variant to an existing product")
    public ResponseEntity<ApiResponse<VariantResponseDto>> addVariant(
            @PathVariable Long id,
            @Valid @RequestBody VariantRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Variant added", productService.addVariant(id, dto)));
    }

    @GetMapping("/inventory/alerts")
    @Operation(summary = "Get variants with low stock")
    public ResponseEntity<ApiResponse<List<VariantResponseDto>>> getLowStock(
            @RequestParam(defaultValue = "5") int threshold) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getLowStockVariants(threshold)));
    }
}
